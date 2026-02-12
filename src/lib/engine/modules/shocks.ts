// ──────────────────────────────────────────────
// Shock events DAG node — deterministic schedule
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput } from '../types';
import { convertCurrency } from './fx';

export class ShockNode implements DAGNode {
  id = 'shock';
  dependencies = ['income', 'expense'];

  public firedShocks: { day: number; shockId: string; amount: number }[] = [];
  private dayImpact = 0;

  prepare(day: number, _state: Readonly<DayState>, input: SimulationInput): void {
    this.dayImpact = 0;
    for (const shock of input.shocks) {
      if (!shock.enabled) continue;
      if (shock.day === day) {
        const impact = convertCurrency(
          shock.amount * shock.severity,
          shock.currency,
          input.baseCurrency,
          _state.fxRates,
        );
        this.dayImpact += impact;
        this.firedShocks.push({ day, shockId: shock.id, amount: impact });
      }
    }
  }

  apply(_day: number, state: DayState, _input: SimulationInput): void {
    if (this.dayImpact !== 0) {
      state.balance += this.dayImpact;
      state.shockImpact += this.dayImpact;
    }
  }
}
