// Mock workout logs — matches ARCH.md §4 `workout_logs` table
// Some exercises have been "completed" to show progress data
export const mockWorkoutLogs = [
  // Day 1 — Monday: completed all 3
  {
    id: 'wl-001',
    user_id: 'u-001',
    plan_exercise_id: 'pe-001',
    performed_at: '2025-09-01T07:30:00Z',
    actual_sets: 4,
    actual_reps: 10,
    actual_weight_kg: 60,
    actual_duration_min: null,
    actual_distance_km: null,
    notes: 'Felt strong today',
  },
  {
    id: 'wl-002',
    user_id: 'u-001',
    plan_exercise_id: 'pe-002',
    performed_at: '2025-09-01T07:55:00Z',
    actual_sets: 3,
    actual_reps: 9,
    actual_weight_kg: 35,
    actual_duration_min: null,
    actual_distance_km: null,
    notes: '',
  },
  {
    id: 'wl-003',
    user_id: 'u-001',
    plan_exercise_id: 'pe-003',
    performed_at: '2025-09-01T08:15:00Z',
    actual_sets: 3,
    actual_reps: 12,
    actual_weight_kg: 15,
    actual_duration_min: null,
    actual_distance_km: null,
    notes: '',
  },
  // Day 2 — Tuesday: completed cardio
  {
    id: 'wl-004',
    user_id: 'u-001',
    plan_exercise_id: 'pe-004',
    performed_at: '2025-09-02T06:00:00Z',
    actual_sets: null,
    actual_reps: null,
    actual_weight_kg: null,
    actual_duration_min: 28,
    actual_distance_km: 4.5,
    notes: 'A bit tired',
  },
  {
    id: 'wl-005',
    user_id: 'u-001',
    plan_exercise_id: 'pe-005',
    performed_at: '2025-09-02T06:35:00Z',
    actual_sets: null,
    actual_reps: null,
    actual_weight_kg: null,
    actual_duration_min: 14,
    actual_distance_km: null,
    notes: '',
  },
  // Day 3 — Wednesday: completed 2 of 3 (skipped Lunge)
  {
    id: 'wl-006',
    user_id: 'u-001',
    plan_exercise_id: 'pe-006',
    performed_at: '2025-09-03T07:00:00Z',
    actual_sets: 4,
    actual_reps: 8,
    actual_weight_kg: 80,
    actual_duration_min: null,
    actual_distance_km: null,
    notes: 'PB on squat!',
  },
  {
    id: 'wl-007',
    user_id: 'u-001',
    plan_exercise_id: 'pe-007',
    performed_at: '2025-09-03T07:30:00Z',
    actual_sets: 3,
    actual_reps: 7,
    actual_weight_kg: 85,
    actual_duration_min: null,
    actual_distance_km: null,
    notes: 'Grip slipping on last set',
  },
];

/** Get logs for a specific plan exercise */
export function getLogsForPlanExercise(planExerciseId) {
  return mockWorkoutLogs.filter((l) => l.plan_exercise_id === planExerciseId);
}

/** Check if a plan exercise has been logged */
export function isExerciseLogged(planExerciseId) {
  return mockWorkoutLogs.some((l) => l.plan_exercise_id === planExerciseId);
}
