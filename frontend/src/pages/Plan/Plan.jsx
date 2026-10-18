import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  ChevronRight,
  HeartPulse,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import { fetchActivePlan } from '../../lib/plans';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Plan.css';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Plan() {
  const [weekSchedule, setWeekSchedule] = useState({});
  const [allDates, setAllDates] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlan = useCallback(async (showSpinner = false) => {
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
        console.error('Supabase error loading active plan:', planRes.error);
        setError(planRes.error.message || 'Failed to load workout plan');
        return;
      }

      setWeekSchedule(planRes.data?.weekSchedule ?? {});
      const dates = planRes.data?.allDates ?? [];
      setAllDates(dates);
      setPlanExercises(planRes.data?.planExercises ?? []);
      setWorkoutLogs(logsRes.data ?? []);

      // Default selection to today if present, or first date
      const todayIso = new Date().toISOString().split('T')[0];
      if (dates.includes(todayIso)) {
        setSelectedDate(todayIso);
      } else if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      console.error('Failed to load plan page data:', err);
      setError(err.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const todayIso = new Date().toISOString().split('T')[0];
  const hasPlan = allDates.length > 0;

  // Compute 7 calendar days
  const calendarDays = (() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayExercises = weekSchedule[iso] ?? [];
      const isDone = workoutLogs.some((l) =>
        dayExercises.some((pe) => pe.id === l.plan_exercise_id)
      );
      const isToday = iso === todayIso;
      const isRest = dayExercises.length === 0;

      let state = 'rest';
      if (isDone) state = 'complete';
      else if (isToday && !isRest) state = 'today';
      else if (!isRest) state = 'planned';

      return {
        day: DAY_NAMES[i],
        date: d.getDate(),
        iso,
        exercises: dayExercises,
        state,
        isRest,
        title: isRest ? 'Recovery Day' : (dayExercises[0]?.exercise?.category ? `${dayExercises[0].exercise.category} focus` : 'Scheduled routine'),
      };
    });
  })();

  const currentSelectedDay = calendarDays.find((d) => d.iso === selectedDate) || calendarDays[0];
  const activeExercises = currentSelectedDay ? (weekSchedule[currentSelectedDay.iso] ?? []) : [];
  const isCurrentRest = activeExercises.length === 0;

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="plan-page" id="plan-page">
        <StateScreen variant="loading" text="Loading your active training schedule…" />
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="plan-page" id="plan-page">
        <StateScreen
          variant="error"
          title="Couldn't load workout plan"
          text={error}
          onRetry={() => loadPlan(true)}
        />
      </div>
    );
  }

  /* ── Empty state: No active plan ── */
  if (!hasPlan) {
    return (
      <div className="plan-page" id="plan-page">
        <div className="plan-empty-card">
          <div className="plan-empty-icon" aria-hidden="true">
            <CalendarDays size={32} />
          </div>
          <h2 className="plan-empty-title">No Active Workout Plan</h2>
          <p className="plan-empty-desc">
            You haven't generated a personalized weekly schedule yet. Set up your training profile, goals, and experience level to generate your adaptive routine.
          </p>
          <Link to="/create-plan" className="primary-button plan-empty-cta">
            <Sparkles size={18} aria-hidden="true" />
            <span>Generate your plan</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-page" id="plan-page">
      {/* ── Planner Toolbar ── */}
      <div className="planner-toolbar">
        <div>
          <h2 className="planner-toolbar__title">Weekly Schedule</h2>
          <span className="planner-toolbar__sub">
            {allDates.length} scheduled sessions · {planExercises.length} total exercises
          </span>
        </div>
        <div className="planner-toolbar__actions">
          <Link to="/create-plan" className="planner-action-btn">
            <Plus size={15} aria-hidden="true" />
            <span>New plan</span>
          </Link>
        </div>
      </div>

      {/* ── 7-Day Planner Grid ── */}
      <div className="planner-grid" role="tablist" aria-label="Weekly schedule days">
        {calendarDays.map((item) => (
          <button
            type="button"
            key={item.iso}
            role="tab"
            aria-selected={selectedDate === item.iso}
            className={`card plan-day plan-day--${item.state} ${selectedDate === item.iso ? 'plan-day--selected' : ''}`}
            onClick={() => setSelectedDate(item.iso)}
          >
            <div className="plan-date">
              <span>{item.day}</span>
              <strong>{item.date}</strong>
            </div>

            {item.isRest ? (
              <div className="rest-day-copy">
                <span className="rest-icon" aria-hidden="true">
                  <HeartPulse size={15} />
                </span>
                <strong>Rest day</strong>
                <small>Full recovery</small>
              </div>
            ) : (
              <div className="plan-copy">
                <div className="plan-state">
                  {item.state === 'complete' ? (
                    <span className="plan-badge plan-badge--done">
                      <Check size={12} /> Done
                    </span>
                  ) : item.state === 'today' ? (
                    <span className="plan-badge plan-badge--today">Today</span>
                  ) : (
                    <span className="plan-badge">Planned</span>
                  )}
                </div>
                <h3 className="plan-title">{item.title}</h3>
                <p className="plan-meta">{item.exercises.length} movements</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Routine Details for Selected Day ── */}
      <section className="routine-builder">
        <div className="routine-heading">
          <div>
            <span className="eyebrow">
              {currentSelectedDay?.iso === todayIso ? "Today's Routine" : 'Scheduled Routine'}
            </span>
            <h2 className="routine-title">
              {isCurrentRest
                ? 'Active Recovery'
                : `${currentSelectedDay?.day} Training Routine`}
            </h2>
            <p className="routine-sub">
              {isCurrentRest
                ? 'Rest and hydration. Let your central nervous system adapt.'
                : `${activeExercises.length} programmed exercises targeting strength and hypertrophy.`}
            </p>
          </div>

          {!isCurrentRest && (
            <Link to="/workout" className="primary-button routine-start-btn">
              <Play size={16} fill="currentColor" aria-hidden="true" />
              <span>Start session</span>
            </Link>
          )}
        </div>

        {isCurrentRest ? (
          <div className="card routine-rest-banner">
            <span className="routine-rest-emoji">😌</span>
            <div>
              <h3>Scheduled Rest Day</h3>
              <p>
                Recovery days allow muscle protein synthesis and glycogen restoration. Stretch, hydrate, and prepare for your next compound session.
              </p>
            </div>
          </div>
        ) : (
          <div className="routine-list" role="list" aria-label="Exercises in routine">
            {activeExercises.map((pe, index) => {
              const ex = pe.exercise;
              const isLogged = workoutLogs.some((l) => l.plan_exercise_id === pe.id);

              return (
                <div className="card routine-row" key={pe.id} role="listitem">
                  <span className="routine-index" aria-hidden="true">
                    {`${index + 1}`.padStart(2, '0')}
                  </span>

                  <div className="routine-details">
                    <h3 className="routine-exercise-name">
                      {ex?.name || 'Movement'}
                    </h3>
                    <p className="routine-exercise-meta">
                      {pe.target_sets ?? 3} sets × {pe.target_reps ?? 10} reps
                      {pe.target_weight_kg ? ` · ${pe.target_weight_kg} kg` : ''}
                      {pe.target_duration_min ? ` · ${pe.target_duration_min} min` : ''}
                    </p>
                  </div>

                  <div className="routine-badges">
                    {ex?.category && <span className="badge">{ex.category}</span>}
                    {ex?.equipment && <span className="badge">{ex.equipment}</span>}
                    {isLogged && (
                      <span className="badge accent-badge">
                        <Check size={12} /> Logged
                      </span>
                    )}
                  </div>

                  {ex?.id && (
                    <Link
                      to={`/exercise/${ex.id}`}
                      className="routine-detail-link"
                      aria-label={`View details for ${ex.name}`}
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
