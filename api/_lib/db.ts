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

export type RecordSource = "whatsapp" | "export" | "seed" | "manual";
export type MessageSource = "whatsapp_webhook" | "export";

export interface EventRecord {
  id: number;
  type: EventType;
  occurred_at: string;
  summary: string;
  mood: Mood | null;
  person_id: number | null;
  photo_url: string | null;
  source: RecordSource;
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

/** Finds a person by display name (case-insensitive), creating one if new. Used for chat exports, which have no wa_id. */
export async function getOrCreatePersonByName(name: string): Promise<Person> {
  const existing = await sql`
    SELECT id, name, role, relationship, wa_id FROM people WHERE lower(name) = lower(${name})
  `;
  if (existing.length > 0) {
    return existing[0] as Person;
  }

  const inserted = await sql`
    INSERT INTO people (name, role)
    VALUES (${name}, 'family')
    RETURNING id, name, role, relationship, wa_id
  `;
  return inserted[0] as Person;
}

export async function insertMessage(params: {
  waMessageId?: string;
  fromWaId?: string;
  fromName?: string;
  body?: string;
  source: MessageSource;
  receivedAt: Date;
}): Promise<{ id: number }> {
  const rows = await sql`
    INSERT INTO messages (wa_message_id, from_wa_id, from_name, body, source, received_at)
    VALUES (${params.waMessageId ?? null}, ${params.fromWaId ?? null}, ${params.fromName ?? null}, ${params.body ?? null}, ${params.source}, ${params.receivedAt.toISOString()})
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
  source: RecordSource;
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
  aliases: string[];
}

/** Returns the single loved-one profile row, or null if none has been created yet. */
export async function getLovedOne(): Promise<LovedOne | null> {
  const rows = await sql`SELECT id, name, bio, photo_url, aliases FROM loved_one LIMIT 1`;
  return (rows[0] as LovedOne) ?? null;
}

/**
 * Creates the loved-one profile if none exists, or updates name/aliases on
 * the existing one. There's only ever one row (single loved one per
 * deployment) - used by the chat-export script to record who "she/Mum/Nana"
 * refers to before running extraction.
 */
export async function upsertLovedOne(name: string, aliases: string[]): Promise<LovedOne> {
  const existing = await getLovedOne();
  if (existing) {
    const rows = await sql`
      UPDATE loved_one SET name = ${name}, aliases = ${aliases}
      WHERE id = ${existing.id}
      RETURNING id, name, bio, photo_url, aliases
    `;
    return rows[0] as LovedOne;
  }

  const rows = await sql`
    INSERT INTO loved_one (name, aliases)
    VALUES (${name}, ${aliases})
    RETURNING id, name, bio, photo_url, aliases
  `;
  return rows[0] as LovedOne;
}

export interface LifeStoryItem {
  id: number;
  occurred_at: string | null;
  era_label: string | null;
  summary: string;
  photo_url: string | null;
  source: RecordSource;
  source_message_id: number | null;
}

export async function insertLifeStoryItem(params: {
  occurredAt?: Date | null;
  eraLabel?: string | null;
  summary: string;
  photoUrl?: string | null;
  source: RecordSource;
  sourceMessageId?: number | null;
}): Promise<LifeStoryItem> {
  const rows = await sql`
    INSERT INTO life_story_items (occurred_at, era_label, summary, photo_url, source, source_message_id)
    VALUES (
      ${params.occurredAt?.toISOString() ?? null},
      ${params.eraLabel ?? null},
      ${params.summary},
      ${params.photoUrl ?? null},
      ${params.source},
      ${params.sourceMessageId ?? null}
    )
    RETURNING id, occurred_at, era_label, summary, photo_url, source, source_message_id
  `;
  return rows[0] as LifeStoryItem;
}

export async function listLifeStoryItems(limit = 200): Promise<LifeStoryItem[]> {
  const rows = await sql`
    SELECT id, occurred_at, era_label, summary, photo_url, source, source_message_id
    FROM life_story_items
    ORDER BY occurred_at DESC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as LifeStoryItem[];
}

export type CalendarItemType = "appointment" | "visit" | "trip" | "task";
export type CalendarItemStatus = "upcoming" | "done";

export interface CalendarItem {
  id: number;
  title: string;
  item_type: CalendarItemType;
  due_at: string | null;
  status: CalendarItemStatus;
  notes: string | null;
  source: RecordSource;
  source_message_id: number | null;
}

export async function insertCalendarItem(params: {
  title: string;
  itemType: CalendarItemType;
  dueAt?: Date | null;
  status?: CalendarItemStatus;
  notes?: string | null;
  source: RecordSource;
  sourceMessageId?: number | null;
}): Promise<CalendarItem> {
  const rows = await sql`
    INSERT INTO calendar_items (title, item_type, due_at, status, notes, source, source_message_id)
    VALUES (
      ${params.title},
      ${params.itemType},
      ${params.dueAt?.toISOString() ?? null},
      ${params.status ?? "upcoming"},
      ${params.notes ?? null},
      ${params.source},
      ${params.sourceMessageId ?? null}
    )
    RETURNING id, title, item_type, due_at, status, notes, source, source_message_id
  `;
  return rows[0] as CalendarItem;
}

export async function listCalendarItems(limit = 200): Promise<CalendarItem[]> {
  const rows = await sql`
    SELECT id, title, item_type, due_at, status, notes, source, source_message_id
    FROM calendar_items
    ORDER BY due_at ASC NULLS LAST
    LIMIT ${limit}
  `;
  return rows as CalendarItem[];
}
