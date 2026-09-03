import './StreakCard.css';

/**
 * Current streak display.
 * Props:
 *   streak — number of consecutive weeks
 */
export default function StreakCard({ streak = 0 }) {
  let label = 'No streak yet';
  if (streak === 1) label = '1 week';
  else if (streak > 1) label = `${streak} weeks`;

  return (
    <div className="streak-card" id="streak-card">
      <span className="streak-card__icon">🔥</span>
      <div className="streak-card__content">
        <span className="streak-card__value">{streak}</span>
        <span className="streak-card__label">{label}</span>
      </div>
    </div>
  );
}
