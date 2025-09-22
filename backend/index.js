// Load environment variables FIRST via side‑effect import so dependencies see them
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import createDefaultSuperAdmin from './utils/createDefaultSuperAdmin.js';

// Re-establish __dirname / __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ LOADED' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ LOADED' : '❌ MISSING');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ PRESENT' : '❌ MISSING');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ PRESENT' : '❌ MISSING');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '⚠️ default smtp.gmail.com');
console.log('PORT:', process.env.PORT || 5000);

// connect to MongoDB
connectDB();

// create Express app
const app = express();

// ===================== CORS CONFIG (Improved) =====================
// Allow configuration via env: CORS_ORIGINS="https://site1.com,https://site2.com"
// Fallback to sensible defaults (Netlify + localhost)
const defaultOrigins = [
  'https://incorgroup.netlify.app',
  'https://incor.netlify.app',
  process.env.FRONTEND_URL, // single front-end URL shortcut
  'http://localhost:3000'
].filter(Boolean);

const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : defaultOrigins);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn('🚫 CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  optionsSuccessStatus: 200
};

// Preflight & standard requests
app.use((req, res, next) => {
  // Lightweight log only for auth/login preflights or blocked requests
  if (req.method === 'OPTIONS' || req.path.startsWith('/api/auth')) {
    console.log(`➡️  Incoming ${req.method} ${req.path} Origin: ${req.headers.origin || 'N/A'}`);
  }
  next();
});
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle any preflight

// Friendly middleware to surface CORS errors as JSON
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS: Origin not allowed', origin: req.headers.origin });
  }
  next(err);
});

app.use(express.json());

// serve uploaded images
app.use('/uploads', express.static('uploads'));

// import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import pollRoutes from './routes/polls.js';
import settingsRoutes from './routes/settings.js';
import roleRequestRoutes from './routes/roleRequestRoutes.js';

// mount routes
app.use('/api/auth', authRoutes);
// Users routes (changed mount path from /api to /api/users so frontend GET /api/users works)
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/role-requests', roleRequestRoutes);

// test route
app.post('/test', (req, res) => {
  res.send('✅ POST /test working fine');
});

// create default SuperAdmin
createDefaultSuperAdmin()
  .then(() => console.log('✅ Default SuperAdmin ensured'))
  .catch((err) => console.error('❌ SuperAdmin init failed:', err.message));

// serve static React build (reuse existing __dirname from above)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Lightweight health / readiness endpoint (must be before SPA fallback)
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
});

// fallback route for React SPA (keep last)
app.use((req, res) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ✅ Listen on all interfaces (0.0.0.0)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile access: http://192.168.0.103:${PORT}`);
  console.log('✅ CORS middleware initialized');
});

// optional date formatting helper
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default app;