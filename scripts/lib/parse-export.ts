/**
 * Parses a WhatsApp "Export Chat" text file into structured messages.
 *
 * Handles both date orderings seen across regions/app versions:
 *   DD/MM/YYYY, HH:MM[:SS] - Sender: text   (or "[..]" brackets, iOS)
 *   YYYY/MM/DD, HH:MM - Sender: text
 *
 * and both "." and "/" as the date separator, with or without seconds, and
 * with or without AM/PM. Lines with a timestamp prefix but no "Sender: text"
 * shape (group-created/added/left notices, encryption notices) are system
 * lines and are skipped, not glued onto the previous message.
 */

export interface ParsedWhatsAppMessage {
  timestamp: Date;
  sender: string;
  text: string;
  /** Filename of an attached media file, present in the export folder. */
  attachmentFilename: string | null;
  /** e.g. "media" when an attachment was referenced but not included in the export. */
  omittedMediaType: string | null;
}

const DATE_TIME_PREFIX =
  /^\[?(\d{1,4})[/.](\d{1,2})[/.](\d{1,4}),\s?(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]?\s?-?\s?/;

const FULL_LINE_PATTERN = new RegExp(DATE_TIME_PREFIX.source + "([^:]+):\\s(.*)$");

const ATTACHMENT_PATTERNS = [
  /<attached:\s*(.+?)>/i, // iOS
  /^(.+?\.\w+)\s*\(file attached\)$/i, // Android
];

const OMITTED_PATTERN = /\b(image|video|audio|sticker|gif|document|media)\s+omitted\b/i;

// Strips WhatsApp's invisible left-to-right/right-to-left marks, which otherwise break the regex.
function cleanLine(line: string): string {
  return line.replace(/[‎‏]/g, "").trimEnd();
}

/**
 * Exactly one of the two outer date components is a 4-digit year; the other
 * is a day (max 31). Whichever exceeds 31 is unambiguously the year - this
 * disambiguates DD/MM/YYYY from YYYY/MM/DD without needing a locale hint.
 */
function resolveDateParts(a: number, month: number, c: number): { day: number; month: number; year: number } {
  if (a > 31) {
    return { year: a, month, day: c };
  }
  const year = c < 100 ? 2000 + c : c;
  return { year, month, day: a };
}

function parseTime(time: string): { hours: number; minutes: number; seconds: number } {
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

  return { hours, minutes, seconds };
}

export function parseWhatsAppExport(chatText: string): ParsedWhatsAppMessage[] {
  const messages: ParsedWhatsAppMessage[] = [];

  for (const rawLine of chatText.split(/\r?\n/)) {
    const line = cleanLine(rawLine);
    if (!line) continue;

    const fullMatch = FULL_LINE_PATTERN.exec(line);
    if (!fullMatch) {
      // No "Sender: text" shape. Either a system notice with the same
      // timestamp prefix (created group, added/left, encryption notice) -
      // skip it - or a continuation line of the previous real message.
      if (DATE_TIME_PREFIX.test(line)) {
        continue;
      }
      if (messages.length > 0) {
        messages[messages.length - 1].text += `\n${line}`;
      }
      continue;
    }

    const [, aRaw, monthRaw, cRaw, time, sender, rawText] = fullMatch;
    const { day, month, year } = resolveDateParts(Number(aRaw), Number(monthRaw), Number(cRaw));
    const { hours, minutes, seconds } = parseTime(time);
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
      timestamp: new Date(year, month - 1, day, hours, minutes, seconds),
      sender: sender.trim(),
      text,
      attachmentFilename,
      omittedMediaType: omittedMatch ? omittedMatch[1].toLowerCase() : null,
    });
  }

  return messages;
}
