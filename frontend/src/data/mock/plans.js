// Mock workout plan and plan exercises — matches ARCH.md §4
// One week plan for the mockUser (intermediate, muscle_gain)

export const mockWorkoutPlan = {
  id: 'wp-001',
  user_id: 'u-001',
  week_start_date: '2025-09-01', // Monday
  week_end_date: '2025-09-07',   // Sunday
  template_goal: 'muscle_gain',
  template_level: 'intermediate',
  created_at: '2025-09-01T00:00:00Z',
};

// Each plan exercise includes both current and initial targets for guardrail comparison
export const mockPlanExercises = [
  // ── Day 1 — Monday: Upper Body Push ──
  {
    id: 'pe-001',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-002', // Bench Press
    scheduled_date: '2025-09-01',
    exercise_order: 1,
    target_sets: 4,
    target_reps: 10,
    target_weight_kg: 60,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 4,
    initial_target_reps: 10,
    initial_target_weight_kg: 60,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-002',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-004', // Overhead Press
    scheduled_date: '2025-09-01',
    exercise_order: 2,
    target_sets: 3,
    target_reps: 10,
    target_weight_kg: 35,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 10,
    initial_target_weight_kg: 35,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-003',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-008', // Tricep Extension
    scheduled_date: '2025-09-01',
    exercise_order: 3,
    target_sets: 3,
    target_reps: 12,
    target_weight_kg: 15,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 12,
    initial_target_weight_kg: 15,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },

  // ── Day 2 — Tuesday: Cardio ──
  {
    id: 'pe-004',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-011', // Running
    scheduled_date: '2025-09-02',
    exercise_order: 1,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 30,
    target_distance_km: 5,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 30,
    initial_target_distance_km: 5,
  },
  {
    id: 'pe-005',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-013', // Jump Rope
    scheduled_date: '2025-09-02',
    exercise_order: 2,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 15,
    target_distance_km: null,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 15,
    initial_target_distance_km: null,
  },

  // ── Day 3 — Wednesday: Lower Body ──
  {
    id: 'pe-006',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-001', // Barbell Squat
    scheduled_date: '2025-09-03',
    exercise_order: 1,
    target_sets: 4,
    target_reps: 8,
    target_weight_kg: 80,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 4,
    initial_target_reps: 8,
    initial_target_weight_kg: 80,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-007',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-003', // Deadlift
    scheduled_date: '2025-09-03',
    exercise_order: 2,
    target_sets: 3,
    target_reps: 8,
    target_weight_kg: 90,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 8,
    initial_target_weight_kg: 90,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-008',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-006', // Lunge
    scheduled_date: '2025-09-03',
    exercise_order: 3,
    target_sets: 3,
    target_reps: 12,
    target_weight_kg: 20,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 12,
    initial_target_weight_kg: 20,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },

  // ── Day 4 — Thursday: Rest ── (no exercises)

  // ── Day 5 — Friday: Upper Body Pull ──
  {
    id: 'pe-009',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-005', // Barbell Row
    scheduled_date: '2025-09-05',
    exercise_order: 1,
    target_sets: 4,
    target_reps: 10,
    target_weight_kg: 55,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 4,
    initial_target_reps: 10,
    initial_target_weight_kg: 55,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-010',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-010', // Lat Pulldown
    scheduled_date: '2025-09-05',
    exercise_order: 2,
    target_sets: 3,
    target_reps: 12,
    target_weight_kg: 45,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 12,
    initial_target_weight_kg: 45,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-011',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-007', // Bicep Curl
    scheduled_date: '2025-09-05',
    exercise_order: 3,
    target_sets: 3,
    target_reps: 12,
    target_weight_kg: 14,
    target_duration_min: null,
    target_distance_km: null,
    initial_target_sets: 3,
    initial_target_reps: 12,
    initial_target_weight_kg: 14,
    initial_target_duration_min: null,
    initial_target_distance_km: null,
  },

  // ── Day 6 — Saturday: Flexibility + Light Cardio ──
  {
    id: 'pe-012',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-016', // Brisk Walking
    scheduled_date: '2025-09-06',
    exercise_order: 1,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 30,
    target_distance_km: 3,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 30,
    initial_target_distance_km: 3,
  },
  {
    id: 'pe-013',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-017', // Hamstring Stretch
    scheduled_date: '2025-09-06',
    exercise_order: 2,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 5,
    target_distance_km: null,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 5,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-014',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-018', // Hip Flexor Stretch
    scheduled_date: '2025-09-06',
    exercise_order: 3,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 5,
    target_distance_km: null,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 5,
    initial_target_distance_km: null,
  },
  {
    id: 'pe-015',
    workout_plan_id: 'wp-001',
    exercise_id: 'ex-020', // Cat-Cow
    scheduled_date: '2025-09-06',
    exercise_order: 4,
    target_sets: null,
    target_reps: null,
    target_weight_kg: null,
    target_duration_min: 5,
    target_distance_km: null,
    initial_target_sets: null,
    initial_target_reps: null,
    initial_target_weight_kg: null,
    initial_target_duration_min: 5,
    initial_target_distance_km: null,
  },

  // ── Day 7 — Sunday: Rest ── (no exercises)
];

/** Helper: get all plan exercises for a given date string (YYYY-MM-DD) */
export function getPlanExercisesForDate(date) {
  return mockPlanExercises
    .filter((pe) => pe.scheduled_date === date)
    .sort((a, b) => a.exercise_order - b.exercise_order);
}

/** Helper: get the week's schedule grouped by date */
export function getWeekSchedule() {
  const schedule = {};
  for (const pe of mockPlanExercises) {
    if (!schedule[pe.scheduled_date]) {
      schedule[pe.scheduled_date] = [];
    }
    schedule[pe.scheduled_date].push(pe);
  }
  // sort exercises within each day
  for (const date in schedule) {
    schedule[date].sort((a, b) => a.exercise_order - b.exercise_order);
  }
  return schedule;
}
