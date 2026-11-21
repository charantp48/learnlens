import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import gapRoutes from './routes/gapRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  if (!req.url.startsWith('/assets/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ==========================================
// Health Check Endpoints
// ==========================================

// 1. Basic API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LearnLens Unified Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    supabaseConfigured: !!config.supabase.url && config.supabase.url !== 'https://your-project-id.supabase.co',
    geminiConfigured: !!config.gemini.apiKey && config.gemini.apiKey !== 'your-gemini-api-key',
    geminiModel: config.gemini.model,
  });
});

// 2. Database Health (Counts topics table rows without exposing keys)
app.get('/api/health/db', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({
        status: 'mock_mode',
        message: 'Backend running in mock/demo mode (Supabase credentials not configured)',
        topicsCount: 10,
        connected: false,
        timestamp: new Date().toISOString()
      });
    }

    const { count, error } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(503).json({
        status: 'error',
        message: 'Could not query topics table from Supabase',
        details: error.message,
        connected: false,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'ok',
      database: 'Supabase PostgreSQL',
      topicsCount: count ?? 0,
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Unexpected database health check failure',
      connected: false,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/gaps', gapRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', adminRoutes);

// ==========================================
// Static Frontend & Single-Page Application (SPA) Fallback
// ==========================================
const distExists = fs.existsSync(frontendDist);

if (distExists) {
  // Serve static assets from frontend/dist
  app.use(express.static(frontendDist));

  // SPA fallback for any non-API route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.warn('\n⚠️  WARNING: frontend/dist was not found!');
  console.warn('👉 Fix: Run "npm run build" to compile the React frontend so the unified server can serve it.\n');

  // Friendly fallback page when build hasn\'t been run yet
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>LearnLens - Build Required</title></head>
        <body style="font-family: sans-serif; background: #F5F0EA; color: #0D0D0D; padding: 40px; text-align: center;">
          <h1 style="color: #F26522;">Frontend Build Required</h1>
          <p>The Express unified server is running, but the frontend has not been compiled yet.</p>
          <pre style="background: #FBF8F4; padding: 15px; border-radius: 8px; display: inline-block; border: 1px solid #E3DCD3;">npm run build</pre>
          <p>Once built, refresh this page to use LearnLens.</p>
        </body>
      </html>
    `);
  });
}

// 404 handler for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist`,
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

// ==========================================
// Startup Environment Check & Server Boot
// ==========================================
function validateEnvironment() {
  const warnings = [];

  if (!config.supabase.url || config.supabase.url.includes('your-project-id')) {
    warnings.push('SUPABASE_URL is not configured or using default template value.');
  }
  if (!config.supabase.anonKey || config.supabase.anonKey.includes('your-supabase-anon-key')) {
    warnings.push('SUPABASE_ANON_KEY is not configured or using default template value.');
  }
  if (!config.gemini.apiKey || config.gemini.apiKey === 'your-gemini-api-key') {
    warnings.push('GEMINI_API_KEY is using placeholder. AI tutor will run in mock/fallback mode.');
  }

  if (warnings.length > 0) {
    console.log('\n🔍 Environment Notice:');
    warnings.forEach((w) => console.log(`   ℹ️  ${w}`));
    console.log('   👉 Tip: Edit .env to supply your live keys if you want live cloud features.\n');
  }
}

if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();

  const server = app.listen(config.port, () => {
    console.log(`==============================================================`);
    console.log(`🎓 LearnLens Unified Single Server`);
    console.log(`🌐 Address:     http://localhost:${config.port}`);
    console.log(`📡 API Health:  http://localhost:${config.port}/api/health`);
    console.log(`🗄️  DB Health:   http://localhost:${config.port}/api/health/db`);
    console.log(`📁 Frontend:    ${distExists ? 'Serving from frontend/dist' : 'Pending build (run npm run build)'}`);
    console.log(`==============================================================`);
  });

  // Handle busy port or other listen errors with plain-English fixes
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${config.port} is already in use by another process.`);
      console.error(`👉 Plain-English Fix:`);
      console.error(`   1. Stop any existing server running on port ${config.port}.`);
      console.error(`   2. Or change the PORT variable in your .env file (e.g. PORT=5001).`);
      console.error(`   3. On Windows, you can find the blocking process with:`);
      console.error(`      Get-Process -Id (Get-NetTCPConnection -LocalPort ${config.port}).OwningProcess\n`);
      process.exit(1);
    } else {
      console.error('\n❌ Fatal Server Listen Error:', err.message);
      process.exit(1);
    }
  });
}

export default app;
