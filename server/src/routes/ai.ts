import express from "express";
import { AuthRequest, authenticate } from "../middleware/auth";
import { callGemini } from "../lib/gemini";
import Document from "../models/Document";
import { ObjectId } from "mongoose";

const router = express.Router();

/**
 * POST /api/ai/summarize/:docId
 * Summarizes a document content
 */
router.post("/summarize", authenticate, async (req: AuthRequest, res) => {
  try {
    const {content , title} = req.body;


    const prompt = `
      Summarize the following text into 2–3 concise sentences, highlighting only the key points. 
      Keep the summary short and simple.
      Document Title: ${title}
      Content:
      ${content}
    `;

    const summary = await callGemini(req.user?.geminiApiKey || "", prompt);

    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/ai/tags/:docId
 * Generates tags from a document content
 */
router.post("/tags", authenticate, async (req: AuthRequest, res) => {
  try {

    const {content , title} = req.body;



    const prompt = `
      Generate 5 to 8 short, relevant tags (keywords) for the following document.
      Only return a comma-separated list of tags.
      Document Title: ${title}
      Content:
      ${content}
    `;

    const tagText = await callGemini(req.user?.geminiApiKey || "", prompt);

    // convert into array
    const tags = tagText.split(",").map(t => t.trim()).filter(Boolean);

    res.json({ tags });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
