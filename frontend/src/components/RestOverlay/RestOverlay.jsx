import { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import './RestOverlay.css';

/**
 * FitTrack 2.0 Fullscreen Rest Countdown Overlay
 * Triggered automatically upon set completion
 *
 * @param {Function} onSkip - callback to dismiss rest overlay and resume workout
 * @param {object} nextExercise - information about the upcoming movement
 * @param {number} initialSeconds - starting rest duration (default 90s)
 */
export default function RestOverlay({ onSkip, nextExercise, initialSeconds = 90 }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((val) => {
        if (val <= 1) {
          window.clearInterval(timer);
          onSkip?.();
          return 0;
        }
        return val - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onSkip]);

  // Handle ESC key to dismiss rest timer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onSkip?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  const addTime = (delta) => {
    setSeconds((v) => v + delta);
    setTotalSeconds((v) => Math.max(v, seconds + delta));
  };

  const minutes = Math.floor(seconds / 60);
  const remainder = `${seconds % 60}`.padStart(2, '0');
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, (seconds / totalSeconds) * 100)) : 0;

  return (
    <div
      className="rest-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Rest timer countdown"
    >
      <div className="rest-glow" aria-hidden="true" />

      <span className="rest-eyebrow">RECOVER · BREATHE</span>
      <h2 className="rest-title">Rest</h2>

      <div className="rest-time" aria-live="polite">
        {minutes}:{remainder}
      </div>

      <div className="rest-progress" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="rest-actions">
        <button
          type="button"
          className="rest-action-btn"
          onClick={() => addTime(15)}
        >
          +15 sec
        </button>
        <button
          type="button"
          className="rest-action-btn"
          onClick={() => addTime(30)}
        >
          +30 sec
        </button>
        <button
          type="button"
          className="rest-action-btn rest-skip-btn"
          onClick={onSkip}
        >
          <span>Skip rest</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {nextExercise && (
        <div className="next-exercise" aria-label="Upcoming exercise preview">
          <span className="next-exercise__tag">Next</span>
          <div className="next-exercise__info">
            <strong className="next-exercise__name">{nextExercise.name}</strong>
            <small className="next-exercise__meta">
              {nextExercise.sets ?? 3} sets · {nextExercise.reps ?? 10} reps · {nextExercise.target_weight_kg ? `${nextExercise.target_weight_kg} kg` : 'Bodyweight'}
            </small>
          </div>
          <ChevronRight size={18} className="next-exercise__icon" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
