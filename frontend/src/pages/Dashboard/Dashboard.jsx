import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserProfile, fetchWeightHistory } from '../../lib/userProfile';
import { fetchActivePlan } from '../../lib/plans';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { calculateDailyStreak } from '../../lib/streak';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import ProgressSummary from '../../components/ProgressSummary/ProgressSummary';
import WeightCard from '../../components/WeightCard/WeightCard';
import StreakCard from '../../components/StreakCard/StreakCard';
import NudgeBanner from '../../components/NudgeBanner/NudgeBanner';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Dashboard.css';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [totalPlanExercises, setTotalPlanExercises] = useState(0);
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
      setTotalPlanExercises(planRes.data?.planExercises?.length ?? 0);
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
  const loggedExercises = workoutLogs.length;
  const completionRate =
    totalPlanExercises > 0
      ? Math.round((loggedExercises / totalPlanExercises) * 100)
      : 0;

  // Calculate daily streak dynamically from logged workout timestamps
  const streak = calculateDailyStreak(workoutLogs.map((l) => l.performed_at));

  // Weight stats
  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight_kg
      : profile?.weight_kg ?? null;

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
    // If log has plan_exercise_id, check if date matches in schedule
    for (const d of allDates) {
      const dayList = weekSchedule[d] ?? [];
      if (dayList.some((pe) => pe.id === log.plan_exercise_id)) {
        completedPerDate[d] = (completedPerDate[d] ?? 0) + 1;
      }
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="dashboard" id="dashboard-page">
        <StateScreen variant="loading" text="Loading your dashboard…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="dashboard" id="dashboard-page">
        <StateScreen
          variant="error"
          title="Couldn't load your data"
          text={error}
          onRetry={() => loadDashboardData(true)}
        />
      </div>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Athlete';

  return (
    <div className="dashboard" id="dashboard-page">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">Welcome back, {firstName} 👋</h1>
          <p className="dashboard__subtext">Here's your fitness snapshot for this week.</p>
        </div>
        <Link to="/create-plan" className="dashboard__cta">New Plan ✨</Link>
      </header>

      <NudgeBanner
        type={completionRate < 30 ? 'encouragement' : null}
        message={completionRate < 30 ? "Don't worry — every workout counts. Let's get back on track this week!" : null}
      />

      <div className="dashboard__stats">
        <ProgressSummary completionRate={completionRate} streak={streak} />
        <WeightCard currentWeight={currentWeight} weightChange={weightChange} />
        <StreakCard streak={streak} />
      </div>

      <section className="dashboard__workouts">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">This Week's Workouts</h2>
          <Link to="/workout" className="dashboard__view-all">View all →</Link>
        </div>
        <div className="dashboard__cards">
          {allDates.length === 0 ? (
            <StateScreen
              variant="empty"
              icon="🏋️"
              title="No workouts yet"
              text="You haven't generated a workout schedule yet. Click 'New Plan ✨' above to create one!"
            />
          ) : (
            allDates.map((date) => (
              <WorkoutCard
                key={date}
                date={date}
                exercises={weekSchedule[date]}
                isToday={date === today}
                completedCount={completedPerDate[date] ?? 0}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

