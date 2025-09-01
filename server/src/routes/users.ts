import express from 'express';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, geminiApiKey } = req.body;
    const userId = req.user!._id;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey;

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
      hasGeminiKey: !!user.geminiApiKey
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;