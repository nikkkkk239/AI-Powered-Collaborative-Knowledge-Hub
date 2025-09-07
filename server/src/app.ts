import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


import teamRoutes from "./routes/teams"
import authRoutes from './routes/auth';
import qandaRoutes from "./routes/q&a"
import documentRoutes from './routes/documents';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import { errorHandler } from './middleware/errorHandler';
import { connectRedis } from './client';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-hub')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));


// Routes

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/team" , teamRoutes);
app.use("/api/q&a" , qandaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

(async () => {
  await connectRedis(); // ensure Redis is connected before server starts
})();


export default app;