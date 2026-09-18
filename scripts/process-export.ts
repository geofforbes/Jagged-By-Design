/**
 * Processes a WhatsApp "Export Chat" .zip (or an already-extracted folder)
 * into the three app modules' data: Care timeline, Life Story, Calendar.
 *
 * Usage:
 *   npx tsx scripts/process-export.ts <path-to-export.zip-or-folder> "<Loved One Name>" ["Nickname1,Nickname2"] [--limit=50]
 *
 * Requires DATABASE_URL, ANTHROPIC_API_KEY, and (for voice notes) OPENAI_API_KEY
 * in the environment - e.g. `vercel env pull .env.local` then
 * `node --env-file=.env.local --import tsx scripts/process-export.ts ...`
 *
 * Writes to Postgres (same tables the live webhook uses) AND to
 * output/{care-timeline,life-story,calendar}.json, so the frontend can be
 * wired up against static fixtures immediately without waiting on the DB.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { parseWhatsAppExport, type ParsedWhatsAppMessage } from "./lib/parse-export.js";
import { describeAttachment } from "./lib/media.js";
import { classifyChunk, type ChunkMessage, type ClassifiedItem } from "./lib/classify.js";
import {
  upsertLovedOne,
  getOrCreatePersonByName,
  insertMessage,
  insertEvent,
  insertLifeStoryItem,
  insertCalendarItem,
  type EventType,
  type Mood,
} from "../api/_lib/db.js";

interface EnrichedMessage extends ParsedWhatsAppMessage {
  dbMessageId: number;
}

function parseArgs(argv: string[]) {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const limitArg = argv.find((a) => a.startsWith("--limit="));
  const [inputPath, lovedOneName, aliasesRaw] = positional;

  if (!inputPath || !lovedOneName) {
    console.error(
      'Usage: process-export.ts <path-to-export.zip-or-folder> "<Loved One Name>" ["Nickname1,Nickname2"] [--limit=N]',
    );
    process.exit(1);
  }

  return {
    inputPath,
    lovedOneName,
    aliases: aliasesRaw ? aliasesRaw.split(",").map((a) => a.trim()) : [],
    limit: limitArg ? Number(limitArg.split("=")[1]) : undefined,
  };
}

async function resolveExportFolder(inputPath: string): Promise<string> {
  const stats = statSync(inputPath);
  if (stats.isDirectory()) {
    return inputPath;
  }

  const extractDir = inputPath.replace(/\.zip$/i, "") + "-extracted";
  if (!existsSync(extractDir)) {
    console.log(`Extracting ${inputPath} -> ${extractDir}`);
    new AdmZip(inputPath).extractAllTo(extractDir, true);
  } else {
    console.log(`Using previously extracted folder: ${extractDir}`);
  }
  return extractDir;
}

async function findChatFile(folder: string): Promise<string> {
  const entries = await readdir(folder);
  const chatFile = entries.find((name) => name.toLowerCase().endsWith(".txt"));
  if (!chatFile) {
    throw new Error(`No .txt chat file found in ${folder}`);
  }
  return path.join(folder, chatFile);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function enrichAttachments(
  messages: ParsedWhatsAppMessage[],
  folder: string,
): Promise<void> {
  for (const message of messages) {
    if (message.attachmentFilename) {
      const filePath = path.join(folder, message.attachmentFilename);
      if (existsSync(filePath)) {
        const description = await describeAttachment(filePath, message.text);
        if (description) {
          message.text = description;
        }
      } else {
        console.warn(`Attachment referenced but not found on disk: ${message.attachmentFilename}`);
      }
    } else if (message.omittedMediaType) {
      message.text = `[${message.omittedMediaType} shared, not included in this export]`;
    }
  }
}

async function main() {
  const { inputPath, lovedOneName, aliases, limit } = parseArgs(process.argv.slice(2));

  console.log(`Loved one: ${lovedOneName} (aliases: ${aliases.join(", ") || "none"})`);
  await upsertLovedOne(lovedOneName, aliases);

  const folder = await resolveExportFolder(inputPath);
  const chatFilePath = await findChatFile(folder);
  console.log(`Parsing ${chatFilePath}`);

  let parsed = parseWhatsAppExport(await readFile(chatFilePath, "utf-8"));
  console.log(`Parsed ${parsed.length} messages`);

  if (limit) {
    parsed = parsed.slice(0, limit);
    console.log(`Limiting to first ${limit} messages for this run`);
  }

  console.log("Describing attachments (images/voice notes) - this is the slow part...");
  await enrichAttachments(parsed, folder);

  console.log("Saving raw messages and resolving senders...");
  const personCache = new Map<string, number>();
  const enriched: EnrichedMessage[] = [];
  for (const message of parsed) {
    if (!personCache.has(message.sender)) {
      const person = await getOrCreatePersonByName(message.sender);
      personCache.set(message.sender, person.id);
    }
    const saved = await insertMessage({
      fromName: message.sender,
      body: message.text,
      source: "export",
      receivedAt: message.timestamp,
    });
    enriched.push({ ...message, dbMessageId: saved.id });
  }

  const chunks = new Map<string, EnrichedMessage[]>();
  for (const message of enriched) {
    const key = dayKey(message.timestamp);
    const chunk = chunks.get(key) ?? [];
    chunk.push(message);
    chunks.set(key, chunk);
  }
  console.log(`Grouped into ${chunks.size} day-chunks`);

  const careTimeline: unknown[] = [];
  const lifeStory: unknown[] = [];
  const calendar: unknown[] = [];

  let processedChunks = 0;
  for (const [day, chunkMessages] of chunks) {
    processedChunks += 1;
    console.log(`[${processedChunks}/${chunks.size}] Classifying ${day} (${chunkMessages.length} messages)`);

    const chunkForClassifier: ChunkMessage[] = chunkMessages.map((m, index) => ({
      index,
      timestamp: m.timestamp,
      sender: m.sender,
      text: m.text,
    }));

    let items: ClassifiedItem[] = [];
    try {
      items = await classifyChunk(chunkForClassifier, lovedOneName, aliases);
    } catch (err) {
      console.error(`Failed to classify ${day}, skipping this chunk:`, err);
      continue;
    }

    for (const item of items) {
      const sourceMessage = chunkMessages[item.sourceMessageIndex];
      if (!sourceMessage) {
        console.warn(`Item referenced out-of-range message index ${item.sourceMessageIndex} on ${day}`);
        continue;
      }
      const personId = personCache.get(sourceMessage.sender) ?? null;

      if (item.category === "care") {
        const saved = await insertEvent({
          type: item.type as EventType,
          occurredAt: sourceMessage.timestamp,
          summary: item.summary,
          mood: item.mood as Mood | null,
          personId,
          source: "export",
          sourceMessageId: sourceMessage.dbMessageId,
        });
        careTimeline.push(saved);
      } else if (item.category === "life_story") {
        const saved = await insertLifeStoryItem({
          occurredAt: item.isHistorical ? null : sourceMessage.timestamp,
          eraLabel: item.eraLabel,
          summary: item.summary,
          source: "export",
          sourceMessageId: sourceMessage.dbMessageId,
        });
        lifeStory.push(saved);
      } else {
        const saved = await insertCalendarItem({
          title: item.title,
          itemType: item.itemType,
          dueAt: item.dueDate ? new Date(item.dueDate) : null,
          notes: item.notes,
          source: "export",
          sourceMessageId: sourceMessage.dbMessageId,
        });
        calendar.push(saved);
      }
    }
  }

  await mkdir("output", { recursive: true });
  await writeFile("output/care-timeline.json", JSON.stringify(careTimeline, null, 2));
  await writeFile("output/life-story.json", JSON.stringify(lifeStory, null, 2));
  await writeFile("output/calendar.json", JSON.stringify(calendar, null, 2));

  console.log(
    `Done. ${careTimeline.length} care events, ${lifeStory.length} life story items, ${calendar.length} calendar items.`,
  );
  console.log("Written to output/*.json and to Postgres.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
