import './NudgeBanner.css';

/**
 * Adaptation nudge / encouragement banner.
 * Props:
 *   type    — 'encouragement' | 'review_goal' | null
 *   message — human-readable explanation text
 */
export default function NudgeBanner({ type, message }) {
  if (!type || !message) return null;

  const isWarning = type === 'review_goal';

  return (
    <div className={`nudge-banner ${isWarning ? 'nudge-banner--warning' : 'nudge-banner--info'}`} id="nudge-banner">
      <span className="nudge-banner__icon">{isWarning ? '⚠️' : '💡'}</span>
      <p className="nudge-banner__message">{message}</p>
    </div>
  );
}
