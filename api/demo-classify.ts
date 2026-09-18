import type { VercelRequest, VercelResponse } from "@vercel/node";
import { classifyChunk, type ChunkMessage } from "../scripts/lib/classify.js";

// Demo-only endpoint: classifies an uploaded chat export live, in the
// browser-facing ingestion demo, with no database write. Scoped to a small
// curated demo file, not an arbitrary multi-year export - see README.

// Request the longest duration Vercel allows for this project's plan, as
// margin on top of the parallelization below - actual cap depends on plan.
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

// Keeps this well inside Vercel's serverless function duration limit. Each
// day-chunk is one Claude call, run with bounded concurrency below so total
// wall-clock time is roughly (chunks / CONCURRENCY) call-latencies, not the
// sum of all of them - but an unbounded number of chunks would still risk
// Anthropic rate limits, so fail fast with a clear message past this size
// rather than hang or silently drop chunks that get rate-limited.
const MAX_MESSAGES = 500;
const MAX_CHUNKS = 120;
const CONCURRENCY = 8;

/** Runs `fn` over `items` with at most `limit` in flight at once. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
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
  if (body.messages.length > MAX_MESSAGES) {
    return res.status(400).json({
      error: `This demo endpoint handles up to ${MAX_MESSAGES} messages at once (got ${body.messages.length}). Use a smaller export, or scripts/process-export.ts for a full history.`,
    });
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

  if (chunks.size > MAX_CHUNKS) {
    return res.status(400).json({
      error: `This demo endpoint handles up to ${MAX_CHUNKS} active days at once (got ${chunks.size}). Use a smaller date range, or scripts/process-export.ts for a full history.`,
    });
  }

  const care: unknown[] = [];
  const lifeStory: unknown[] = [];
  const calendar: unknown[] = [];
  let nextId = 1;

  const chunkResults = await mapWithConcurrency([...chunks.values()], CONCURRENCY, async (chunkMessages) => {
    const chunkForClassifier: ChunkMessage[] = chunkMessages.map((m, index) => ({
      index,
      timestamp: m.timestamp,
      sender: m.sender,
      text: m.text,
    }));

    try {
      const items = await classifyChunk(chunkForClassifier, body.lovedOneName, aliases);
      return { chunkMessages, items };
    } catch (err) {
      console.error("Demo classify failed for a chunk", err);
      return { chunkMessages, items: [] };
    }
  });

  for (const { chunkMessages, items } of chunkResults) {
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
