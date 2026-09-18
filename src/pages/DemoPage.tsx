import { useRef, useState } from "react";
import WhatsAppMockup from "../components/WhatsAppMockup";
import ResultsPreview, { type DemoResults } from "../components/ResultsPreview";
import { parseWhatsAppExport, type ParsedWhatsAppMessage } from "../lib/parseWhatsAppExport";

type Phase = "idle" | "parsed" | "processing" | "done" | "error";

// Mirrors MAX_MESSAGES in api/demo-classify.ts - surfaced here so an
// oversized file gets a clear heads-up before the request, not just a
// rejection after clicking Process.
const DEMO_MAX_MESSAGES = 150;

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<ParsedWhatsAppMessage[]>([]);
  const [groupName, setGroupName] = useState("Family chat");
  const [lovedOneName, setLovedOneName] = useState("");
  const [aliases, setAliases] = useState("");
  const [results, setResults] = useState<DemoResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseWhatsAppExport(text);
      setMessages(parsed);
      setGroupName(file.name.replace(/\.txt$/i, "").replace(/^whatsapp chat with /i, ""));
      setPhase("parsed");
      setError(null);
    };
    reader.readAsText(file);
  }

  async function handleProcess() {
    if (!lovedOneName.trim()) {
      setError("Enter the loved one's name before processing.");
      return;
    }
    setPhase("processing");
    setError(null);
    try {
      const response = await fetch("/api/demo-classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            timestamp: m.timestamp.toISOString(),
            sender: m.sender,
            text: m.text,
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
      const data: DemoResults = await response.json();
      setResults(data);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("parsed");
    }
  }

  function handleReset() {
    setPhase("idle");
    setMessages([]);
    setResults(null);
    setError(null);
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
          <p>Upload a WhatsApp chat export (.txt) to see it become structured family knowledge.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {phase !== "idle" && (
        <div className="demo-columns">
          <div className="demo-column">
            <WhatsAppMockup groupName={groupName} messages={messages} />
          </div>
          <div className="demo-column">
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
                <p>Reading the conversation and extracting structured knowledge…</p>
              </div>
            )}
            {phase === "done" && results && <ResultsPreview results={results} />}
          </div>
        </div>
      )}
    </main>
  );
}
