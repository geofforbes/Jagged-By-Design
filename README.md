# Builder's Table

Project scaffold for [Builder's Table](https://builderstable.net/), a hackathon project.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (TypeScript)

This matches the stack Google AI Studio exports, to keep the export/import
round-trip between AI Studio and this repo friction-free.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment

This repo deploys to Vercel automatically on every push via Vercel's native
GitHub integration:

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub repo.
2. Vercel auto-detects the Vite framework — no extra config needed.
3. Every push to `main` deploys to production; every other branch/PR gets a
   preview deployment.

## WhatsApp bot

`api/whatsapp-webhook.ts` is a Vercel serverless function that receives
WhatsApp Cloud API webhook events (Vercel serves `/api/*` as functions
regardless of frontend framework, so this works alongside the Vite app).
`api/_lib/whatsapp.ts` has the payload parser and a `sendWhatsAppMessage`
helper for replying (used later by the "Ask" feature).

**Setup checklist (Meta App Dashboard steps — one person, ~15 min):**

1. Create a Meta app with the WhatsApp use case at the
   [App Dashboard](https://developers.facebook.com/apps), following Meta's
   [Get Started guide](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
   through "API Setup." This gives you a free test phone number — no business
   verification needed.
2. Under **API Setup**, add your own phone number (and teammates') as
   recipient test numbers so the test number can message you (max 5).
3. Create a system user and generate a **permanent** access token (Get
   Started guide, Step 5) — the temporary one expires in 24h.
4. In Vercel project settings → Environment Variables, add (see
   `.env.example` for details):
   - `WHATSAPP_VERIFY_TOKEN` — any string you choose
   - `WHATSAPP_ACCESS_TOKEN` — the permanent token from step 3
   - `WHATSAPP_PHONE_NUMBER_ID` — the test number's phone number ID
   Redeploy after adding these (env var changes don't apply to already-built
   deployments).
5. Back in the Meta App Dashboard, under **Configuration**, set the webhook:
   - Callback URL: `https://jagged-by-design.vercel.app/api/whatsapp-webhook`
   - Verify token: same value as `WHATSAPP_VERIFY_TOKEN` above
   - Subscribe to the `messages` field
6. Send a test message to your test number and check the Vercel function
   logs — you should see `WhatsApp message received: ...`.

**Deliberate scope cuts for the hackathon:** the webhook doesn't verify
Meta's `X-Hub-Signature-256` header, so it trusts any POST to that URL. Fine
behind an unguessable path for a demo; would need fixing before real use.
The bot also never messages first (avoids needing an approved message
template) — it only replies within the 24h window opened by an incoming
message.

## Database & knowledge base

Incoming messages are now persisted and turned into structured timeline
events (visits, observations, pharmacy events, etc.) via Claude, per
`db/schema.sql`.

**Setup:**

1. Vercel dashboard → your project → **Storage** tab → **Create Database** →
   **Postgres** (this provisions a Neon database and auto-injects
   `DATABASE_URL`/`POSTGRES_URL` into your project's env vars — no manual
   copy-pasting needed).
2. Open that database's **Query** console (in the Storage tab) and paste in
   the full contents of `db/schema.sql`, then run it. Safe to re-run anytime.
3. Get an API key from [console.anthropic.com](https://console.anthropic.com)
   and add it to Vercel's Environment Variables as `ANTHROPIC_API_KEY`.
4. Redeploy so the new env vars take effect.

**How it fits together:**

- `api/_lib/db.ts` — typed query helpers (`insertMessage`, `insertEvent`,
  `listEvents`, `listPeople`, `getOrCreatePersonByWaId`, `getLovedOne`)
- `api/_lib/extract.ts` — turns one message's raw text into a structured
  event via Claude's structured outputs (`isRelevant`/`type`/`summary`/`mood`),
  or `null` if the message has no care-relevant content (e.g. "ok", "👍")
- `api/_lib/ingest.ts` — the shared pipeline (save raw message → extract →
  save event) used by both the webhook and the demo seed script
- `api/events.ts`, `api/people.ts`, `api/loved-one.ts` — read-only `GET`
  endpoints for the frontend to build the timeline against

**Schema:** four tables — `loved_one` (single profile row), `people`
(circle of care, matched to WhatsApp senders by `wa_id`), `messages` (raw
ingested WhatsApp messages, for provenance), `events` (the unified timeline —
one row per visit/observation/pharmacy/appointment/memory). Kept intentionally
flat: one loved one per deployment, no multi-tenancy, no vector search — the
"Ask" feature (not yet built) can just feed the full `events` table into
Claude as context, since a hackathon dataset is small enough that full-context
retrieval is simpler and more reliable than building real RAG infrastructure.
