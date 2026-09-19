import { useRef, useState } from "react";
import JSZip from "jszip";
import WhatsAppMockup from "../components/WhatsAppMockup";
import AppPreview from "../components/AppPreview";
import ResultsPreview, { type CareItem, type CalendarItem, type DemoResults, type LifeStoryItem } from "../components/ResultsPreview";
import { parseWhatsAppExport } from "../lib/parseWhatsAppExport";
import { captionOnly, detectMediaKind, type EnrichedMessage } from "../lib/mediaKind";

type Phase = "idle" | "parsed" | "processing" | "done" | "error";

// Total upload size this live demo accepts - surfaced here so an oversized
// file gets a clear heads-up before processing starts, not just a rejection
// partway through.
const DEMO_MAX_MESSAGES = 150;

// Messages sent per /api/demo-classify request. Even a single 140-message
// request (well under DEMO_MAX_MESSAGES, and ~7-8s by local timing) still hit
// a 504 in production, which means Vercel's real per-invocation limit is
// stricter than the maxDuration we configured - most likely the Hobby plan's
// platform-level cap, which isn't overridable from app code. Rather than
// chase the exact number, each request is kept small enough (a few seconds
// of Claude time) to comfortably fit under any plausible limit; the browser
// sends the upload as a sequence of small requests and merges the results.
const BATCH_SIZE = 25;

// Batches run concurrently, not one-at-a-time: each is a separate Vercel
// invocation, not multiple Anthropic calls sharing one function's wall
// clock (that's the earlier day-chunking case, where concurrency genuinely
// didn't help). Awaiting them sequentially was the main reason a 6-batch
// upload took 3+ minutes. DEMO_MAX_MESSAGES / BATCH_SIZE is 6, so this
// covers the largest file the demo accepts in a single wave rather than
// two - concurrency=4 still left a 6-batch upload waiting on a second
// round, which is why it was still taking ~2 minutes after the first fix.
const CONCURRENCY = 6;

// Finds a zip entry for an attachment filename - exact path first, then by
// basename, since some WhatsApp export zips nest media in a subfolder while
// the .txt still references the bare filename.
function findZipEntry(zip: JSZip, filename: string): JSZip.JSZipObject | null {
  const exact = zip.file(filename);
  if (exact) return exact;
  const basename = filename.split("/").pop() ?? filename;
  const escaped = basename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = zip.file(new RegExp(`(^|/)${escaped}$`));
  return matches[0] ?? null;
}

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const [groupName, setGroupName] = useState("Family chat");
  const [lovedOneName, setLovedOneName] = useState("");
  const [aliases, setAliases] = useState("");
  const [results, setResults] = useState<DemoResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp's "Export Chat" -> "Attach Media" produces a .zip with the
  // chat .txt plus the actual photos/voice notes. Images are matched to
  // their message here and turned into an object URL purely for display -
  // never uploaded anywhere, since the classifier never needs to see them
  // (see messageTextForClassifier below).
  async function loadZip(file: File): Promise<EnrichedMessage[]> {
    const zip = await JSZip.loadAsync(file);
    const txtEntry = Object.values(zip.files).find((f) => !f.dir && /\.txt$/i.test(f.name));
    if (!txtEntry) {
      throw new Error('No .txt chat file found in that zip - make sure it\'s a WhatsApp "Export Chat" zip.');
    }
    const text = await txtEntry.async("string");
    const parsed = parseWhatsAppExport(text);

    const enriched: EnrichedMessage[] = [];
    for (const message of parsed) {
      const mediaKind = detectMediaKind(message);
      let photoUrl: string | null = null;
      if (mediaKind === "image" && message.attachmentFilename) {
        const entry = findZipEntry(zip, message.attachmentFilename);
        if (entry) {
          const blob = await entry.async("blob");
          photoUrl = URL.createObjectURL(blob);
        }
      }
      enriched.push({ ...message, mediaKind, photoUrl });
    }
    return enriched;
  }

  function handleFile(file: File) {
    const finish = (enriched: EnrichedMessage[], name: string) => {
      setMessages(enriched);
      setGroupName(name.replace(/^whatsapp chat with /i, ""));
      setPhase("parsed");
      setError(null);
    };

    if (/\.zip$/i.test(file.name)) {
      loadZip(file)
        .then((enriched) => finish(enriched, file.name.replace(/\.zip$/i, "")))
        .catch((err) => setError(err instanceof Error ? err.message : "Couldn't read that zip file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseWhatsAppExport(text);
      const enriched: EnrichedMessage[] = parsed.map((m) => ({ ...m, mediaKind: detectMediaKind(m), photoUrl: null }));
      finish(enriched, file.name.replace(/\.txt$/i, ""));
    };
    reader.readAsText(file);
  }

  // What actually gets sent to the classifier for a media message: never the
  // file itself (no vision/transcription happens here - see AppPreview's
  // "not built in this demo pass" placeholders for where real analysis would
  // slot in), just a bracketed hint matching what classifyChunk's system
  // prompt expects, plus any real caption text already in the export.
  function messageTextForClassifier(m: EnrichedMessage): string {
    const caption = captionOnly(m);
    if (m.mediaKind === "image") return caption ? `[Photo: ${caption}]` : "[Photo attached, no caption]";
    if (m.mediaKind === "video") return caption ? `[Video: ${caption}]` : "[Video attached, no caption]";
    if (m.mediaKind === "audio") {
      return caption ? `[Voice note attached - not transcribed. Caption: ${caption}]` : "[Voice note attached - not transcribed]";
    }
    return m.text;
  }

  async function classifyBatch(batch: EnrichedMessage[]): Promise<{
    care: (CareItem & { source_message_index: number })[];
    lifeStory: (LifeStoryItem & { source_message_index: number })[];
    calendar: (CalendarItem & { source_message_index: number })[];
  }> {
    const response = await fetch("/api/demo-classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: batch.map((m) => ({
          timestamp: m.timestamp.toISOString(),
          sender: m.sender,
          text: messageTextForClassifier(m),
        })),
        lovedOneName: lovedOneName.trim(),
        aliases: aliases
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${response.status})`);
    }
    return await response.json();
  }

  async function handleProcess() {
    if (!lovedOneName.trim()) {
      setError("Enter the loved one's name before processing.");
      return;
    }
    setPhase("processing");
    setError(null);
    setWarning(null);

    const batches: EnrichedMessage[][] = [];
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      batches.push(messages.slice(i, i + BATCH_SIZE));
    }
    setBatchProgress({ done: 0, total: batches.length });

    const merged: DemoResults = { care: [], lifeStory: [], calendar: [] };
    let nextId = 1;
    let failedBatches = 0;
    let doneCount = 0;

    // A bounded worker pool, not Promise.all(batches.map(...)): that would
    // fire every batch at once regardless of count, which is both an
    // unbounded burst against Anthropic's rate limits and loses the
    // "N of M" progress granularity. Each worker just keeps pulling the next
    // unclaimed batch until none are left. One batch failing (e.g. the model
    // emitting a value outside a fixed enum - classifyChunk already retries
    // once server-side) is caught per-worker and skipped, not left to
    // discard everything else already merged.
    let nextBatchIndex = 0;
    async function worker() {
      while (nextBatchIndex < batches.length) {
        const batch = batches[nextBatchIndex++];
        try {
          const batchResult = await classifyBatch(batch);
          for (const { source_message_index: _unused, ...item } of batchResult.care) {
            merged.care.push({ ...item, id: nextId++ });
          }
          for (const { source_message_index, ...item } of batchResult.lifeStory) {
            // The photo itself never went to the server (see
            // messageTextForClassifier) - re-attach it here from the same
            // batch's local object URL, purely client-side.
            merged.lifeStory.push({ ...item, id: nextId++, photo_url: batch[source_message_index]?.photoUrl ?? null });
          }
          for (const { source_message_index: _unused2, ...item } of batchResult.calendar) {
            merged.calendar.push({ ...item, id: nextId++ });
          }
        } catch (err) {
          failedBatches += 1;
          console.error("Batch failed, skipping", err);
        }
        doneCount += 1;
        setBatchProgress({ done: doneCount, total: batches.length });
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, batches.length) }, () => worker()),
    );

    setBatchProgress(null);
    setResults(merged);
    setPhase("done");
    if (failedBatches > 0) {
      setWarning(
        `${failedBatches} of ${batches.length} batches couldn't be processed and were skipped - results below are incomplete.`,
      );
    }
  }

  function handleReset() {
    for (const m of messages) {
      if (m.photoUrl) URL.revokeObjectURL(m.photoUrl);
    }
    setPhase("idle");
    setMessages([]);
    setResults(null);
    setError(null);
    setWarning(null);
    setLovedOneName("");
    setAliases("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="demo-page">
      <header className="demo-header">
        <h1>Chat export ingestion demo</h1>
        {phase !== "idle" && (
          <button className="demo-reset" onClick={handleReset}>
            Reset
          </button>
        )}
      </header>

      {phase === "idle" && (
        <div className="demo-upload">
          <p>
            Upload a WhatsApp chat export to see it become structured family knowledge. A plain .txt export works,
            or a .zip from "Export Chat → Attach Media" to include real photos and voice notes.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.zip"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {phase !== "idle" && (
        <div className="demo-pipeline">
          <div className="demo-stage">
            <h3 className="demo-stage-label">WhatsApp export</h3>
            <div className="demo-stage-frame">
              <WhatsAppMockup groupName={groupName} messages={messages} />
            </div>
          </div>

          <div className="demo-arrow" aria-hidden="true">
            <span className="demo-arrow-glyph">→</span>
            <span className="demo-arrow-label">Claude extracts</span>
          </div>

          <div className="demo-stage">
            <h3 className="demo-stage-label">Structured data</h3>
            <div className="demo-stage-frame demo-stage-frame-plain">
              {phase === "parsed" && (
                <div className="demo-process-form">
                  <p>{messages.length} messages parsed. Who is this conversation about?</p>
                  {messages.length > DEMO_MAX_MESSAGES && (
                    <p className="demo-error">
                      That's {messages.length} messages — this live demo handles up to {DEMO_MAX_MESSAGES} at once
                      to stay fast and reliable. Export a shorter date range for the live demo.
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="Loved one's name (e.g. Nana)"
                    value={lovedOneName}
                    onChange={(e) => setLovedOneName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Nicknames, comma separated (e.g. Mom, Nan)"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                  />
                  {error && <p className="demo-error">{error}</p>}
                  <button
                    className="demo-process-button"
                    onClick={handleProcess}
                    disabled={messages.length > DEMO_MAX_MESSAGES}
                  >
                    Process this conversation
                  </button>
                </div>
              )}
              {phase === "processing" && (
                <div className="demo-processing">
                  <div className="demo-spinner" />
                  <p>
                    Reading the conversation and extracting structured knowledge…
                    {batchProgress && (
                      <>
                        <br />
                        Batch {Math.min(batchProgress.done + 1, batchProgress.total)} of {batchProgress.total}
                      </>
                    )}
                  </p>
                </div>
              )}
              {phase === "done" && results && (
                <>
                  {warning && <p className="demo-error">{warning}</p>}
                  <ResultsPreview results={results} />
                </>
              )}
            </div>
          </div>

          <div className="demo-arrow" aria-hidden="true">
            <span className="demo-arrow-glyph">→</span>
            <span className="demo-arrow-label">Powers the app</span>
          </div>

          <div className="demo-stage">
            <h3 className="demo-stage-label">Care Co. app</h3>
            <div className="demo-stage-frame">
              {phase === "done" && results ? (
                <AppPreview results={results} lovedOneName={lovedOneName.trim()} messages={messages} />
              ) : (
                <div className="demo-stage-placeholder">App screens populate here once processing finishes.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
