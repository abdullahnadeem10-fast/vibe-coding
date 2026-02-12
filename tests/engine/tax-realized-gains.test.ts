import { describe, expect, it } from 'vitest';
import { simulate } from '../../src/lib/engine/simulate';
import type { SimulationInput } from '../../src/lib/engine/types';

function makeInput(): SimulationInput {
  return {
    name: 'FIFO Tax Test',
    horizonDays: 40,
    baseCurrency: 'USD',
    fx: {
      baseRates: { EUR: 0.9, PKR: 280 },
      volatility: 0,
    },
    startingCash: -1000,
    incomes: [],
    expenses: [],
    debts: [],
    assets: [
      {
        id: 'asset-low-gain',
        name: 'Low Gain Asset',
        class: 'index_fund',
        value: 1000,
        currency: 'USD',
        expectedReturn: 0,
        volatility: 0,
        salePenalty: 0,
        liquidityDelayDays: 0,
        locked: false,
      },
      {
        id: 'asset-high-gain',
        name: 'High Gain Asset',
        class: 'crypto',
        value: 1000,
        currency: 'USD',
        expectedReturn: 0,
        volatility: 0,
        salePenalty: 0,
        liquidityDelayDays: 0,
        locked: false,
      },
    ],
    taxBrackets: [
      { floor: 0, ceiling: 1_000_000, rate: 0.2 },
    ],
    shocks: [],
    cashReserveRatio: 0,
  };
}

describe('Tax realized gains (FIFO)', () => {
  it('taxes realized gains from earlier lots first when liquidation happens', () => {
    const input = makeInput();

    const result = simulate(input, undefined, {
      initialAssetLots: {
        'asset-low-gain': [
          { costBasis: 800, value: 1000 },
        ],
        'asset-high-gain': [
          { costBasis: 200, value: 1000 },
        ],
      },
      liquidationOrder: ['asset-low-gain', 'asset-high-gain'],
    });

    // First month tax should reflect only first sold lot (gain = 200)
    expect(result.summary.taxesPaid).toBeCloseTo(40, 6);
    expect(result.summary.realizedGains).toBeGreaterThanOrEqual(200);
  });
});
