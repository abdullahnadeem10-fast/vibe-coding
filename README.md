# Future Wallet

Deterministic financial simulation app built with **Next.js 14 + TypeScript**.

Future Wallet projects your finances with daily granularity, deterministic outputs, and scenario branching/compare workflows.

## Website

![Landing Page](https://github.com/user-attachments/assets/f2ba9ee4-0d1f-4b11-9298-ae1ed1ff0407)

![Dashboard](https://github.com/user-attachments/assets/5bb94997-3a91-444a-8bb4-975b256a9e03)

![Scenario Detail](https://github.com/user-attachments/assets/9178e930-141b-4046-b350-d890ed4ad64b)
## What It Does

- Runs deterministic daily projections for up to 1,825 days (5 years)
- Uses a DAG execution model for income, expense, debt, asset, tax, FX, shocks, and metrics modules
- Produces Expected/P5/P95 balance and NAV series without Monte Carlo randomness
- Supports branching and counterfactual analysis from existing scenarios
- Includes share-token endpoint and CSV/JSON export utilities

## Current Product Surface

- Landing page and app shell
- Dashboard with save/load flows
- Scenario detail with summary + timeline chart
- Insights, Branch, and Compare routes
- Read-only share endpoint: `GET /api/share/[token]`

## Architecture (Pure Core, Impure Shell)

- `src/lib/engine/*` — pure deterministic simulation core
- `src/lib/worker/sim.worker.ts` — worker offloads simulation from UI thread
- `src/app/*` — Next.js routes and UI
- `src/lib/supabase/*` — persistence adapter (Supabase + in-memory fallback)
- `src/lib/auth/*` — Clerk auth helpers with non-production fallback behavior

## Quick Start (Local First)

### 1) Install dependencies

```bash
npm install
```

### 2) Start dev server

```bash
npm run dev
```

### 3) Optional checks

```bash
npm run lint
npm run test
```

## Environment Variables

You can run locally with fallback behavior, then add cloud services.

### Auth (Clerk)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `FUTURE_WALLET_DEV_USER_ID` (optional dev fallback)

If Clerk keys are missing and `NODE_ENV` is not production, a development fallback user is used.

### Persistence (Supabase)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FUTURE_WALLET_SUPABASE_ACCESS_TOKEN`

Optional non-production fallback:

- `SUPABASE_SERVICE_ROLE_KEY`
- `FUTURE_WALLET_ALLOW_SERVICE_ROLE_SCENARIO_STORE=true`

If these variables are absent, the app falls back to an in-memory scenario store.

## Testing

- Unit/integration tests run with Vitest: `npm run test`
- Watch mode: `npm run test:watch`
- Engine tests cover determinism, DAG behavior, horizon, FX, liquidation, taxes, counterfactuals, performance, and snapshots
- E2E specs exist in `tests/e2e/` but are currently scaffolded/planned (runner wiring pending)

## Project Structure

```text
future-wallet/
├─ src/app/                    # Next.js routes and UI
├─ src/lib/engine/             # Deterministic simulation core
├─ src/lib/worker/             # Web Worker entry
├─ src/lib/supabase/           # Persistence logic
├─ src/lib/auth/               # Auth helpers
├─ tests/                      # Unit + integration + scaffolded e2e
├─ design-variants/            # Variant pages and tests
└─ README.md
```

## Design Variants

Short-form variant experiments are available under:

- `design-variants/`
- `src/design-variants/`

## Notes

- Determinism is a hard requirement: same inputs must produce the same outputs.
- Simulation runs client-side via Web Worker; server responsibilities are persistence and share-token reads.
