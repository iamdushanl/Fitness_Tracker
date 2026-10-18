import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Flame,
  Weight,
  Check,
  ChevronRight,
  Clock3,
  Trophy,
  TrendingUp,
  Zap,
  Sparkles,
} from 'lucide-react';
import { fetchUserProfile, fetchWeightHistory } from '../../lib/userProfile';
import { fetchActivePlan } from '../../lib/plans';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { calculateDailyStreak } from '../../lib/streak';
import PerformanceVisual from '../../components/PerformanceVisual/PerformanceVisual';
import Ring from '../../components/Ring/Ring';
import TrendChart from '../../components/TrendChart/TrendChart';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Dashboard.css';

/**
 * Section header with title and action link
 */
function SectionHeading({ title, action, to }) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">{title}</h2>
      {action && to && (
        <Link to={to} className="text-button">
          <span>{action}</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
      setError(null);
    }
    try {
      const [profileRes, weightRes, planRes, logsRes] = await Promise.all([
        fetchUserProfile(),
        fetchWeightHistory(),
        fetchActivePlan(),
        fetchWorkoutLogs(),
      ]);

      if (profileRes.error) {
        console.error('Supabase error loading user profile:', profileRes.error);
      }
      if (weightRes.error) {
        console.error('Supabase error loading weight history:', weightRes.error);
      }
      if (planRes.error) {
        console.error('Supabase error loading active plan:', planRes.error);
      }
      if (logsRes.error) {
        console.error('Supabase error loading workout logs:', logsRes.error);
      }

      setProfile(profileRes.data);
      setWeightHistory(weightRes.data ?? []);
      setWeekSchedule(planRes.data?.weekSchedule ?? {});
      setAllDates(planRes.data?.allDates ?? []);
      setPlanExercises(planRes.data?.planExercises ?? []);
      setWorkoutLogs(logsRes.data ?? []);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Today ISO string
  const today = new Date().toISOString().split('T')[0];

  // Calculate completion rate: logged exercises / total plan exercises
  const totalPlanExercises = planExercises.length;
  const loggedExercises = workoutLogs.length;
  const completionRate =
    totalPlanExercises > 0
      ? Math.min(100, Math.round((loggedExercises / totalPlanExercises) * 100))
      : 0;

  // Calculate daily streak dynamically from logged workout timestamps
  const streak = calculateDailyStreak(workoutLogs.map((l) => l.performed_at));

  // Weight stats
  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight_kg
      : profile?.weight_kg ?? 70.0;

  const weightChange =
    weightHistory.length > 1
      ? Number(
          (
            weightHistory[weightHistory.length - 1].weight_kg -
            weightHistory[0].weight_kg
          ).toFixed(1)
        )
      : 0;

  // Count logged exercises per date
  const completedPerDate = {};
  for (const log of workoutLogs) {
    for (const d of allDates) {
      const dayList = weekSchedule[d] ?? [];
      if (dayList.some((pe) => pe.id === log.plan_exercise_id)) {
        completedPerDate[d] = (completedPerDate[d] ?? 0) + 1;
      }
    }
  }

  // Today's scheduled workout
  const todayExercises = weekSchedule[today] ?? [];
  const hasPlan = allDates.length > 0;
  const isTodayWorkoutDay = todayExercises.length > 0;

  // Dynamic readiness score (baseline 75% + streak bonus, capped at 96%)
  const readinessScore = Math.min(96, Math.max(65, 74 + Math.min(18, streak * 3)));

  // Generate 7 calendar days for the current week
  const weekDays = (() => {
    const now = new Date();
    // Monday of current week
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const hasWorkout = Boolean(weekSchedule[iso] && weekSchedule[iso].length > 0);
      const isDone = Boolean((completedPerDate[iso] ?? 0) > 0);
      const isCurDay = iso === today;

      let state = '';
      if (isCurDay) state = 'today';
      else if (isDone) state = 'done';
      else if (hasWorkout) state = 'planned';

      return {
        label: DAY_LABELS[i],
        dayNum,
        iso,
        state,
        isDone,
      };
    });
  })();

  const completedDaysCount = weekDays.filter((d) => d.isDone).length;
  const plannedDaysCount = Math.max(1, weekDays.filter((d) => d.state === 'planned' || d.isDone || d.state === 'today').length);

  // Best recent lift or PR from workoutLogs
  const bestLog = workoutLogs.reduce((best, log) => {
    const volume = (log.weight_kg ?? 0) * (log.reps ?? 0);
    const bestVolume = (best?.weight_kg ?? 0) * (best?.reps ?? 0);
    return volume > bestVolume ? log : best;
  }, workoutLogs[0] || null);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="dashboard-view" id="dashboard-page">
        <StateScreen variant="loading" text="Loading your performance dashboard…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="dashboard-view" id="dashboard-page">
        <StateScreen
          variant="error"
          title="Couldn't load dashboard data"
          text={error}
          onRetry={() => loadDashboardData(true)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-view" id="dashboard-page">
      {/* ── Status Strip ── */}
      <section className="status-strip" aria-label="System status">
        <div className="status-main">
          <div className="status-icon" aria-hidden="true">
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <strong>Primed to train</strong>
            <span>
              {streak > 0
                ? `${streak}-day streak active. Training load is calibrated.`
                : 'Welcome back. Calibrated for your next training session.'}
            </span>
          </div>
        </div>

        <div className="status-stats">
          <div>
            <strong>{streak} {streak === 1 ? 'day' : 'days'}</strong>
            <span>Active streak</span>
          </div>
          <div>
            <strong>{readinessScore}%</strong>
            <span>Readiness</span>
          </div>
        </div>
      </section>

      {/* ── Main Home Grid Layout ── */}
      <div className="home-grid">
        {/* ── Left Column: Primary Training Panel ── */}
        <section className="home-primary">
          <SectionHeading
            title="Today's workout"
            action="View workout"
            to="/workout"
          />

          {/* Workout Hero Card */}
          <div className="card workout-hero">
            <PerformanceVisual />
            <div className="workout-overlay" aria-hidden="true" />

            <div className="workout-hero-content">
              <div className="hero-topline">
                <span className="badge accent-badge">
                  {hasPlan
                    ? (isTodayWorkoutDay ? 'ACTIVE SESSION' : 'REST & RECOVERY')
                    : 'NEW ATHLETE'}
                </span>
                <span className="workout-time">
                  <Clock3 size={15} aria-hidden="true" />
                  <span>~45 min</span>
                </span>
              </div>

              <div className="hero-copy">
                <span className="kicker">
                  {hasPlan ? 'Adaptive Training Routine' : 'Ready to Start'}
                </span>
                <h3 className="hero-heading">
                  {hasPlan
                    ? (isTodayWorkoutDay ? 'Target Session' : 'Active Recovery')
                    : 'Create Your Plan'}
                </h3>
                <p>
                  {hasPlan
                    ? (isTodayWorkoutDay
                        ? `${todayExercises.length} programmed movements targeting strength and hypertrophy.`
                        : 'No compound lifts scheduled for today. Rest and recover.')
                    : 'Build a personalized workout schedule tailored to your goals.'}
                </p>
              </div>

              <div className="workout-summary">
                <div>
                  <strong>{todayExercises.length}</strong>
                  <span>Exercises</span>
                </div>
                <div>
                  <strong>{todayExercises.reduce((acc, ex) => acc + (ex.sets ?? 3), 0)}</strong>
                  <span>Working sets</span>
                </div>
                <div>
                  <strong>{completionRate}%</strong>
                  <span>Goal pace</span>
                </div>
              </div>

              {hasPlan ? (
                <Link to="/workout" className="primary-button hero-cta">
                  <Play size={17} fill="currentColor" aria-hidden="true" />
                  <span>Start workout</span>
                </Link>
              ) : (
                <Link to="/create-plan" className="primary-button hero-cta">
                  <Sparkles size={17} aria-hidden="true" />
                  <span>Create my plan</span>
                </Link>
              )}
            </div>
          </div>

          {/* Lower Desktop Grid: Weekly Calendar & PR Card */}
          <div className="desktop-lower-grid">
            {/* Week Card */}
            <div className="card week-card">
              <SectionHeading
                title="This week"
                action="Open plan"
                to="/plan"
              />

              <div className="week-days" role="list" aria-label="7-day schedule">
                {weekDays.map((day, idx) => (
                  <div
                    className={`day ${day.state}`}
                    key={`${day.label}-${idx}`}
                    role="listitem"
                  >
                    <span>{day.label}</span>
                    <div title={day.iso}>
                      {day.isDone ? (
                        <Check size={14} aria-hidden="true" />
                      ) : (
                        day.dayNum
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="weekly-goal">
                <div>
                  <strong>{completedDaysCount} of {plannedDaysCount} workouts</strong>
                  <span>Weekly training pace</span>
                </div>
                <span>{completionRate}%</span>
              </div>

              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            {/* PR / Recent Highlight Card */}
            <div className="card pr-card">
              <div className="pr-icon" aria-hidden="true">
                <Trophy size={18} />
              </div>
              <div className="pr-content">
                <span className="eyebrow">Recent highlight</span>
                <h4 className="pr-title">
                  {bestLog?.exercise?.name || 'Compound Progress'}
                </h4>
                <strong className="pr-value">
                  {bestLog?.weight_kg
                    ? `${bestLog.weight_kg} kg × ${bestLog.reps || 1}`
                    : `${loggedExercises} sets logged`}
                </strong>
                <span className="positive">
                  <TrendingUp size={13} aria-hidden="true" />
                  <span>Progress recorded</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right Column: Secondary Readiness & Metrics ── */}
        <aside className="home-secondary">
          <SectionHeading
            title="Daily readiness"
            action="Details"
            to="/progress"
          />

          {/* Readiness Card */}
          <div className="card readiness-card">
            <Ring value={readinessScore} label="readiness" />

            <div className="readiness-copy">
              <h3 className="readiness-title">Strong recovery</h3>
              <p>
                {streak > 2
                  ? 'Consistent training momentum. Keep target RIR 2 on compound lifts.'
                  : 'Neuromuscular readiness is high. Programmed load is optimal.'}
              </p>
            </div>

            {/* Muscle target volume indicator bars */}
            <div className="recovery-bars" aria-label="Muscle readiness bars">
              <div>
                <span>Chest</span>
                <i><b style={{ width: '84%' }} /></i>
                <strong>84%</strong>
              </div>
              <div>
                <span>Back</span>
                <i><b style={{ width: '78%' }} /></i>
                <strong>78%</strong>
              </div>
              <div>
                <span>Legs</span>
                <i><b style={{ width: '91%' }} /></i>
                <strong>91%</strong>
              </div>
            </div>
          </div>

          {/* Metric Grid (Streak + Weight) */}
          <div className="metric-grid">
            <div className="card metric-card">
              <div className="metric-icon" aria-hidden="true">
                <Flame size={17} />
              </div>
              <span>Current streak</span>
              <strong>
                {streak} <small>days</small>
              </strong>
              <em>{streak > 0 ? 'Active momentum' : 'Ready to start'}</em>
            </div>

            <div className="card metric-card">
              <div className="metric-icon metric-icon--cool" aria-hidden="true">
                <Weight size={17} />
              </div>
              <span>Body weight</span>
              <strong>
                {currentWeight} <small>kg</small>
              </strong>
              <em className="neutral">
                {weightChange === 0
                  ? 'Balanced'
                  : `${weightChange > 0 ? '+' : ''}${weightChange} kg this week`}
              </em>
            </div>
          </div>

          {/* Mini Strength Trend Chart Card */}
          <Link to="/progress" className="card mini-chart-card">
            <div className="mini-chart-head">
              <div>
                <span className="eyebrow">Performance score</span>
                <strong>{820 + Math.min(120, loggedExercises * 12)}</strong>
              </div>
              <span className="positive">
                <TrendingUp size={13} aria-hidden="true" />
                <span>+4.8%</span>
              </span>
            </div>

            <TrendChart />

            <div className="chart-labels" aria-hidden="true">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
            </div>
          </Link>
        </aside>
      </div>

      {/* ── Mobile Insights Stack (screens <= 768px) ── */}
      <section className="mobile-only mobile-insights">
        <SectionHeading
          title="Your momentum"
          action="View progress"
          to="/progress"
        />

        <div className="metric-grid">
          <div className="card metric-card">
            <div className="metric-icon" aria-hidden="true">
              <Flame size={17} />
            </div>
            <span>Streak</span>
            <strong>
              {streak} <small>days</small>
            </strong>
          </div>

          <div className="card metric-card">
            <div className="metric-icon metric-icon--cool" aria-hidden="true">
              <Weight size={17} />
            </div>
            <span>Weight</span>
            <strong>
              {currentWeight} <small>kg</small>
            </strong>
          </div>
        </div>

        {/* Mobile Week Strip */}
        <div className="card week-card mobile-week-card">
          <SectionHeading
            title="This week"
            action="Plan"
            to="/plan"
          />
          <div className="week-days" role="list">
            {weekDays.map((day, idx) => (
              <div
                className={`day ${day.state}`}
                key={`m-${day.label}-${idx}`}
                role="listitem"
              >
                <span>{day.label}</span>
                <div>
                  {day.isDone ? <Check size={14} aria-hidden="true" /> : day.dayNum}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
