import type { VercelRequest, VercelResponse } from "@vercel/node";
import { classifyChunk, type ChunkMessage } from "../scripts/lib/classify.js";

// Demo-only endpoint: classifies an uploaded chat export live, in the
// browser-facing ingestion demo, with no database write. Scoped to a small
// curated demo file, not an arbitrary multi-year export - see README.

interface DemoMessage {
  timestamp: string;
  sender: string;
  text: string;
}

interface DemoRequestBody {
  messages: DemoMessage[];
  lovedOneName: string;
  aliases?: string[];
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body as DemoRequestBody;
  if (!body?.messages?.length || !body.lovedOneName) {
    return res.status(400).json({ error: "messages[] and lovedOneName are required" });
  }

  const aliases = body.aliases ?? [];
  const messages = body.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));

  const chunks = new Map<string, typeof messages>();
  for (const message of messages) {
    const key = dayKey(message.timestamp);
    const chunk = chunks.get(key) ?? [];
    chunk.push(message);
    chunks.set(key, chunk);
  }

  const care: unknown[] = [];
  const lifeStory: unknown[] = [];
  const calendar: unknown[] = [];
  let nextId = 1;

  for (const [, chunkMessages] of chunks) {
    const chunkForClassifier: ChunkMessage[] = chunkMessages.map((m, index) => ({
      index,
      timestamp: m.timestamp,
      sender: m.sender,
      text: m.text,
    }));

    let items;
    try {
      items = await classifyChunk(chunkForClassifier, body.lovedOneName, aliases);
    } catch (err) {
      console.error("Demo classify failed for a chunk", err);
      continue;
    }

    for (const item of items) {
      const sourceMessage = chunkMessages[item.sourceMessageIndex];
      if (!sourceMessage) continue;
      const personName = sourceMessage.sender;

      if (item.category === "care") {
        care.push({
          id: nextId++,
          type: item.type,
          occurred_at: sourceMessage.timestamp.toISOString(),
          summary: item.summary,
          mood: item.mood,
          person_name: personName,
        });
      } else if (item.category === "life_story") {
        lifeStory.push({
          id: nextId++,
          occurred_at: item.isHistorical ? null : sourceMessage.timestamp.toISOString(),
          era_label: item.eraLabel,
          summary: item.summary,
          person_name: personName,
        });
      } else {
        calendar.push({
          id: nextId++,
          title: item.title,
          item_type: item.itemType,
          due_at: item.dueDate,
          notes: item.notes,
          person_name: personName,
        });
      }
    }
  }

  return res.status(200).json({ care, lifeStory, calendar });
}
