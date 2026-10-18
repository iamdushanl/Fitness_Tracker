import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { fetchUserProfile, fetchWeightHistory, calculateWeightStats } from '../../lib/userProfile';
import { fetchActivePlan } from '../../lib/plans';
import { fetchWorkoutLogs, calculateTotalTonnageKg, formatVolumeDisplay } from '../../lib/workoutLogs';
import { calculateDailyStreak } from '../../lib/streak';
import { calculateMuscleRecovery } from '../../lib/recovery';
import { getExerciseById } from '../../lib/exercises';
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

  // Truthful body weight stats and label ("since first entry", "Baseline recorded", "No weight recorded")
  const { currentWeight, changeLabel } = useMemo(
    () => calculateWeightStats(weightHistory, profile?.weight_kg),
    [weightHistory, profile?.weight_kg]
  );

  // Dynamic daily streak from logged workout timestamps
  const streak = calculateDailyStreak(workoutLogs.map((l) => l.performed_at));

  // Dynamic muscle recovery & neuromuscular readiness (unified with Recovery page)
  const { muscleList, readinessScore, readinessCategory, readinessAdvice } = useMemo(
    () => calculateMuscleRecovery(workoutLogs, planExercises),
    [workoutLogs, planExercises]
  );

  // Key muscle status bars (Chest, Back, Legs) for Dashboard readiness panel
  const keyMuscles = useMemo(() => {
    const targets = ['Chest', 'Back', 'Legs'];
    return targets.map((name) => {
      const found = muscleList.find((m) => m.name === name);
      return found || { name, value: 85, state: 'ready' };
    });
  }, [muscleList]);

  // Total volume load from workout logs (sanitized, zero-rep preserved)
  const totalTonnageKg = useMemo(() => calculateTotalTonnageKg(workoutLogs), [workoutLogs]);
  const volumeDisplay = useMemo(() => formatVolumeDisplay(totalTonnageKg), [totalTonnageKg]);

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

  // Estimated workout duration based on programmed movements and sets
  const estimatedWorkoutMinutes = isTodayWorkoutDay
    ? todayExercises.reduce((acc, ex) => {
        if (ex.target_duration_min) return acc + ex.target_duration_min;
        const sets = ex.target_sets || ex.sets || 3;
        return acc + sets * 3;
      }, 0)
    : 0;

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

  // Unit-consistent completion metrics:
  // 1. Goal pace: % of scheduled exercises in plan that have at least 1 completed set
  const totalPlanExercises = planExercises.length;
  const completedExerciseIds = new Set(workoutLogs.map((l) => l.plan_exercise_id));
  const completedExercisesCount = planExercises.filter((pe) => completedExerciseIds.has(pe.id)).length;
  const exerciseCompletionRate =
    totalPlanExercises > 0
      ? Math.min(100, Math.round((completedExercisesCount / totalPlanExercises) * 100))
      : 0;

  // 2. Weekly training pace: % of planned workout days completed
  const weeklyWorkoutPace =
    plannedDaysCount > 0
      ? Math.min(100, Math.round((completedDaysCount / plannedDaysCount) * 100))
      : 0;

  // Best recent lift or highlight from actual workout logs
  const bestLog = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) return null;
    return workoutLogs.reduce((best, log) => {
      const weight = log.actual_weight_kg ?? 0;
      const reps = log.actual_reps ?? 0;
      const volume = weight * reps;
      const bestVolume = (best?.actual_weight_kg ?? 0) * (best?.actual_reps ?? 0);
      return volume > bestVolume ? log : best;
    }, workoutLogs[0]);
  }, [workoutLogs]);

  const bestExercise = useMemo(() => {
    if (!bestLog) return null;
    const pe = planExercises.find((p) => p.id === bestLog.plan_exercise_id);
    return pe?.exercise || getExerciseById(pe?.exercise_id) || null;
  }, [bestLog, planExercises]);

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
                  <span>{isTodayWorkoutDay ? `~${estimatedWorkoutMinutes} min` : 'Rest day'}</span>
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
                  <strong>{exerciseCompletionRate}%</strong>
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
                <span>{weeklyWorkoutPace}%</span>
              </div>

              <div className="progress-track" aria-hidden="true">
                <span style={{ width: `${weeklyWorkoutPace}%` }} />
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
                  {bestExercise?.name || (bestLog ? 'Logged session' : 'No sessions logged')}
                </h4>
                <strong className="pr-value">
                  {bestLog?.actual_weight_kg
                    ? `${bestLog.actual_weight_kg} kg × ${bestLog.actual_reps || 1}`
                    : workoutLogs.length > 0
                      ? `${workoutLogs.length} sets logged`
                      : 'Awaiting first workout'}
                </strong>
                <span className={workoutLogs.length > 0 ? 'positive' : 'neutral'}>
                  <TrendingUp size={13} aria-hidden="true" />
                  <span>{workoutLogs.length > 0 ? 'Progress recorded' : 'Ready to start'}</span>
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
            to="/recovery"
          />

          {/* Readiness Card */}
          <div className="card readiness-card">
            <Ring value={readinessScore} label="readiness" />

            <div className="readiness-copy">
              <h3 className="readiness-title">{readinessCategory}</h3>
              <p>{readinessAdvice}</p>
            </div>

            {/* Muscle target volume indicator bars */}
            <div className="recovery-bars" aria-label="Muscle readiness bars">
              {keyMuscles.map((m) => (
                <div key={m.name}>
                  <span>{m.name}</span>
                  <i><b style={{ width: `${m.value}%` }} /></i>
                  <strong>{m.value}%</strong>
                </div>
              ))}
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
                {currentWeight != null ? `${currentWeight} ` : '— '}<small>kg</small>
              </strong>
              <em className="neutral">{changeLabel}</em>
            </div>
          </div>

          {/* Training Volume Trend Card */}
          <Link to="/progress" className="card mini-chart-card">
            <div className="mini-chart-head">
              <div>
                <span className="eyebrow">Training volume</span>
                <strong>{volumeDisplay}</strong>
              </div>
              <span className={workoutLogs.length > 0 ? 'positive' : 'neutral'}>
                <TrendingUp size={13} aria-hidden="true" />
                <span>{workoutLogs.length > 0 ? `${workoutLogs.length} sets logged` : 'No logs yet'}</span>
              </span>
            </div>

            <TrendChart
              ariaLabel="Illustrative volume progression model (not measured historical points)"
              caption="Illustrative model · Not measured data"
            />
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
              {currentWeight != null ? `${currentWeight} ` : '— '}<small>kg</small>
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
