// ──────────────────────────────────────────────
// Core types for the Future Wallet simulation engine
// All types are pure data — no React/DB imports.
// ──────────────────────────────────────────────

/** Supported currencies */
export type Currency = 'USD' | 'EUR' | 'PKR';

/** Exchange rates relative to USD */
export interface FXRates {
  EUR: number;
  PKR: number;
}

export interface AssetLot {
  costBasis: number;
  value: number;
}

/** FX configuration with volatility for analytical distribution */
export interface FXConfig {
  baseRates: FXRates;
  /** Annual volatility (σ) used for P5/P95 quantile bands */
  volatility: number;
}

/** Asset class identifiers */
export type AssetClass = 'cash' | 'savings' | 'index_fund' | 'real_estate' | 'crypto';

/** Single asset holding */
export interface Asset {
  id: string;
  name: string;
  class: AssetClass;
  value: number;
  currency: Currency;
  /** Expected annual return (e.g. 0.07 = 7%) */
  expectedReturn: number;
  /** Annual volatility for quantile bands */
  volatility: number;
  /** Sale penalty as fraction (e.g. 0.06 = 6%) */
  salePenalty: number;
  /** Liquidity delay in days (0 = liquid) */
  liquidityDelayDays: number;
  /** Whether the asset is locked / non-sellable */
  locked: boolean;
}

/** Single debt / liability */
export interface Debt {
  id: string;
  name: string;
  principal: number;
  currency: Currency;
  /** Annual Percentage Rate (e.g. 0.18 = 18%) */
  apr: number;
  /** Minimum monthly payment */
  minPayment: number;
  /** Consecutive missed payment count */
  missedPayments: number;
}

/** Income stream */
export interface IncomeStream {
  id: string;
  name: string;
  /** Monthly gross amount */
  monthlyAmount: number;
  currency: Currency;
  /** Optional: day-of-month the income arrives (1-28) */
  dayOfMonth: number;
}

/** Expense category */
export interface Expense {
  id: string;
  name: string;
  /** Monthly amount */
  monthlyAmount: number;
  currency: Currency;
  /** Whether the expense is essential (affects liquidation priority) */
  essential: boolean;
}

/** Progressive tax bracket */
export interface TaxBracket {
  /** Lower bound of taxable income for this bracket */
  floor: number;
  /** Upper bound (Infinity for the last bracket) */
  ceiling: number;
  /** Marginal rate (e.g. 0.22 = 22%) */
  rate: number;
}

/** Preset shock event */
export interface ShockPreset {
  id: string;
  name: string;
  /** Day on which the shock occurs */
  day: number;
  /** Monetary impact (negative = cost) */
  amount: number;
  currency: Currency;
  /** Whether this shock is enabled for the run */
  enabled: boolean;
  /** Severity multiplier (1.0 = normal) */
  severity: number;
}

/** Complete simulation input configuration */
export interface SimulationInput {
  /** Scenario name */
  name: string;
  /** Number of days to simulate (max 1825 = 5 years) */
  horizonDays: number;
  /** Base currency for reporting */
  baseCurrency: Currency;
  /** FX configuration */
  fx: FXConfig;
  /** Starting cash balance */
  startingCash: number;
  /** Income streams */
  incomes: IncomeStream[];
  /** Recurring expenses */
  expenses: Expense[];
  /** Debt / liabilities */
  debts: Debt[];
  /** Asset holdings */
  assets: Asset[];
  /** Progressive tax brackets */
  taxBrackets: TaxBracket[];
  /** Shock presets */
  shocks: ShockPreset[];
  /** Cash reserve ratio (fraction, e.g. 0.10 = 10%) for liquidation trigger */
  cashReserveRatio: number;
}

/** Per-day snapshot of financial state */
export interface DaySnapshot {
  day: number;
  balance: number;
  nav: number; // Net Asset Value
  creditScore: number;
  /** Quantile bands */
  balanceP5: number;
  balanceP95: number;
  navP5: number;
  navP95: number;
}

/** Vibe / pet tier */
export type VibeTier = 'Thriving' | 'Stable' | 'Stressed' | 'Crisis' | 'Collapse';

/** Simulation result summary */
export interface SimulationSummary {
  /** Final day balance (expected) */
  finalBalance: number;
  finalBalanceP5: number;
  finalBalanceP95: number;
  /** Final NAV */
  finalNAV: number;
  finalNAVP5: number;
  finalNAVP95: number;
  /** Final credit score */
  finalCreditScore: number;
  /** Collapse probability (heuristic risk index 0-1) */
  collapseProbability: number;
  /** Day of first collapse risk (if any) */
  collapseDay: number | null;
  /** Shock Resilience Index (0-100) */
  shockResilienceIndex: number;
  /** Average number of fired shocks per 30-day window */
  shockClusteringDensity: number;
  /** Mean absolute monetary magnitude of fired shocks */
  shockIntensityAverage: number;
  /** Recovery slope (balance restoration rate after deficit) */
  recoverySlope: number;
  /** Vibe / pet tier */
  vibeTier: VibeTier;
  /** Liquidity ratio at end */
  liquidityRatio: number;
  /** Total days in deficit */
  deficitDays: number;
  /** Total taxes paid across the run */
  taxesPaid: number;
  /** Total realized gains across the run */
  realizedGains: number;
  /** Ending asset values by asset id */
  assetEndingValues: Record<string, number>;
}

/** Full simulation output */
export interface SimulationResult {
  input: SimulationInput;
  summary: SimulationSummary;
  /** Daily snapshots (full resolution, kept in memory only) */
  dailySnapshots: DaySnapshot[];
  /** Weekly snapshots (for persistence — every 7th day) */
  weeklySnapshots: DaySnapshot[];
  /** Shock events that fired */
  firedShocks: { day: number; shockId: string; amount: number }[];
  /** Duration of the simulation in milliseconds */
  computeTimeMs: number;
}

export interface SimulationRuntimeOptions {
  fxRatesByDay?: Record<number, FXRates>;
  initialAssetLots?: Record<string, AssetLot[]>;
  liquidationOrder?: string[];
}

export interface CounterfactualInsights {
  balanceDeltaNoShocksVsActual: number;
  navDeltaNoShocksVsActual: number;
}

export interface CounterfactualResult {
  withShocks: SimulationResult;
  withoutShocks: SimulationResult;
  insights: CounterfactualInsights;
}

/** Messages from worker → main thread */
export type WorkerMessage =
  | { type: 'progress'; day: number; totalDays: number }
  | { type: 'result'; result: SimulationResult }
  | { type: 'counterfactual-result'; result: CounterfactualResult }
  | { type: 'error'; message: string };

/** Messages from main thread → worker */
export type MainMessage =
  | { type: 'run'; input: SimulationInput }
  | { type: 'run-counterfactual'; input: SimulationInput }
  | { type: 'cancel' };
