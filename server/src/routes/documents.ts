import express from 'express';
import Document from '../models/Document';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongoose';

const router = express.Router();

// Get all documents
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { search, tags, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!req.user?.teamId) {
      return res.status(400).json({ message: "User has no team" });
    }

    let query: any = { team: req.user.teamId };

    if (search) {
      query.$text = { $search: search as string };
    }

    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Get document by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('versions.updatedBy', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (document.teamId.toString() !== req.user!.teamId.toString()) {
        return res.status(403).json({ message: "Not in your team" });
    }

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Create document
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    const user = req.user!;

    if (!user.teamId) {
      return res.status(400).json({ message: "User must belong to a team" });
    }

    const document = new Document({
      title,
      content,
      tags,
      createdBy: user._id,
      team: user.teamId,   // 👈 attach team here
      versions: [{
        content,
        tags,
        updatedBy: user._id,
        updatedAt: new Date()
      }]
    });

    await document.save();
    await document.populate('createdBy', 'name email');

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// Update document
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags, summary } = req.body;
    const userId = req.user!._id;
    const user = req.user!;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions
    if (document.teamId.toString() !== req.user!.teamId.toString()) {
        return res.status(403).json({ message: "Not in your team" });
    }

    // Create new version
    document.versions.push({
      content: document.content,
      summary: document.summary,
      tags: document.tags,
      updatedBy: userId,
      updatedAt: new Date()
    });

    // Update document
    document.title = title || document.title;
    document.content = content || document.content;
    document.tags = tags || document.tags;
    document.summary = summary || document.summary;

    await document.save();
    await document.populate('createdBy', 'name email');

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete document
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId= req.user!._id;
    const user = req.user!;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }


    // Check permissions
    if (document.teamId.toString() !== req.user!.teamId.toString()) {
        return res.status(403).json({ message: "Not in your team" });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/activity/recent', authenticate, async (req: AuthRequest, res) => {
  try {
    const recentDocs = await Document.find({teamId : req.user?.teamId})
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt createdBy');

    res.json(recentDocs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;