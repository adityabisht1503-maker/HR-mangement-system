const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  workforceInsights,
  analyzeEmployee,
  generateJobDescription,
  chat,
} = require("../controller/aiController");

const aiRouter = express.Router();

// GET  /api/ai/workforce-insights          → dashboard AI panel
aiRouter.get("/workforce-insights",          authMiddleware, workforceInsights);

// POST /api/ai/analyze-employee/:id        → single employee AI analysis
aiRouter.post("/analyze/:id",       authMiddleware, analyzeEmployee);

// POST /api/ai/generate-job-description    → generate JD with Gemini
aiRouter.post("/generate-job-description",   authMiddleware, generateJobDescription);

// POST /api/ai/chat                        → HR AI chatbot
aiRouter.post("/chat",                       authMiddleware, chat);

module.exports = { aiRouter };
