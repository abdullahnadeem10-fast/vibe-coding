// ──────────────────────────────────────────────
// Credit score formula test
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';

describe('Credit Score', () => {
  it('stays within 300-850 range throughout simulation', () => {
    const result = simulate(DEMO_PROFILE);

    for (const snap of result.dailySnapshots) {
      expect(snap.creditScore).toBeGreaterThanOrEqual(300);
      expect(snap.creditScore).toBeLessThanOrEqual(850);
    }
  });

  it('initial credit score is 650', () => {
    const result = simulate(DEMO_PROFILE);
    expect(result.dailySnapshots[0].creditScore).toBe(650);
  });

  it('final credit score is in expected range for demo profile', () => {
    const result = simulate(DEMO_PROFILE);
    // With regular payments, credit should improve or stay stable
    expect(result.summary.finalCreditScore).toBeGreaterThanOrEqual(300);
    expect(result.summary.finalCreditScore).toBeLessThanOrEqual(850);
  });
});
