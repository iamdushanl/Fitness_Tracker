import { supabase } from './supabase';
import { saveUserProfile, insertWeight } from './userProfile';
import { EXERCISE_UUIDS, getExerciseById } from './exercises';

/**
 * Returns Monday to Sunday dates (YYYY-MM-DD) for the current week.
 */
export function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    dates.push(iso);
  }

  return {
    week_start_date: dates[0],
    week_end_date: dates[6],
    dates,
  };
}

/**
 * Build 7-day scheduled exercises from goals and experience level.
 */
function buildWeeklyScheduleTemplate(goal, level, dates) {
  // Multipliers based on experience level
  const setDelta = level === 'beginner' ? -1 : level === 'advanced' ? 1 : 0;
  const weightMult = level === 'beginner' ? 0.75 : level === 'advanced' ? 1.25 : 1.0;
  const cardioMult = level === 'beginner' ? 0.75 : level === 'advanced' ? 1.3 : 1.0;

  const s = (base) => Math.max(2, base + setDelta);
  const w = (base) => Math.round(base * weightMult);
  const c = (base) => Math.round(base * cardioMult);

  return [
    // ── Day 0 (Monday) — Upper Body Push ──
    {
      scheduled_date: dates[0],
      exercise_order: 1,
      exercise_id: EXERCISE_UUIDS['ex-002'], // Bench Press
      target_sets: s(4),
      target_reps: 10,
      target_weight_kg: w(60),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[0],
      exercise_order: 2,
      exercise_id: EXERCISE_UUIDS['ex-004'], // Overhead Press
      target_sets: s(3),
      target_reps: 10,
      target_weight_kg: w(35),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[0],
      exercise_order: 3,
      exercise_id: EXERCISE_UUIDS['ex-008'], // Tricep Extension
      target_sets: s(3),
      target_reps: 12,
      target_weight_kg: w(15),
      target_duration_min: null,
      target_distance_km: null,
    },

    // ── Day 1 (Tuesday) — Cardio / Conditioning ──
    {
      scheduled_date: dates[1],
      exercise_order: 1,
      exercise_id: EXERCISE_UUIDS['ex-011'], // Running
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: c(30),
      target_distance_km: Number((5 * cardioMult).toFixed(1)),
    },
    {
      scheduled_date: dates[1],
      exercise_order: 2,
      exercise_id: EXERCISE_UUIDS['ex-013'], // Jump Rope
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: c(15),
      target_distance_km: null,
    },

    // ── Day 2 (Wednesday) — Lower Body ──
    {
      scheduled_date: dates[2],
      exercise_order: 1,
      exercise_id: EXERCISE_UUIDS['ex-001'], // Barbell Squat
      target_sets: s(4),
      target_reps: 8,
      target_weight_kg: w(80),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[2],
      exercise_order: 2,
      exercise_id: EXERCISE_UUIDS['ex-003'], // Deadlift
      target_sets: s(3),
      target_reps: 8,
      target_weight_kg: w(90),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[2],
      exercise_order: 3,
      exercise_id: EXERCISE_UUIDS['ex-006'], // Lunge
      target_sets: s(3),
      target_reps: 12,
      target_weight_kg: w(20),
      target_duration_min: null,
      target_distance_km: null,
    },

    // ── Day 3 (Thursday) — Rest Day (0 exercises) ──

    // ── Day 4 (Friday) — Upper Body Pull ──
    {
      scheduled_date: dates[4],
      exercise_order: 1,
      exercise_id: EXERCISE_UUIDS['ex-005'], // Barbell Row
      target_sets: s(4),
      target_reps: 10,
      target_weight_kg: w(55),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[4],
      exercise_order: 2,
      exercise_id: EXERCISE_UUIDS['ex-010'], // Lat Pulldown
      target_sets: s(3),
      target_reps: 12,
      target_weight_kg: w(45),
      target_duration_min: null,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[4],
      exercise_order: 3,
      exercise_id: EXERCISE_UUIDS['ex-007'], // Bicep Curl
      target_sets: s(3),
      target_reps: 12,
      target_weight_kg: w(14),
      target_duration_min: null,
      target_distance_km: null,
    },

    // ── Day 5 (Saturday) — Flexibility + Active Recovery ──
    {
      scheduled_date: dates[5],
      exercise_order: 1,
      exercise_id: EXERCISE_UUIDS['ex-016'], // Brisk Walking
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: c(30),
      target_distance_km: Number((3 * cardioMult).toFixed(1)),
    },
    {
      scheduled_date: dates[5],
      exercise_order: 2,
      exercise_id: EXERCISE_UUIDS['ex-017'], // Hamstring Stretch
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: 5,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[5],
      exercise_order: 3,
      exercise_id: EXERCISE_UUIDS['ex-018'], // Hip Flexor Stretch
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: 5,
      target_distance_km: null,
    },
    {
      scheduled_date: dates[5],
      exercise_order: 4,
      exercise_id: EXERCISE_UUIDS['ex-020'], // Cat-Cow
      target_sets: null,
      target_reps: null,
      target_weight_kg: null,
      target_duration_min: 5,
      target_distance_km: null,
    },

    // ── Day 6 (Sunday) — Rest Day (0 exercises) ──
  ];
}

/**
 * Creates a workout plan and persists everything to Supabase:
 * 1. Upserts `users` profile
 * 2. Inserts `weight_history` initial record
 * 3. Inserts `workout_plans` row
 * 4. Inserts `plan_exercises` rows
 *
 * @param {object} profileData
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function createWorkoutPlan(profileData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'You must be signed in to create a workout plan.' } };
  }

  // 1. Save user profile
  const { error: profileError } = await saveUserProfile(profileData);
  if (profileError) {
    console.error('Failed to save profile to Supabase:', profileError);
    return { data: null, error: profileError };
  }

  // 2. Insert weight history
  if (profileData.weight_kg) {
    const { error: weightError } = await insertWeight(profileData.weight_kg);
    if (weightError) {
      console.warn('Weight history save warning:', weightError);
    }
  }

  // 3. Create workout plan
  const { week_start_date, week_end_date, dates } = getCurrentWeekDates();

  const { data: newPlan, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      user_id: user.id,
      week_start_date,
      week_end_date,
      template_goal: profileData.fitness_goal,
      template_level: profileData.experience_level,
    })
    .select()
    .single();

  if (planError) {
    console.error('Failed to insert workout_plan in Supabase:', planError);
    return { data: null, error: planError };
  }

  // 4. Generate and insert plan exercises
  const templateExercises = buildWeeklyScheduleTemplate(
    profileData.fitness_goal,
    profileData.experience_level,
    dates
  );

  const planExercisesToInsert = templateExercises.map((te) => ({
    workout_plan_id: newPlan.id,
    exercise_id: te.exercise_id,
    scheduled_date: te.scheduled_date,
    exercise_order: te.exercise_order,
    target_sets: te.target_sets,
    target_reps: te.target_reps,
    target_weight_kg: te.target_weight_kg,
    target_duration_min: te.target_duration_min,
    target_distance_km: te.target_distance_km,
    initial_target_sets: te.target_sets,
    initial_target_reps: te.target_reps,
    initial_target_weight_kg: te.target_weight_kg,
    initial_target_duration_min: te.target_duration_min,
    initial_target_distance_km: te.target_distance_km,
  }));

  const { data: insertedExercises, error: peError } = await supabase
    .from('plan_exercises')
    .insert(planExercisesToInsert)
    .select('*, exercises(*)');

  if (peError) {
    console.error('Failed to insert plan_exercises in Supabase:', peError);
    return { data: null, error: peError };
  }

  return {
    data: {
      plan: newPlan,
      planExercises: insertedExercises ?? [],
    },
    error: null,
  };
}

/**
 * Fetch the active workout plan for the authenticated user and
 * group its exercises by date.
 *
 * @returns {Promise<{ data: { plan: object|null, planExercises: Array, weekSchedule: object, allDates: Array }, error: object|null }>}
 */
export async function fetchActivePlan() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: { plan: null, planExercises: [], weekSchedule: {}, allDates: [] },
      error: { message: 'Not authenticated' },
    };
  }

  // Fetch most recent plan for user
  const { data: plans, error: planError } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (planError) {
    console.error('Failed to fetch active workout plan:', planError);
    return {
      data: { plan: null, planExercises: [], weekSchedule: {}, allDates: [] },
      error: planError,
    };
  }

  if (!plans || plans.length === 0) {
    return {
      data: { plan: null, planExercises: [], weekSchedule: {}, allDates: [] },
      error: null,
    };
  }

  const plan = plans[0];

  // Fetch plan_exercises with joined exercise details
  const { data: rawExercises, error: peError } = await supabase
    .from('plan_exercises')
    .select('*, exercises(*)')
    .eq('workout_plan_id', plan.id)
    .order('scheduled_date', { ascending: true })
    .order('exercise_order', { ascending: true });

  if (peError) {
    console.error('Failed to fetch plan_exercises:', peError);
    return {
      data: { plan, planExercises: [], weekSchedule: {}, allDates: [] },
      error: peError,
    };
  }

  const planExercises = (rawExercises ?? []).map((pe) => {
    // If DB relation didn't populate exercises row, resolve from local fallback
    const resolvedExercise = pe.exercises ?? getExerciseById(pe.exercise_id);
    return {
      ...pe,
      exercise: resolvedExercise,
    };
  });

  // Build the 7-day schedule map
  const weekSchedule = {};
  const dateSet = new Set();

  // Seed dates between week_start_date and week_end_date
  if (plan.week_start_date && plan.week_end_date) {
    const start = new Date(plan.week_start_date + 'T00:00:00');
    const end = new Date(plan.week_end_date + 'T00:00:00');
    const cur = new Date(start);
    while (cur <= end) {
      const dStr = cur.toISOString().split('T')[0];
      weekSchedule[dStr] = [];
      dateSet.add(dStr);
      cur.setDate(cur.getDate() + 1);
    }
  }

  for (const pe of planExercises) {
    if (!weekSchedule[pe.scheduled_date]) {
      weekSchedule[pe.scheduled_date] = [];
    }
    weekSchedule[pe.scheduled_date].push(pe);
    dateSet.add(pe.scheduled_date);
  }

  // Sort exercises by exercise_order
  for (const date in weekSchedule) {
    weekSchedule[date].sort((a, b) => a.exercise_order - b.exercise_order);
  }

  const allDates = Array.from(dateSet).sort();

  return {
    data: {
      plan,
      planExercises,
      weekSchedule,
      allDates,
    },
    error: null,
  };
}
