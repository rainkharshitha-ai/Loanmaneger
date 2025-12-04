// src/App.jsx
import { useState } from "react";

import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatBody from "./components/ChatBody";

// 🧠 System prompt for the bot
const SYSTEM_PROMPT = `SYSTEM PROMPT — Real SBA Loan Manager (PCFS Solutions)
You are a professional and intelligent virtual assistant for the SBA Loan Manager.
Format every reply: 1) summary 2) steps 3) follow-up.
`;

const API_URL = "https://sba-helpdesk-backend.onrender.com/api/chat";

const App = () => {
  // Controls open / close of the chatbot content
  const [showChatbot, setShowchatbot] = useState(false);

  // Chat messages for this session (no localStorage)
  const [chatHistory, setChatHistory] = useState([]);

  // Helper: add a new message into chatHistory
  const addMessage = (role, text, extra = {}) => {
    setChatHistory((prev) => [...prev, { role, text, ...extra }]);
  };

  // Main function to talk to backend
  const generateBotResponse = async (history) => {
    const lastUserMessage =
      history.filter((h) => h.role === "user").pop()?.text || "";

    // Small built-in reply for "hello"
    const normalized = lastUserMessage.trim().toLowerCase();
    if (normalized.includes("hello")) {
      addMessage("model", "I am your SBA assistant, how can I help today?");
      return;
    }

    const sbaPrompt = `${SYSTEM_PROMPT}\n\nUser message:\n${lastUserMessage}`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: sbaPrompt }] }],
    };

    // Add a temporary "Thinking…" message
    setChatHistory((prev) => [
      ...prev,
      { role: "model", text: "Thinking⋯", meta: { loading: true } },
    ]);

    try {
      console.log("➡️ Calling backend:", API_URL);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!response.ok) {
        const message = data?.error?.message || JSON.stringify(data);
        throw new Error(message);
      }

      const botReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.output?.[0]?.content?.[0]?.text ||
        data?.response ||
        (typeof data === "string" ? data : JSON.stringify(data));

      // Replace the last "Thinking…" with real reply
      setChatHistory((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === "model" && updated[i].meta?.loading) {
            updated[i] = { role: "model", text: botReply };
            return updated;
          }
        }
        // Fallback if no loading message found
        updated.push({ role: "model", text: botReply });
        return updated;
      });
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === "model" && updated[i].meta?.loading) {
            updated[i] = {
              role: "model",
              text: "Oops! Something went wrong: " + error.message,
            };
            return updated;
          }
        }
        updated.push({
          role: "model",
          text: "Oops! Something went wrong: " + error.message,
        });
        return updated;
      });
    }
  };

  // When user clicks a suggestion quick-reply button
  const handleSuggestion = async (suggestionText) => {
    const newHistory = [...chatHistory, { role: "user", text: suggestionText }];
    setChatHistory(newHistory);
    await generateBotResponse(newHistory);
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">SBA HelpDesk</h2>
          </div>

          {/* Arrow button to open / close the chat window */}
          <button
            onClick={() => setShowchatbot((prev) => !prev)}
            className="toggle-btn material-symbols-rounded"
            title="Toggle"
          >
            {showChatbot ? "keyboard_double_arrow_down" : "keyboard_double_arrow_up"}
          </button>
        </div>

        {/* Chat body + footer only when open */}
        {showChatbot && (
          <>
            <ChatBody
              chatHistory={chatHistory}
              onSuggestion={handleSuggestion}
            />

            <div className="chat-footer">
              <ChatForm
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                generateBotResponse={generateBotResponse}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
