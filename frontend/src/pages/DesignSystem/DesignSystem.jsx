import {
  Flame,
  Plus,
  Check,
} from 'lucide-react';
import TrendChart from '../../components/TrendChart/TrendChart';
import './DesignSystem.css';

const COLOR_TOKENS = [
  ['Background', '--bg'],
  ['Surface', '--surface'],
  ['Elevated', '--surface-hover'],
  ['Border', '--line-strong'],
  ['Primary text', '--text'],
  ['Secondary text', '--muted'],
  ['Muted text', '--faint'],
  ['Lime accent', '--accent'],
  ['Success', '--accent-strong'],
  ['Warning', '--amber'],
  ['Error', '--danger'],
];

const TYPE_SPECIMENS = [
  ['Display Large', 'type-display-lg', 'Instrument Serif'],
  ['Display Medium', 'type-display-md', 'Instrument Serif'],
  ['Heading 1', 'type-h1', 'Instrument Serif'],
  ['Heading 2', 'type-h2', 'Instrument Serif'],
  ['Heading 3', 'type-h3', 'DM Sans'],
  ['Body Large', 'type-body-lg', 'DM Sans'],
  ['Body', 'type-body', 'DM Sans'],
  ['Body Small', 'type-body-sm', 'DM Sans'],
  ['Caption', 'type-caption', 'DM Sans'],
  ['Metric Large', 'type-metric-lg', 'Instrument Serif'],
  ['Metric Medium', 'type-metric-md', 'Instrument Serif'],
];

const SPACING_STEPS = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
const RADIUS_STEPS = [12, 16, 20, 24, 32];

/**
 * FitTrack 2.0 Design System Foundations (/design-system)
 * Living styleguide & QA token reference
 */
export default function DesignSystem() {
  return (
    <div className="design-system-page" id="design-system-page">
      <div className="foundation-intro">
        <span className="eyebrow">FITTRACK 2.0 DESIGN SYSTEM</span>
        <h1 className="foundation-heading">A calm system for serious training.</h1>
        <p className="foundation-subtext">
          Semantic foundations and reusable components for every athlete touchpoint.
          Dark is the primary product theme; canonical tokens preserve implementation precision.
        </p>
      </div>

      {/* ── 01.1 Color System ── */}
      <section className="foundation-section">
        <div className="foundation-label">
          <span>01.1</span>
          <h2>Color system</h2>
          <p>Semantic names maintain clarity and contrast across all athlete states.</p>
        </div>
        <div className="swatch-grid">
          {COLOR_TOKENS.map(([label, token]) => (
            <div className="swatch card" key={label}>
              <span style={{ background: `var(${token})` }} className="swatch-color" />
              <strong>{label}</strong>
              <small>{token.replace('--', 'color.')}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── 01.2 Typography ── */}
      <section className="foundation-section">
        <div className="foundation-label">
          <span>01.2</span>
          <h2>Typography</h2>
          <p>Instrument Serif carries emotion. DM Sans carries information.</p>
        </div>
        <div className="type-specimens card">
          {TYPE_SPECIMENS.map(([label, className, fontName]) => (
            <div className="type-specimen-row" key={label}>
              <span className="type-specimen-label">{label}</span>
              <div className={`specimen-sample ${className}`}>Train with intent.</div>
              <small className="type-specimen-font">{fontName}</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── 01.3 Spacing & Shape ── */}
      <section className="foundation-section">
        <div className="foundation-label">
          <span>01.3</span>
          <h2>Spacing & shape</h2>
          <p>A 4px base rhythm keeps layouts structured and balanced.</p>
        </div>
        <div className="spacing-shape-col">
          <div className="spacing-tokens card">
            <span className="specimen-group-label">Spacing Scale (px)</span>
            <div className="spacing-bars">
              {SPACING_STEPS.map((space) => (
                <div key={space} className="spacing-bar-item">
                  <i style={{ height: `${space}px` }} />
                  <span>{space}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="radius-tokens card">
            <span className="specimen-group-label">Corner Radius</span>
            <div className="radius-pills">
              {RADIUS_STEPS.map((radius) => (
                <div style={{ borderRadius: `${radius}px` }} key={radius} className="radius-pill-item">
                  <span>{radius}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 01.4 Components ── */}
      <section className="foundation-section">
        <div className="foundation-label">
          <span>01.4</span>
          <h2>Component board</h2>
          <p>Accessible primitives sized for high-stress gym usage.</p>
        </div>
        <div className="component-board">
          {/* Actions */}
          <div className="card component-group">
            <span className="component-name">Actions</span>
            <div className="component-row">
              <button type="button" className="primary-button">Primary button</button>
              <button type="button" className="secondary-button">Secondary button</button>
              <button type="button" className="icon-btn" aria-label="Add item">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Badges & Inputs */}
          <div className="card component-group">
            <span className="component-name">Inputs & filters</span>
            <div className="specimen-input-wrap">
              <input type="text" placeholder="Search exercises..." className="specimen-input" readOnly />
            </div>
            <div className="component-row">
              <span className="badge accent-badge">Active badge</span>
              <span className="badge">Neutral badge</span>
              <div className="specimen-avatar">DS</div>
            </div>
          </div>

          {/* Metric Card Sample */}
          <div className="card metric-card component-metric">
            <div className="metric-icon" aria-hidden="true">
              <Flame size={18} />
            </div>
            <span>Current streak</span>
            <strong>8 <small>days</small></strong>
            <em>Personal best</em>
          </div>

          {/* Set Row Sample */}
          <div className="card component-group">
            <span className="component-name">Set row</span>
            <div className="specimen-set-row">
              <span className="specimen-set-num">1</span>
              <div className="specimen-stepper"><strong>26 kg</strong></div>
              <div className="specimen-stepper"><strong>8 reps</strong></div>
              <div className="specimen-rir">RIR 1</div>
              <div className="specimen-check"><Check size={16} /></div>
            </div>
          </div>

          {/* Chart Sample */}
          <div className="card component-group chart-sample">
            <span className="component-name">Vector Trend Chart</span>
            <TrendChart ariaLabel="Performance progression curve" />
          </div>
        </div>
      </section>
    </div>
  );
}
