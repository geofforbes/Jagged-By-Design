import type { EnrichedMessage } from "../lib/mediaKind";
import { captionOnly, pseudoDuration } from "../lib/mediaKind";

const SENDER_COLORS = ["#c2185b", "#2e7d32", "#1565c0", "#6a1b9a", "#ef6c00", "#00838f", "#5d4037"];

function colorForSender(sender: string): string {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = (hash * 31 + sender.charCodeAt(i)) % SENDER_COLORS.length;
  }
  return SENDER_COLORS[Math.abs(hash)];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

interface WhatsAppMockupProps {
  groupName: string;
  messages: EnrichedMessage[];
  avatarUrl?: string | null;
}

export default function WhatsAppMockup({ groupName, messages, avatarUrl }: WhatsAppMockupProps) {
  let lastDayLabel = "";

  return (
    <div className="wa-phone">
      <div className="wa-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="wa-header-avatar-photo" />
        ) : (
          <div className="wa-header-avatar">{groupName.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <div className="wa-header-title">{groupName}</div>
        </div>
      </div>
      <div className="wa-messages">
        {messages.map((message, i) => {
          const dayLabel = formatDayLabel(message.timestamp);
          const showDaySeparator = dayLabel !== lastDayLabel;
          lastDayLabel = dayLabel;
          const caption = captionOnly(message);

          return (
            <div key={i}>
              {showDaySeparator && <div className="wa-day-separator">{dayLabel}</div>}
              <div className="wa-bubble">
                <div className="wa-bubble-sender" style={{ color: colorForSender(message.sender) }}>
                  {message.sender}
                </div>

                {message.mediaKind === "image" &&
                  (message.photoUrl ? (
                    <img src={message.photoUrl} alt="" className="wa-bubble-photo" />
                  ) : (
                    <div className="wa-bubble-photo-placeholder">📷 Photo</div>
                  ))}

                {message.mediaKind === "audio" && (
                  <div className="wa-bubble-voice">
                    <span className="wa-bubble-voice-icon">🎤</span>
                    <span className="wa-bubble-voice-wave">
                      {Array.from({ length: 10 }, (_, j) => (
                        <span key={j} style={{ height: `${4 + ((i + j) % 5) * 3}px` }} />
                      ))}
                    </span>
                    <span className="wa-bubble-voice-duration">{pseudoDuration(message.attachmentFilename ?? String(i))}</span>
                  </div>
                )}

                {message.mediaKind === "video" &&
                  (message.attachmentFilename ? <div className="wa-bubble-photo-placeholder">🎬 Video</div> : null)}

                {caption && <div className="wa-bubble-text">{caption}</div>}
                <div className="wa-bubble-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="wa-empty">No messages to show yet — upload a chat export to begin.</p>
        )}
      </div>
    </div>
  );
}
