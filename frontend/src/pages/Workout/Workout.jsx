import { useState, useEffect, useCallback } from 'react';
import { getWeekSchedule } from '../../data/mock/plans';
import { getExerciseById } from '../../data/mock/exercises';
import { fetchWorkoutLogs, insertWorkoutLog } from '../../lib/workoutLogs';
import DaySelector from '../../components/DaySelector/DaySelector';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';
import WorkoutLogForm from '../../components/WorkoutLogForm/WorkoutLogForm';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Workout.css';

export default function Workout() {
  const weekSchedule = getWeekSchedule();
  const allDates = [
    '2025-09-01', '2025-09-02', '2025-09-03', '2025-09-04',
    '2025-09-05', '2025-09-06', '2025-09-07',
  ];

  const [selectedDate, setSelectedDate] = useState(allDates[0]);
  const [loggingExerciseId, setLoggingExerciseId] = useState(null);
  const [localLogs, setLocalLogs] = useState([]);
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
    setLocalLogs(data);
    setLogsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const exercises = weekSchedule[selectedDate] ?? [];
  const isRestDay = exercises.length === 0;

  // Build exercise counts for DaySelector
  const exerciseCounts = {};
  for (const date of allDates) {
    const dayExercises = weekSchedule[date] ?? [];
    const completed = dayExercises.filter((pe) =>
      localLogs.some((l) => l.plan_exercise_id === pe.id)
    ).length;
    exerciseCounts[date] = { total: dayExercises.length, completed };
  }

  const handleSaveLog = async (logData) => {
    const { data: newLog, error } = await insertWorkoutLog(logData);
    if (error) {
      console.error('Supabase error saving workout log:', error);
      throw error;
    }
    setLocalLogs((prev) => [newLog, ...prev]);
    setLoggingExerciseId(null);
  };

  /* ── Loading state ── */
  if (logsLoading) {
    return (
      <div className="workout-page" id="workout-page">
        <StateScreen variant="loading" text="Loading your workouts…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (logsError) {
    return (
      <div className="workout-page" id="workout-page">
        <StateScreen
          variant="error"
          title="Couldn't load workouts"
          text={logsError}
          onRetry={loadLogs}
        />
      </div>
    );
  }

  return (
    <div className="workout-page" id="workout-page">
      <header className="workout-page__header">
        <h1 className="workout-page__title">Workout</h1>
        <p className="workout-page__subtitle">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <DaySelector
        dates={allDates}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        exerciseCounts={exerciseCounts}
      />

      {Object.keys(weekSchedule).length === 0 ? (
        <StateScreen
          variant="empty"
          icon="🏋️"
          title="No workouts yet"
          text="You don't have any scheduled workouts yet. Create a plan to get started!"
        />
      ) : isRestDay ? (
        <div className="workout-page__rest" id="rest-day-message">
          <span className="workout-page__rest-icon">😌</span>
          <h2 className="workout-page__rest-title">Rest Day</h2>
          <p className="workout-page__rest-text">
            Recovery is part of the plan. Stretch, hydrate, and come back stronger tomorrow.
          </p>
        </div>
      ) : (
        <div className="workout-page__exercises">
          {exercises.map((pe) => {
            const exercise = getExerciseById(pe.exercise_id);
            const logged = localLogs.some((l) => l.plan_exercise_id === pe.id);
            const isLogging = loggingExerciseId === pe.id;

            return (
              <div key={pe.id} className="workout-page__exercise-group">
                <ExerciseCard
                  exercise={exercise}
                  planExercise={pe}
                  isLogged={logged}
                />
                {!logged && !isLogging && (
                  <button
                    className="workout-page__log-btn"
                    onClick={() => setLoggingExerciseId(pe.id)}
                  >
                    Log Performance
                  </button>
                )}
                {isLogging && (
                  <WorkoutLogForm
                    planExercise={pe}
                    exercise={exercise}
                    onSave={handleSaveLog}
                    onCancel={() => setLoggingExerciseId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

