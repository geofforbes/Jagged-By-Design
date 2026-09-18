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
Incoming messages are only logged right now — persisting them to the shared
knowledge base is the next piece of work once that backend exists. The bot
also never messages first (avoids needing an approved message template) —
it only replies within the 24h window opened by an incoming message.
