// ──────────────────────────────────────────────
// Expense DAG node
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput } from '../types';
import { convertCurrency } from './fx';

export class ExpenseNode implements DAGNode {
  id = 'expense';
  dependencies = ['income']; // expenses come after income

  private dailyTotal = 0;

  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void {
    this.dailyTotal = 0;
    for (const exp of input.expenses) {
      // Distribute monthly expense evenly across 30 days
      this.dailyTotal += convertCurrency(
        exp.monthlyAmount / 30,
        exp.currency,
        input.baseCurrency,
        state.fxRates,
      );
    }
  }

  apply(day: number, state: DayState, _input: SimulationInput): void {
    state.balance -= this.dailyTotal;
    state.totalExpenses += this.dailyTotal;
  }
}
