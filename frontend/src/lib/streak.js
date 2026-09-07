/**
 * Client-side daily workout streak calculator.
 * Aligns with server-side algorithm in backend/utils/streak.js.
 *
 * Rules:
 * 1. If a workout is logged today: streak includes today and counts backward consecutive days.
 * 2. If no workout yet today, but logged yesterday: streak remains active.
 * 3. If neither today nor yesterday has a logged workout: streak is 0.
 *
 * @param {Array<string|Date>} dates - List of performed_at timestamps
 * @param {Date} [referenceDate=new Date()] - Reference date (defaults to now)
 * @returns {number} Active streak in days
 */
export function calculateDailyStreak(dates, referenceDate = new Date()) {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return 0;
  }

  const toDateStr = (d) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Deduplicate dates
  const uniqueDates = new Set();
  for (const item of dates) {
    if (!item) continue;
    const str = toDateStr(item);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      uniqueDates.add(str);
    }
  }

  if (uniqueDates.size === 0) {
    return 0;
  }

  const getOffsetDateStr = (ref, dayOffset) => {
    const d = new Date(ref);
    d.setDate(d.getDate() + dayOffset);
    return toDateStr(d);
  };

  const todayStr = getOffsetDateStr(referenceDate, 0);
  const yesterdayStr = getOffsetDateStr(referenceDate, -1);

  let streak = 0;
  let currentOffset = 0;

  if (uniqueDates.has(todayStr)) {
    streak = 1;
    currentOffset = -1;
  } else if (uniqueDates.has(yesterdayStr)) {
    streak = 1;
    currentOffset = -2;
  } else {
    return 0;
  }

  while (uniqueDates.has(getOffsetDateStr(referenceDate, currentOffset))) {
    streak += 1;
    currentOffset -= 1;
  }

  return streak;
}
