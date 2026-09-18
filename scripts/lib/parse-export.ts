/**
 * Parses a WhatsApp "Export Chat" text file into structured messages.
 *
 * Handles the two common export formats:
 *   iOS:     [DD/MM/YYYY, HH:MM:SS] Sender: text
 *   Android: DD/MM/YYYY, HH:MM - Sender: text
 *
 * Assumes DD/MM/YYYY (non-US) date order and a 24h or 12h (AM/PM) clock.
 * Real exports vary by locale/app version more than this covers - once we
 * have a real file to test against, adjust LINE_PATTERN and parseDateTime
 * rather than guessing further edge cases up front.
 */

export interface ParsedWhatsAppMessage {
  timestamp: Date;
  sender: string;
  text: string;
  /** Filename of an attached media file, present in the export folder. */
  attachmentFilename: string | null;
  /** e.g. "image" when media was referenced but not included in the export (locale text varies). */
  omittedMediaType: string | null;
}

const LINE_PATTERN =
  /^\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s?(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]?\s?-?\s?([^:]+):\s(.*)$/;

const ATTACHMENT_PATTERNS = [
  /<attached:\s*(.+?)>/i, // iOS
  /^(.+?\.\w+)\s*\(file attached\)$/i, // Android
];

const OMITTED_PATTERN = /\b(image|video|audio|sticker|gif|document|media)\s+omitted\b/i;

// Strips WhatsApp's invisible left-to-right marks, which otherwise break the regex.
function cleanLine(line: string): string {
  return line.replace(/[‎‏]/g, "").trimEnd();
}

function parseDateTime(day: number, month: number, yearRaw: number, time: string): Date {
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const ampmMatch = /([AaPp][Mm])$/.exec(time.trim());
  const timeOnly = time.trim().replace(/[AaPp][Mm]$/, "").trim();
  const [hoursStr, minutesStr, secondsStr] = timeOnly.split(":");
  let hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = secondsStr ? Number(secondsStr) : 0;

  if (ampmMatch) {
    const isPM = ampmMatch[1].toLowerCase() === "pm";
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

export function parseWhatsAppExport(chatText: string): ParsedWhatsAppMessage[] {
  const messages: ParsedWhatsAppMessage[] = [];

  for (const rawLine of chatText.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    if (!line) continue;

    const match = LINE_PATTERN.exec(line);
    if (!match) {
      // Continuation of the previous message's text (WhatsApp messages can
      // span multiple lines), or a system line we don't otherwise handle.
      if (messages.length > 0) {
        messages[messages.length - 1].text += `\n${line}`;
      }
      continue;
    }

    const [, day, month, year, time, sender, rawText] = match;
    const text = rawText.trim();

    let attachmentFilename: string | null = null;
    for (const pattern of ATTACHMENT_PATTERNS) {
      const attachMatch = pattern.exec(text);
      if (attachMatch) {
        attachmentFilename = attachMatch[1];
        break;
      }
    }

    const omittedMatch = OMITTED_PATTERN.exec(text);

    messages.push({
      timestamp: parseDateTime(Number(day), Number(month), Number(year), time),
      sender: sender.trim(),
      text,
      attachmentFilename,
      omittedMediaType: omittedMatch ? omittedMatch[1].toLowerCase() : null,
    });
  }

  return messages;
}
