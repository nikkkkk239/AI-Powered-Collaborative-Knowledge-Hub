import express from 'express';
import Document from '../models/Document';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongoose';
import rateLimit from 'express-rate-limit';
import Team from '../models/Team';
import { getEmbedding } from '../lib/embedding';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests, please try again later.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later."
    });
  }
});

const router = express.Router();

// Get all documents
router.get('/' , limiter, authenticate, async (req: AuthRequest, res) => {
  try {
    const { search, tags, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!req.user?.teamId) {
      return res.status(400).json({ message: "User has no team" });
    }

    let query: any = { teamId: req.user.teamId };

    if (search) {
      query.$text = { $search: search as string };
    }

    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const documents = await Document.find(query)
      .populate('createdBy', 'name email ')
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
      .populate('versions.updatedBy','name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (document.teamId.toString() !== req?.user?.teamId?.toString()) {
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
    const { title, content , summary, tags = [] } = req.body;
    const user = req.user!;

    if (!user.teamId) {
      return res.status(400).json({ message: "User must belong to a team" });
    }

    const embedding = await getEmbedding(process.env.EMBEDDING_KEY!, `${title}\n${content}`);


    const document = new Document({
      title,
      content,
      tags,
      createdBy: user._id,
      summary : summary ? summary : "",
      teamId: user.teamId,   // 👈 attach team here
      versions: [],
      embedding
    });
    const team = await Team.findById(user.teamId);

    if(!team){
      return res.status(404).json({message : "Team Not Found."});
    }

    team.recentActivities.push({
      docName : title,
      activityType : "create",
      user:user._id,
    })

    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }

    await team.save();
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
    if (document.teamId.toString() !== req?.user?.teamId?.toString()) {
        return res.status(403).json({ message: "Not in your team" });
    }
    const embedding = await getEmbedding(process.env.EMBEDDING_KEY!, `${title}\n${content}`);


    // Create new version
    document.versions.push({
      content: document.content,
      summary: document.summary,
      tags: document.tags,
      teamId : document.teamId,
      updatedBy: userId as any,
      updatedAt: new Date()
    });

    if (document.versions.length > 5) {
      document.versions = document.versions.slice(-5);
    }

    // Update document
    document.title = title || document.title;
    document.content = content || document.content;
    document.tags = tags || document.tags;
    document.summary = summary || document.summary;
    document.embedding = embedding || document.embedding;

    const team = await Team.findById(user.teamId);

    if(!team){
      return res.status(404).json({message : "Team Not Found."});
    }

    team.recentActivities.push({
      docName:title || document.title,
      activityType : "update",
      user:user._id,
    })

    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }
    await team.save();

    await document.save();
    await document.populate('versions.updatedBy','name email');

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

    if (document.teamId.toString() !== req?.user?.teamId?.toString()) {
        return res.status(403).json({ message: "Not in your team" });
    }

    const team = await Team.findById(user.teamId);

    if(!team){
      return res.status(404).json({message : "Team Not Found."});
    }

    team.recentActivities.push({
      docName : document.title,
      activityType : "delete",
      user:user._id,
    })

    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }
    await team.save();

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/activity/recent', authenticate, async (req: AuthRequest, res) => {
  try {
      const team = await Team.findById(req?.user?.teamId).populate("recentActivities.user", "name email");
      if(!team){
        return res.status(404).json({message : "Team Not Found."});
      }

    res.json({recentActivity : team.recentActivities});
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;