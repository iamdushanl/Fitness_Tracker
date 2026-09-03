import { Link } from 'react-router-dom';
import { mockUser } from '../../data/mock/users';
import { mockPlanExercises, getWeekSchedule } from '../../data/mock/plans';
import { mockWorkoutLogs } from '../../data/mock/logs';
import { getCurrentWeight, getWeightChange } from '../../data/mock/weightHistory';
import WorkoutCard from '../../components/WorkoutCard/WorkoutCard';
import ProgressSummary from '../../components/ProgressSummary/ProgressSummary';
import WeightCard from '../../components/WeightCard/WeightCard';
import StreakCard from '../../components/StreakCard/StreakCard';
import NudgeBanner from '../../components/NudgeBanner/NudgeBanner';
import './Dashboard.css';

export default function Dashboard() {
  const weekSchedule = getWeekSchedule();
  const dates = Object.keys(weekSchedule).sort();

  // Pick "today" as the first date in the mock data for demo purposes
  const today = dates[0] ?? '';

  // Calculate completion rate: logged exercises / total plan exercises
  const totalExercises = mockPlanExercises.length;
  const loggedExercises = mockWorkoutLogs.length;
  const completionRate = totalExercises > 0 ? Math.round((loggedExercises / totalExercises) * 100) : 0;

  // Mock streak
  const streak = 4;

  // Count logged exercises per date
  const completedPerDate = {};
  for (const log of mockWorkoutLogs) {
    const pe = mockPlanExercises.find((p) => p.id === log.plan_exercise_id);
    if (pe) {
      completedPerDate[pe.scheduled_date] = (completedPerDate[pe.scheduled_date] ?? 0) + 1;
    }
  }

  return (
    <div className="dashboard" id="dashboard-page">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__greeting">Welcome back, {mockUser.name.split(' ')[0]} 👋</h1>
          <p className="dashboard__subtext">Here's your fitness snapshot for this week.</p>
        </div>
        <Link to="/create-plan" className="dashboard__cta">New Plan ✨</Link>
      </header>

      <NudgeBanner
        type={completionRate < 30 ? 'encouragement' : null}
        message={completionRate < 30 ? "Don't worry — every workout counts. Let's get back on track this week!" : null}
      />

      <div className="dashboard__stats">
        <ProgressSummary completionRate={completionRate} streak={streak} />
        <WeightCard currentWeight={getCurrentWeight()} weightChange={getWeightChange()} />
        <StreakCard streak={streak} />
      </div>

      <section className="dashboard__workouts">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">This Week's Workouts</h2>
          <Link to="/workout" className="dashboard__view-all">View all →</Link>
        </div>
        <div className="dashboard__cards">
          {dates.map((date) => (
            <WorkoutCard
              key={date}
              date={date}
              exercises={weekSchedule[date]}
              isToday={date === today}
              completedCount={completedPerDate[date] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
