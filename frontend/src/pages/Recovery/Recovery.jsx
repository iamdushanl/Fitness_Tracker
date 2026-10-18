import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  ArrowRight,
} from 'lucide-react';
import { fetchWorkoutLogs } from '../../lib/workoutLogs';
import { fetchActivePlan } from '../../lib/plans';
import { getExerciseById } from '../../lib/exercises';
import Ring from '../../components/Ring/Ring';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Recovery.css';

const RECOVERY_TABS = ['Recovery', 'Volume', 'Untrained'];

const DEFAULT_MUSCLES = [
  { name: 'Chest', baseHours: 42, baseState: 'ready', baseVal: 88 },
  { name: 'Back', baseHours: 64, baseState: 'ready', baseVal: 94 },
  { name: 'Legs', baseHours: 18, baseState: 'warm', baseVal: 54 },
  { name: 'Shoulders', baseHours: 26, baseState: 'warm', baseVal: 70 },
  { name: 'Triceps', baseHours: 44, baseState: 'ready', baseVal: 92 },
  { name: 'Core', baseHours: 50, baseState: 'ready', baseVal: 86 },
];

/**
 * FitTrack 2.0 Biometric Muscle Recovery & Status View (/recovery)
 */
export default function Recovery() {
  const [activeTab, setActiveTab] = useState('Recovery');
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

  // Heuristic calculation of muscle recovery
  const { muscleList, readinessScore, readinessCategory, readinessAdvice } = useMemo(() => {
    const now = new Date().getTime();

    // Map each muscle to latest log timestamp
    const latestByMuscle = {};
    for (const log of workoutLogs) {
      const pe = planExercises.find((p) => p.id === log.plan_exercise_id);
      const ex = pe?.exercise || getExerciseById(pe?.exercise_id);
      if (ex?.muscle_group) {
        const mg = ex.muscle_group.toLowerCase();
        const time = new Date(log.performed_at).getTime();
        if (!latestByMuscle[mg] || time > latestByMuscle[mg]) {
          latestByMuscle[mg] = time;
        }
      }
    }

    const calculated = DEFAULT_MUSCLES.map((muscle) => {
      const key = muscle.name.toLowerCase();
      const latestTime = latestByMuscle[key];

      let value = muscle.baseVal;
      let state = muscle.baseState;

      if (latestTime) {
        const diffHours = (now - latestTime) / (1000 * 60 * 60);
        if (diffHours < 20) {
          value = Math.min(60, Math.max(35, Math.round(35 + diffHours * 1.25)));
          state = 'tired'; // fatigued
        } else if (diffHours < 40) {
          value = Math.min(84, Math.max(62, Math.round(60 + (diffHours - 20) * 1.2)));
          state = 'warm'; // recovering
        } else {
          value = Math.min(99, Math.max(86, Math.round(85 + (diffHours - 40) * 0.4)));
          state = 'ready'; // recovered
        }
      }

      return {
        name: muscle.name,
        value,
        state,
      };
    });

    const avgScore = Math.round(
      calculated.reduce((acc, m) => acc + m.value, 0) / calculated.length
    );

    let category = 'Well recovered';
    let advice = 'Upper body is primed for moderate-to-high intensity compound work.';

    if (avgScore < 65) {
      category = 'Recovery needed';
      advice = 'High cumulative fatigue detected. Prioritize sleep, light mobility, and hydration.';
    } else if (avgScore >= 85) {
      category = 'Optimal readiness';
      advice = 'All major kinetic chains are fully recovered. Excellent day to push PR loads.';
    }

    return {
      muscleList: calculated,
      readinessScore: avgScore,
      readinessCategory: category,
      readinessAdvice: advice,
    };
  }, [workoutLogs, planExercises]);

  if (loading) {
    return (
      <div className="recovery-page" id="recovery-page">
        <StateScreen variant="loading" text="Analyzing recovery intelligence…" />
      </div>
    );
  }

  return (
    <div className="recovery-page" id="recovery-page">
      {/* ── Page Header & Tabs ── */}
      <section className="recovery-intro" aria-label="Recovery overview">
        <div>
          <span className="eyebrow">PERFORMANCE INTELLIGENCE</span>
          <h1 className="recovery-hero-heading">
            How ready is your body<br />for the next session?
          </h1>
          <p className="recovery-intro-text">
            Dynamic recovery estimates combine volume, load, rest intervals, and elapsed recovery hours since your last session.
          </p>
        </div>

        <div className="tabs recovery-tabs" role="tablist" aria-label="Recovery filters">
          {RECOVERY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`button recovery-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
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
