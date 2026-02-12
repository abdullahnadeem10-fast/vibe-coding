// ──────────────────────────────────────────────
// Shock events test
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';
import type { SimulationInput } from '../../src/lib/engine/types';

describe('Shock Events', () => {
  it('enabled shocks fire on the correct day', () => {
    const result = simulate(DEMO_PROFILE);

    const enabledShocks = DEMO_PROFILE.shocks.filter(s => s.enabled);
    expect(result.firedShocks.length).toBe(enabledShocks.length);

    for (const shock of enabledShocks) {
      const fired = result.firedShocks.find(f => f.shockId === shock.id);
      expect(fired).toBeDefined();
      expect(fired!.day).toBe(shock.day);
    }
  });

  it('disabled shocks do not fire', () => {
    const allDisabled: SimulationInput = {
      ...DEMO_PROFILE,
      shocks: DEMO_PROFILE.shocks.map(s => ({ ...s, enabled: false })),
    };

    const result = simulate(allDisabled);
    expect(result.firedShocks.length).toBe(0);
  });

  it('severity scales the shock amount', () => {
    const doubleSeverity: SimulationInput = {
      ...DEMO_PROFILE,
      shocks: DEMO_PROFILE.shocks.map(s => ({
        ...s,
        severity: 2.0,
      })),
    };

    const normal = simulate(DEMO_PROFILE);
    const doubled = simulate(doubleSeverity);

    // Fired shocks should have doubled amounts
    for (const shock of DEMO_PROFILE.shocks.filter(s => s.enabled)) {
      const normalFired = normal.firedShocks.find(f => f.shockId === shock.id);
      const doubledFired = doubled.firedShocks.find(f => f.shockId === shock.id);
      expect(doubledFired!.amount).toBeCloseTo(normalFired!.amount * 2, 5);
    }
  });

  it('shock toggles affect final results', () => {
    const noShocks: SimulationInput = {
      ...DEMO_PROFILE,
      shocks: DEMO_PROFILE.shocks.map(s => ({ ...s, enabled: false })),
    };

    const withShocks = simulate(DEMO_PROFILE);
    const without = simulate(noShocks);

    // Results should differ
    expect(withShocks.summary.finalBalance).not.toBe(without.summary.finalBalance);
  });
});
