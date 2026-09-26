require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { syncDB } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Compression ──────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// ── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Static Files (uploads) ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',           require('./src/routes/auth'));
app.use('/api/listings',       require('./src/routes/listings'));
app.use('/api/collaborations', require('./src/routes/collaborations'));
app.use('/api/admin',          require('./src/routes/admin'));
app.use('/api/transactions',   require('./src/routes/transactions'));
app.use('/api/users',          require('./src/routes/users'));
app.use('/api/files',          require('./src/routes/files'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  success: true, message: 'Antigravity API is running',
  version: '1.0.0', timestamp: new Date().toISOString()
}));

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
const start = async () => {
  try {
    await syncDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Antigravity API running on http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/api/health`);
      console.log(`🌍 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
