import './TrendChart.css';

/**
 * FitTrack 2.0 SVG Trend Chart Component
 * Responsive strength/volume trend curve with accent gradient area
 */
export default function TrendChart({ ariaLabel = 'Strength trend curve increasing over recent sessions' }) {
  return (
    <svg
      viewBox="0 0 560 160"
      className="trend-chart"
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Subtle guide lines */}
      <line x1="0" y1="130" x2="560" y2="130" className="chart-grid" />
      <line x1="0" y1="72" x2="560" y2="72" className="chart-grid" />

      {/* Shaded Area */}
      <path
        d="M0 132 C48 128 66 108 110 112 S180 98 218 104 S278 65 326 74 S396 58 434 62 S505 22 560 30 V160 H0Z"
        fill="url(#trendAreaGradient)"
      />

      {/* Main Vector Curve */}
      <path
        d="M0 132 C48 128 66 108 110 112 S180 98 218 104 S278 65 326 74 S396 58 434 62 S505 22 560 30"
        className="chart-line"
      />

      {/* Active endpoint indicator dot */}
      <circle cx="560" cy="30" r="5" className="chart-point" />
    </svg>
  );
}
