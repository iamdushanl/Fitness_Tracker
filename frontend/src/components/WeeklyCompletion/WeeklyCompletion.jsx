import './WeeklyCompletion.css';

/**
 * This week's completion rate display.
 * Props:
 *   rate — number 0–100
 */
export default function WeeklyCompletion({ rate = 0 }) {
  let status = 'low';
  if (rate >= 90) status = 'high';
  else if (rate >= 60) status = 'medium';

  return (
    <div className="weekly-completion" id="weekly-completion">
      <div className="weekly-completion__header">
        <span className="weekly-completion__title">Weekly Completion</span>
        <span className={`weekly-completion__badge weekly-completion__badge--${status}`}>
          {rate >= 90 ? '🎯 On Track' : rate >= 60 ? '📊 Steady' : '💪 Keep Going'}
        </span>
      </div>
      <div className="weekly-completion__display">
        <span className="weekly-completion__value">{rate}%</span>
      </div>
      <div className="weekly-completion__bar">
        <div className={`weekly-completion__fill weekly-completion__fill--${status}`} style={{ width: `${Math.min(rate, 100)}%` }} />
      </div>
    </div>
  );
}
