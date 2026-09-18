import type { ParsedWhatsAppMessage } from "../lib/parseWhatsAppExport";

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
  messages: ParsedWhatsAppMessage[];
}

export default function WhatsAppMockup({ groupName, messages }: WhatsAppMockupProps) {
  let lastDayLabel = "";

  return (
    <div className="wa-phone">
      <div className="wa-header">
        <div className="wa-header-avatar">{groupName.charAt(0).toUpperCase()}</div>
        <div>
          <div className="wa-header-title">{groupName}</div>
          <div className="wa-header-subtitle">{messages.length} messages</div>
        </div>
      </div>
      <div className="wa-messages">
        {messages.map((message, i) => {
          const dayLabel = formatDayLabel(message.timestamp);
          const showDaySeparator = dayLabel !== lastDayLabel;
          lastDayLabel = dayLabel;

          return (
            <div key={i}>
              {showDaySeparator && <div className="wa-day-separator">{dayLabel}</div>}
              <div className="wa-bubble">
                <div className="wa-bubble-sender" style={{ color: colorForSender(message.sender) }}>
                  {message.sender}
                </div>
                <div className="wa-bubble-text">{message.text}</div>
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
