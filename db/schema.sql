-- Builder's Table schema. Paste this into the Vercel Postgres (Neon) query
-- console once, after provisioning the database (Storage tab -> Create
-- Database -> Postgres). Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS loved_one (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
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
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('whatsapp', 'seed', 'manual')),
  source_message_id INTEGER REFERENCES messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_occurred_at_idx ON events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS messages_received_at_idx ON messages (received_at DESC);
