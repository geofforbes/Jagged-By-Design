import type { ParsedWhatsAppMessage } from "./parseWhatsAppExport";

export type MediaKind = "image" | "video" | "audio" | null;

/**
 * A parsed message enriched with a browser-local object URL for its photo,
 * when the upload was a .zip with real media (see zipToMessages in
 * DemoPage.tsx) - never uploaded anywhere, just used for display and for
 * re-attaching to a life-story item's photo_url after classification.
 */
export interface EnrichedMessage extends ParsedWhatsAppMessage {
  mediaKind: MediaKind;
  photoUrl: string | null;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|heic|heif|gif)$/i;
const VIDEO_EXT = /\.(mp4|mov|3gp|m4v)$/i;
const AUDIO_EXT = /\.(opus|m4a|aac|mp3|ogg|amr|wav)$/i;

/**
 * Derives a coarse media kind from a parsed message's attachment info, so
 * the browser demo can render (or classify) it appropriately without ever
 * needing the actual file bytes for anything but display. Real WhatsApp
 * exports made without media just say "image omitted" etc.; exports made
 * with "Attach Media" carry the real filename instead.
 */
export function detectMediaKind(message: ParsedWhatsAppMessage): MediaKind {
  if (message.omittedMediaType) {
    if (message.omittedMediaType === "video") return "video";
    if (message.omittedMediaType === "audio") return "audio";
    if (message.omittedMediaType === "image" || message.omittedMediaType === "sticker" || message.omittedMediaType === "gif") {
      return "image";
    }
    return null;
  }
  if (message.attachmentFilename) {
    if (IMAGE_EXT.test(message.attachmentFilename)) return "image";
    if (VIDEO_EXT.test(message.attachmentFilename)) return "video";
    if (AUDIO_EXT.test(message.attachmentFilename)) return "audio";
  }
  return null;
}

/** Strips the raw attachment marker from message text, leaving only a caption (if any). */
export function captionOnly(message: ParsedWhatsAppMessage): string {
  return message.text
    .replace(/<attached:\s*.+?>/i, "")
    .replace(/^.+?\.\w+\s*\(file attached\)$/i, "")
    .replace(/\b(image|video|audio|sticker|gif|document|media)\s+omitted\b/i, "")
    .trim();
}

/** A small stable "duration" for a voice-note bubble, derived from its filename so it doesn't change on re-render - never a real analyzed value. */
export function pseudoDuration(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const seconds = 8 + (hash % 52); // 0:08-0:59, plausible voice-note range
  return `0:${String(seconds).padStart(2, "0")}`;
}
