import express from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import fetch from "node-fetch";
const router = express.Router();

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, geminiApiKey } = req.body;
    const userId = req.user!._id;

    const updateData: any = {};
    if (name) updateData.name = name;

    // Validate Gemini key if provided
    if (geminiApiKey !== undefined) {
      const testUrl = `https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`;

      try {
        const response = await fetch(testUrl);
        if (!response.ok) {
          const errorData = await response.json();
          return res.status(400).json({
            message: (errorData as any).error?.message || "Invalid Gemini API key",
          });
        }
        updateData.geminiApiKey = geminiApiKey;
      } catch (err: any) {
        return res.status(500).json({ message: "Error validating Gemini key: " + err.message });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasGeminiKey: !!user.geminiApiKey,
      teamId: user.teamId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;