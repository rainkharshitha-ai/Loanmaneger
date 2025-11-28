import { useEffect, useRef } from "react";
import ChatbotIcon from "./ChatbotIcon";

const ChatBody = ({ chatHistory, onSuggestion }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  const formatText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*/g, "")
      .replace(/^#+\s?/gm, "")
      .replace(/\d+\./g, "");
  };

  // suggestion items
  const suggestions = [
    "Loan Status Update",
    "Document Checklist",
    "Payment Posting Help",
    "Loan Eligibility Check",
    "Loan Payoff Quote"
  ];

  return (
    <div className="chat-body" role="log" aria-live="polite">

      {/* Welcome message */}
      <div className="message bot-message welcome">
        <div className="bot-icon">
          <ChatbotIcon />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Hello! I'm here to help — ask about Loan Manager
          </p>
          <div style={{ height: 8 }} />
          <p style={{ margin: 0, color: "rgba(230,238,248,0.7)" }}>
            Not sure what to ask? Choose something:
          </p>
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="chip-user"
            onClick={() => onSuggestion(s)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSuggestion(s);
            }}
            aria-label={`Suggestion: ${s}`}
            title={s}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Chat history */}
      {chatHistory.map((chat, index) => {
        const isModel = chat.role === "model";
        const containerClass = `message ${isModel ? "bot-message" : "user-message"}`;

        return (
          <div key={index} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div className={containerClass}>
              {isModel && (
                <div className="bot-icon">
                  <ChatbotIcon />
                </div>
              )}

              <div className="message-content" style={{ flex: 1 }}>
                <p
                  className="message-text"
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(chat.text) }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBody;
