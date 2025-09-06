import express from 'express';
import Document from '../models/Document';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import Team from '../models/Team';
import redisClient from '../client';
import { getEmbedding } from '../lib/embedding';
import mongoose from 'mongoose';

// Utility: Extract plain text from Quill Delta JSON
function extractPlainText(delta: any): string {
  if (!Array.isArray(delta)) return '';
  return delta
    .map(op => (typeof op.insert === 'string' ? op.insert : ''))
    .join('');
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later."
    });
  }
});

const router = express.Router();

/**
 * Get all documents
 */
router.get('/', limiter, authenticate, async (req: AuthRequest, res) => {
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

/**
 * Get document by ID
 */
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('versions.updatedBy', 'name email');

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

/**
 * Create document
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, summary, tags = [] } = req.body;
    const user = req.user!;

    if (!user.teamId) {
      return res.status(400).json({ message: "User must belong to a team" });
    }

    // Extract plain text from Quill JSON for embeddings
    const plainText = extractPlainText(content);
    const embedding = await getEmbedding(process.env.EMBEDDING_KEY!, `${title}\n${plainText}`);

    const document = new Document({
      title,
      content, // Quill Delta JSON
      tags,
      createdBy: user._id,
      summary: summary || "",
      teamId: user.teamId,
      versions: [],
      embedding
    });

    const team = await Team.findById(user.teamId);
    if (!team) return res.status(404).json({ message: "Team Not Found." });

    team.recentActivities.push({
      docName: title,
      activityType: "create",
      user: user._id as mongoose.Types.ObjectId,
      date: new Date()
    });
    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }

    await team.save();
    await team.populate("recentActivities.user", "name email");
    await redisClient.publish("team:activity", JSON.stringify({
      activity: team.recentActivities[team.recentActivities.length - 1],
      teamId: team._id
    }));

    await document.save();
    await document.populate('createdBy', 'name email');
    await redisClient.publish("document:new", JSON.stringify({
      teamId: team._id,
      document
    }));

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Update document
 */
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags, summary } = req.body;
    const user = req.user!;

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (document.teamId.toString() !== user.teamId?.toString()) {
      return res.status(403).json({ message: "Not in your team" });
    }

    // Prepare embedding from plain text
    const plainText = content ? extractPlainText(content) : extractPlainText(document.content);
    const embedding = await getEmbedding(process.env.EMBEDDING_KEY!, `${title || document.title}\n${plainText}`);

    // Save current state as a new version
    document.versions.push({
      title: document.title,
      content: document.content,
      summary: document.summary,
      tags: document.tags,
      teamId: document.teamId,
      updatedBy: user._id as mongoose.Types.ObjectId,
      updatedAt: new Date()
    });
    if (document.versions.length > 5) {
      document.versions = document.versions.slice(-5);
    }

    // Update doc
    document.title = title || document.title;
    document.content = content || document.content;
    document.tags = tags || document.tags;
    document.summary = summary || document.summary;
    document.embedding = embedding || document.embedding;

    const team = await Team.findById(user.teamId);
    if (!team) return res.status(404).json({ message: "Team Not Found." });

    team.recentActivities.push({
      docName: title || document.title,
      activityType: "update",
      user: user._id as mongoose.Types.ObjectId,
      date: new Date()
    });
    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }

    await team.save();
    await team.populate("recentActivities.user", "name email");
    await redisClient.publish("team:activity", JSON.stringify({
      activity: team.recentActivities[team.recentActivities.length - 1],
      teamId: team._id
    }));

    await document.save();
    await document.populate('versions.updatedBy', 'name email');
    await redisClient.publish("document:update", JSON.stringify({
      teamId: team._id,
      document
    }));

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Revert document
 */
router.put('/revert/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { versionIndex } = req.body; // safer than matching on content/title
    const user = req.user!;

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.teamId.toString() !== user.teamId?.toString()) {
      return res.status(403).json({ message: "Not in your team" });
    }

    if (versionIndex == null || versionIndex < 0 || versionIndex >= document.versions.length) {
      return res.status(400).json({ message: "Invalid version index" });
    }

    const targetVersion = document.versions[versionIndex];

    // Save current doc as version
    document.versions.push({
      title: document.title,
      content: document.content,
      summary: document.summary,
      tags: document.tags,
      teamId: document.teamId,
      updatedBy: user._id as mongoose.Types.ObjectId,
      updatedAt: new Date(),
    });

    // Overwrite with target version
    document.title = targetVersion.title;
    document.content = targetVersion.content;
    document.summary = targetVersion.summary;
    document.tags = targetVersion.tags;

    if (document.versions.length > 5) {
      document.versions = document.versions.slice(-5);
    }

    const team = await Team.findById(user.teamId);
    if (!team) return res.status(404).json({ message: "Team Not Found." });

    team.recentActivities.push({
      docName: document.title,
      activityType: "update",
      user: user._id as mongoose.Types.ObjectId,
      date: new Date()
    });
    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }

    await team.save();
    await team.populate("recentActivities.user", "name email");
    await redisClient.publish("team:activity", JSON.stringify({
      activity: team.recentActivities[team.recentActivities.length - 1],
      teamId: team._id
    }));

    await document.save();
    await document.populate("versions.updatedBy", "name email");
    await redisClient.publish("document:update", JSON.stringify({
      teamId: team._id,
      document
    }));

    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Delete document
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.teamId.toString() !== user.teamId?.toString()) {
      return res.status(403).json({ message: "Not in your team" });
    }

    const team = await Team.findById(user.teamId);
    if (!team) return res.status(404).json({ message: "Team Not Found." });

    team.recentActivities.push({
      docName: document.title,
      activityType: "delete",
      user: user._id as mongoose.Types.ObjectId,
      date: new Date()
    });
    if (team.recentActivities.length > 5) {
      team.recentActivities = team.recentActivities.slice(-5);
    }

    await team.save();
    await team.populate("recentActivities.user", "name email");
    await redisClient.publish("team:activity", JSON.stringify({
      activity: team.recentActivities[team.recentActivities.length - 1],
      teamId: team._id
    }));

    await redisClient.publish("document:delete", JSON.stringify({
      teamId: team._id,
      documentId: req.params.id
    }));

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get recent activity
 */
router.get('/activity/recent', authenticate, async (req: AuthRequest, res) => {
  try {
    const team = await Team.findById(req?.user?.teamId)
      .populate("recentActivities.user", "name email");
    if (!team) return res.status(404).json({ message: "Team Not Found." });

    res.json({ recentActivity: team.recentActivities });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
