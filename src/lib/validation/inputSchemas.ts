// ──────────────────────────────────────────────
// Zod validation schemas for all simulation inputs
// ──────────────────────────────────────────────

import { z } from 'zod';

export const CurrencySchema = z.enum(['USD', 'EUR', 'PKR']);

export const FXRatesSchema = z.object({
  EUR: z.number().positive(),
  PKR: z.number().positive(),
});

export const FXConfigSchema = z.object({
  baseRates: FXRatesSchema,
  volatility: z.number().min(0).max(2),
});

export const AssetClassSchema = z.enum(['cash', 'savings', 'index_fund', 'real_estate', 'crypto']);

export const AssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  class: AssetClassSchema,
  value: z.number().min(0),
  currency: CurrencySchema,
  expectedReturn: z.number(),
  volatility: z.number().min(0),
  salePenalty: z.number().min(0).max(1),
  liquidityDelayDays: z.number().int().min(0),
  locked: z.boolean(),
});

export const DebtSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  principal: z.number().min(0),
  currency: CurrencySchema,
  apr: z.number().min(0),
  minPayment: z.number().min(0),
  missedPayments: z.number().int().min(0),
});

export const IncomeStreamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  monthlyAmount: z.number().min(0),
  currency: CurrencySchema,
  dayOfMonth: z.number().int().min(0).max(28),
});

export const ExpenseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  monthlyAmount: z.number().min(0),
  currency: CurrencySchema,
  essential: z.boolean(),
});

export const TaxBracketSchema = z.object({
  floor: z.number().min(0),
  ceiling: z.number().min(0),
  rate: z.number().min(0).max(1),
});

export const ShockPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  day: z.number().int().min(0),
  amount: z.number(),
  currency: CurrencySchema,
  enabled: z.boolean(),
  severity: z.number().min(0),
});

export const SimulationInputSchema = z.object({
  name: z.string().min(1).max(100),
  horizonDays: z.number().int().min(1).max(1825),
  baseCurrency: CurrencySchema,
  fx: FXConfigSchema,
  startingCash: z.number(),
  incomes: z.array(IncomeStreamSchema),
  expenses: z.array(ExpenseSchema),
  debts: z.array(DebtSchema),
  assets: z.array(AssetSchema),
  taxBrackets: z.array(TaxBracketSchema),
  shocks: z.array(ShockPresetSchema),
  cashReserveRatio: z.number().min(0).max(1),
});

export const DaySnapshotSchema = z.object({
  day: z.number().int().min(0),
  balance: z.number(),
  nav: z.number(),
  creditScore: z.number(),
  balanceP5: z.number(),
  balanceP95: z.number(),
  navP5: z.number(),
  navP95: z.number(),
});

export const SimulationSummarySchema = z.object({
  finalBalance: z.number(),
  finalBalanceP5: z.number(),
  finalBalanceP95: z.number(),
  finalNAV: z.number(),
  finalNAVP5: z.number(),
  finalNAVP95: z.number(),
  finalCreditScore: z.number(),
  collapseProbability: z.number(),
  collapseDay: z.number().nullable(),
  shockResilienceIndex: z.number(),
  recoverySlope: z.number(),
  vibeTier: z.enum(['Thriving', 'Stable', 'Stressed', 'Crisis', 'Collapse']),
  liquidityRatio: z.number(),
  deficitDays: z.number().int(),
});
