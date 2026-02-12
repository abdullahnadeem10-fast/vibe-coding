// ──────────────────────────────────────────────
// Validation schemas test
// ──────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { SimulationInputSchema } from '../../src/lib/validation/inputSchemas';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';

describe('Input Validation', () => {
  it('demo profile passes validation', () => {
    const result = SimulationInputSchema.safeParse(DEMO_PROFILE);
    expect(result.success).toBe(true);
  });

  it('rejects negative horizon', () => {
    const invalid = { ...DEMO_PROFILE, horizonDays: -1 };
    const result = SimulationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects horizon exceeding 1825', () => {
    const invalid = { ...DEMO_PROFILE, horizonDays: 2000 };
    const result = SimulationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const invalid = { ...DEMO_PROFILE, name: '' };
    const result = SimulationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency', () => {
    const invalid = { ...DEMO_PROFILE, baseCurrency: 'GBP' };
    const result = SimulationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects cash reserve ratio > 1', () => {
    const invalid = { ...DEMO_PROFILE, cashReserveRatio: 1.5 };
    const result = SimulationInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts valid modified profile', () => {
    const modified = {
      ...DEMO_PROFILE,
      name: 'Custom Profile',
      horizonDays: 730,
      startingCash: 10000,
    };
    const result = SimulationInputSchema.safeParse(modified);
    expect(result.success).toBe(true);
  });
});
