import './ProgressSummary.css';

/**
 * Dashboard snapshot: completion rate + streak.
 * Props:
 *   completionRate — number 0–100
 *   streak         — number of consecutive weeks
 */
export default function ProgressSummary({ completionRate = 0, streak = 0 }) {
  return (
    <div className="progress-summary" id="progress-summary">
      <div className="progress-summary__item">
        <span className="progress-summary__value">{completionRate}%</span>
        <span className="progress-summary__label">This Week</span>
        <div className="progress-summary__bar">
          <div className="progress-summary__fill" style={{ width: `${Math.min(completionRate, 100)}%` }} />
        </div>
      </div>
      <div className="progress-summary__divider" />
      <div className="progress-summary__item">
        <span className="progress-summary__value">{streak}</span>
        <span className="progress-summary__label">Week Streak 🔥</span>
      </div>
    </div>
  );
}
