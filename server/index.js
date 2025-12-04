import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Take API key from .env
const GEMINI_KEY = process.env.GEMINI_KEY;
console.log("🔑 GEMINI_KEY loaded:", GEMINI_KEY ? "YES" : "NO");

// ✅ Gemini model URL
const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/api/chat", async (req, res) => {
    try {
        console.log(
            "➡️ Incoming /api/chat request body:",
            JSON.stringify(req.body, null, 2)
        );

        if (!GEMINI_KEY) {
            return res
                .status(500)
                .json({ error: "Server missing GEMINI_KEY. Check .env file." });
        }

        // 🔹 Take the user's text from the request.
        // If something is wrong, just send "Hello" to Gemini.
        const userText =
            req.body?.contents?.[0]?.parts?.[0]?.text || "Hello from backend";

        // 🔹 Build the SAME payload that worked in your node -e test
        const payload = {
            contents: [
                {
                    parts: [{ text: userText }],
                },
            ],
        };

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": GEMINI_KEY, // ✅ correct place for key
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("🔁 Gemini status:", response.status);
        console.log("🔁 Gemini response:", JSON.stringify(data, null, 2));

        return res.status(response.status).json(data);
    } catch (e) {
        console.error("❌ Server error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

