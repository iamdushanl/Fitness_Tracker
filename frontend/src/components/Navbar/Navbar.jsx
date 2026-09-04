import { NavLink } from 'react-router-dom';
import AuthButton from '../AuthButton/AuthButton';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">🏋️</span>
        <span className="navbar__title">FitTrack</span>
      </div>

      <ul className="navbar__links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            <span className="navbar__link-icon">📊</span>
            <span className="navbar__link-text">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/create-plan" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            <span className="navbar__link-icon">✨</span>
            <span className="navbar__link-text">Create Plan</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/workout" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            <span className="navbar__link-icon">💪</span>
            <span className="navbar__link-text">Workout</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/progress" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            <span className="navbar__link-icon">📈</span>
            <span className="navbar__link-text">Progress</span>
          </NavLink>
        </li>
      </ul>

      <AuthButton />
    </nav>
  );
}

