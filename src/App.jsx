
import { useState, useEffect } from "react";

import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatBody from "./components/ChatBody";

const SYSTEM_PROMPT = `SYSTEM PROMPT — Real SBA Loan Manager (PCFS Solutions)
You are a professional and intelligent virtual assistant for the SBA Loan Manager.
Format every reply: 1) summary 2) steps 3) follow-up.
`;

const App = () => {
  const [showChatbot, setShowchatbot] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chatHistory");
      if (saved) setChatHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } catch (e) {}
  }, [chatHistory]);

  
  const generateBotResponse = async (history) => {
    const lastUserMessage =
      history.filter((h) => h.role === "user").pop()?.text || "";

    
    const normalized = lastUserMessage.trim().toLowerCase();
    if (normalized.includes("hello")) {
      const botReply = "I am your SBA assistant, how can I help today?";
      setChatHistory([...history, { role: "model", text: botReply }]);
      return;
    }

    
    const sbaPrompt = `${SYSTEM_PROMPT}\n\nUser message:\n${lastUserMessage}`;

    const requestBody = {
      contents: [{ role: "user", parts: [{ text: sbaPrompt }] }],
    };

    setChatHistory((prev) => [
      ...prev,
      { role: "model", text: "Thinking⋯", meta: { loading: true } },
    ]);

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
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

      // replace "Thinking…" message
      setChatHistory((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === "model") {
            updated[i] = { role: "model", text: botReply };
            break;
          }
        }
        return updated;
      });
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === "model") {
            updated[i] = {
              role: "model",
              text: "Oops! Something went wrong: " + error.message,
            };
            break;
          }
        }
        return updated;
      });
    }
  };

  
  const handleSuggestion = async (suggestionText) => {
    const newHistory = [...chatHistory, { role: "user", text: suggestionText }];
    setChatHistory(newHistory);
    await generateBotResponse(newHistory);
  };

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">SBA HelpDesk</h2>
          </div>
          <button
            onClick={() => setShowchatbot((prev) => !prev)}
            className="material-symbols-rounded"
            title="Toggle"
          >
            keyboard_double_arrow_down
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default App;
