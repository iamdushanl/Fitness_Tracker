import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Plus,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { fetchActivePlan } from '../../lib/plans';
import { getExerciseById } from '../../lib/exercises';
import { fetchWorkoutLogs, insertWorkoutLog } from '../../lib/workoutLogs';
import PerformanceVisual from '../../components/PerformanceVisual/PerformanceVisual';
import RestOverlay from '../../components/RestOverlay/RestOverlay';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Workout.css';

export default function Workout() {
  const [weekSchedule, setWeekSchedule] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [localLogs, setLocalLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [setRows, setSetRows] = useState({}); // { [planExerciseId]: [ { weight_kg, reps, done: bool, logId: string } ] }
  const [resting, setResting] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
      setError(null);
    }
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
      setLocalLogs(logsRes.data ?? []);

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

  const currentPlanExercise = exercises[currentExerciseIndex] || exercises[0] || null;
  const currentExercise = currentPlanExercise
    ? (currentPlanExercise.exercise || getExerciseById(currentPlanExercise.exercise_id))
    : null;

  // Initialize set rows for current exercise
  useEffect(() => {
    if (!currentPlanExercise) return;

    setSetRows((prev) => {
      if (prev[currentPlanExercise.id]) return prev;

      const numSets = currentPlanExercise.target_sets ?? 3;
      const initialWeight = currentPlanExercise.target_weight_kg ?? 20;
      const initialReps = currentPlanExercise.target_reps ?? 10;

      // Check if any sets were already logged in localLogs for this exercise
      const alreadyLogged = localLogs.filter(
        (l) => l.plan_exercise_id === currentPlanExercise.id
      );

      const rows = Array.from({ length: numSets }, (_, i) => {
        const log = alreadyLogged[i];
        return {
          setNumber: i + 1,
          weight_kg: log?.actual_weight_kg ?? initialWeight,
          reps: log?.actual_reps ?? initialReps,
          done: Boolean(log),
          logId: log?.id ?? null,
        };
      });

      return {
        ...prev,
        [currentPlanExercise.id]: rows,
      };
    });
  }, [currentPlanExercise, localLogs]);

  const currentRows = (currentPlanExercise && setSetRows && setRows[currentPlanExercise.id])
    ? setRows[currentPlanExercise.id]
    : [];

  // Update weight or reps in a specific set
  const updateSetField = (setIndex, field, delta) => {
    if (!currentPlanExercise) return;

    setSetRows((prev) => {
      const rows = [...(prev[currentPlanExercise.id] || [])];
      if (!rows[setIndex]) return prev;

      const currentVal = Number(rows[setIndex][field]) || 0;
      let nextVal = currentVal + delta;
      if (field === 'weight_kg') nextVal = Math.max(0, Number(nextVal.toFixed(1)));
      if (field === 'reps') nextVal = Math.max(1, Math.round(nextVal));

      rows[setIndex] = {
        ...rows[setIndex],
        [field]: nextVal,
      };

      return {
        ...prev,
        [currentPlanExercise.id]: rows,
      };
    });
  };

  // Add an extra set to the current movement
  const handleAddSet = () => {
    if (!currentPlanExercise) return;

    setSetRows((prev) => {
      const rows = [...(prev[currentPlanExercise.id] || [])];
      const lastRow = rows[rows.length - 1];
      const newRow = {
        setNumber: rows.length + 1,
        weight_kg: lastRow?.weight_kg ?? currentPlanExercise.target_weight_kg ?? 20,
        reps: lastRow?.reps ?? currentPlanExercise.target_reps ?? 10,
        done: false,
        logId: null,
      };

      return {
        ...prev,
        [currentPlanExercise.id]: [...rows, newRow],
      };
    });
  };

  // Log a set and trigger RestOverlay
  const handleCompleteSet = async (setIndex) => {
    if (!currentPlanExercise || !currentRows[setIndex]) return;
    const targetSet = currentRows[setIndex];

    try {
      const logPayload = {
        plan_exercise_id: currentPlanExercise.id,
        performed_at: new Date().toISOString(),
        actual_sets: 1,
        actual_reps: Number(targetSet.reps),
        actual_weight_kg: Number(targetSet.weight_kg),
        notes: '',
      };

      const { data: newLog, error: saveErr } = await insertWorkoutLog(logPayload);
      if (saveErr) {
        console.error('Supabase error saving workout log set:', saveErr);
        throw saveErr;
      }

      setLocalLogs((prev) => [newLog, ...prev]);

      setSetRows((prev) => {
        const rows = [...(prev[currentPlanExercise.id] || [])];
        rows[setIndex] = {
          ...rows[setIndex],
          done: true,
          logId: newLog.id,
        };
        return {
          ...prev,
          [currentPlanExercise.id]: rows,
        };
      });

      // Trigger Rest Overlay
      setResting(true);
    } catch (err) {
      console.error('Failed to log set:', err);
    }
  };

  // Total session set progress
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.target_sets ?? 3), 0);
  const completedSets = Object.values(setRows).reduce(
    (acc, rows) => acc + rows.filter((r) => r.done).length,
    0
  );
  const sessionProgressPercent = totalSets > 0 ? Math.min(100, Math.round((completedSets / totalSets) * 100)) : 0;

  // Next upcoming exercise preview
  const nextPlanExercise = exercises[currentExerciseIndex + 1] || null;
  const nextExercise = nextPlanExercise
    ? {
        name: nextPlanExercise.exercise?.name || 'Next Movement',
        sets: nextPlanExercise.target_sets ?? 3,
        reps: nextPlanExercise.target_reps ?? 10,
        target_weight_kg: nextPlanExercise.target_weight_kg,
      }
    : null;

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="workout-view" id="workout-page">
        <StateScreen variant="loading" text="Loading active training session…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="workout-view" id="workout-page">
        <StateScreen
          variant="error"
          title="Couldn't load workout"
          text={error}
          onRetry={() => loadData(true)}
        />
      </div>
    );
  }

  /* ── No Plan State ── */
  if (allDates.length === 0) {
    return (
      <div className="workout-view" id="workout-page">
        <div className="card workout-empty-card">
          <div className="workout-empty-icon" aria-hidden="true">
            <Dumbbell size={36} />
          </div>
          <h2 className="workout-empty-title">No Workout Plan Scheduled</h2>
          <p className="workout-empty-desc">
            You don't have an active routine yet. Generate your personalized weekly schedule to start logging workouts with automated progressive overload.
          </p>
          <Link to="/create-plan" className="primary-button workout-empty-cta">
            <Sparkles size={18} aria-hidden="true" />
            <span>Generate workout plan</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Session Complete Celebration Modal ── */
  if (sessionFinished) {
    return (
      <div className="workout-view" id="workout-page">
        <div className="card session-finished-card">
          <div className="session-finished-icon" aria-hidden="true">
            <Sparkles size={36} />
          </div>
          <span className="eyebrow">SESSION ACCOMPLISHED</span>
          <h2 className="session-finished-title">Outstanding Workout!</h2>
          <p className="session-finished-desc">
            You completed {completedSets} sets across {exercises.length} programmed movements. Your volume load and streak metrics have been updated.
          </p>
          <div className="session-finished-actions">
            <Link to="/" className="primary-button">
              <span>Return to Overview</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSessionFinished(false)}
            >
              Review workout logs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-view" id="workout-page">
      {/* ── Day Selector Strip ── */}
      <div className="workout-day-bar" role="tablist" aria-label="Select workout day">
        {allDates.map((d) => {
          const isSelected = d === selectedDate;
          const dayDate = new Date(d + 'T00:00:00');
          const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dayDate.getDate();
          const dayCount = (weekSchedule[d] ?? []).length;

          return (
            <button
              type="button"
              key={d}
              role="tab"
              aria-selected={isSelected}
              className={`workout-day-btn ${isSelected ? 'workout-day-btn--active' : ''}`}
              onClick={() => {
                setSelectedDate(d);
                setCurrentExerciseIndex(0);
              }}
            >
              <span className="workout-day-btn__name">{dayName}</span>
              <strong className="workout-day-btn__num">{dayNum}</strong>
              <small className="workout-day-btn__count">
                {dayCount > 0 ? `${dayCount} ex` : 'Rest'}
              </small>
            </button>
          );
        })}
      </div>

      {isRestDay ? (
        <div className="card workout-rest-card" id="rest-day-message">
          <div className="workout-rest-icon" aria-hidden="true">
            <HeartPulse size={36} />
          </div>
          <span className="eyebrow">RECOVERY · REPAIR</span>
          <h2 className="workout-rest-title">Active Recovery Day</h2>
          <p className="workout-rest-desc">
            Rest and hydration are fundamental to muscle hypertrophy and nervous system recovery. Take a walk, stretch, and nourish your body.
          </p>
          <div className="workout-rest-actions">
            <Link to="/plan" className="planner-action-btn">
              <span>View weekly plan</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Active Session Header ── */}
          <header className="workout-header">
            <Link to="/" className="workout-nav-btn" aria-label="Close workout session" title="Close">
              <X size={20} />
            </Link>

            <div className="workout-header-center">
              <h2 className="workout-session-title">
                {currentExercise?.name || 'Workout Session'}
              </h2>
              <span className="workout-session-sub">
                Exercise {currentExerciseIndex + 1} of {exercises.length} · {completedSets}/{totalSets} sets
              </span>
            </div>

            <div className="workout-header-actions">
              <button
                type="button"
                className="workout-finish-btn"
                onClick={() => setSessionFinished(true)}
                title="Finish workout"
                aria-label="Finish workout session"
              >
                <Check size={18} aria-hidden="true" />
                <span>Finish</span>
              </button>
            </div>
          </header>

          {/* Session Progress Bar */}
          <div className="session-progress" aria-hidden="true">
            <span style={{ width: `${sessionProgressPercent}%` }} />
          </div>

          {/* ── Active Exercise Layout ── */}
          <div className="exercise-layout">
            {/* Left: Exercise Visual Media Panel */}
            <div className="exercise-media">
              <PerformanceVisual className="exercise-media-visual" />
              <div className="media-shade" />

              <span className="exercise-count">
                Exercise {currentExerciseIndex + 1} / {exercises.length}
              </span>

              <div className="media-info-overlay">
                <span className="badge accent-badge">
                  {currentExercise?.category?.toUpperCase() || 'STRENGTH'}
                </span>
                <span className="badge">
                  {currentExercise?.equipment || 'EQUIPMENT'}
                </span>
              </div>
            </div>

            {/* Right: Stepper Card & Set Rows */}
            <div className="exercise-detail">
              <div className="exercise-title-row">
                <div>
                  <span className="eyebrow">CURRENT EXERCISE</span>
                  <h2 className="exercise-title">
                    {currentExercise?.name || 'Compound Movement'}
                  </h2>
                </div>
              </div>

              <div className="exercise-badges">
                {currentExercise?.primary_muscle && (
                  <span className="badge accent-badge">
                    {currentExercise.primary_muscle}
                  </span>
                )}
                <span className="badge">
                  Target: {currentPlanExercise?.target_weight_kg ?? 20} kg × {currentPlanExercise?.target_reps ?? 10}
                </span>
                <span className="badge">
                  {currentPlanExercise?.target_sets ?? 3} working sets
                </span>
              </div>

              <div className="progression-note">
                <TrendingUp size={16} aria-hidden="true" />
                <span>
                  <strong>Progression target</strong> · Add load while keeping target RIR 2 on compound sets.
                </span>
              </div>

              {/* Set Stepper Card */}
              <div className="card set-card">
                <div className="set-head">
                  <span>Set</span>
                  <span>Weight (kg)</span>
                  <span>Reps</span>
                  <span>RIR</span>
                  <span>Log</span>
                </div>

                {currentRows.map((row, index) => (
                  <div
                    className={`set-row ${row.done ? 'completed' : ''}`}
                    key={index}
                  >
                    <span className="set-number">{row.setNumber}</span>

                    {/* Weight Stepper (Canonical KG) */}
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label="Decrease weight by 2.5 kg"
                        onClick={() => updateSetField(index, 'weight_kg', -2.5)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="stepper-input"
                        value={row.weight_kg}
                        aria-label={`Weight for set ${row.setNumber}`}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSetRows((prev) => {
                            const rows = [...(prev[currentPlanExercise.id] || [])];
                            rows[index] = { ...rows[index], weight_kg: val };
                            return { ...prev, [currentPlanExercise.id]: rows };
                          });
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Increase weight by 2.5 kg"
                        onClick={() => updateSetField(index, 'weight_kg', 2.5)}
                      >
                        +
                      </button>
                    </div>

                    {/* Reps Stepper */}
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label="Decrease reps by 1"
                        onClick={() => updateSetField(index, 'reps', -1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="stepper-input"
                        value={row.reps}
                        aria-label={`Reps for set ${row.setNumber}`}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setSetRows((prev) => {
                            const rows = [...(prev[currentPlanExercise.id] || [])];
                            rows[index] = { ...rows[index], reps: val };
                            return { ...prev, [currentPlanExercise.id]: rows };
                          });
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Increase reps by 1"
                        onClick={() => updateSetField(index, 'reps', 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="rir-control">2</span>

                    {/* Complete Set Checkbox Button */}
                    <button
                      type="button"
                      className="set-check"
                      aria-label={`Log set ${row.setNumber}`}
                      onClick={() => handleCompleteSet(index)}
                    >
                      {row.done && <Check size={17} aria-hidden="true" />}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-set"
                  onClick={handleAddSet}
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>Add working set</span>
                </button>
              </div>

              {/* Movement Navigation Actions */}
              <div className="session-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={currentExerciseIndex === 0}
                  onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  className="primary-button"
                  disabled={currentExerciseIndex >= exercises.length - 1}
                  onClick={() => setCurrentExerciseIndex((i) => Math.min(exercises.length - 1, i + 1))}
                >
                  <span>Next movement</span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Rest Overlay Countdown Modal ── */}
      {resting && (
        <RestOverlay
          onSkip={() => setResting(false)}
          nextExercise={nextExercise}
          initialSeconds={90}
        />
      )}
    </div>
  );
}
