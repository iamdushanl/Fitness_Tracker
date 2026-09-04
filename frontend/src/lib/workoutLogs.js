import { supabase } from './supabase';

/**
 * Fetch all workout logs for the signed-in user,
 * ordered newest-first (performed_at DESC).
 *
 * @returns {Promise<{ data: Array, error: object|null }>}
 */
export async function fetchWorkoutLogs() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: { message: 'Not authenticated' } };

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('performed_at', { ascending: false });

  if (error) return { data: [], error };

  return { data: data ?? [], error: null };
}

/**
 * Insert a new workout log for the signed-in user.
 *
 * @param {object} logData — must include plan_exercise_id, performed_at,
 *   actual_sets, actual_reps, actual_weight_kg, actual_duration_min,
 *   actual_distance_km, notes.  user_id is set automatically.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function insertWorkoutLog(logData) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  const row = {
    user_id: user.id,
    plan_exercise_id: logData.plan_exercise_id,
    performed_at: logData.performed_at,
    actual_sets: logData.actual_sets ?? null,
    actual_reps: logData.actual_reps ?? null,
    actual_weight_kg: logData.actual_weight_kg ?? null,
    actual_duration_min: logData.actual_duration_min ?? null,
    actual_distance_km: logData.actual_distance_km ?? null,
    notes: logData.notes ?? null,
  };

  const { data, error } = await supabase
    .from('workout_logs')
    .insert(row)
    .select()
    .single();

  return { data, error };
}

