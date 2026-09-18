import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseWhatsAppWebhookPayload } from "./_lib/whatsapp.js";

// NOTE: this endpoint does not verify the X-Hub-Signature-256 header, so
// anyone who finds the URL could POST a forged payload. Fine for a hackathon
// prototype behind an unguessable path; add signature verification before
// any real/production use.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return handleVerification(req, res);
  }
  if (req.method === "POST") {
    return handleIncomingMessages(req, res);
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).send("Method Not Allowed");
}

// Meta calls this once, when you save the webhook URL in the App Dashboard,
// to confirm you control the endpoint.
function handleVerification(req: VercelRequest, res: VercelResponse) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Forbidden");
}

async function handleIncomingMessages(req: VercelRequest, res: VercelResponse) {
  try {
    const messages = parseWhatsAppWebhookPayload(req.body);
    for (const message of messages) {
      // TODO: once the shared knowledge base backend exists, run structured
      // extraction and persist here. Await any async writes before
      // responding below, so Meta doesn't retry a message we already saved.
      console.log("WhatsApp message received:", message);
    }
  } catch (err) {
    console.error("Failed to parse WhatsApp webhook payload", err);
  }

  // Always ack with 2xx so Meta doesn't retry-storm the endpoint.
  return res.status(200).send("EVENT_RECEIVED");
}
