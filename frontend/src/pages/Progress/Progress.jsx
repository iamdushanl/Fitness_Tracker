import { mockPlanExercises } from '../../data/mock/plans';
import { mockWorkoutLogs } from '../../data/mock/logs';
import { mockWeightHistory, getCurrentWeight, getStartingWeight, getWeightChange } from '../../data/mock/weightHistory';
import CompletionChart from '../../components/CompletionChart/CompletionChart';
import WeightChart from '../../components/WeightChart/WeightChart';
import StreakCard from '../../components/StreakCard/StreakCard';
import WeeklyCompletion from '../../components/WeeklyCompletion/WeeklyCompletion';
import WeightCard from '../../components/WeightCard/WeightCard';
import './Progress.css';

export default function Progress() {
  // Mock weekly completion data (historical trend)
  const completionData = [
    { week: 'W1', rate: 85 },
    { week: 'W2', rate: 92 },
    { week: 'W3', rate: 78 },
    { week: 'W4', rate: 65 },
    { week: 'W5', rate: 47 },
  ];

  // Current week completion
  const totalExercises = mockPlanExercises.length;
  const loggedExercises = mockWorkoutLogs.length;
  const currentRate = totalExercises > 0 ? Math.round((loggedExercises / totalExercises) * 100) : 0;

  // Weight chart data
  const weightData = mockWeightHistory.map((wh) => ({
    date: wh.recorded_at,
    weight_kg: wh.weight_kg,
  }));

  const streak = 4;

  return (
    <div className="progress-page" id="progress-page">
      <header className="progress-page__header">
        <h1 className="progress-page__title">Progress</h1>
        <p className="progress-page__subtitle">
          Track your fitness journey over time. See how your consistency and
          effort translate into results.
        </p>
      </header>

      <div className="progress-page__stats">
        <WeeklyCompletion rate={currentRate} />
        <WeightCard currentWeight={getCurrentWeight()} weightChange={getWeightChange()} />
        <StreakCard streak={streak} />
      </div>

      <div className="progress-page__charts">
        <CompletionChart data={completionData} />
        <WeightChart data={weightData} />
      </div>

      <section className="progress-page__history">
        <h2 className="progress-page__section-title">Recent Workout Logs</h2>
        <div className="progress-page__logs">
          {mockWorkoutLogs.map((log) => {
            const pe = mockPlanExercises.find((p) => p.id === log.plan_exercise_id);
            return (
              <div key={log.id} className="progress-page__log-item">
                <div className="progress-page__log-date">
                  {new Date(log.performed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="progress-page__log-details">
                  {log.actual_sets != null
                    ? `${log.actual_sets}×${log.actual_reps} @ ${log.actual_weight_kg} kg`
                    : `${log.actual_duration_min} min${log.actual_distance_km ? ` / ${log.actual_distance_km} km` : ''}`}
                </div>
                {log.notes && <div className="progress-page__log-notes">"{log.notes}"</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
