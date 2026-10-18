/**
 * FitTrack 2.0 Canonical Fitness Goals & Compatibility Layer
 *
 * Persisted in Supabase public.users (enforced by Postgres check constraint
 * `users_fitness_goal_check`):
 *   - 'muscle_gain'
 *   - 'weight_loss'
 *   - 'general_fitness'
 *   - 'endurance'
 *
 * Legacy / UI aliases mapped:
 *   - 'build_strength' ➔ 'muscle_gain'
 *   - 'hypertrophy'    ➔ 'muscle_gain'
 *   - 'fat_loss'       ➔ 'weight_loss'
 */

export const FITNESS_GOALS = [
  {
    id: 'muscle_gain',
    label: 'Build Muscle & Strength',
    description: 'Hypertrophy and progressive strength overload',
    icon: '💪',
  },
  {
    id: 'weight_loss',
    label: 'Fat Loss & Definition',
    description: 'Caloric expenditure, density, and metabolic conditioning',
    icon: '🔥',
  },
  {
    id: 'general_fitness',
    label: 'General Fitness & Conditioning',
    description: 'Balanced full-body athleticism, mobility, and stamina',
    icon: '⚡',
  },
  {
    id: 'endurance',
    label: 'Endurance & Stamina',
    description: 'Aerobic capacity, sustained work capacity, and cardio',
    icon: '🏃',
  },
];

/**
 * Normalizes any legacy or alias goal identifier to a database-valid canonical ID.
 *
 * @param {string|null|undefined} rawGoal
 * @returns {string} canonical goal ID ('muscle_gain' | 'weight_loss' | 'general_fitness' | 'endurance')
 */
export function normalizeGoal(rawGoal) {
  if (!rawGoal || typeof rawGoal !== 'string') {
    return 'general_fitness';
  }

  const clean = rawGoal.trim().toLowerCase();

  switch (clean) {
    case 'build_strength':
    case 'hypertrophy':
    case 'muscle_gain':
      return 'muscle_gain';

    case 'fat_loss':
    case 'weight_loss':
      return 'weight_loss';

    case 'endurance':
    case 'cardio':
    case 'stamina':
      return 'endurance';

    case 'general_fitness':
    case 'fitness':
    case 'conditioning':
      return 'general_fitness';

    default: {
      const match = FITNESS_GOALS.find((g) => g.id === clean);
      return match ? match.id : 'general_fitness';
    }
  }
}

/**
 * Returns human-readable display label for any goal identifier.
 *
 * @param {string|null|undefined} rawGoal
 * @returns {string} display label
 */
export function getGoalLabel(rawGoal) {
  const canonical = normalizeGoal(rawGoal);
  const found = FITNESS_GOALS.find((g) => g.id === canonical);
  return found ? found.label : 'General Fitness & Conditioning';
}
