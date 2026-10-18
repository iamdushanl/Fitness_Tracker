import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Dumbbell,
  AlertCircle,
} from 'lucide-react';
import { fetchExerciseById, getExerciseById } from '../../lib/exercises';
import YouTubeEmbed from '../../components/YouTubeEmbed/YouTubeEmbed';
import StateScreen from '../../components/StateScreen/StateScreen';
import './ExerciseDetails.css';

/**
 * Assigns a curated preview image based on exercise type and muscle focus
 */
function getExerciseHeroImage(exercise) {
  if (exercise?.preview_image) return exercise.preview_image;
  const name = (exercise?.name || '').toLowerCase();
  const muscle = (exercise?.muscle_group || '').toLowerCase();
  const category = (exercise?.category || '').toLowerCase();

  if (name.includes('bench') || name.includes('squat') || name.includes('deadlift')) {
    return '/images/bench-press.jpg';
  }
  if (name.includes('pulldown') || name.includes('extension') || name.includes('curl') || category === 'strength') {
    return '/images/gym-machines.jpg';
  }
  if (category === 'cardio' || category === 'flexibility' || muscle.includes('body')) {
    return '/images/athlete.jpg';
  }
  return '/images/bench-press.jpg';
}

/**
 * Parses instructions into clean numbered execution steps
 */
function parseInstructionSteps(instructions) {
  if (!instructions) return [];
  return instructions
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)
    .map((s) => (s.endsWith('.') ? s : `${s}.`));
}

/**
 * FitTrack 2.0 Exercise Detail View
 */
export default function ExerciseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <div className="exercise-detail-page" id="exercise-details-page">
        <StateScreen variant="loading" text="Loading movement specification…" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="exercise-detail-page" id="exercise-details-page">
        <div className="exercise-detail-not-found">
          <div className="not-found-icon-wrap" aria-hidden="true">
            <Dumbbell size={36} />
          </div>
          <h2>Movement Not Found</h2>
          <p>We couldn't locate this exercise in the movement library.</p>
          <Link to="/exercises" className="primary-button not-found-btn">
            Browse Movement Library
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = getExerciseHeroImage(exercise);
  const steps = parseInstructionSteps(exercise.instructions);
  const categoryLabel =
    exercise.category === 'strength'
      ? 'Strength'
      : exercise.category === 'cardio'
      ? 'Cardio'
      : 'Mobility & Stretch';

  return (
    <div className="exercise-detail-page" id="exercise-details-page">
      {/* ── Top Navigation Bar ── */}
      <nav className="detail-top-nav" aria-label="Breadcrumb navigation">
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="detail-back-btn"
          aria-label="Back to exercises library"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Movement Library</span>
        </button>
      </nav>

      {/* ── Atmospheric Hero Visual ── */}
      <div className="detail-hero" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="detail-hero-shade" />
        <div className="detail-hero-badge">
          <span className="badge accent-badge">{categoryLabel}</span>
        </div>
      </div>

      {/* ── Main Detail Content ── */}
      <main className="detail-content">
        <div className="detail-header-block">
          <span className="eyebrow">
            {exercise.muscle_group?.toUpperCase()} · {exercise.category?.toUpperCase()}
          </span>
          <h1 className="detail-title">{exercise.name}</h1>

          <div className="detail-tags">
            <span className="badge accent-badge">{exercise.muscle_group}</span>
            <span className="badge">{categoryLabel}</span>
            {exercise.youtube_url && (
              <span className="badge video-badge">
                <Play size={11} aria-hidden="true" /> Video Demo
              </span>
            )}
          </div>
        </div>

        {/* ── Primary Muscles Card ── */}
        <section className="card primary-muscles" aria-labelledby="muscles-heading">
          <span className="eyebrow" id="muscles-heading">
            PRIMARY TARGET & FOCUS
          </span>
          <div className="muscles-grid">
            <div className="muscle-item">
              <span className="muscle-label">Prime Mover</span>
              <strong>{exercise.muscle_group}</strong>
            </div>
            <div className="muscle-item">
              <span className="muscle-label">Modality</span>
              <strong>{categoryLabel}</strong>
            </div>
            <div className="muscle-item">
              <span className="muscle-label">Kinetic Chain</span>
              <strong>Compound Movement</strong>
            </div>
          </div>
        </section>

        {/* ── Video Demonstration ── */}
        {exercise.youtube_url && (
          <section className="detail-video-section" aria-labelledby="video-demo-heading">
            <div className="section-title-row">
              <h2 className="section-title" id="video-demo-heading">
                Technique Demonstration
              </h2>
              <span className="section-subtext">Video guidance & execution form</span>
            </div>
            <div className="card video-card">
              <YouTubeEmbed
                url={exercise.youtube_url}
                title={`${exercise.name} demonstration`}
              />
            </div>
          </section>
        )}

        {/* ── Technique Breakdown ── */}
        <section className="technique-section" aria-labelledby="technique-heading">
          <div className="section-title-row">
            <h2 className="section-title" id="technique-heading">
              Execution & Technique
            </h2>
            <span className="section-subtext">Step-by-step coaching cues</span>
          </div>

          <div className="card technique-card">
            {steps.map((step, idx) => (
              <div className="technique-step" key={idx}>
                <span className="step-number" aria-hidden="true">
                  {`${idx + 1}`.padStart(2, '0')}
                </span>
                <p className="step-text">{step}</p>
              </div>
            ))}

            {/* Pro-Tip & Safety Cue */}
            <div className="technique-mistake">
              <div className="mistake-icon" aria-hidden="true">
                <AlertCircle size={16} />
              </div>
              <div>
                <strong>Safety & Efficiency Cue</strong>
                <p>
                  Maintain core brace and controlled eccentric tempo. Avoid jerking or bouncing at the bottom of the movement.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Sticky Bottom Actions ── */}
      <footer className="detail-actions" aria-label="Exercise action controls">
        <Link to="/exercises" className="button secondary-button detail-action-secondary">
          All Movements
        </Link>
        <Link to="/workout" className="button primary-button detail-action-primary">
          <Dumbbell size={16} aria-hidden="true" />
          <span>Start Workout Session</span>
        </Link>
      </footer>
    </div>
  );
}
