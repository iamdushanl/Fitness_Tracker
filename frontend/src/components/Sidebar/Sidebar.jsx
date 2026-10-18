import { NavLink } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  CalendarDays,
  BarChart3,
  Search,
  Activity,
  UserRound,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import './Sidebar.css';

/**
 * Brand Logo component with 2.0 tilted badge and typography
 */
export function Logo() {
  return (
    <div className="sidebar__logo" aria-label="FitTrack 2.0">
      <div className="sidebar__logo-mark" aria-hidden="true">
        <Dumbbell size={18} strokeWidth={2.6} />
      </div>
      <span className="sidebar__logo-text">FitTrack</span>
      <sup className="sidebar__logo-badge">2.0</sup>
    </div>
  );
}

const navLinks = [
  { to: '/', label: 'Overview', icon: Home, end: true },
  { to: '/workout', label: 'Workout', icon: Dumbbell, end: false },
  { to: '/plan', label: 'Training Plan', icon: CalendarDays, end: false },
  { to: '/exercises', label: 'Movement Library', icon: Search, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/recovery', label: 'Muscle Status', icon: Activity, end: false },
  { to: '/profile', label: 'Athlete Profile', icon: UserRound, end: false },
];

/**
 * FitTrack 2.0 Desktop Sidebar Navigation
 */
export default function Sidebar() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Athlete';

  const userEmail = user?.email || 'Personal plan';
  const avatarUrl = user?.user_metadata?.avatar_url;

  // Extract up to 2 uppercase initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'AT';

  return (
    <aside className="sidebar" id="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar__top">
        <Logo />

        <nav className="sidebar__nav" aria-label="Main menu">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar__nav-item sidebar__nav-item--active'
                    : 'sidebar__nav-item'
                }
              >
                <Icon size={19} className="sidebar__nav-icon" aria-hidden="true" />
                <span className="sidebar__nav-label">{item.label}</span>
                <span className="sidebar__active-dot" aria-hidden="true" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__bottom">
        {/* Adaptive coach insight card */}
        <section className="sidebar__coach-card" aria-label="Adaptive coach insight">
          <div className="sidebar__coach-icon" aria-hidden="true">
            <Sparkles size={16} />
          </div>
          <h3 className="sidebar__coach-title">Adaptive coach</h3>
          <p className="sidebar__coach-text">
            Your plan is adapting well. Target RIR 2 for today's primary compound sets.
          </p>
          <NavLink to="/workout" className="sidebar__coach-link">
            <span>Start session</span>
            <ArrowRight size={14} aria-hidden="true" />
          </NavLink>
        </section>

        {/* User profile & sign out footer */}
        <div className="sidebar__profile" id="sidebar-user-profile">
          <div className="sidebar__avatar" aria-hidden="true">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="sidebar__avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="sidebar__user-info">
            <strong className="sidebar__user-name" title={displayName}>
              {displayName}
            </strong>
            <span className="sidebar__user-meta" title={userEmail}>
              {userEmail}
            </span>
          </div>

          <button
            type="button"
            className="sidebar__signout-btn"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out of FitTrack"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
