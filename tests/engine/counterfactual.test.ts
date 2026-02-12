import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';
import { simulateWithCounterfactual } from '../../src/lib/engine/simulate';

describe('Counterfactual no-shocks path', () => {
  it('returns withShocks and withoutShocks runs and deterministic delta', () => {
    const result = simulateWithCounterfactual(DEMO_PROFILE);

    expect(result.withShocks.firedShocks.length).toBeGreaterThan(0);
    expect(result.withoutShocks.firedShocks.length).toBe(0);
    expect(result.insights.balanceDeltaNoShocksVsActual).toBeCloseTo(
      result.withoutShocks.summary.finalBalance - result.withShocks.summary.finalBalance,
      6,
    );
  });
});
