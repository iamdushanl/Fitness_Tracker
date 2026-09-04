import { supabase } from './supabase';

/**
 * Fetch current authenticated user's profile from `public.users`.
 * Falls back to auth session metadata if profile has not yet been saved.
 *
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function fetchUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  if (data) {
    return { data, error: null };
  }

  // Fallback profile derived from auth user
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Athlete';

  return {
    data: {
      id: user.id,
      name,
      age: null,
      height_cm: null,
      weight_kg: null,
      experience_level: 'intermediate',
      fitness_goal: 'general_fitness',
    },
    error: null,
  };
}

/**
 * Save / upsert current user profile into `public.users`.
 *
 * @param {object} profile
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function saveUserProfile(profile) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  const row = {
    id: user.id,
    name: profile.name,
    age: Number(profile.age),
    height_cm: Number(profile.height_cm),
    weight_kg: Number(profile.weight_kg),
    experience_level: profile.experience_level,
    fitness_goal: profile.fitness_goal,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(row)
    .select()
    .single();

  return { data, error };
}

/**
 * Fetch user's weight history ordered chronologically.
 *
 * @returns {Promise<{ data: Array, error: object|null }>}
 */
export async function fetchWeightHistory() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: { message: 'Not authenticated' } };

  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: true });

  if (error) return { data: [], error };
  return { data: data ?? [], error: null };
}

/**
 * Insert a new weight entry and update profile weight.
 *
 * @param {number} weight_kg
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function insertWeight(weight_kg) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: { message: 'Not authenticated' } };

  const { data, error } = await supabase
    .from('weight_history')
    .insert({
      user_id: user.id,
      weight_kg: Number(weight_kg),
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { data: null, error };

  // Sync latest weight to users table
  await supabase
    .from('users')
    .update({ weight_kg: Number(weight_kg), updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return { data, error: null };
}
