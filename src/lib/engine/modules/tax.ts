// ──────────────────────────────────────────────
// Tax DAG node — progressive brackets on realized gains
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput } from '../types';

export class TaxNode implements DAGNode {
  id = 'tax';
  dependencies = ['income', 'expense', 'debt', 'asset'];

  private taxDue = 0;
  private lastTaxedIncome = 0;
  private lastTaxedGains = 0;

  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void {
    this.taxDue = 0;

    // Apply taxes monthly (on day 30 of each pseudo-month)
    const dayInMonth = ((day % 30) + 1);
    if (dayInMonth !== 30) return;

    // Calculate THIS MONTH's income (delta from last tax event)
    const monthlyIncome = state.totalIncome - this.lastTaxedIncome;
    const monthlyGains = Math.max(0, state.realizedGains - this.lastTaxedGains);
    this.lastTaxedIncome = state.totalIncome;
    this.lastTaxedGains = state.realizedGains;

    const taxableIncome = monthlyIncome + monthlyGains;
    if (taxableIncome <= 0) return;

    // Apply progressive brackets
    let remaining = taxableIncome;
    for (const bracket of input.taxBrackets) {
      if (remaining <= 0) break;
      const bracketWidth = Math.max(0, bracket.ceiling - bracket.floor);
      const taxableInBracket = Math.min(remaining, bracketWidth);
      this.taxDue += taxableInBracket * bracket.rate;
      remaining -= taxableInBracket;
    }
  }

  apply(day: number, state: DayState, _input: SimulationInput): void {
    if (this.taxDue > 0) {
      state.balance -= this.taxDue;
      state.taxesPaid += this.taxDue;
    }
  }
}
