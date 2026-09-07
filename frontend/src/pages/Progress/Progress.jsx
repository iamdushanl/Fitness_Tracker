import { useState, useEffect, useCallback } from 'react';
import { fetchActivePlan } from '../../lib/plans';
import { getExerciseById } from '../../lib/exercises';
import { fetchUserProfile, fetchWeightHistory } from '../../lib/userProfile';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { calculateDailyStreak } from '../../lib/streak';
import CompletionChart from '../../components/CompletionChart/CompletionChart';
import WeightChart from '../../components/WeightChart/WeightChart';
import StreakCard from '../../components/StreakCard/StreakCard';
import WeeklyCompletion from '../../components/WeeklyCompletion/WeeklyCompletion';
import WeightCard from '../../components/WeightCard/WeightCard';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Progress.css';

export default function Progress() {
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgressData = useCallback(async (showSpinner = false) => {
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
      setPlanExercises(planRes.data?.planExercises ?? []);
      setWorkoutLogs(logsRes.data ?? []);
    } catch (err) {
      console.error('Failed to load progress data:', err);
      setError(err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Historical weekly trend (mock trend baseline per ARCH.md §4)
  const completionData = [
    { week: 'W1', rate: 85 },
    { week: 'W2', rate: 92 },
    { week: 'W3', rate: 78 },
    { week: 'W4', rate: 65 },
    { week: 'W5', rate: 47 },
  ];

  // Current week completion rate
  const totalExercises = planExercises.length;
  const loggedExercises = workoutLogs.length;
  const currentRate =
    totalExercises > 0
      ? Math.round((loggedExercises / totalExercises) * 100)
      : 0;

  // Weight chart & stats
  const weightData = weightHistory.map((wh) => ({
    date: wh.recorded_at,
    weight_kg: wh.weight_kg,
  }));

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

  // Calculate active daily streak from workout logs
  const streak = calculateDailyStreak(workoutLogs.map((wh) => wh.performed_at));

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="progress-page" id="progress-page">
        <StateScreen variant="loading" text="Loading your progress…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="progress-page" id="progress-page">
        <StateScreen
          variant="error"
          title="Couldn't load progress data"
          text={error}
          onRetry={() => loadProgressData(true)}
        />
      </div>
    );
  }

  return (
    <div className="progress-page" id="progress-page">
      <header className="progress-page__header">
        <h1 className="progress-page__title">Progress</h1>
        <p className="progress-page__subtitle">
          Track your fitness journey over time. See how your consistency and
          effort translate into results.
        </p>
      </header>

      <div className="progress-page__stats">
        <WeeklyCompletion rate={currentRate} />
        <WeightCard currentWeight={currentWeight} weightChange={weightChange} />
        <StreakCard streak={streak} />
      </div>

      <div className="progress-page__charts">
        <CompletionChart data={completionData} />
        <WeightChart data={weightData} />
      </div>

      <section className="progress-page__history">
        <h2 className="progress-page__section-title">Recent Workout Logs</h2>
        <div className="progress-page__logs">
          {workoutLogs.length === 0 ? (
            <StateScreen
              variant="empty"
              icon="🏋️"
              title="No workouts yet"
              text="Complete a workout on the Workout page and your logs will appear here."
            />
          ) : (
            workoutLogs.map((log) => {
              const pe = planExercises.find((p) => p.id === log.plan_exercise_id);
              const exercise = pe?.exercise || getExerciseById(pe?.exercise_id);
              return (
                <div key={log.id} className="progress-page__log-item">
                  <div className="progress-page__log-date">
                    {new Date(log.performed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {exercise && (
                    <div className="progress-page__log-exercise">
                      {exercise.name}
                    </div>
                  )}
                  <div className="progress-page__log-details">
                    {log.actual_sets != null
                      ? `${log.actual_sets}×${log.actual_reps} @ ${log.actual_weight_kg} kg`
                      : `${log.actual_duration_min} min${log.actual_distance_km ? ` / ${log.actual_distance_km} km` : ''}`}
                  </div>
                  {log.notes && <div className="progress-page__log-notes">"{log.notes}"</div>}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

