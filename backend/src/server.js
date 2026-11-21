import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import gapRoutes from './routes/gapRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LearnLens API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    supabaseConfigured: !!config.supabase.url,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/planner', plannerRoutes);

// 404 handler for unknown endpoints
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.url} does not exist`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server',
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`🚀 LearnLens Backend running on port ${config.port}`);
    console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`===============================================`);
  });
}

export default app;
