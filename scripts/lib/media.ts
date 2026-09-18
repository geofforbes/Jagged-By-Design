import { readFile } from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "../../api/_lib/claude-model.js";

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
    model: CLAUDE_MODEL,
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
      // Voice note transcription is out of initial scope (would need a
      // speech-to-text provider beyond Claude) - just flag its presence.
      return "[Voice note shared, not transcribed]";
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
