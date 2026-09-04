import './StateScreen.css';

/**
 * Reusable full-width state placeholder for async data screens.
 *
 * Usage:
 *   <StateScreen variant="loading" />
 *   <StateScreen variant="empty"  title="No workouts yet" text="..." />
 *   <StateScreen variant="error"  title="Something went wrong" text="..." onRetry={refetch} />
 *
 * Props:
 *   variant  — 'loading' | 'empty' | 'error'
 *   icon     — optional emoji / character (defaults per variant)
 *   title    — heading text (not shown for loading)
 *   text     — description text
 *   onRetry  — if provided, shows a "Try again" button (error variant)
 */
export default function StateScreen({
  variant = 'loading',
  icon,
  title,
  text,
  onRetry,
}) {
  if (variant === 'loading') {
    return (
      <div className="state-screen state-screen--loading" id="state-loading" role="status" aria-live="polite">
        <div className="state-screen__spinner" />
        <p className="state-screen__text">{text ?? 'Loading your data…'}</p>
      </div>
    );
  }

  const defaultIcon = variant === 'error' ? '⚠️' : '🏋️';
  const defaultTitle = variant === 'error' ? 'Something went wrong' : 'No workouts yet';

  return (
    <div className={`state-screen state-screen--${variant}`} id={`state-${variant}`} role={variant === 'error' ? 'alert' : 'region'}>
      <span className="state-screen__icon">{icon ?? defaultIcon}</span>
      <h2 className="state-screen__title">{title ?? defaultTitle}</h2>
      {text && <p className="state-screen__text">{text}</p>}
      {variant === 'error' && onRetry && (
        <button className="state-screen__retry" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}
