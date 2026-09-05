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

const { supabaseAdmin } = require('./supabaseClient');
const { calculateDailyStreak, getStartOfWeek } = require('./utils/streak');

/**
 * GET /summary/week
 * Reads the signed-in user's workouts from Supabase,
 * calculates total minutes this week, and calculates the current daily streak.
 */
app.get('/summary/week', requireAuth, async (req, res) => {
  try {
    // Read user's workout logs from Supabase
    const { data: logs, error } = await supabaseAdmin
      .from('workout_logs')
      .select('id, performed_at, actual_duration_min, actual_sets, actual_reps')
      .eq('user_id', req.user.id)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout logs from Supabase:', error);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to retrieve workout logs from Supabase.',
      });
    }

    const now = new Date();
    const startOfWeek = getStartOfWeek(now);

    // Calculate total minutes for workouts performed during the current week
    const weekLogs = (logs || []).filter((log) => new Date(log.performed_at) >= startOfWeek);

    let totalMinutesThisWeek = 0;
    for (const log of weekLogs) {
      if (log.actual_duration_min != null && !isNaN(Number(log.actual_duration_min))) {
        totalMinutesThisWeek += Number(log.actual_duration_min);
      } else if (log.actual_sets != null && !isNaN(Number(log.actual_sets))) {
        // Fallback estimate for strength sets (approx. 2 mins per completed set)
        totalMinutesThisWeek += Number(log.actual_sets) * 2;
      }
    }

    // Calculate daily streak from all logged workout timestamps
    const workoutDates = (logs || []).map((log) => log.performed_at);
    const currentDailyStreak = calculateDailyStreak(workoutDates, now);

    return res.json({
      user_id: req.user.id,
      week_start_date: startOfWeek.toISOString().split('T')[0],
      total_minutes: Math.round(totalMinutesThisWeek),
      daily_streak: currentDailyStreak,
      workouts_this_week: weekLogs.length,
      total_workouts_logged: (logs || []).length,
    });
  } catch (err) {
    console.error('Unexpected error in GET /summary/week:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to compute weekly summary.',
    });
  }
});

// Start server if invoked directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Backend server running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

module.exports = { app, config };
