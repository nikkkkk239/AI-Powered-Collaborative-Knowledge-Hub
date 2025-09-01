import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Document from '../models/Document';
import User from '../models/User';

const router = express.Router();

// Helper function to call Gemini API
async function callGeminiAPI(apiKey: string, prompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to call Gemini API');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Summarize document
router.post('/summarize', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, documentId } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user?.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API key required. Please add it in your profile settings.' });
    }

    const prompt = `Please provide a concise summary of the following document content in 2-3 sentences:\n\n${content}`;
    const summary = await callGeminiAPI(user.geminiApiKey, prompt);

    // Update document if documentId provided
    if (documentId) {
      await Document.findByIdAndUpdate(documentId, { summary });
    }

    res.json({ summary });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate tags
router.post('/generate-tags', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, title } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user?.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API key required. Please add it in your profile settings.' });
    }

    const prompt = `Based on the following document title and content, generate 3-5 relevant tags (single words or short phrases, lowercase, comma-separated):\n\nTitle: ${title}\n\nContent: ${content}`;
    const tagsResponse = await callGeminiAPI(user.geminiApiKey, prompt);
    
    const tags = tagsResponse
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 5);

    res.json({ tags });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Semantic search
router.post('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user?.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API key required. Please add it in your profile settings.' });
    }

    // Get all documents
    const allDocs = await Document.find()
      .populate('createdBy', 'name email')
      .select('title content summary tags createdBy createdAt updatedAt');

    // Use Gemini to find relevant documents
    const docsContext = allDocs.map(doc => 
      `ID: ${doc._id}\nTitle: ${doc.title}\nSummary: ${doc.summary}\nContent: ${doc.content.substring(0, 500)}...\n`
    ).join('\n---\n');

    const prompt = `Based on the search query "${query}", analyze these documents and return the IDs of the most relevant ones (up to 5), ranked by relevance. Only return the document IDs, one per line:\n\n${docsContext}`;
    
    const relevantIds = await callGeminiAPI(user.geminiApiKey, prompt);
    const docIds = relevantIds.split('\n')
      .map(line => line.trim())
      .filter(id => id.length > 0)
      .slice(0, 5);

    // Filter documents by relevant IDs
    const relevantDocs = allDocs.filter(doc => 
      docIds.some(id => doc._id.toString().includes(id.replace('ID: ', '').trim()))
    );

    res.json({ documents: relevantDocs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Q&A over documents
router.post('/qa', authenticate, async (req: AuthRequest, res) => {
  try {
    const { question } = req.body;
    const user = await User.findById(req.user!._id);

    if (!user?.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API key required. Please add it in your profile settings.' });
    }

    // Get all documents as context
    const allDocs = await Document.find()
      .select('title content summary tags');

    const context = allDocs.map(doc => 
      `Title: ${doc.title}\nSummary: ${doc.summary}\nContent: ${doc.content}\n`
    ).join('\n---\n');

    const prompt = `Based on the following knowledge base documents, please answer this question: "${question}"\n\nKnowledge Base:\n${context}\n\nIf the answer cannot be found in the provided documents, please say so clearly. Provide a helpful and accurate response based only on the information available.`;
    
    const answer = await callGeminiAPI(user.geminiApiKey, prompt);

    res.json({ answer, question });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;