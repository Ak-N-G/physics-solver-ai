const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3001;

// Replace this with your actual Gemini API key
const API_KEY = "AIzaSyDw4gki0SKBtItufQDf57UUTSv8v2yq0Ws";
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