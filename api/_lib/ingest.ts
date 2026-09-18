import type { IncomingWhatsAppMessage } from "./whatsapp.js";
import { getOrCreatePersonByWaId, insertMessage, insertEvent } from "./db.js";
import { extractEvent } from "./extract.js";

/**
 * Persists a raw WhatsApp message and, if it carries care-relevant content,
 * runs extraction and adds a structured event to the timeline. Shared by the
 * webhook handler (real messages) and the seed script (demo/backfill data).
 */
export async function ingestWhatsAppMessage(message: IncomingWhatsAppMessage): Promise<void> {
  const person = await getOrCreatePersonByWaId(message.fromWaId, message.fromName);
  const occurredAt = new Date(Number(message.timestampSec) * 1000);

  const savedMessage = await insertMessage({
    waMessageId: message.waMessageId,
    fromWaId: message.fromWaId,
    fromName: message.fromName,
    body: message.text,
    receivedAt: occurredAt,
  });

  if (!message.text) {
    return;
  }

  const extracted = await extractEvent(message.text);
  if (!extracted || !extracted.type || !extracted.summary) {
    return;
  }

  await insertEvent({
    type: extracted.type,
    occurredAt,
    summary: extracted.summary,
    mood: extracted.mood,
    personId: person.id,
    source: "whatsapp",
    sourceMessageId: savedMessage.id,
  });
}
