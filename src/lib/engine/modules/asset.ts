// ──────────────────────────────────────────────
// Asset DAG node — daily valuation + liquidation
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput, SimulationRuntimeOptions } from '../types';
import { convertCurrency } from './fx';

function consumeLotsFIFO(lots: Array<{ costBasis: number; value: number }>, sellValue: number): number {
  let remaining = sellValue;
  let consumedCostBasis = 0;

  while (remaining > 0 && lots.length > 0) {
    const lot = lots[0];
    const take = Math.min(lot.value, remaining);
    const ratio = lot.value > 0 ? take / lot.value : 0;
    consumedCostBasis += lot.costBasis * ratio;

    lot.value -= take;
    lot.costBasis -= lot.costBasis * ratio;
    remaining -= take;

    if (lot.value <= 1e-9) {
      lots.shift();
    }
  }

  return consumedCostBasis;
}

export class AssetNode implements DAGNode {
  id = 'asset';
  dependencies = ['income', 'expense', 'debt'];

  constructor(private readonly runtimeOptions?: SimulationRuntimeOptions) {}

  private valuationChanges = new Map<string, number>();
  private liquidationNeeded = false;

  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void {
    this.valuationChanges.clear();
    this.liquidationNeeded = false;

    // Update asset valuations (expected daily return)
    for (const asset of input.assets) {
      if (asset.locked) continue;
      const currentValue = state.assets.get(asset.id) ?? 0;
      const dailyReturn = asset.expectedReturn / 365;
      const change = currentValue * dailyReturn;
      this.valuationChanges.set(asset.id, change);
    }

    // Check if liquidation is needed (balance below reserve)
    const totalAssetValue = Array.from(state.assets.values()).reduce((s, v) => s + v, 0);
    const requiredReserve = totalAssetValue * input.cashReserveRatio;
    if (state.balance < 0 || state.balance < requiredReserve * 0.1) {
      this.liquidationNeeded = true;
    }
  }

  apply(day: number, state: DayState, input: SimulationInput): void {
    // Apply valuation changes
    for (const asset of input.assets) {
      const currentValue = state.assets.get(asset.id) ?? 0;
      const change = this.valuationChanges.get(asset.id) ?? 0;
      state.assets.set(asset.id, currentValue + change);
    }

    // Liquidation: sell liquid assets to cover deficit
    if (this.liquidationNeeded && state.balance < 0) {
      const customOrder = this.runtimeOptions?.liquidationOrder ?? [];
      const orderLookup = new Map(customOrder.map((assetId, index) => [assetId, index]));

      // Sort assets by explicit liquidation order, then liquidity (0 delay first), then sale penalty.
      const sellable = input.assets
        .filter(a => !a.locked && a.liquidityDelayDays === 0)
        .sort((a, b) => {
          const orderA = orderLookup.has(a.id) ? orderLookup.get(a.id)! : Number.MAX_SAFE_INTEGER;
          const orderB = orderLookup.has(b.id) ? orderLookup.get(b.id)! : Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          if (a.salePenalty !== b.salePenalty) return a.salePenalty - b.salePenalty;
          return a.id.localeCompare(b.id);
        });

      for (const asset of sellable) {
        if (state.balance >= 0) break;
        const currentValue = state.assets.get(asset.id) ?? 0;
        if (currentValue <= 0) continue;

        const deficitBase = Math.abs(state.balance);
        const availableNetBase = convertCurrency(
          currentValue * (1 - asset.salePenalty),
          asset.currency,
          input.baseCurrency,
          state.fxRates,
        );
        const proceedsBase = Math.min(availableNetBase, deficitBase);

        const proceedsInAssetCurrency = convertCurrency(
          proceedsBase,
          input.baseCurrency,
          asset.currency,
          state.fxRates,
        );

        const sellAmount = Math.min(
          currentValue,
          proceedsInAssetCurrency / Math.max(1e-9, 1 - asset.salePenalty),
        );
        const proceeds = sellAmount * (1 - asset.salePenalty);

        const lots = state.assetLots.get(asset.id) ?? [];
        const costBasisSold = consumeLotsFIFO(lots, sellAmount);
        state.assetLots.set(asset.id, lots);

        const realizedGainInAssetCurrency = proceeds - costBasisSold;
        const realizedGainInBase = convertCurrency(
          realizedGainInAssetCurrency,
          asset.currency,
          input.baseCurrency,
          state.fxRates,
        );

        state.assets.set(asset.id, currentValue - sellAmount);
        state.balance += convertCurrency(proceeds, asset.currency, input.baseCurrency, state.fxRates);
        state.realizedGains += realizedGainInBase;
      }
    }
  }
}
