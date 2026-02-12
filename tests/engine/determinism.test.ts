// ──────────────────────────────────────────────
// Determinism test — identical inputs MUST produce identical outputs
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';

describe('Simulation Determinism', () => {
  it('produces identical outputs for identical inputs', () => {
    const result1 = simulate(DEMO_PROFILE);
    const result2 = simulate(DEMO_PROFILE);

    // Same number of snapshots
    expect(result1.dailySnapshots.length).toBe(result2.dailySnapshots.length);

    // Every daily snapshot must be bit-exact
    for (let i = 0; i < result1.dailySnapshots.length; i++) {
      expect(result1.dailySnapshots[i].balance).toBe(result2.dailySnapshots[i].balance);
      expect(result1.dailySnapshots[i].nav).toBe(result2.dailySnapshots[i].nav);
      expect(result1.dailySnapshots[i].creditScore).toBe(result2.dailySnapshots[i].creditScore);
      expect(result1.dailySnapshots[i].balanceP5).toBe(result2.dailySnapshots[i].balanceP5);
      expect(result1.dailySnapshots[i].balanceP95).toBe(result2.dailySnapshots[i].balanceP95);
    }

    // Summary must be identical
    expect(result1.summary.finalBalance).toBe(result2.summary.finalBalance);
    expect(result1.summary.finalNAV).toBe(result2.summary.finalNAV);
    expect(result1.summary.finalCreditScore).toBe(result2.summary.finalCreditScore);
    expect(result1.summary.collapseProbability).toBe(result2.summary.collapseProbability);
    expect(result1.summary.vibeTier).toBe(result2.summary.vibeTier);
    expect(result1.summary.shockResilienceIndex).toBe(result2.summary.shockResilienceIndex);
  });

  it('produces different outputs for different inputs', () => {
    const modified = {
      ...DEMO_PROFILE,
      startingCash: DEMO_PROFILE.startingCash + 10000,
    };

    const result1 = simulate(DEMO_PROFILE);
    const result2 = simulate(modified);

    expect(result1.summary.finalBalance).not.toBe(result2.summary.finalBalance);
  });

  it('determinism holds over 3 consecutive runs', () => {
    const results = [
      simulate(DEMO_PROFILE),
      simulate(DEMO_PROFILE),
      simulate(DEMO_PROFILE),
    ];

    for (let i = 1; i < results.length; i++) {
      expect(results[i].summary.finalBalance).toBe(results[0].summary.finalBalance);
      expect(results[i].summary.finalNAV).toBe(results[0].summary.finalNAV);
      expect(results[i].summary.vibeTier).toBe(results[0].summary.vibeTier);
    }
  });
});
