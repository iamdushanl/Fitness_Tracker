// Mock weight history — matches ARCH.md §4 `weight_history` table
export const mockWeightHistory = [
  { id: 'wh-001', user_id: 'u-001', weight_kg: 82.0, recorded_at: '2025-08-01T08:00:00Z' },
  { id: 'wh-002', user_id: 'u-001', weight_kg: 81.5, recorded_at: '2025-08-08T08:00:00Z' },
  { id: 'wh-003', user_id: 'u-001', weight_kg: 81.0, recorded_at: '2025-08-15T08:00:00Z' },
  { id: 'wh-004', user_id: 'u-001', weight_kg: 80.2, recorded_at: '2025-08-22T08:00:00Z' },
  { id: 'wh-005', user_id: 'u-001', weight_kg: 79.5, recorded_at: '2025-08-29T08:00:00Z' },
  { id: 'wh-006', user_id: 'u-001', weight_kg: 78.0, recorded_at: '2025-09-05T08:00:00Z' },
];

/** Get the starting weight (earliest entry) */
export function getStartingWeight() {
  return mockWeightHistory[0]?.weight_kg ?? null;
}

/** Get the current weight (latest entry) */
export function getCurrentWeight() {
  return mockWeightHistory[mockWeightHistory.length - 1]?.weight_kg ?? null;
}

/** Weight change from start */
export function getWeightChange() {
  const start = getStartingWeight();
  const current = getCurrentWeight();
  if (start == null || current == null) return null;
  return +(current - start).toFixed(1);
}
