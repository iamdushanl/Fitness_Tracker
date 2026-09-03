import './CompletionChart.css';

/**
 * Weekly completion-rate trend chart (pure CSS bar chart).
 * Props:
 *   data — array of { week: string, rate: number }
 */
export default function CompletionChart({ data = [] }) {
  if (data.length === 0) return null;

  const maxRate = 100;

  return (
    <div className="completion-chart" id="completion-chart">
      <h3 className="completion-chart__title">Weekly Completion Rate</h3>
      <div className="completion-chart__chart">
        {data.map((item, i) => {
          const height = (item.rate / maxRate) * 100;
          let barClass = 'completion-chart__bar--low';
          if (item.rate >= 90) barClass = 'completion-chart__bar--high';
          else if (item.rate >= 60) barClass = 'completion-chart__bar--medium';

          return (
            <div key={i} className="completion-chart__column">
              <div className="completion-chart__bar-container">
                <div
                  className={`completion-chart__bar ${barClass}`}
                  style={{ height: `${height}%` }}
                  title={`${item.rate}%`}
                >
                  <span className="completion-chart__bar-label">{item.rate}%</span>
                </div>
              </div>
              <span className="completion-chart__week">{item.week}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
