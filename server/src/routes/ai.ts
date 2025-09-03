import express from "express";
import { AuthRequest, authenticate } from "../middleware/auth";
import { callGemini } from "../lib/gemini";
import Document from "../models/Document";
import { getEmbedding } from "../lib/embedding";

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
      Generate 4 to 6 short, relevant tags (keywords) for the following document.
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

router.post("/search", authenticate, async (req: AuthRequest, res) => {
  try {
    const { body } = req.body; // take `body` instead of `query`
    const apiKey = req.user?.geminiApiKey || process.env.FREE_GEMINI_KEY!;

    if (!body) {
      return res.status(400).json({ message: "Body text is required" });
    }

    // get body embedding
    const queryEmbedding = await getEmbedding(apiKey, body);

    // fetch all docs with embeddings
    const docs = await Document.find({ embedding: { $exists: true, $ne: [] } }).populate(
      "createdBy",
      "name email"
    );

    // cosine similarity
    function cosineSimilarity(a: number[], b: number[]) {
      const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
      const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
      return dot / (magA * magB);
    }

    const results = docs
      .map((doc) => ({
        doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .filter((r) => r.score > 0.60)
      .sort((a, b) => b.score - a.score) // higher first
      .slice(0, 5) // top 5
      .map((r) => r.doc); // ✅ only keep docs

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
