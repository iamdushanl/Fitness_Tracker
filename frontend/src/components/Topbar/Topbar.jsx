import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import './Topbar.css';

/**
 * Returns eyebrow and title configuration based on current pathname
 */
function getRouteMetadata(pathname) {
  if (pathname === '/') {
    return { eyebrow: 'Daily Training', title: 'Overview' };
  }
  if (pathname.startsWith('/workout')) {
    return { eyebrow: 'Active Session', title: 'Workout Tracker' };
  }
  if (pathname.startsWith('/create-plan') || pathname.startsWith('/plan')) {
    return { eyebrow: 'Training Architecture', title: 'Workout Plan' };
  }
  if (pathname.startsWith('/progress')) {
    return { eyebrow: 'Performance Metrics', title: 'Progress & Analytics' };
  }
  if (pathname === '/exercises') {
    return { eyebrow: 'Movement Library', title: 'Exercises' };
  }
  if (pathname.startsWith('/exercise/')) {
    return { eyebrow: 'Movement Library', title: 'Exercise Details' };
  }
  if (pathname.startsWith('/recovery')) {
    return { eyebrow: 'Performance Intelligence', title: 'Muscle Status' };
  }
  if (pathname.startsWith('/profile')) {
    return { eyebrow: 'Athlete Settings', title: 'Profile & Preferences' };
  }
  if (pathname.startsWith('/design-system')) {
    return { eyebrow: 'Design Foundations', title: '01 — Design System' };
  }
  return { eyebrow: 'FitTrack 2.0', title: 'Performance Hub' };
}

/**
 * FitTrack 2.0 Sticky Topbar Component
 */
export default function Topbar({ onOpenProfile }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { eyebrow, title } = getRouteMetadata(location.pathname);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Athlete';

  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'AT';

  const handleAvatarClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setShowProfileMenu((prev) => !prev);
    }
  };

  return (
    <header className="topbar" id="app-topbar">
      <div className="topbar__heading">
        <span className="topbar__eyebrow">{eyebrow}</span>
        <h1 className="topbar__title">{title}</h1>
      </div>

      <div className="topbar__actions">
        {/* Notification Bell */}
        <button
          type="button"
          className="topbar__icon-button"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={19} aria-hidden="true" />
          <span className="topbar__notification-dot" aria-hidden="true" />
        </button>

        {/* User Profile Avatar with accessible popover */}
        <div className="topbar__profile-wrapper">
          <button
            type="button"
            className="topbar__avatar-btn"
            onClick={handleAvatarClick}
            aria-label={`User menu for ${displayName}`}
            aria-expanded={showProfileMenu}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="topbar__avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="topbar__avatar-initials">{initials}</span>
            )}
          </button>

          {/* Desktop Dropdown Popover (when onOpenProfile is not passed) */}
          {showProfileMenu && (
            <div className="topbar__dropdown" role="menu">
              <div className="topbar__dropdown-header">
                <div className="topbar__dropdown-avatar" aria-hidden="true">
                  {initials}
                </div>
                <div className="topbar__dropdown-user">
                  <strong className="topbar__dropdown-name">{displayName}</strong>
                  <span className="topbar__dropdown-email">{userEmail}</span>
                  <span className="topbar__dropdown-badge">
                    <ShieldCheck size={12} /> Plan active
                  </span>
                </div>
              </div>

              <div className="topbar__dropdown-actions">
                <button
                  type="button"
                  className="topbar__dropdown-item"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                >
                  <User size={15} />
                  <span>Account details</span>
                </button>

                <button
                  type="button"
                  className="topbar__dropdown-item topbar__dropdown-item--signout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
