import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Logo } from '../../components/Sidebar/Sidebar';
import PerformanceVisual from '../../components/PerformanceVisual/PerformanceVisual';
import './Landing.css';

/**
 * Clean SVG Google mark for standard OAuth button
 */
function GoogleIcon() {
  return (
    <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * FitTrack 2.0 Landing & Auth Experience
 * Split-screen layout with glowing PerformanceVisual and Google OAuth sign-in/sign-up.
 */
export default function Landing() {
  const { signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleClick = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google authentication error:', err);
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" id="landing-auth-page">
      <div className="auth-atmosphere" aria-hidden="true" />

      {/* Top Brand Indicator */}
      <div className="auth-brand">
        <Logo />
        <span className="auth-brand__tagline">Human performance, intelligently guided.</span>
      </div>

      {/* ── Left Visual Panel ── */}
      <section className="auth-visual" aria-hidden="true">
        <PerformanceVisual />
        <div className="auth-visual-copy">
          <span className="auth-visual-eyebrow">FITTRACK PERFORMANCE SYSTEM</span>
          <h1 className="auth-visual-title">
            Move with purpose.<br />
            <em>Progress with clarity.</em>
          </h1>
          <p className="auth-visual-sub">
            Training, recovery, and performance intelligence—built around you.
          </p>
        </div>

        {/* Ambient Recovery Signal Chip */}
        <div className="auth-signal" aria-label="System recovery indicator">
          <span className="auth-signal__label">
            <Activity size={14} aria-hidden="true" /> Recovery readiness
          </span>
          <strong className="auth-signal__value">78%</strong>
          <span className="auth-signal__track">
            <span className="auth-signal__fill" />
          </span>
        </div>
      </section>

      {/* ── Right Auth Shell (Sliding Track) ── */}
      <section className={`auth-shell ${mode === 'register' ? 'auth-shell--register' : ''}`} aria-label="Authentication form">
        <div className="auth-panel-track">
          {/* ── Login Panel ── */}
          <div className="auth-form-panel">
            <div className="auth-mobile-logo">
              <Logo />
            </div>

            <span className="auth-panel-eyebrow">WELCOME BACK</span>
            <h2 className="auth-panel-title">
              Ready for your<br />next session?
            </h2>
            <p className="auth-subtitle">Sign in to continue your training plan.</p>

            {/* Primary Google Auth CTA */}
            <button
              type="button"
              id="landing-signin-btn"
              className="google-button"
              onClick={handleGoogleClick}
              disabled={submitting}
            >
              <GoogleIcon />
              <span>{submitting ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <p className="auth-disclaimer">
              Single-click sign in with your Google account.
            </p>

            <p className="auth-switch">
              <span>New to FitTrack?</span>
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setMode('register')}
              >
                Create an account
              </button>
            </p>
          </div>

          {/* ── Register Panel ── */}
          <div className="auth-form-panel auth-form-panel--register">
            <div className="auth-mobile-logo">
              <Logo />
            </div>

            <span className="auth-panel-eyebrow">START YOUR JOURNEY</span>
            <h2 className="auth-panel-title">
              Build your strongest<br />self.
            </h2>
            <p className="auth-subtitle">Create an account and personalize your training plan.</p>

            {/* Primary Google Auth Sign Up */}
            <button
              type="button"
              id="landing-signup-btn"
              className="google-button"
              onClick={handleGoogleClick}
              disabled={submitting}
            >
              <GoogleIcon />
              <span>{submitting ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>

            <p className="auth-disclaimer">
              By joining FitTrack, you agree to the Terms of Service and Privacy Policy.
            </p>

            <p className="auth-switch">
              <span>Already a member?</span>
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
