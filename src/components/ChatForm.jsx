import { useState } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const [userInput, setUserInput] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() && !attachedFile) return;

    const newMessages = [];

    if (attachedFile) {
      newMessages.push({
        role: "user",
        text: attachedFile.type.startsWith("image/")
          ? `🖼️ Attached an image: ${attachedFile.name}`
          : `📎 Attached: ${attachedFile.name}`,
      });
    }

    if (userInput.trim()) {
      newMessages.push({ role: "user", text: userInput });
    }

    const newHistory = [
      ...chatHistory,
      ...newMessages,
     
    ];

    setChatHistory(newHistory);
    setUserInput("");
    setAttachedFile(null);
    setPreviewUrl(null);

    await generateBotResponse(newHistory);
  };

  const handleAttachClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewUrl(imageUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />

      <button type="button" className="attach-btn" onClick={handleAttachClick} title="Attach a file">
        <span className="material-symbols-rounded">add</span>
      </button>

      {attachedFile && (
        <div className="attached-file-preview">
          {previewUrl ? (
            <img src={previewUrl} alt={attachedFile.name} className="image-preview" />
          ) : (
            <>📎 {attachedFile.name}</>
          )}
          <button type="button" className="remove-file-btn" onClick={() => { setAttachedFile(null); setPreviewUrl(null); }} title="Remove file">✖</button>
        </div>
      )}

      <input
        type="text"
        className="chat-input"
        placeholder="Type a message..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />

      <button type="submit" className="send-btn" title="Send message">
        <span className="material-symbols-rounded">send</span>
      </button>
    </form>
  );
};

export default ChatForm;
