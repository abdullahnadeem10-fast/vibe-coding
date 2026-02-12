# Future Wallet

Deterministic financial projection engine and UI built with Next.js 14 + TypeScript.

## MVP Status (Bare Minimum)

The current engine satisfies the core TASK.md requirements for:

- Determinism and daily simulation horizon
- DAG dependency resolution with cycle protection
- FX transaction-time realization
- Asset liquidation under deficit with constraints
- Tax handling on realized gains
- Branching/counterfactual simulation support
- Output packet metrics: balance bands (Exp/P5/P95), collapse risk/timing, vibe, credit score, RSI, NAV, liquidity ratio

## Requirement-to-Test Coverage

- Determinism: `tests/engine/determinism.test.ts`
- DAG integrity: `tests/engine/dag.test.ts`
- Daily horizon and output shape/perf: `tests/engine/horizon.test.ts`
- FX realization: `tests/engine/fx-realization.test.ts`
- Liquidation behavior: `tests/engine/liquidation.test.ts`
- Realized-gains taxation: `tests/engine/tax-realized-gains.test.ts`
- Branching/counterfactual behavior: `tests/engine/counterfactual.test.ts`

## Run

- Dev server: `npm run dev`
- Focused compliance tests:
	- `npm test -- tests/engine/determinism.test.ts tests/engine/dag.test.ts tests/engine/fx-realization.test.ts tests/engine/liquidation.test.ts tests/engine/tax-realized-gains.test.ts tests/engine/counterfactual.test.ts tests/engine/horizon.test.ts`
- Full suite: `npm test`
