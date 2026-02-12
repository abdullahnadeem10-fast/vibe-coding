// ──────────────────────────────────────────────
// Metrics node — credit score, RSI, vibe/pet tier
// Runs last in DAG; computes derived metrics.
// ──────────────────────────────────────────────

import type { DAGNode, DayState } from '../graph';
import type { SimulationInput, VibeTier } from '../types';

/**
 * Credit score formula:
 * CS = base + f(debtRatio, punctuality, restructuring)
 * Range: 300–850
 */
function computeCreditScore(
  currentScore: number,
  debtRatio: number,
  missedPayments: number,
  day: number,
): number {
  // Gradual daily adjustment
  const punctualityPenalty = missedPayments * 5;
  const debtPenalty = Math.min(debtRatio * 100, 200);
  const ageBonus = Math.min(day * 0.01, 50); // credit history length bonus

  const newScore = currentScore - punctualityPenalty - debtPenalty + ageBonus + 0.5;
  return Math.max(300, Math.min(850, newScore));
}

/**
 * Determine vibe/pet tier from financial health indicators
 */
export function computeVibeTier(
  balance: number,
  nav: number,
  creditScore: number,
  deficitDays: number,
  liquidityRatio: number,
): VibeTier {
  if (deficitDays >= 90 || nav < 0) return 'Collapse';
  if (deficitDays >= 30 || creditScore < 400 || liquidityRatio < 0.05) return 'Crisis';
  if (deficitDays >= 7 || creditScore < 550 || liquidityRatio < 0.15) return 'Stressed';
  if (creditScore >= 700 && liquidityRatio >= 0.3 && balance > 0) return 'Thriving';
  return 'Stable';
}

/**
 * Shock Resilience Index (0–100):
 * Higher = more resilient to shocks
 */
export function computeRSI(
  liquidityRatio: number,
  debtServiceRatio: number,
  creditScore: number,
  deficitDays: number,
): number {
  const liquidityScore = Math.min(liquidityRatio * 100, 30); // max 30
  const debtScore = Math.max(0, 30 - debtServiceRatio * 50); // max 30
  const creditContrib = ((creditScore - 300) / 550) * 25; // max 25
  const stabilityScore = Math.max(0, 15 - deficitDays * 0.5); // max 15

  return Math.max(0, Math.min(100, liquidityScore + debtScore + creditContrib + stabilityScore));
}

export class MetricsNode implements DAGNode {
  id = 'metrics';
  dependencies = ['income', 'expense', 'debt', 'asset', 'shock'];

  prepare(_day: number, _state: Readonly<DayState>, _input: SimulationInput): void {
    // No preparation needed — metrics are computed in apply
  }

  apply(day: number, state: DayState, _input: SimulationInput): void {
    // Skip day 0 — use initial credit score as-is
    if (day === 0) return;

    // Compute NAV for ratios
    let totalAssets = 0;
    for (const v of state.assets.values()) totalAssets += v;
    let totalDebts = 0;
    for (const v of state.debts.values()) totalDebts += v;

    const nav = state.balance + totalAssets - totalDebts;
    const debtRatio = nav > 0 ? totalDebts / nav : 1;

    // Update credit score
    state.creditScore = computeCreditScore(
      state.creditScore,
      debtRatio,
      state.missedPayments,
      day,
    );
  }
}
