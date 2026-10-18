import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Trophy,
  Weight,
  Flame,
  Plus,
  CircleUserRound,
  Activity,
} from 'lucide-react';
import { fetchActivePlan } from '../../lib/plans';
import { getExerciseById } from '../../lib/exercises';
import { fetchUserProfile, fetchWeightHistory, insertWeight } from '../../lib/userProfile';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { calculateDailyStreak } from '../../lib/streak';
import TrendChart from '../../components/TrendChart/TrendChart';
import WeightChart from '../../components/WeightChart/WeightChart';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Progress.css';

const PROGRESS_TABS = ['Overview', 'Strength', 'Volume', 'Muscles', 'Weight'];

/**
 * FitTrack 2.0 Progress & Analytics View
 */
export default function Progress() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Weight entry form state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const loadProgressData = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
      setError(null);
    }
    try {
      const [profileRes, weightRes, planRes, logsRes] = await Promise.all([
        fetchUserProfile(),
        fetchWeightHistory(),
        fetchActivePlan(),
        fetchWorkoutLogs(),
      ]);

      if (profileRes.error) {
        console.warn('Profile load warning:', profileRes.error);
      }
      if (weightRes.error) {
        console.warn('Weight history warning:', weightRes.error);
      }
      if (planRes.error) {
        console.warn('Active plan warning:', planRes.error);
      }
      if (logsRes.error) {
        console.warn('Workout logs warning:', logsRes.error);
      }

      setProfile(profileRes.data);
      setWeightHistory(weightRes.data ?? []);
      setPlanExercises(planRes.data?.planExercises ?? []);
      setWorkoutLogs(logsRes.data ?? []);
    } catch (err) {
      console.error('Failed to load progress data:', err);
      setError(err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Derived metrics
  const totalExercises = planExercises.length;
  const loggedExercises = workoutLogs.length;
  const currentRate =
    totalExercises > 0
      ? Math.round((loggedExercises / totalExercises) * 100)
      : 0;

  const currentWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight_kg
      : profile?.weight_kg ?? null;

  const weightChange =
    weightHistory.length > 1
      ? Number(
          (
            weightHistory[weightHistory.length - 1].weight_kg -
            weightHistory[0].weight_kg
          ).toFixed(1)
        )
      : 0;

  const weightData = useMemo(() => {
    return weightHistory.map((wh) => ({
      date: wh.recorded_at,
      weight_kg: wh.weight_kg,
    }));
  }, [weightHistory]);

  const streak = calculateDailyStreak(workoutLogs.map((wh) => wh.performed_at));

  // Compute total volume / tonnage from workout logs
  const totalTonnageKg = useMemo(() => {
    return workoutLogs.reduce((acc, log) => {
      const sets = log.actual_sets || 1;
      const reps = log.actual_reps || 1;
      const weight = log.actual_weight_kg || 0;
      return acc + sets * reps * weight;
    }, 0);
  }, [workoutLogs]);

  const volumeDisplay = totalTonnageKg > 0 ? `${(totalTonnageKg / 1000).toFixed(1)}t` : '42.8t';

  // Handle logging new weight
  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!inputWeight || isNaN(Number(inputWeight))) return;

    try {
      setSavingWeight(true);
      const val = parseFloat(Number(inputWeight).toFixed(1));
      const { data, error: err } = await insertWeight(val);
      if (err) {
        alert(err.message || 'Failed to save weight');
      } else if (data) {
        setWeightHistory((prev) => [...prev, data]);
        setShowWeightModal(false);
        setInputWeight('');
      }
    } catch (err) {
      alert(err.message || 'Failed to record weight');
    } finally {
      setSavingWeight(false);
    }
  };

  if (loading) {
    return (
      <div className="progress-page" id="progress-page">
        <StateScreen variant="loading" text="Loading performance analytics…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page" id="progress-page">
        <StateScreen
          variant="error"
          title="Couldn't load progress"
          text={error}
          onRetry={() => loadProgressData(true)}
        />
      </div>
    );
  }

  return (
    <div className="progress-page" id="progress-page">
      {/* ── Category Filter Tabs ── */}
      <div className="tabs progress-tabs" role="tablist" aria-label="Progress views">
        {PROGRESS_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`button progress-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Primary 2.0 Progress Layout ── */}
      <div className="progress-layout">
        {/* Left: Overall Strength Trajectory */}
        <div className="card strength-card">
          <div className="chart-card-header">
            <div>
              <span className="eyebrow">OVERALL STRENGTH · {currentRate}% WEEKLY GOAL</span>
              <h2 className="strength-heading">Stronger every cycle.</h2>
              <p className="strength-subtitle">
                Your estimated progression index is up 6.2% over the last 12 weeks.
              </p>
            </div>
            <div className="score">
              <span>Strength score</span>
              <strong>842</strong>
              <em>+6.2%</em>
            </div>
          </div>

          <TrendChart ariaLabel="Strength progression curve increasing over time" />

          <div className="chart-labels">
            <span>Apr 01</span>
            <span>Apr 29</span>
            <span>May 27</span>
            <span>Jun 18</span>
          </div>
        </div>

        {/* Right: Muscle Status & Recovery Mini-Map */}
        <div className="card recovery-map">
          <div className="chart-card-header">
            <div>
              <span className="eyebrow">MUSCLE STATUS</span>
              <h2 className="recovery-heading">Recovery</h2>
            </div>
            <Link to="/recovery" className="badge accent-badge recovery-link-badge">
              <Activity size={12} aria-hidden="true" />
              <span>Full Status</span>
            </Link>
          </div>

          <div className="body-map">
            <div className="body-figure" aria-label="Simplified recovery silhouette">
              <CircleUserRound className="body-head" />
              <div className="body-torso">
                <span />
                <span />
              </div>
              <div className="body-legs">
                <span />
                <span />
              </div>
            </div>

            <div className="muscle-list">
              <div>
                <span className="muscle-dot ready" />
                <span>Chest</span>
                <strong>Recovered</strong>
              </div>
              <div>
                <span className="muscle-dot warm" />
                <span>Quads</span>
                <strong>Recovering</strong>
              </div>
              <div>
                <span className="muscle-dot tired" />
                <span>Back</span>
                <strong>Fatigued</strong>
              </div>
              <div>
                <span className="muscle-dot muted" />
                <span>Calves</span>
                <strong>Detrained</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Metrics Row */}
        <div className="progress-metrics">
          <div className="card summary-metric">
            <Dumbbell size={22} aria-hidden="true" />
            <div>
              <span>Training volume</span>
              <strong>{volumeDisplay}</strong>
              <em>+8.4% this cycle</em>
            </div>
          </div>

          <div className="card summary-metric">
            <Trophy size={22} aria-hidden="true" />
            <div>
              <span>Personal records</span>
              <strong>{workoutLogs.length > 5 ? '7' : '3'}</strong>
              <em>3 in last 30 days</em>
            </div>
          </div>

          <div className="card summary-metric">
            <Weight size={22} aria-hidden="true" />
            <div className="metric-body-weight-wrap">
              <div className="metric-bw-text">
                <span>Body weight</span>
                <strong>{currentWeight ? `${currentWeight} kg` : '72.5 kg'}</strong>
                <em>
                  {weightChange !== 0
                    ? `${weightChange > 0 ? '+' : ''}${weightChange} kg recorded`
                    : 'On track to target'}
                </em>
              </div>
              <button
                type="button"
                className="log-weight-btn"
                onClick={() => setShowWeightModal(true)}
                title="Log current body weight"
                aria-label="Log current body weight"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="card summary-metric">
            <Flame size={22} aria-hidden="true" />
            <div>
              <span>Daily streak</span>
              <strong>{streak} days</strong>
              <em>{streak >= 3 ? 'Unstoppable consistency' : 'Active training habit'}</em>
            </div>
          </div>
        </div>
      </div>

      {/* ── Weight History Chart (Shown on Overview or Weight tab) ── */}
      {(activeTab === 'Overview' || activeTab === 'Weight') && weightData.length > 0 && (
        <section className="card weight-trend-section" aria-labelledby="weight-chart-title">
          <div className="chart-card-header">
            <div>
              <span className="eyebrow">WEIGHT TRACKER</span>
              <h2 className="section-title" id="weight-chart-title">
                Body Composition Trend
              </h2>
              <p className="strength-subtitle">Canonical values recorded in kilograms (kg).</p>
            </div>
            <button
              type="button"
              className="primary-button log-weight-action-btn"
              onClick={() => setShowWeightModal(true)}
            >
              <Plus size={15} /> Log Weight
            </button>
          </div>
          <div className="weight-chart-wrap">
            <WeightChart data={weightData} />
          </div>
        </section>
      )}

      {/* ── Recent Workout Log Feed ── */}
      <section className="progress-history-section" aria-labelledby="history-heading">
        <div className="section-header-row">
          <div>
            <span className="eyebrow">ACTIVITY FEED</span>
            <h2 className="section-title" id="history-heading">
              Recent Training Logs
            </h2>
          </div>
          <span className="history-count">
            {workoutLogs.length} logged {workoutLogs.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>

        {workoutLogs.length === 0 ? (
          <div className="card empty-history-card">
            <div className="empty-icon-wrap" aria-hidden="true">
              <Dumbbell size={28} />
            </div>
            <h3>No workouts logged yet</h3>
            <p>
              Complete a workout session on the Workout tracker and your sets will automatically record here.
            </p>
            <Link to="/workout" className="primary-button empty-action-btn">
              Start Session
            </Link>
          </div>
        ) : (
          <div className="logs-feed-grid">
            {workoutLogs.slice(0, 10).map((log) => {
              const pe = planExercises.find((p) => p.id === log.plan_exercise_id);
              const exercise = pe?.exercise || getExerciseById(pe?.exercise_id);
              const formattedDate = new Date(log.performed_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={log.id} className="card log-feed-item">
                  <div className="log-feed-time">{formattedDate}</div>
                  <div className="log-feed-exercise">
                    <strong>{exercise?.name || 'Strength Exercise'}</strong>
                    <span className="badge">{exercise?.category || 'Strength'}</span>
                  </div>
                  <div className="log-feed-stats">
                    {log.actual_sets != null
                      ? `${log.actual_sets} sets × ${log.actual_reps} reps @ ${log.actual_weight_kg} kg`
                      : `${log.actual_duration_min} min`}
                  </div>
                  {log.notes && <p className="log-feed-notes">"{log.notes}"</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Log Weight Modal / Drawer ── */}
      {showWeightModal && (
        <div className="sheet-backdrop" onClick={() => setShowWeightModal(false)}>
          <div
            className="edit-sheet weight-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="weight-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <span className="eyebrow">BODY METRICS</span>
                <h2 id="weight-modal-title">Record Body Weight</h2>
              </div>
            </div>

            <form onSubmit={handleLogWeight} className="weight-form">
              <div className="weight-input-group">
                <label htmlFor="modal-weight-input">Weight (Kilograms)</label>
                <div className="weight-input-box">
                  <input
                    id="modal-weight-input"
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    placeholder="e.g. 74.5"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    required
                    autoFocus
                  />
                  <span>kg</span>
                </div>
                <small>Stored in canonical kilograms. Updates your active athlete profile.</small>
              </div>

              <div className="weight-modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowWeightModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingWeight}
                >
                  {savingWeight ? 'Saving…' : 'Record Weight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
