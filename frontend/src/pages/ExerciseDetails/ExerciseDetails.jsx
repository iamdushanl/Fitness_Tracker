import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchExerciseById, getExerciseById } from '../../lib/exercises';
import YouTubeEmbed from '../../components/YouTubeEmbed/YouTubeEmbed';
import StateScreen from '../../components/StateScreen/StateScreen';
import './ExerciseDetails.css';

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState(() => getExerciseById(id));
  const [loading, setLoading] = useState(!exercise);

  useEffect(() => {
    let active = true;
    fetchExerciseById(id).then(({ data }) => {
      if (active && data) {
        setExercise(data);
      }
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="exercise-details" id="exercise-details-page">
        <StateScreen variant="loading" text="Loading exercise details…" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="exercise-details" id="exercise-details-page">
        <div className="exercise-details__not-found">
          <span className="exercise-details__not-found-icon">🔍</span>
          <h2>Exercise Not Found</h2>
          <p>We couldn't find that exercise.</p>
          <Link to="/workout" className="exercise-details__back-link">← Back to Workout</Link>
        </div>
      </div>
    );
  }

  const categoryIcon = exercise.category === 'strength' ? '🏋️' : exercise.category === 'cardio' ? '🏃' : '🧘';

  return (
    <div className="exercise-details" id="exercise-details-page">
      <Link to="/workout" className="exercise-details__back-link">← Back to Workout</Link>

      <header className="exercise-details__header">
        <span className={`exercise-details__category exercise-details__category--${exercise.category}`}>
          {categoryIcon} {exercise.category}
        </span>
        <h1 className="exercise-details__name">{exercise.name}</h1>
        <span className="exercise-details__muscle">{exercise.muscle_group}</span>
      </header>

      <section className="exercise-details__video">
        <h2 className="exercise-details__section-title">Demonstration</h2>
        <YouTubeEmbed url={exercise.youtube_url} title={`${exercise.name} demonstration`} />
      </section>

      <section className="exercise-details__instructions">
        <h2 className="exercise-details__section-title">Instructions</h2>
        <p className="exercise-details__text">{exercise.instructions}</p>
      </section>
    </div>
  );
}

