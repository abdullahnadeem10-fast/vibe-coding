// ──────────────────────────────────────────────
// Main simulation loop — daily DAG execution
// Pure, deterministic. No React/DB imports.
// ──────────────────────────────────────────────

import type {
  CounterfactualResult,
  SimulationInput,
  SimulationResult,
  SimulationRuntimeOptions,
  SimulationSummary,
  DaySnapshot,
} from './types';
import {
  topologicalSort,
  createInitialState,
  cloneState,
  stateToSnapshot,
  type DAGNode,
  type DayState,
} from './graph';
import { IncomeNode } from './modules/income';
import { ExpenseNode } from './modules/expense';
import { DebtNode } from './modules/debt';
import { AssetNode } from './modules/asset';
import { TaxNode } from './modules/tax';
import { FXNode } from './modules/fx';
import { ShockNode } from './modules/shocks';
import { MetricsNode, computeVibeTier, computeRSI } from './modules/metrics';

/**
 * Compute deterministic P5/P95 quantile bands using analytical approximation.
 * Uses a lognormal-like spread based on cumulative volatility.
 */
function computeQuantileBands(
  expectedValue: number,
  day: number,
  annualVolatility: number,
): { p5: number; p95: number } {
  if (day === 0 || annualVolatility === 0) {
    return { p5: expectedValue, p95: expectedValue };
  }

  // Time-scaled volatility (sqrt of time for diffusion)
  const timeYears = day / 365;
  const sigma = annualVolatility * Math.sqrt(timeYears);

  // Z-scores for 5th and 95th percentiles
  const z5 = -1.645;
  const z95 = 1.645;

  // Lognormal-like approximation
  const p5 = expectedValue * Math.exp(z5 * sigma - 0.5 * sigma * sigma);
  const p95 = expectedValue * Math.exp(z95 * sigma - 0.5 * sigma * sigma);

  return { p5, p95 };
}

/**
 * Build all DAG nodes from the input configuration.
 */
function buildNodes(runtimeOptions?: SimulationRuntimeOptions): {
  nodes: DAGNode[];
  shockNode: ShockNode;
} {
  const incomeNode = new IncomeNode();
  const expenseNode = new ExpenseNode();
  const debtNode = new DebtNode();
  const assetNode = new AssetNode(runtimeOptions);
  const taxNode = new TaxNode();
  const fxNode = new FXNode(runtimeOptions);
  const shockNode = new ShockNode();
  const metricsNode = new MetricsNode();

  return {
    nodes: [fxNode, incomeNode, expenseNode, debtNode, assetNode, taxNode, shockNode, metricsNode],
    shockNode,
  };
}

/**
 * Run a full deterministic simulation.
 *
 * @param input   Validated simulation configuration
 * @param onProgress  Optional callback for progress reporting (day, totalDays)
 * @returns Complete simulation result
 */
export function simulate(
  input: SimulationInput,
  onProgress?: (day: number, totalDays: number) => void,
  runtimeOptions?: SimulationRuntimeOptions,
): SimulationResult {
  const startTime = performance.now();

  // Build and sort DAG
  const { nodes, shockNode } = buildNodes(runtimeOptions);
  const sortedNodes = topologicalSort(nodes);

  // Initialize state
  let state = createInitialState(input, runtimeOptions);

  const dailySnapshots: DaySnapshot[] = [];
  const weeklySnapshots: DaySnapshot[] = [];

  // Track deficit streak
  let deficitDays = 0;
  let consecutiveDeficit = 0;
  let maxDeficitStreak = 0;

  // Composite volatility for quantile bands (weighted average of asset volatilities)
  const compositeVolatility = input.assets.length > 0
    ? input.assets.reduce((sum, a) => sum + a.volatility * a.value, 0) /
      Math.max(1, input.assets.reduce((sum, a) => sum + a.value, 0))
    : 0.1; // default 10% if no assets

  // ── Daily loop ──
  for (let day = 0; day <= input.horizonDays; day++) {
    // Copy-on-write: clone state for this day
    state = cloneState(state);
    state.day = day;

    // Reset daily accumulators (keep cumulative totals)
    // Execute DAG nodes in topological order
    for (const node of sortedNodes) {
      node.prepare(day, state, input);
      node.apply(day, state, input);
    }

    // Track deficit
    if (state.balance < 0) {
      deficitDays++;
      consecutiveDeficit++;
      maxDeficitStreak = Math.max(maxDeficitStreak, consecutiveDeficit);
    } else {
      consecutiveDeficit = 0;
    }

    // Compute quantile bands
    const balanceBands = computeQuantileBands(state.balance, day, compositeVolatility);

    let nav = state.balance;
    for (const v of state.assets.values()) nav += v;
    for (const v of state.debts.values()) nav -= v;
    const navBands = computeQuantileBands(nav, day, compositeVolatility);

    // Create snapshot
    const snapshot = stateToSnapshot(
      state,
      balanceBands.p5,
      balanceBands.p95,
      navBands.p5,
      navBands.p95,
    );

    dailySnapshots.push(snapshot);

    // Weekly snapshot (every 7 days)
    if (day % 7 === 0) {
      weeklySnapshots.push(snapshot);
    }

    // Report progress every 50 days
    if (onProgress && day % 50 === 0) {
      onProgress(day, input.horizonDays);
    }
  }

  // ── Compute summary ──
  const finalSnapshot = dailySnapshots[dailySnapshots.length - 1];

  let totalAssets = 0;
  for (const v of state.assets.values()) totalAssets += v;
  let totalDebts = 0;
  for (const v of state.debts.values()) totalDebts += v;
  const nav = state.balance + totalAssets - totalDebts;

  const liquidityRatio = totalAssets > 0
    ? state.balance / (state.balance + totalAssets)
    : state.balance > 0 ? 1 : 0;

  const debtServiceRatio = state.totalIncome > 0
    ? state.totalDebtPayments / state.totalIncome
    : 0;

  const collapseProbability = computeCollapseProbability(
    liquidityRatio,
    debtServiceRatio,
    consecutiveDeficit,
    state.creditScore,
  );

  const vibeTier = computeVibeTier(
    state.balance,
    nav,
    state.creditScore,
    deficitDays,
    liquidityRatio,
  );

  const rsi = computeRSI(liquidityRatio, debtServiceRatio, state.creditScore, deficitDays);
  const shockClusteringDensity = computeShockClusteringDensity(
    shockNode.firedShocks.length,
    input.horizonDays,
  );
  const shockIntensityAverage = computeShockIntensityAverage(shockNode.firedShocks);

  // Recovery slope: average rate of balance increase after deficit periods
  const recoverySlope = computeRecoverySlope(dailySnapshots);

  const collapseDay = maxDeficitStreak >= 90
    ? dailySnapshots.findIndex(s => s.balance < 0)
    : null;

  const summary: SimulationSummary = {
    finalBalance: finalSnapshot.balance,
    finalBalanceP5: finalSnapshot.balanceP5,
    finalBalanceP95: finalSnapshot.balanceP95,
    finalNAV: finalSnapshot.nav,
    finalNAVP5: finalSnapshot.navP5,
    finalNAVP95: finalSnapshot.navP95,
    finalCreditScore: state.creditScore,
    collapseProbability,
    collapseDay,
    shockResilienceIndex: rsi,
    shockClusteringDensity,
    shockIntensityAverage,
    recoverySlope,
    vibeTier,
    liquidityRatio,
    deficitDays,
    taxesPaid: state.taxesPaid,
    realizedGains: state.realizedGains,
    assetEndingValues: Object.fromEntries(state.assets.entries()),
  };

  const computeTimeMs = performance.now() - startTime;

  return {
    input,
    summary,
    dailySnapshots,
    weeklySnapshots,
    firedShocks: shockNode.firedShocks,
    computeTimeMs,
  };
}

export function simulateWithCounterfactual(
  input: SimulationInput,
  onProgress?: (day: number, totalDays: number) => void,
  runtimeOptions?: SimulationRuntimeOptions,
): CounterfactualResult {
  const withShocks = simulate(input, onProgress, runtimeOptions);
  const withoutShocks = simulate(
    {
      ...input,
      shocks: input.shocks.map((shock) => ({ ...shock, enabled: false })),
    },
    undefined,
    runtimeOptions,
  );

  return {
    withShocks,
    withoutShocks,
    insights: {
      balanceDeltaNoShocksVsActual:
        withoutShocks.summary.finalBalance - withShocks.summary.finalBalance,
      navDeltaNoShocksVsActual:
        withoutShocks.summary.finalNAV - withShocks.summary.finalNAV,
    },
  };
}

/**
 * Heuristic collapse probability using logistic function
 * (Option A from plan — deterministic risk index)
 */
function computeCollapseProbability(
  liquidityRatio: number,
  debtServiceRatio: number,
  deficitStreak: number,
  creditScore: number,
): number {
  // Risk factors (higher = riskier)
  const liquidityRisk = Math.max(0, 1 - liquidityRatio * 5);
  const debtRisk = Math.min(1, debtServiceRatio * 2);
  const deficitRisk = Math.min(1, deficitStreak / 90);
  const creditRisk = Math.max(0, (650 - creditScore) / 350);

  // Weighted combination
  const riskScore = 0.3 * liquidityRisk + 0.25 * debtRisk + 0.25 * deficitRisk + 0.2 * creditRisk;

  // Logistic function to map to [0, 1]
  return 1 / (1 + Math.exp(-10 * (riskScore - 0.5)));
}

/**
 * Compute average recovery slope after deficit periods
 */
function computeRecoverySlope(snapshots: DaySnapshot[]): number {
  let totalRecovery = 0;
  let recoveryPeriods = 0;

  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i - 1].balance < 0 && snapshots[i].balance > snapshots[i - 1].balance) {
      totalRecovery += snapshots[i].balance - snapshots[i - 1].balance;
      recoveryPeriods++;
    }
  }

  return recoveryPeriods > 0 ? totalRecovery / recoveryPeriods : 0;
}

function computeShockClusteringDensity(firedShockCount: number, horizonDays: number): number {
  const totalDays = Math.max(1, horizonDays + 1);
  return (firedShockCount / totalDays) * 30;
}

function computeShockIntensityAverage(
  firedShocks: { day: number; shockId: string; amount: number }[],
): number {
  if (firedShocks.length === 0) {
    return 0;
  }
  const totalAbsAmount = firedShocks.reduce((sum, shock) => sum + Math.abs(shock.amount), 0);
  return totalAbsAmount / firedShocks.length;
}
