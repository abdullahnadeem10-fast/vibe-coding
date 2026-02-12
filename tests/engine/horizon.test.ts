// ──────────────────────────────────────────────
// Horizon test — output shapes + timing
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';
import type { SimulationInput } from '../../src/lib/engine/types';

describe('Simulation Horizon', () => {
  it('365-day run completes and produces correct number of snapshots', () => {
    const result = simulate(DEMO_PROFILE);

    // horizonDays + 1 (day 0 to day horizonDays inclusive)
    expect(result.dailySnapshots.length).toBe(DEMO_PROFILE.horizonDays + 1);
  });

  it('weekly snapshots are correct subset of daily', () => {
    const result = simulate(DEMO_PROFILE);

    // Weekly snapshots should be every 7th day
    const expectedWeekly = result.dailySnapshots.filter((_, i) => i % 7 === 0);
    expect(result.weeklySnapshots.length).toBe(expectedWeekly.length);

    for (let i = 0; i < result.weeklySnapshots.length; i++) {
      expect(result.weeklySnapshots[i].day).toBe(expectedWeekly[i].day);
      expect(result.weeklySnapshots[i].balance).toBe(expectedWeekly[i].balance);
    }
  });

  it('all output snapshots have valid shape', () => {
    const result = simulate(DEMO_PROFILE);

    for (const snap of result.dailySnapshots) {
      expect(typeof snap.day).toBe('number');
      expect(typeof snap.balance).toBe('number');
      expect(typeof snap.nav).toBe('number');
      expect(typeof snap.creditScore).toBe('number');
      expect(typeof snap.balanceP5).toBe('number');
      expect(typeof snap.balanceP95).toBe('number');
      expect(typeof snap.navP5).toBe('number');
      expect(typeof snap.navP95).toBe('number');
      expect(snap.creditScore).toBeGreaterThanOrEqual(300);
      expect(snap.creditScore).toBeLessThanOrEqual(850);
    }
  });

  it('summary has all required fields', () => {
    const result = simulate(DEMO_PROFILE);
    const s = result.summary;

    expect(typeof s.finalBalance).toBe('number');
    expect(typeof s.finalBalanceP5).toBe('number');
    expect(typeof s.finalBalanceP95).toBe('number');
    expect(typeof s.finalNAV).toBe('number');
    expect(typeof s.finalCreditScore).toBe('number');
    expect(typeof s.collapseProbability).toBe('number');
    expect(typeof s.shockResilienceIndex).toBe('number');
    expect(typeof s.recoverySlope).toBe('number');
    expect(typeof s.liquidityRatio).toBe('number');
    expect(typeof s.deficitDays).toBe('number');
    expect(['Thriving', 'Stable', 'Stressed', 'Crisis', 'Collapse']).toContain(s.vibeTier);
    expect(s.collapseProbability).toBeGreaterThanOrEqual(0);
    expect(s.collapseProbability).toBeLessThanOrEqual(1);
  });

  it('5-year simulation completes in under 3 seconds', () => {
    const fiveYear: SimulationInput = {
      ...DEMO_PROFILE,
      horizonDays: 1825,
    };

    const start = performance.now();
    const result = simulate(fiveYear);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(3000);
    expect(result.dailySnapshots.length).toBe(1826);
  });

  it('minimum 1-day horizon works', () => {
    const minimal: SimulationInput = {
      ...DEMO_PROFILE,
      horizonDays: 1,
    };

    const result = simulate(minimal);
    expect(result.dailySnapshots.length).toBe(2); // day 0 and day 1
  });
});
