/**
 * Pure training-volume calculation and formatting utilities.
 * Pure functions: no I/O, no framework imports, no side-effects.
 */

/**
 * Calculates volume load (tonnage) in kilograms for an individual workout log entry.
 *
 * Requirements:
 * - Legitimate 0 values (e.g. actual_reps: 0 on a failed attempt) must yield 0 volume.
 * - Negative values, NaN, or invalid types are safely clamped to 0.
 * - If actual_sets is null/undefined, defaults to 1 (compatible with single-set log rows).
 * - If actual_sets is an explicit number, it is preserved (compatible with legacy multi-set rows).
 * - If actual_reps or actual_weight_kg is null/undefined, defaults to 0.
 *
 * @param {object} log - Workout log entry
 * @returns {number} Volume load in kg (>= 0)
 */
export function getLogVolumeKg(log) {
  if (!log || typeof log !== 'object') return 0;

  // 1. Resolve and validate sets
  let sets = 1;
  if (log.actual_sets !== null && log.actual_sets !== undefined) {
    const parsedSets = Number(log.actual_sets);
    sets = Number.isFinite(parsedSets) && parsedSets >= 0 ? parsedSets : 0;
  }

  // 2. Resolve and validate reps (preserve legitimate 0!)
  let reps = 0;
  if (log.actual_reps !== null && log.actual_reps !== undefined) {
    const parsedReps = Number(log.actual_reps);
    reps = Number.isFinite(parsedReps) && parsedReps >= 0 ? parsedReps : 0;
  }

  // 3. Resolve and validate weight in kg
  let weight = 0;
  if (log.actual_weight_kg !== null && log.actual_weight_kg !== undefined) {
    const parsedWeight = Number(log.actual_weight_kg);
    weight = Number.isFinite(parsedWeight) && parsedWeight >= 0 ? parsedWeight : 0;
  }

  const volume = sets * reps * weight;
  return Number.isFinite(volume) && volume > 0 ? volume : 0;
}

/**
 * Calculates cumulative training volume / tonnage in kilograms across an array of workout logs.
 *
 * @param {Array<object>} workoutLogs - Array of workout log entries
 * @returns {number} Total tonnage in kilograms (>= 0)
 */
export function calculateTotalTonnageKg(workoutLogs = []) {
  if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
    return 0;
  }

  const total = workoutLogs.reduce((acc, log) => acc + getLogVolumeKg(log), 0);
  return Number.isFinite(total) && total > 0 ? Number(total.toFixed(2)) : 0;
}

/**
 * Formats a tonnage value in kilograms into a human-readable string in tonnes (e.g. '1.5t', '0.0t').
 *
 * @param {number} tonnageKg - Volume in kilograms
 * @returns {string} Formatted volume display
 */
export function formatVolumeDisplay(tonnageKg) {
  const val = Number(tonnageKg);
  if (!Number.isFinite(val) || val <= 0) {
    return '0.0t';
  }
  return `${(val / 1000).toFixed(1)}t`;
}
