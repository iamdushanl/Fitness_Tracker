/**
 * Converts a date or date string to YYYY-MM-DD
 * @param {string|Date} d
 * @returns {string}
 */
function toDateString(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    return d.split('T')[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates start of the week (Monday 00:00:00.000) for a given date.
 * @param {Date} [refDate=new Date()]
 * @returns {Date}
 */
function getStartOfWeek(refDate = new Date()) {
  const date = new Date(refDate);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Calculates the current daily streak of logged workouts.
 *
 * Rules:
 * 1. If workout logged today: streak includes today and counts backward consecutive days.
 * 2. If no workout yet today, but logged yesterday: streak is still active, starting from yesterday.
 * 3. If neither today nor yesterday has a logged workout: streak is 0.
 *
 * @param {Array<string|Date>} dates - List of timestamps or date strings
 * @param {Date} [referenceDate=new Date()] - Reference "now" date
 * @returns {number} Current streak in days
 */
function calculateDailyStreak(dates, referenceDate = new Date()) {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return 0;
  }

  // Deduplicate and normalize dates to 'YYYY-MM-DD'
  const uniqueDateStrings = new Set();
  for (const item of dates) {
    if (!item) continue;
    const str = typeof item === 'string' ? item.split('T')[0] : toDateString(item);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      uniqueDateStrings.add(str);
    }
  }

  if (uniqueDateStrings.size === 0) {
    return 0;
  }

  const getOffsetDateStr = (ref, dayOffset) => {
    const d = new Date(ref);
    d.setDate(d.getDate() + dayOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getOffsetDateStr(referenceDate, 0);
  const yesterdayStr = getOffsetDateStr(referenceDate, -1);

  let streak = 0;
  let currentOffset = 0;

  if (uniqueDateStrings.has(todayStr)) {
    streak = 1;
    currentOffset = -1;
  } else if (uniqueDateStrings.has(yesterdayStr)) {
    streak = 1;
    currentOffset = -2;
  } else {
    return 0;
  }

  // Check preceding consecutive days
  while (uniqueDateStrings.has(getOffsetDateStr(referenceDate, currentOffset))) {
    streak += 1;
    currentOffset -= 1;
  }

  return streak;
}

module.exports = {
  toDateString,
  getStartOfWeek,
  calculateDailyStreak,
};
