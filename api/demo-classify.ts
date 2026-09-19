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

// One classifyChunk call per request - the browser sends the upload as a
// sequence of small batches (see BATCH_SIZE in DemoPage.tsx) and merges the
// results, rather than this endpoint chunking internally. That's a direct
// response to production evidence, not a guess: a single 300-message request
// 504'd despite completing in ~20s in a direct local test, and a single
// 140-message request (well under the old 150 cap) 504'd too even though
// local timing put it at ~7-8s. Both point to a platform-level per-invocation
// limit stricter than the maxDuration configured below - most likely the
// Hobby plan's execution cap, which app code can't override. This constant
// is a safety net against a misbehaving client sending an oversized batch,
// not the primary size control.
const MAX_MESSAGES = 30;

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
      error: `This endpoint handles up to ${MAX_MESSAGES} messages per request (got ${body.messages.length}) to stay well within the platform's per-invocation limit. The demo page sends uploads in small batches automatically - if you're calling this endpoint directly, split your request.`,
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
        insight_category: item.insightCategory,
        severity: item.severity,
        title: item.title,
        body: item.body,
        occurred_at: sourceMessage.timestamp.toISOString(),
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
        due_time: item.dueTime,
        notes: item.notes,
        person_name: personName,
      });
    }
  }

  return res.status(200).json({ care, lifeStory, calendar });
}
