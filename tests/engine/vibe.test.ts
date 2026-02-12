// ──────────────────────────────────────────────
// Vibe tier / pet state test
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { computeVibeTier } from '../../src/lib/engine/modules/metrics';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';

describe('Vibe Tier', () => {
  it('returns Thriving for healthy financials', () => {
    const tier = computeVibeTier(10000, 50000, 750, 0, 0.4);
    expect(tier).toBe('Thriving');
  });

  it('returns Stable for moderate financials', () => {
    const tier = computeVibeTier(5000, 20000, 650, 3, 0.2);
    expect(tier).toBe('Stable');
  });

  it('returns Stressed for tight financials', () => {
    const tier = computeVibeTier(1000, 5000, 520, 10, 0.1);
    expect(tier).toBe('Stressed');
  });

  it('returns Crisis for poor financials', () => {
    const tier = computeVibeTier(100, 1000, 380, 35, 0.03);
    expect(tier).toBe('Crisis');
  });

  it('returns Collapse for negative NAV', () => {
    const tier = computeVibeTier(-5000, -10000, 350, 100, 0);
    expect(tier).toBe('Collapse');
  });

  it('simulation always produces a valid vibe tier', () => {
    const result = simulate(DEMO_PROFILE);
    expect(['Thriving', 'Stable', 'Stressed', 'Crisis', 'Collapse']).toContain(
      result.summary.vibeTier,
    );
  });
});
