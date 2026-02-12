// ──────────────────────────────────────────────
// Weekly snapshot downsampling test
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';

describe('Weekly Snapshots', () => {
  it('contains only every 7th day', () => {
    const result = simulate(DEMO_PROFILE);

    for (const snap of result.weeklySnapshots) {
      expect(snap.day % 7).toBe(0);
    }
  });

  it('has approximately horizonDays/7 entries', () => {
    const result = simulate(DEMO_PROFILE);
    const expected = Math.floor(DEMO_PROFILE.horizonDays / 7) + 1;
    expect(result.weeklySnapshots.length).toBe(expected);
  });

  it('weekly snapshots match corresponding daily snapshots', () => {
    const result = simulate(DEMO_PROFILE);

    for (const weekly of result.weeklySnapshots) {
      const daily = result.dailySnapshots[weekly.day];
      expect(weekly.balance).toBe(daily.balance);
      expect(weekly.nav).toBe(daily.nav);
      expect(weekly.creditScore).toBe(daily.creditScore);
    }
  });

  it('caps 5-year weekly snapshots to expected downsample size', () => {
    const fiveYearInput = {
      ...DEMO_PROFILE,
      horizonDays: 1825,
    };

    const result = simulate(fiveYearInput);

    expect(result.weeklySnapshots.length).toBe(Math.floor(1825 / 7) + 1);
    expect(result.weeklySnapshots.length).toBeLessThanOrEqual(261);
  });
});
