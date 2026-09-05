const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Read config from environment variables (.env in backend/ or root)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

const { requireAuth } = require('./middleware/auth');

/**
 * GET /health
 * Public liveness/health probe
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /summary/week
 * Protected endpoint returning weekly summary structure for the authenticated user
 */
app.get('/summary/week', requireAuth, (req, res) => {
  res.json({
    status: 'placeholder',
    message: 'Weekly summary endpoint. Will compute trusted weekly volume, streak, and completion rate.',
    user_id: req.user.id,
    data: {
      week_start_date: null,
      week_end_date: null,
      completion_rate: 0,
      streak_weeks: 0,
      total_planned_exercises: 0,
      total_completed_exercises: 0,
    },
  });
});

// Start server if invoked directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Backend server running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

module.exports = { app, config };
