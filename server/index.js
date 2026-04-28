/**
 * VoteWise AI - Express Backend Server
 * Google Cloud Run ready
 * Services: Gemini API, Firebase Admin, Google Translate
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const chatRoutes = require('./routes/chat');
const fakeNewsRoutes = require('./routes/fakenews');
const translateRoutes = require('./routes/translate');
const quizRoutes = require('./routes/quiz');
const manifestoRoutes = require('./routes/manifesto');
const constituencyRoutes = require('./routes/constituency');
const analyticsRoutes = require('./routes/analytics');
const candidateRoutes = require('./routes/candidate');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Efficiency ──────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());

// Cache-Control headers for GET requests to optimize efficiency
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  }
  next();
});

// ── CORS ──────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return cb(null, true);
    
    // Allow any localhost port in development
    if (origin.startsWith('http://localhost:')) return cb(null, true);
    
    // Allow specific production domains
    const allowedDomains = [
      'https://votewise-ai.run.app',
      /\.vercel\.app$/
    ];
    
    const isAllowed = allowedDomains.some(domain => 
      domain instanceof RegExp ? domain.test(origin) : domain === origin
    );
    
    if (isAllowed) return cb(null, true);
    
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parser ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ─────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Health Check (required by Cloud Run) ─────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'VoteWise AI API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    googleServices: {
      gemini: !!process.env.GEMINI_API_KEY,
      translate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
      firebase: !!process.env.FIREBASE_PROJECT_ID,
    },
  });
});

// ── API Routes ────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/fakenews', fakeNewsRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/manifesto', manifestoRoutes);
app.use('/api/constituency', constituencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/candidate', candidateRoutes);

// ── Serve Frontend (Production / Cloud Run) ───────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ── Global Error Handler ──────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[VoteWise AI Error]:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🗳️  VoteWise AI Server running on http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
