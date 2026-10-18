import './Ring.css';

/**
 * Conic gradient readiness dial component
 * @param {number} value - readiness percentage (0 - 100)
 * @param {string} label - sub-label below percentage
 */
export default function Ring({ value = 78, label = 'ready' }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const degrees = Math.round(clampedValue * 3.6);

  return (
    <div
      className="ring"
      style={{ '--progress': `${degrees}deg` }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Readiness score: ${clampedValue}%`}
    >
      <div className="ring-inner">
        <strong>{clampedValue}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
