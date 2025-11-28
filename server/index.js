import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Take API key from .env
const GEMINI_KEY = process.env.GEMINI_KEY;

// ✅ Correct model URL (new)
const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/api/chat", async (req, res) => {
    try {
        console.log(
            "➡️ Incoming /api/chat request body:",
            JSON.stringify(req.body, null, 2)
        );

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        console.log("🔁 Gemini status:", response.status);
        console.log("🔁 Gemini response:", JSON.stringify(data, null, 2));

        return res.status(response.status).json(data);
    } catch (e) {
        console.error("❌ Server error:", e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

