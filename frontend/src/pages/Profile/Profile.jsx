import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { fetchUserProfile, saveUserProfile } from '../../lib/userProfile';
import { FITNESS_GOALS, normalizeGoal, getGoalLabel } from '../../lib/goals';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Profile.css';

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Beginner (0–1 years)' },
  { id: 'intermediate', label: 'Intermediate (1–3 years)' },
  { id: 'advanced', label: 'Advanced (3+ years)' },
];

/**
 * FitTrack 2.0 Athlete Profile & Preferences Page (/profile)
 */
export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    experience_level: 'intermediate',
    fitness_goal: 'general_fitness',
  });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        setLoading(true);
        const { data } = await fetchUserProfile();
        if (!active) return;
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || user?.user_metadata?.full_name || '',
            age: data.age != null ? String(data.age) : '',
            height_cm: data.height_cm != null ? String(data.height_cm) : '',
            weight_kg: data.weight_kg != null ? String(data.weight_kg) : '',
            experience_level: data.experience_level || 'intermediate',
            fitness_goal: normalizeGoal(data.fitness_goal),
          });
        }
      } catch (err) {
        console.warn('Profile load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Athlete';

  const userEmail = user?.email || 'Authenticated athlete';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'AT';

  const goalLabel = getGoalLabel(profile?.fitness_goal);

  const expLabel =
    EXPERIENCE_OPTIONS.find((e) => e.id === profile?.experience_level)?.label ||
    'Intermediate';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim() || displayName,
        age: formData.age ? Number(formData.age) : null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? Number(formData.weight_kg) : null,
        experience_level: formData.experience_level,
        fitness_goal: normalizeGoal(formData.fitness_goal),
      };

      const { data, error: err } = await saveUserProfile(payload);
      if (err) {
        alert(err.message || 'Failed to update profile');
      } else if (data) {
        setProfile(data);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditing(false);
        }, 600);
      }
    } catch (err) {
      alert(err.message || 'Error saving athlete profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page" id="profile-page">
        <StateScreen variant="loading" text="Loading athlete profile…" />
      </div>
    );
  }

  return (
    <div className="profile-page" id="profile-page">
      {/* ── Athlete Hero Card ── */}
      <div className="card profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="profile-avatar-img" referrerPolicy="no-referrer" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="profile-hero-meta">
          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-subtext">
            {expLabel} · {goalLabel}
          </p>
          <div className="profile-badge-row">
            <span className="badge accent-badge">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Plan active</span>
            </span>
            <span className="profile-email-badge">{userEmail}</span>
          </div>
        </div>

        <button
          type="button"
          className="button secondary-button profile-edit-btn"
          onClick={() => setEditing(true)}
        >
          Edit Profile
        </button>
      </div>

      {/* ── 2-Column Profile Grid ── */}
      <div className="profile-grid">
        {/* Left: Training Attributes */}
        <div className="card profile-section">
          <span className="eyebrow">TRAINING ATTRIBUTES</span>
          <div className="settings-list">
            <div className="settings-row">
              <span>Primary Goal</span>
              <strong>{goalLabel}</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Experience Level</span>
              <strong>{expLabel}</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Body Weight</span>
              <strong>{profile?.weight_kg ? `${profile.weight_kg} kg` : '72.5 kg'}</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Height</span>
              <strong>{profile?.height_cm ? `${profile.height_cm} cm` : '178 cm'}</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Age</span>
              <strong>{profile?.age ? `${profile.age} yrs` : '28 yrs'}</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Right: Preferences & System */}
        <div className="card profile-section">
          <span className="eyebrow">PREFERENCES & SYSTEM</span>
          <div className="settings-list">
            <div className="settings-row">
              <span>Units of Measure</span>
              <strong>Metric (kg canonical)</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Rest Interval Default</span>
              <strong>90 seconds</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <div className="settings-row">
              <span>Interface Theme</span>
              <strong>FitTrack 2.0 Dark</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </div>
            <Link to="/exercises" className="settings-row system-link">
              <span>Movement Library</span>
              <strong>20 Curated Moves</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/recovery" className="settings-row system-link">
              <span>Biometric Status</span>
              <strong>Muscle Recovery</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/design-system" className="settings-row system-link">
              <span>Design System</span>
              <strong>01 — Foundations</strong>
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Sign Out Container ── */}
      <div className="profile-signout-card">
        <button
          type="button"
          className="button profile-signout-btn"
          onClick={() => signOut()}
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign Out of FitTrack 2.0</span>
        </button>
      </div>

      {/* ── Edit Profile Modal Sheet ── */}
      {editing && (
        <div className="sheet-backdrop" onClick={() => setEditing(false)}>
          <div
            className="edit-sheet profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <span className="eyebrow">ATHLETE SETTINGS</span>
                <h2 id="profile-modal-title">Edit Training Profile</h2>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dushan Silva"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-weight">Weight (kg)</label>
                  <input
                    id="edit-weight"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="72.5"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-height">Height (cm)</label>
                  <input
                    id="edit-height"
                    type="number"
                    min="100"
                    max="250"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    placeholder="178"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-age">Age</label>
                <input
                  id="edit-age"
                  type="number"
                  min="13"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="28"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-goal">Primary Fitness Goal</label>
                <select
                  id="edit-goal"
                  value={normalizeGoal(formData.fitness_goal)}
                  onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                >
                  {FITNESS_GOALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-exp">Experience Level</label>
                <select
                  id="edit-exp"
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                >
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
