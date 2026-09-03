import './WeightChart.css';

/**
 * Weight trend line chart (pure CSS).
 * Props:
 *   data — array of { date: string, weight_kg: number }
 */
export default function WeightChart({ data = [] }) {
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight_kg);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const range = max - min || 1;

  // Generate SVG polyline points
  const chartWidth = 100;
  const chartHeight = 100;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((d.weight_kg - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="weight-chart" id="weight-chart">
      <h3 className="weight-chart__title">Weight Trend</h3>
      <div className="weight-chart__container">
        <svg className="weight-chart__svg" viewBox={`-5 -5 ${chartWidth + 10} ${chartHeight + 10}`} preserveAspectRatio="none">
          <polyline
            className="weight-chart__line"
            points={points}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((d.weight_kg - min) / range) * chartHeight;
            return <circle key={i} cx={x} cy={y} r="3" className="weight-chart__dot" />;
          })}
        </svg>
      </div>
      <div className="weight-chart__labels">
        {data.map((d, i) => (
          <div key={i} className="weight-chart__label-item">
            <span className="weight-chart__label-weight">{d.weight_kg} kg</span>
            <span className="weight-chart__label-date">
              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
