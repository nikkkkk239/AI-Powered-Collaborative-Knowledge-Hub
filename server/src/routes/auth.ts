import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password, name  });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasGeminiKey: !!user.geminiApiKey,
        teamId : null
      }
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId : user.teamId,
        hasGeminiKey: !!user.geminiApiKey
      }
    });
  } catch (error: any) {
    console.log("Error"  , error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
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