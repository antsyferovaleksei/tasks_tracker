import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from '../packages/server/src/routes/authRoutes.js';
import projectRoutes from '../packages/server/src/routes/projectRoutes.js';
import taskRoutes from '../packages/server/src/routes/taskRoutes.js';
import tagRoutes from '../packages/server/src/routes/tagRoutes.js';
import timeEntryRoutes from '../packages/server/src/routes/timeEntryRoutes.js';
import filterRoutes from '../packages/server/src/routes/filterRoutes.js';
import reminderRoutes from '../packages/server/src/routes/reminderRoutes.js';
import analyticsRoutes from '../packages/server/src/routes/analyticsRoutes.js';

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: [
    'https://*.vercel.app',
    'https://*.vercel.com',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🎯 Tasks Tracker API',
    version: '1.0.0',
    status: 'Running on Vercel',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
    environment: process.env.NODE_ENV || 'production',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// Export for Vercel
export default app; 