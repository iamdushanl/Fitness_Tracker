import './WeightCard.css';

/**
 * Current weight display with change from start.
 * Props:
 *   currentWeight — number (kg)
 *   weightChange  — number (+ or -, kg)
 */
export default function WeightCard({ currentWeight, weightChange }) {
  const isLoss = weightChange != null && weightChange < 0;
  const isGain = weightChange != null && weightChange > 0;

  return (
    <div className="weight-card" id="weight-card">
      <span className="weight-card__icon">⚖️</span>
      <div className="weight-card__content">
        <span className="weight-card__value">
          {currentWeight != null ? `${currentWeight} kg` : '–'}
        </span>
        <span className="weight-card__label">Current Weight</span>
        {weightChange != null && (
          <span className={`weight-card__change ${isLoss ? 'weight-card__change--loss' : ''} ${isGain ? 'weight-card__change--gain' : ''}`}>
            {isLoss ? '↓' : isGain ? '↑' : '→'} {Math.abs(weightChange)} kg
          </span>
        )}
      </div>
    </div>
  );
}
