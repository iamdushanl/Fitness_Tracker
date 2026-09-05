const { describe, it } = require('node:test');
const assert = require('node:assert');
const { calculateDailyStreak } = require('../utils/streak');

describe('calculateDailyStreak', () => {
  const refDate = new Date('2026-09-05T12:00:00Z'); // Saturday, Sep 5, 2026

  it('returns 0 for empty or invalid input', () => {
    assert.strictEqual(calculateDailyStreak([]), 0);
    assert.strictEqual(calculateDailyStreak(null), 0);
    assert.strictEqual(calculateDailyStreak(undefined), 0);
  });

  it('returns 1 if workout was logged only today', () => {
    const dates = ['2026-09-05T08:00:00Z'];
    assert.strictEqual(calculateDailyStreak(dates, refDate), 1);
  });

  it('calculates continuous streak including today (3 days)', () => {
    const dates = [
      '2026-09-05T08:30:00Z',
      '2026-09-04T17:00:00Z',
      '2026-09-03T07:15:00Z',
    ];
    assert.strictEqual(calculateDailyStreak(dates, refDate), 3);
  });

  it('keeps streak active if workout was logged yesterday but not yet today', () => {
    const dates = [
      '2026-09-04T09:00:00Z',
      '2026-09-03T18:00:00Z',
      '2026-09-02T12:00:00Z',
    ];
    assert.strictEqual(calculateDailyStreak(dates, refDate), 3);
  });

  it('returns 0 if streak was broken (most recent workout was 2+ days ago)', () => {
    const dates = [
      '2026-09-03T09:00:00Z',
      '2026-09-02T18:00:00Z',
    ];
    assert.strictEqual(calculateDailyStreak(dates, refDate), 0);
  });

  it('does not double count multiple workouts on the same day', () => {
    const dates = [
      '2026-09-05T07:00:00Z',
      '2026-09-05T19:00:00Z',
      '2026-09-04T08:00:00Z',
    ];
    assert.strictEqual(calculateDailyStreak(dates, refDate), 2);
  });
});
