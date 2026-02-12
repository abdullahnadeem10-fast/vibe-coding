// ──────────────────────────────────────────────
// Debt DAG node — interest accrual + min payments
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput } from '../types';
import { convertCurrency } from './fx';

export class DebtNode implements DAGNode {
  id = 'debt';
  dependencies = ['income', 'expense'];

  private payments = new Map<string, number>();
  private paymentInBase = new Map<string, number>();
  private missed = 0;

  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void {
    this.payments.clear();
    this.paymentInBase.clear();
    this.missed = 0;

    for (const debt of input.debts) {
      const currentPrincipal = state.debts.get(debt.id) ?? 0;
      if (currentPrincipal <= 0) continue;

      // Daily interest accrual
      const dailyRate = debt.apr / 365;
      const interest = currentPrincipal * dailyRate;

      // Min payment is monthly — pay on 1st of each pseudo-month
      const dayInMonth = ((day % 30) + 1);
      if (dayInMonth === 1) {
        const payment = Math.min(debt.minPayment, currentPrincipal + interest);
        const paymentBase = convertCurrency(
          payment,
          debt.currency,
          input.baseCurrency,
          state.fxRates,
        );
        if (state.balance >= paymentBase) {
          this.payments.set(debt.id, payment);
          this.paymentInBase.set(debt.id, paymentBase);
        } else {
          // Can't make payment
          this.missed += 1;
          this.payments.set(debt.id, 0);
          this.paymentInBase.set(debt.id, 0);
        }
      }

      // Always accrue interest
      this.payments.set(debt.id + '_interest', interest);
    }
  }

  apply(day: number, state: DayState, input: SimulationInput): void {
    for (const debt of input.debts) {
      const currentPrincipal = state.debts.get(debt.id) ?? 0;
      if (currentPrincipal <= 0) continue;

      // Add interest
      const interest = this.payments.get(debt.id + '_interest') ?? 0;
      let newPrincipal = currentPrincipal + interest;

      // Subtract payment
      const payment = this.payments.get(debt.id) ?? 0;
      if (payment > 0) {
        newPrincipal -= payment;
        const paymentBase = this.paymentInBase.get(debt.id) ?? 0;
        state.balance -= paymentBase;
        state.totalDebtPayments += paymentBase;
      }

      state.debts.set(debt.id, Math.max(0, newPrincipal));
    }

    state.missedPayments += this.missed;
  }
}
