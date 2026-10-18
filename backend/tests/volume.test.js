const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Training Volume Calculations (volume.js)', async () => {
  // Dynamically import ESM volume helper from frontend
  const {
    getLogVolumeKg,
    calculateTotalTonnageKg,
    formatVolumeDisplay,
  } = await import('../../frontend/src/lib/volume.js');

  describe('getLogVolumeKg', () => {
    it('returns 0 for null, undefined, or non-object logs', () => {
      assert.strictEqual(getLogVolumeKg(null), 0);
      assert.strictEqual(getLogVolumeKg(undefined), 0);
      assert.strictEqual(getLogVolumeKg('invalid'), 0);
      assert.strictEqual(getLogVolumeKg(123), 0);
    });

    it('calculates volume for a standard single-set entry (1 set × 10 reps @ 50 kg = 500 kg)', () => {
      const log = { actual_sets: 1, actual_reps: 10, actual_weight_kg: 50 };
      assert.strictEqual(getLogVolumeKg(log), 500);
    });

    it('calculates volume for a legacy multi-set entry (3 sets × 10 reps @ 50 kg = 1500 kg)', () => {
      const log = { actual_sets: 3, actual_reps: 10, actual_weight_kg: 50 };
      assert.strictEqual(getLogVolumeKg(log), 1500);
    });

    it('defaults actual_sets to 1 when actual_sets is null or undefined', () => {
      const logNullSets = { actual_sets: null, actual_reps: 8, actual_weight_kg: 60 };
      assert.strictEqual(getLogVolumeKg(logNullSets), 480);

      const logUndefinedSets = { actual_reps: 8, actual_weight_kg: 60 };
      assert.strictEqual(getLogVolumeKg(logUndefinedSets), 480);
    });

    it('PRESERVES legitimate zero reps: actual_reps: 0 must NEVER be converted to 1 rep', () => {
      const failedSet = { actual_sets: 1, actual_reps: 0, actual_weight_kg: 100 };
      assert.strictEqual(getLogVolumeKg(failedSet), 0);

      const legacyFailed = { actual_sets: 3, actual_reps: 0, actual_weight_kg: 80 };
      assert.strictEqual(getLogVolumeKg(legacyFailed), 0);
    });

    it('PRESERVES legitimate zero sets: actual_sets: 0 must yield 0 volume', () => {
      const zeroSets = { actual_sets: 0, actual_reps: 10, actual_weight_kg: 100 };
      assert.strictEqual(getLogVolumeKg(zeroSets), 0);
    });

    it('returns 0 volume for cardio or bodyweight exercises with null or zero weight', () => {
      const cardio = { actual_sets: null, actual_reps: null, actual_weight_kg: null, actual_duration_min: 30 };
      assert.strictEqual(getLogVolumeKg(cardio), 0);

      const bodyweight = { actual_sets: 1, actual_reps: 15, actual_weight_kg: 0 };
      assert.strictEqual(getLogVolumeKg(bodyweight), 0);
    });

    it('safely handles non-numeric, NaN, or string values without corrupting calculations', () => {
      const nanLog = { actual_sets: 1, actual_reps: 'not-a-number', actual_weight_kg: 50 };
      assert.strictEqual(getLogVolumeKg(nanLog), 0);

      const stringNumberLog = { actual_sets: '2', actual_reps: '10', actual_weight_kg: '25.5' };
      assert.strictEqual(getLogVolumeKg(stringNumberLog), 510);
    });

    it('clamps negative values to 0 to prevent negative volume leakage', () => {
      const negativeLog = { actual_sets: -2, actual_reps: -10, actual_weight_kg: 50 };
      assert.strictEqual(getLogVolumeKg(negativeLog), 0);
    });
  });

  describe('calculateTotalTonnageKg', () => {
    it('returns 0 for empty array or invalid inputs', () => {
      assert.strictEqual(calculateTotalTonnageKg([]), 0);
      assert.strictEqual(calculateTotalTonnageKg(null), 0);
      assert.strictEqual(calculateTotalTonnageKg(undefined), 0);
    });

    it('correctly aggregates multiple sets without double-counting', () => {
      const logs = [
        { actual_sets: 1, actual_reps: 10, actual_weight_kg: 50 }, // 500
        { actual_sets: 1, actual_reps: 10, actual_weight_kg: 50 }, // 500
        { actual_sets: 1, actual_reps: 8, actual_weight_kg: 50 },  // 400
      ];
      assert.strictEqual(calculateTotalTonnageKg(logs), 1400);
    });

    it('ignores corrupted or zero-rep entries without breaking the total', () => {
      const logs = [
        { actual_sets: 1, actual_reps: 10, actual_weight_kg: 50 }, // 500
        { actual_sets: 1, actual_reps: 0, actual_weight_kg: 100 }, // 0 (failed set)
        { actual_sets: 1, actual_reps: 'corrupt', actual_weight_kg: NaN }, // 0 (corrupt)
        { actual_sets: 1, actual_reps: 5, actual_weight_kg: 60 },  // 300
      ];
      assert.strictEqual(calculateTotalTonnageKg(logs), 800);
    });
  });

  describe('formatVolumeDisplay', () => {
    it('formats 0 or negative volume as 0.0t', () => {
      assert.strictEqual(formatVolumeDisplay(0), '0.0t');
      assert.strictEqual(formatVolumeDisplay(-100), '0.0t');
      assert.strictEqual(formatVolumeDisplay(null), '0.0t');
      assert.strictEqual(formatVolumeDisplay(NaN), '0.0t');
    });

    it('formats positive kilograms into tonnes with 1 decimal place', () => {
      assert.strictEqual(formatVolumeDisplay(1500), '1.5t');
      assert.strictEqual(formatVolumeDisplay(42800), '42.8t');
      assert.strictEqual(formatVolumeDisplay(750), '0.8t');
    });
  });
});
