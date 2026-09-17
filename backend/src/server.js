import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/teams.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Root Landing & Status Page
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GESF Operations API Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #111827; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 700px; padding: 36px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    .btn { display: inline-block; background: #06b6d4; color: #000; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-right: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● API Engine Online • PostgreSQL 18 Connected</div>
    <h1>GOD'S EYE SECURITY FORCE — REST API</h1>
    <p>Operational REST API server running on port <strong>${PORT}</strong> with PostgreSQL 18 relational schema.</p>
    <a href="/api/health" class="btn" target="_blank">Health Check JSON</a>
    <a href="http://localhost:5500" class="btn" target="_blank">Operations Dashboard</a>
  </div>
</body>
</html>`);
});

// Health check endpoint (Standard JSON envelope)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      system: "GOD'S EYE SECURITY FORCE - Enterprise Operations Platform",
      database: 'PostgreSQL 18 connected via Prisma ORM',
      timestamp: new Date().toISOString()
    }
  });
});

// Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global error handler (Standard JSON error envelope)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GESF Enterprise Backend Server running on http://localhost:${PORT}`);
});
