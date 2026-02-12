import { describe, expect, it } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import type { SimulationInput } from '../../src/lib/engine/types';

const baseInput: SimulationInput = {
  name: 'FX Realization',
  horizonDays: 0,
  baseCurrency: 'USD',
  fx: {
    baseRates: { EUR: 1, PKR: 280 },
    volatility: 0,
  },
  startingCash: 0,
  incomes: [
    { id: 'eur-salary', name: 'EUR Salary', monthlyAmount: 3000, currency: 'EUR', dayOfMonth: 1 },
  ],
  expenses: [
    { id: 'usd-rent', name: 'Rent', monthlyAmount: 3000, currency: 'USD', essential: true },
  ],
  debts: [],
  assets: [],
  taxBrackets: [{ floor: 0, ceiling: 1_000_000, rate: 0 }],
  shocks: [],
  cashReserveRatio: 0,
};

describe('FX realization', () => {
  it('converts non-base currency flows using transaction-day rates', () => {
    const result = simulate(baseInput, undefined, {
      fxRatesByDay: {
        0: { EUR: 2, PKR: 280 },
      },
    });

    // Day 0: income = 3000 EUR => 1500 USD, expense = 100 USD/day
    expect(result.dailySnapshots[0].balance).toBeCloseTo(1400, 6);
  });
});
