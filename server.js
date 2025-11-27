const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3001;

// Use environment variable for the Gemini API key in production.
// Keep a fallback placeholder but recommend setting `GEMINI_API_KEY`.
const API_KEY = process.env.GEMINI_API_KEY || "your key";
const genAI = new GoogleGenerativeAI(API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (index.html, etc.) from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Gemini AI API route
app.post("/ask-gemini", async (req, res) => {
  try {
    const { question } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });
  } catch (error) {
    console.error("Gemini AI Error:", error);
    res.status(500).json({ answer: "Gemini AI failed to respond." });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
