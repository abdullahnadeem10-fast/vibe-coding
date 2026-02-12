// ──────────────────────────────────────────────
// Income DAG node
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput } from '../types';
import { convertCurrency } from './fx';

export class IncomeNode implements DAGNode {
  id = 'income';
  dependencies: string[] = [];

  private dailyTotal = 0;

  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void {
    this.dailyTotal = 0;
    for (const inc of input.incomes) {
      // Monthly income: arrives on the specified dayOfMonth
      // Convert day number to day-of-month (1-indexed)
      const dayInMonth = ((day % 30) + 1);
      if (dayInMonth === inc.dayOfMonth || inc.dayOfMonth === 0) {
        // If dayOfMonth is 0, distribute daily (monthlyAmount / 30)
        if (inc.dayOfMonth === 0) {
          this.dailyTotal += convertCurrency(
            inc.monthlyAmount / 30,
            inc.currency,
            input.baseCurrency,
            state.fxRates,
          );
        } else {
          this.dailyTotal += convertCurrency(
            inc.monthlyAmount,
            inc.currency,
            input.baseCurrency,
            state.fxRates,
          );
        }
      }
    }
  }

  apply(day: number, state: DayState, _input: SimulationInput): void {
    state.balance += this.dailyTotal;
    state.totalIncome += this.dailyTotal;
  }
}
