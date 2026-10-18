import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  CalendarDays,
  BarChart3,
  UserRound,
  Search,
  Activity,
  X,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import './BottomNav.css';

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/workout', label: 'Workout', icon: Dumbbell, end: false },
  { to: '/plan', label: 'Plan', icon: CalendarDays, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
];

/**
 * FitTrack 2.0 Mobile Bottom Navigation with Account Sheet
 */
export default function BottomNav() {
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Athlete';

  const userEmail = user?.email || 'Active session';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'AT';

  // Handle ESC key to close profile sheet
  useEffect(() => {
    if (!profileOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileOpen]);

  return (
    <>
      <nav className="bottom-nav" id="app-bottom-nav" aria-label="Mobile bottom navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? 'bottom-nav__item bottom-nav__item--active'
                  : 'bottom-nav__item'
              }
            >
              <Icon size={20} className="bottom-nav__icon" aria-hidden="true" />
              <span className="bottom-nav__label">{item.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Navigation Target: Profile / Account Sheet Trigger */}
        <button
          type="button"
          className={`bottom-nav__item ${profileOpen ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setProfileOpen(true)}
          aria-label="Open profile and account settings"
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
        >
          <UserRound size={20} className="bottom-nav__icon" aria-hidden="true" />
          <span className="bottom-nav__label">Profile</span>
        </button>
      </nav>

      {/* Mobile Account Bottom Sheet */}
      {profileOpen && (
        <div
          className="account-sheet-overlay"
          onClick={() => setProfileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-sheet-title"
        >
          <div
            className="account-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-sheet__header">
              <div className="account-sheet__grabber" aria-hidden="true" />
              <button
                type="button"
                className="account-sheet__close"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile sheet"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="account-sheet__hero">
              <div className="account-sheet__avatar" aria-hidden="true">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="account-sheet__avatar-img"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="account-sheet__meta">
                <h2 className="account-sheet__name" id="account-sheet-title">
                  {displayName}
                </h2>
                <span className="account-sheet__email">{userEmail}</span>
                <span className="account-sheet__badge">
                  <ShieldCheck size={13} /> FitTrack 2.0 Active
                </span>
              </div>
            </div>

            <div className="account-sheet__info-grid">
              <div className="account-sheet__info-card">
                <span className="account-sheet__info-label">Plan status</span>
                <strong className="account-sheet__info-val">Adaptive Active</strong>
              </div>
              <div className="account-sheet__info-card">
                <span className="account-sheet__info-label">Training units</span>
                <strong className="account-sheet__info-val">Kilograms (kg)</strong>
              </div>
            </div>

            <div className="account-sheet__coach-tip">
              <div className="account-sheet__tip-icon" aria-hidden="true">
                <Sparkles size={16} />
              </div>
              <p className="account-sheet__tip-text">
                Your performance algorithms automatically recompute targets on every workout write.
              </p>
            </div>

            <div className="account-sheet__actions">
              <NavLink
                to="/profile"
                className="account-sheet__library-btn"
                onClick={() => setProfileOpen(false)}
              >
                <UserRound size={16} aria-hidden="true" />
                <span>Athlete Profile & Settings</span>
              </NavLink>

              <NavLink
                to="/recovery"
                className="account-sheet__library-btn"
                onClick={() => setProfileOpen(false)}
              >
                <Activity size={16} aria-hidden="true" />
                <span>Muscle Status & Recovery</span>
              </NavLink>

              <NavLink
                to="/exercises"
                className="account-sheet__library-btn"
                onClick={() => setProfileOpen(false)}
              >
                <Search size={16} aria-hidden="true" />
                <span>Movement Library</span>
              </NavLink>

              <button
                type="button"
                className="account-sheet__signout-btn"
                onClick={() => {
                  setProfileOpen(false);
                  signOut();
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
