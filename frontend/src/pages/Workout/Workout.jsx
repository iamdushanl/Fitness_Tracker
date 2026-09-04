import { useState, useEffect, useCallback } from 'react';
import { fetchActivePlan } from '../../lib/plans';
import { getExerciseById } from '../../lib/exercises';
import { fetchWorkoutLogs, insertWorkoutLog } from '../../lib/workoutLogs';
import DaySelector from '../../components/DaySelector/DaySelector';
import ExerciseCard from '../../components/ExerciseCard/ExerciseCard';
import WorkoutLogForm from '../../components/WorkoutLogForm/WorkoutLogForm';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Workout.css';

export default function Workout() {
  const [weekSchedule, setWeekSchedule] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loggingExerciseId, setLoggingExerciseId] = useState(null);
  const [localLogs, setLocalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planRes, logsRes] = await Promise.all([
        fetchActivePlan(),
        fetchWorkoutLogs(),
      ]);

      if (planRes.error) {
        console.error('Supabase error loading plan:', planRes.error);
        setError(planRes.error.message || 'Failed to load workout plan');
        return;
      }
      if (logsRes.error) {
        console.error('Supabase error loading workout logs:', logsRes.error);
        setError(logsRes.error.message || 'Failed to load workout logs');
        return;
      }

      const schedule = planRes.data.weekSchedule;
      const dates = planRes.data.allDates;

      setWeekSchedule(schedule);
      setAllDates(dates);
      setLocalLogs(logsRes.data);

      // Select today if in dates, otherwise first date
      const todayIso = new Date().toISOString().split('T')[0];
      if (dates.includes(todayIso)) {
        setSelectedDate(todayIso);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      console.error('Failed to load workout data:', err);
      setError(err.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exercises = (selectedDate && weekSchedule[selectedDate]) ? weekSchedule[selectedDate] : [];
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
    const { data: newLog, error: saveErr } = await insertWorkoutLog(logData);
    if (saveErr) {
      console.error('Supabase error saving workout log:', saveErr);
      throw saveErr;
    }
    setLocalLogs((prev) => [newLog, ...prev]);
    setLoggingExerciseId(null);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="workout-page" id="workout-page">
        <StateScreen variant="loading" text="Loading your workouts…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="workout-page" id="workout-page">
        <StateScreen
          variant="error"
          title="Couldn't load workouts"
          text={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="workout-page" id="workout-page">
      <header className="workout-page__header">
        <h1 className="workout-page__title">Workout</h1>
        <p className="workout-page__subtitle">
          {selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            : 'Schedule'}
        </p>
      </header>

      {allDates.length === 0 ? (
        <StateScreen
          variant="empty"
          icon="🏋️"
          title="No workouts yet"
          text="You don't have an active workout plan yet. Click 'New Plan' in the navigation or dashboard to generate your weekly schedule!"
        />
      ) : (
        <>
          <DaySelector
            dates={allDates}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            exerciseCounts={exerciseCounts}
          />

          {isRestDay ? (
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
                const exercise = pe.exercise || getExerciseById(pe.exercise_id);
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
        </>
      )}
    </div>
  );
}


