import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import createDefaultSuperAdmin from './utils/createDefaultSuperAdmin.js';
import path from 'path';
import { fileURLToPath } from 'url';

// connect to MongoDB
connectDB();

// create Express app
const app = express();

// ✅ Updated CORS to allow your IP address
const allowedOrigins = [
  'https://incor.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // if you use cookies or auth headers
}));

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

// serve static React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/build')));

// fallback route for React SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ✅ Listen on all interfaces (0.0.0.0)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile access: http://192.168.0.103:${PORT}`);
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