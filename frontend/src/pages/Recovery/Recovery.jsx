import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  ArrowRight,
} from 'lucide-react';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { fetchActivePlan } from '../../lib/plans';
import { calculateMuscleRecovery } from '../../lib/recovery';
import Ring from '../../components/Ring/Ring';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Recovery.css';

/**
 * FitTrack 2.0 Biometric Muscle Recovery & Status View (/recovery)
 */
export default function Recovery() {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [planExercises, setPlanExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const [logsRes, planRes] = await Promise.all([
          fetchWorkoutLogs(),
          fetchActivePlan(),
        ]);
        if (!active) return;
        setWorkoutLogs(logsRes.data ?? []);
        setPlanExercises(planRes.data?.planExercises ?? []);
      } catch (err) {
        console.warn('Recovery data load fallback:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Dynamic calculation of muscle recovery
  const { muscleList, readinessScore, readinessCategory, readinessAdvice } = useMemo(
    () => calculateMuscleRecovery(workoutLogs, planExercises),
    [workoutLogs, planExercises]
  );

  if (loading) {
    return (
      <div className="recovery-page" id="recovery-page">
        <StateScreen variant="loading" text="Analyzing recovery intelligence…" />
      </div>
    );
  }

  return (
    <div className="recovery-page" id="recovery-page">
      {/* ── Page Header ── */}
      <section className="recovery-intro" aria-label="Recovery overview">
        <div>
          <span className="eyebrow">PERFORMANCE INTELLIGENCE</span>
          <h1 className="recovery-hero-heading">
            How ready is your body<br />for the next session?
          </h1>
          <p className="recovery-intro-text">
            Activity-based estimates: Recovery readiness is estimated from the elapsed hours since each kinetic muscle group was last logged in your training sessions. This is an algorithmic scheduling heuristic, not a medical measurement.
          </p>
        </div>
      </section>

      {/* ── 2-Column Recovery Grid ── */}
      <div className="recovery-layout">
        {/* Left: Biometric Performance Body Visual */}
        <div className="card body-visual-card" aria-label="Biometric body recovery visualization">
          <div className="ambient-orb" aria-hidden="true" />

          <div className="performance-body" aria-hidden="true">
            <div className="performance-head" />
            <div className="performance-neck" />
            <div className="performance-arms">
              <i className={muscleList.find((m) => m.name === 'Triceps')?.state || 'ready'} />
              <i className={muscleList.find((m) => m.name === 'Shoulders')?.state || 'ready'} />
            </div>
            <div className="performance-chest">
              <i className={muscleList.find((m) => m.name === 'Chest')?.state || 'ready'} />
              <i className={muscleList.find((m) => m.name === 'Chest')?.state || 'ready'} />
            </div>
            <div className={`performance-core ${muscleList.find((m) => m.name === 'Core')?.state || 'ready'}`} />
            <div className="performance-legs">
              <i className={muscleList.find((m) => m.name === 'Legs')?.state || 'warm'} />
              <i className={muscleList.find((m) => m.name === 'Legs')?.state || 'warm'} />
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="body-legend">
            <span>
              <i className="ready" /> Recovered
            </span>
            <span>
              <i className="recovering" /> Recovering
            </span>
            <span>
              <i className="fatigued" /> Fatigued
            </span>
            <span>
              <i className="detrained" /> Detrained
            </span>
          </div>
        </div>

        {/* Right: Score and Detailed Muscle List */}
        <div className="muscle-status-list">
          {/* Overall Readiness Card */}
          <div className="card recovery-score">
            <Ring value={readinessScore} label="readiness" />
            <div className="recovery-score-meta">
              <span className="eyebrow">OVERALL READINESS</span>
              <h2 className="recovery-score-title">{readinessCategory}</h2>
              <p className="recovery-score-desc">{readinessAdvice}</p>
            </div>
          </div>

          {/* Individual Muscle Breakdown */}
          {muscleList.map((muscle) => {
            const stateLabel =
              muscle.state === 'ready'
                ? 'Recovered'
                : muscle.state === 'warm'
                ? 'Recovering'
                : 'Fatigued';

            return (
              <div className="card muscle-status-row" key={muscle.name}>
                <div className="muscle-row-left">
                  <span className={`muscle-dot ${muscle.state}`} />
                  <strong>{muscle.name}</strong>
                </div>

                <div className="muscle-row-right">
                  <div className="muscle-bar-track">
                    <div
                      className={`muscle-bar-fill ${muscle.state}`}
                      style={{ width: `${muscle.value}%` }}
                    />
                  </div>
                  <strong className="muscle-percent">{muscle.value}%</strong>
                </div>

                <span className="muscle-state-caption">
                  {muscle.value}% · {stateLabel}
                </span>
              </div>
            );
          })}

          {/* Action Link to Workout Tracker */}
          <div className="recovery-cta-box">
            <Link to="/workout" className="primary-button recovery-start-workout-btn">
              <Dumbbell size={16} aria-hidden="true" />
              <span>Start Suggested Session</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
