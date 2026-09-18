import { readFile } from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const AUDIO_EXTENSIONS = new Set([".opus", ".ogg", ".m4a", ".mp3", ".aac", ".wav"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".3gp", ".avi"]);

export type MediaKind = "image" | "audio" | "video" | "document" | "unknown";

export function getMediaKind(filename: string): MediaKind {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (ext === ".pdf") return "document";
  return "unknown";
}

const IMAGE_MEDIA_TYPES: Record<string, "image/jpeg" | "image/png" | "image/webp" | "image/gif"> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function describeImage(filePath: string, captionText?: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const mediaType = IMAGE_MEDIA_TYPES[ext] ?? "image/jpeg";
  const data = (await readFile(filePath)).toString("base64");

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data } },
          {
            type: "text",
            text: `Describe what's happening in this photo in one or two sentences, for a family dementia-care timeline. Focus on people, setting, mood, and activity.${
              captionText ? ` The person who shared it captioned it: "${captionText}"` : ""
            }`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}

// OpenAI transcription model - update if this identifier becomes stale.
const WHISPER_MODEL = "whisper-1";

export async function transcribeAudio(filePath: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY env var (needed for voice note transcription)");
  }

  const fileBuffer = await readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(fileBuffer)]), path.basename(filePath));
  form.append("model", WHISPER_MODEL);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Whisper transcription failed (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as { text: string };
  return result.text;
}

/**
 * Best-effort description of any attachment, as plain text to fold into the
 * conversation before classification. Never throws - a failure just means
 * that one attachment contributes no extra context (logged for visibility).
 */
export async function describeAttachment(
  filePath: string,
  captionText: string | undefined,
): Promise<string | null> {
  const kind = getMediaKind(filePath);
  try {
    if (kind === "image") {
      const description = await describeImage(filePath, captionText);
      return `[Photo: ${description}]`;
    }
    if (kind === "audio") {
      const transcript = await transcribeAudio(filePath);
      return `[Voice note transcript: ${transcript}]`;
    }
    if (kind === "video") {
      // No video-frame extraction in this pass (would need ffmpeg) - just
      // flag its presence so classification knows a video was shared.
      return "[Video shared, not analyzed]";
    }
    return null;
  } catch (err) {
    console.error(`Failed to describe attachment ${filePath}:`, err);
    return null;
  }
}
