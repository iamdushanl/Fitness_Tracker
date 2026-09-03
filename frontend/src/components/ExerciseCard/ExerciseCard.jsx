import { Link } from 'react-router-dom';
import './ExerciseCard.css';

/**
 * Displays an exercise overview card with category badge and target info.
 * Props:
 *   exercise      — exercise object from seed library
 *   planExercise  — the plan_exercise row (targets)
 *   isLogged      — whether this exercise has been completed
 */
export default function ExerciseCard({ exercise, planExercise, isLogged = false }) {
  if (!exercise) return null;

  const isStrength = exercise.category === 'strength';
  const isCardio = exercise.category === 'cardio';

  const targetText = isStrength
    ? `${planExercise.target_sets}×${planExercise.target_reps} @ ${planExercise.target_weight_kg} kg`
    : isCardio
      ? `${planExercise.target_duration_min} min${planExercise.target_distance_km ? ` / ${planExercise.target_distance_km} km` : ''}`
      : `${planExercise.target_duration_min} min`;

  const categoryIcon = isStrength ? '🏋️' : isCardio ? '🏃' : '🧘';

  return (
    <div className={`exercise-card ${isLogged ? 'exercise-card--logged' : ''}`} id={`exercise-card-${planExercise.id}`}>
      <div className="exercise-card__top">
        <div className="exercise-card__info">
          <span className={`exercise-card__category exercise-card__category--${exercise.category}`}>
            {categoryIcon} {exercise.category}
          </span>
          <h3 className="exercise-card__name">{exercise.name}</h3>
          <span className="exercise-card__muscle">{exercise.muscle_group}</span>
        </div>
        {isLogged && <span className="exercise-card__check">✓</span>}
      </div>

      <div className="exercise-card__target">
        <span className="exercise-card__target-label">Target</span>
        <span className="exercise-card__target-value">{targetText}</span>
      </div>

      <Link to={`/exercise/${exercise.id}`} className="exercise-card__details-link">
        View details →
      </Link>
    </div>
  );
}
