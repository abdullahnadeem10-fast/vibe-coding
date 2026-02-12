// ──────────────────────────────────────────────
// Barrel export for the engine
// ──────────────────────────────────────────────

export * from './types';
export * from './graph';
export * from './simulate';
export { IncomeNode } from './modules/income';
export { ExpenseNode } from './modules/expense';
export { DebtNode } from './modules/debt';
export { AssetNode } from './modules/asset';
export { TaxNode } from './modules/tax';
export { FXNode, getDeterministicFXRates, convertToUSD, convertCurrency } from './modules/fx';
export { ShockNode } from './modules/shocks';
export { MetricsNode, computeVibeTier, computeRSI } from './modules/metrics';
