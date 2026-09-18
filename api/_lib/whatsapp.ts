const GRAPH_API_VERSION = "v23.0";

export interface IncomingWhatsAppMessage {
  waMessageId: string;
  fromWaId: string;
  fromName?: string;
  timestampSec: string;
  type: string;
  text?: string;
  mediaId?: string;
}

/**
 * Normalizes a raw WhatsApp Cloud API webhook payload into a flat list of
 * messages. A single payload can contain multiple entries/changes, though in
 * practice Meta almost always sends one message per delivery.
 */
export function parseWhatsAppWebhookPayload(body: unknown): IncomingWhatsAppMessage[] {
  const messages: IncomingWhatsAppMessage[] = [];
  const entries = (body as any)?.entry ?? [];

  for (const entry of entries) {
    for (const change of entry?.changes ?? []) {
      if (change?.field !== "messages") continue;

      const value = change.value ?? {};
      const nameByWaId = new Map<string, string>(
        (value.contacts ?? []).map((contact: any) => [contact.wa_id, contact.profile?.name]),
      );

      for (const message of value.messages ?? []) {
        messages.push({
          waMessageId: message.id,
          fromWaId: message.from,
          fromName: nameByWaId.get(message.from),
          timestampSec: message.timestamp,
          type: message.type,
          text: message.text?.body,
          mediaId:
            message.image?.id ?? message.audio?.id ?? message.video?.id ?? message.document?.id,
        });
      }
    }
  }

  return messages;
}

/**
 * Sends a free-form (non-template) WhatsApp message. Only works within the
 * 24-hour customer service window opened by the recipient's last message —
 * fine for replying to an "Ask" query, not for messaging someone first.
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<unknown> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN env vars");
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp send failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}
