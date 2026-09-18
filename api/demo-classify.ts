import type { VercelRequest, VercelResponse } from "@vercel/node";
import { classifyChunk, type ChunkMessage } from "../scripts/lib/classify.js";

// Demo-only endpoint: classifies an uploaded chat export live, in the
// browser-facing ingestion demo, with no database write. Scoped to a small
// curated demo file, not an arbitrary multi-year export - see README.

// Request the longest duration Vercel allows for this project's plan.
export const config = { maxDuration: 60 };

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

// Deliberately a single classifyChunk call over the whole upload, not
// day-chunked like the CLI pipeline - day-chunking exists there purely to
// keep years of history affordable, not because it's faster. Measured
// against real data: ~124 messages -> 7.6s, ~300 messages -> ~20s, and a
// live 300-message attempt through this endpoint hit a platform-level
// gateway timeout (504) despite completing in ~20s in a direct local test -
// that gap is real network/cold-start overhead a local test doesn't
// capture, not something to explain away. Capped well under the smaller
// number actually observed to work, with real margin instead of a
// best-case estimate.
const MAX_MESSAGES = 150;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body as DemoRequestBody;
  if (!body?.messages?.length || !body.lovedOneName) {
    return res.status(400).json({ error: "messages[] and lovedOneName are required" });
  }
  if (body.messages.length > MAX_MESSAGES) {
    return res.status(400).json({
      error: `This live demo handles up to ${MAX_MESSAGES} messages at once (got ${body.messages.length}) to stay well within the platform's request timeout. Use a shorter date range for the live demo, or scripts/process-export.ts for a full history.`,
    });
  }

  const aliases = body.aliases ?? [];
  const messages = body.messages
    .map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const chunkForClassifier: ChunkMessage[] = messages.map((m, index) => ({
    index,
    timestamp: m.timestamp,
    sender: m.sender,
    text: m.text,
  }));

  let items;
  try {
    items = await classifyChunk(chunkForClassifier, body.lovedOneName, aliases);
  } catch (err) {
    console.error("Demo classify failed", err);
    return res.status(502).json({ error: "Classification failed - see function logs for details." });
  }

  const care: unknown[] = [];
  const lifeStory: unknown[] = [];
  const calendar: unknown[] = [];
  let nextId = 1;

  for (const item of items) {
    const sourceMessage = messages[item.sourceMessageIndex];
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

  return res.status(200).json({ care, lifeStory, calendar });
}
