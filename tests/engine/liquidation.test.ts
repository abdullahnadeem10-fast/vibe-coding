import { describe, expect, it } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import type { SimulationInput } from '../../src/lib/engine/types';

const liquidationInput: SimulationInput = {
  name: 'Liquidation test',
  horizonDays: 0,
  baseCurrency: 'USD',
  fx: {
    baseRates: { EUR: 1, PKR: 280 },
    volatility: 0,
  },
  startingCash: -100,
  incomes: [],
  expenses: [],
  debts: [],
  assets: [
    {
      id: 'real-estate',
      name: 'Property',
      class: 'real_estate',
      value: 1000,
      currency: 'USD',
      expectedReturn: 0,
      volatility: 0,
      salePenalty: 0.06,
      liquidityDelayDays: 90,
      locked: false,
    },
    {
      id: 'savings',
      name: 'Savings',
      class: 'savings',
      value: 200,
      currency: 'USD',
      expectedReturn: 0,
      volatility: 0,
      salePenalty: 0,
      liquidityDelayDays: 0,
      locked: false,
    },
  ],
  taxBrackets: [{ floor: 0, ceiling: 1_000_000, rate: 0 }],
  shocks: [],
  cashReserveRatio: 0,
};

describe('Liquidation', () => {
  it('liquidates only liquid assets first and leaves delayed assets untouched', () => {
    const result = simulate(liquidationInput);

    expect(result.summary.finalBalance).toBeGreaterThanOrEqual(0);
    expect(result.summary.assetEndingValues.savings).toBeLessThan(200);
    expect(result.summary.assetEndingValues['real-estate']).toBe(1000);
  });
});
