// ──────────────────────────────────────────────
// FX DAG node — deterministic exchange rate dynamics
// Uses analytical distribution (no randomness)
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput, FXRates, Currency, SimulationRuntimeOptions } from '../types';

/**
 * Compute deterministic daily FX rates.
 * Uses a sine-based deterministic oscillation around base rates
 * modulated by the volatility parameter.
 * This produces repeatable, non-random rate paths.
 */
export function getDeterministicFXRates(
  day: number,
  baseRates: FXRates,
  volatility: number,
): FXRates {
  // Deterministic oscillation using trigonometric functions
  // Different frequencies for different currencies to avoid correlation
  const eurFactor = 1 + volatility * Math.sin(day * 0.017) * 0.1;
  const pkrFactor = 1 + volatility * Math.sin(day * 0.023 + 1.5) * 0.1;

  return {
    EUR: baseRates.EUR * eurFactor,
    PKR: baseRates.PKR * pkrFactor,
  };
}

/**
 * Convert an amount from one currency to USD using the given rates.
 */
export function convertToUSD(
  amount: number,
  fromCurrency: string,
  rates: FXRates,
): number {
  if (fromCurrency === 'USD') return amount;
  if (fromCurrency === 'EUR') return amount / rates.EUR;
  if (fromCurrency === 'PKR') return amount / rates.PKR;
  return amount; // fallback
}

export function convertFromUSD(
  amount: number,
  toCurrency: Currency,
  rates: FXRates,
): number {
  if (toCurrency === 'USD') return amount;
  if (toCurrency === 'EUR') return amount * rates.EUR;
  if (toCurrency === 'PKR') return amount * rates.PKR;
  return amount;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: FXRates,
): number {
  if (fromCurrency === toCurrency) return amount;
  const usdAmount = convertToUSD(amount, fromCurrency, rates);
  return convertFromUSD(usdAmount, toCurrency, rates);
}

export class FXNode implements DAGNode {
  id = 'fx';
  dependencies: string[] = []; // FX rates are independent

  constructor(private readonly runtimeOptions?: SimulationRuntimeOptions) {}

  private currentRates: FXRates = { EUR: 1, PKR: 1 };

  prepare(day: number, _state: Readonly<DayState>, input: SimulationInput): void {
    const overridden = this.runtimeOptions?.fxRatesByDay?.[day];
    if (overridden) {
      this.currentRates = overridden;
      return;
    }

    this.currentRates = getDeterministicFXRates(
      day,
      input.fx.baseRates,
      input.fx.volatility,
    );
  }

  apply(_day: number, _state: DayState, _input: SimulationInput): void {
    _state.fxRates = this.currentRates;
  }

  getRates(): FXRates {
    return this.currentRates;
  }
}
