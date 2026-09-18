-- Builder's Table schema. Paste this into the Neon SQL editor (Vercel
-- Storage tab -> your database -> Query) one statement at a time — Neon's
-- editor runs each execution as a single prepared statement and rejects a
-- semicolon-separated batch.
--
-- Safe to re-run: every statement is idempotent. If you already created the
-- original four tables before life_story_items/calendar_items existed, run
-- the "Migration" statements at the bottom too.

CREATE TABLE IF NOT EXISTS loved_one (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'carer', 'admin')),
  relationship TEXT,
  wa_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  wa_message_id TEXT UNIQUE,
  from_wa_id TEXT,
  from_name TEXT,
  body TEXT,
  source TEXT NOT NULL DEFAULT 'whatsapp_webhook' CHECK (source IN ('whatsapp_webhook', 'export')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('visit', 'observation', 'pharmacy', 'appointment', 'memory')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('positive', 'neutral', 'negative')),
  person_id INTEGER REFERENCES people(id),
  photo_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('whatsapp', 'export', 'seed', 'manual')),
  source_message_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Day-to-day moments (dated) and historical memories (undated, era_label
-- instead) that make up the "Life Story" feed and monthly recaps.
CREATE TABLE IF NOT EXISTS life_story_items (
  id SERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ,
  era_label TEXT,
  summary TEXT NOT NULL,
  photo_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('whatsapp', 'export', 'seed', 'manual')),
  source_message_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upcoming commitments (appointments/visits/trips) and to-dos inferred from
-- conversation, for the shared calendar view.
CREATE TABLE IF NOT EXISTS calendar_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('appointment', 'visit', 'trip', 'task')),
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'done')),
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('whatsapp', 'export', 'seed', 'manual')),
  source_message_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_occurred_at_idx ON events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS messages_received_at_idx ON messages (received_at DESC);
CREATE INDEX IF NOT EXISTS life_story_items_occurred_at_idx ON life_story_items (occurred_at DESC);
CREATE INDEX IF NOT EXISTS calendar_items_due_at_idx ON calendar_items (due_at);

-- Migration: only needed if you ran the original (pre-life-story/calendar)
-- version of this file already. Run each statement individually, as above.

ALTER TABLE loved_one ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'whatsapp_webhook';
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_source_check;
ALTER TABLE messages ADD CONSTRAINT messages_source_check CHECK (source IN ('whatsapp_webhook', 'export'));
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_source_check;
ALTER TABLE events ADD CONSTRAINT events_source_check CHECK (source IN ('whatsapp', 'export', 'seed', 'manual'));
