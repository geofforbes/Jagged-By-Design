import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL (or POSTGRES_URL) env var");
}

export const sql = neon(connectionString);

export type EventType = "visit" | "observation" | "pharmacy" | "appointment" | "memory";
export type Mood = "positive" | "neutral" | "negative";

export interface Person {
  id: number;
  name: string;
  role: "family" | "carer" | "admin";
  relationship: string | null;
  wa_id: string | null;
}

export interface EventRecord {
  id: number;
  type: EventType;
  occurred_at: string;
  summary: string;
  mood: Mood | null;
  person_id: number | null;
  photo_url: string | null;
  source: "whatsapp" | "seed" | "manual";
  source_message_id: number | null;
}

/** Finds a person by WhatsApp ID, creating one from their WhatsApp profile name if new. */
export async function getOrCreatePersonByWaId(
  waId: string,
  name: string | undefined,
): Promise<Person> {
  const existing = await sql`
    SELECT id, name, role, relationship, wa_id FROM people WHERE wa_id = ${waId}
  `;
  if (existing.length > 0) {
    return existing[0] as Person;
  }

  const inserted = await sql`
    INSERT INTO people (name, role, wa_id)
    VALUES (${name ?? "Unknown"}, 'family', ${waId})
    RETURNING id, name, role, relationship, wa_id
  `;
  return inserted[0] as Person;
}

export async function insertMessage(params: {
  waMessageId: string;
  fromWaId: string;
  fromName?: string;
  body?: string;
  receivedAt: Date;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO messages (wa_message_id, from_wa_id, from_name, body, received_at)
    VALUES (${params.waMessageId}, ${params.fromWaId}, ${params.fromName ?? null}, ${params.body ?? null}, ${params.receivedAt.toISOString()})
    ON CONFLICT (wa_message_id) DO UPDATE SET wa_message_id = EXCLUDED.wa_message_id
    RETURNING id
  `;
  return rows[0] as { id: number };
}

export async function insertEvent(params: {
  type: EventType;
  occurredAt: Date;
  summary: string;
  mood?: Mood | null;
  personId?: number | null;
  photoUrl?: string | null;
  source: "whatsapp" | "seed" | "manual";
  sourceMessageId?: number | null;
}): Promise<EventRecord> {
  const rows = await sql`
    INSERT INTO events (type, occurred_at, summary, mood, person_id, photo_url, source, source_message_id)
    VALUES (
      ${params.type},
      ${params.occurredAt.toISOString()},
      ${params.summary},
      ${params.mood ?? null},
      ${params.personId ?? null},
      ${params.photoUrl ?? null},
      ${params.source},
      ${params.sourceMessageId ?? null}
    )
    RETURNING id, type, occurred_at, summary, mood, person_id, photo_url, source, source_message_id
  `;
  return rows[0] as EventRecord;
}

export async function listEvents(limit = 200): Promise<EventRecord[]> {
  const rows = await sql`
    SELECT id, type, occurred_at, summary, mood, person_id, photo_url, source, source_message_id
    FROM events
    ORDER BY occurred_at DESC
    LIMIT ${limit}
  `;
  return rows as EventRecord[];
}

export async function listPeople(): Promise<Person[]> {
  const rows = await sql`
    SELECT id, name, role, relationship, wa_id FROM people ORDER BY name
  `;
  return rows as Person[];
}

export interface LovedOne {
  id: number;
  name: string;
  bio: string | null;
  photo_url: string | null;
}

/** Returns the single loved-one profile row, or null if none has been created yet. */
export async function getLovedOne(): Promise<LovedOne | null> {
  const rows = await sql`SELECT id, name, bio, photo_url FROM loved_one LIMIT 1`;
  return (rows[0] as LovedOne) ?? null;
}
