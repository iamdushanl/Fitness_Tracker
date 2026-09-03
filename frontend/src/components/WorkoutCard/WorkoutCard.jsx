import { Link } from 'react-router-dom';
import { getExerciseById } from '../../data/mock/exercises';
import './WorkoutCard.css';

/**
 * Displays a summary card for a single day's workout.
 * Props:
 *   date        — scheduled date string (YYYY-MM-DD)
 *   exercises   — array of plan_exercises for this day
 *   isToday     — boolean, highlights the card
 *   completedCount — how many exercises have been logged
 */
export default function WorkoutCard({ date, exercises, isToday = false, completedCount = 0 }) {
  const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  const shortDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const total = exercises.length;
  const allDone = completedCount >= total && total > 0;

  return (
    <div className={`workout-card ${isToday ? 'workout-card--today' : ''} ${allDone ? 'workout-card--done' : ''}`} id={`workout-card-${date}`}>
      <div className="workout-card__header">
        <div className="workout-card__day">
          <span className="workout-card__day-name">{dayName}</span>
          <span className="workout-card__date">{shortDate}</span>
        </div>
        {isToday && <span className="workout-card__badge">Today</span>}
        {allDone && <span className="workout-card__badge workout-card__badge--done">✓ Done</span>}
      </div>

      <ul className="workout-card__exercises">
        {exercises.map((pe) => {
          const ex = getExerciseById(pe.exercise_id);
          return (
            <li key={pe.id} className="workout-card__exercise">
              <span className={`workout-card__category workout-card__category--${ex?.category}`}>
                {ex?.category === 'strength' ? '🏋️' : ex?.category === 'cardio' ? '🏃' : '🧘'}
              </span>
              <span className="workout-card__exercise-name">{ex?.name ?? 'Unknown'}</span>
            </li>
          );
        })}
      </ul>

      <div className="workout-card__footer">
        <span className="workout-card__progress">{completedCount}/{total} exercises</span>
        <Link to="/workout" className="workout-card__action">
          {allDone ? 'Review' : isToday ? 'Start' : 'View'} →
        </Link>
      </div>
    </div>
  );
}
