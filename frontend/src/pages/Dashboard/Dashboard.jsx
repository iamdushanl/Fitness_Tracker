import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mockUser } from '../../data/mock/users';
import { mockPlanExercises, getWeekSchedule } from '../../data/mock/plans';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { getCurrentWeight, getWeightChange } from '../../data/mock/weightHistory';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import ProgressSummary from '../../components/ProgressSummary/ProgressSummary';
import WeightCard from '../../components/WeightCard/WeightCard';
import StreakCard from '../../components/StreakCard/StreakCard';
import NudgeBanner from '../../components/NudgeBanner/NudgeBanner';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Dashboard.css';

export default function Dashboard() {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    const { data, error } = await fetchWorkoutLogs();
    if (error) {
      console.error('Supabase error loading workout logs:', error);
      setLogsError(error.message || 'Failed to load workout logs');
    }
    setWorkoutLogs(data);
    setLogsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const weekSchedule = getWeekSchedule();
  const dates = Object.keys(weekSchedule).sort();

  // Pick "today" as the first date in the mock data for demo purposes
  const today = dates[0] ?? '';

  // Calculate completion rate: logged exercises / total plan exercises
  const totalExercises = mockPlanExercises.length;
  const loggedExercises = workoutLogs.length;
  const completionRate = totalExercises > 0 ? Math.round((loggedExercises / totalExercises) * 100) : 0;

  // Mock streak
  const streak = 4;

  // Count logged exercises per date
  const completedPerDate = {};
  for (const log of workoutLogs) {
    const pe = mockPlanExercises.find((p) => p.id === log.plan_exercise_id);
    if (pe) {
      completedPerDate[pe.scheduled_date] = (completedPerDate[pe.scheduled_date] ?? 0) + 1;
    }
  }

  /* ── Loading state ── */
  if (logsLoading) {
    return (
      <div className="dashboard" id="dashboard-page">
        <StateScreen variant="loading" text="Loading your dashboard…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (logsError) {
    return (
      <div className="dashboard" id="dashboard-page">
        <StateScreen
          variant="error"
          title="Couldn't load your data"
          text={logsError}
          onRetry={loadLogs}
        />
      </div>
    );
  }

  return (
    <div className="dashboard" id="dashboard-page">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">Welcome back, {mockUser.name.split(' ')[0]} 👋</h1>
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
        <WeightCard currentWeight={getCurrentWeight()} weightChange={getWeightChange()} />
        <StreakCard streak={streak} />
      </div>

      <section className="dashboard__workouts">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">This Week's Workouts</h2>
          <Link to="/workout" className="dashboard__view-all">View all →</Link>
        </div>
        <div className="dashboard__cards">
          {dates.length === 0 ? (
            <StateScreen
              variant="empty"
              icon="🏋️"
              title="No workouts yet"
              text="You don't have any scheduled workouts for this week. Create a plan to get started!"
            />
          ) : (
            dates.map((date) => (
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
