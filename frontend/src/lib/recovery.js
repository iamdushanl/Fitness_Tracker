import { getExerciseById } from './exercises';

export const DEFAULT_MUSCLES = [
  { name: 'Chest', baseHours: 42, baseState: 'ready', baseVal: 88 },
  { name: 'Back', baseHours: 64, baseState: 'ready', baseVal: 94 },
  { name: 'Legs', baseHours: 18, baseState: 'warm', baseVal: 54 },
  { name: 'Shoulders', baseHours: 26, baseState: 'warm', baseVal: 70 },
  { name: 'Triceps', baseHours: 44, baseState: 'ready', baseVal: 92 },
  { name: 'Core', baseHours: 50, baseState: 'ready', baseVal: 86 },
];

/**
 * Calculates dynamic muscle recovery and neuromuscular readiness from workout log timestamps.
 *
 * @param {Array} workoutLogs - User workout logs with performed_at and plan_exercise_id
 * @param {Array} planExercises - Programmed plan exercises
 * @param {number} nowMs - Optional current timestamp in ms (for testing / consistency)
 * @returns {{ muscleList: Array, readinessScore: number, readinessCategory: string, readinessAdvice: string }}
 */
export function calculateMuscleRecovery(workoutLogs = [], planExercises = [], nowMs = Date.now()) {
  // Map each muscle to latest log timestamp
  const latestByMuscle = {};
  for (const log of workoutLogs) {
    if (!log.performed_at) continue;
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

  const muscleList = DEFAULT_MUSCLES.map((muscle) => {
    const key = muscle.name.toLowerCase();
    const latestTime = latestByMuscle[key];

    let value = muscle.baseVal;
    let state = muscle.baseState;

    if (latestTime) {
      const diffHours = (nowMs - latestTime) / (1000 * 60 * 60);
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
    muscleList.reduce((acc, m) => acc + m.value, 0) / muscleList.length
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
    muscleList,
    readinessScore: avgScore,
    readinessCategory: category,
    readinessAdvice: advice,
  };
}
