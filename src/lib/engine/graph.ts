// ──────────────────────────────────────────────
// DAG node interfaces + topological sort
// Pure module — no side effects, no React/DB.
// ──────────────────────────────────────────────

import type { AssetLot, DaySnapshot, FXRates, SimulationInput, SimulationRuntimeOptions } from './types';

/** Mutable state accumulator for a single day */
export interface DayState {
  day: number;
  balance: number;
  assets: Map<string, number>; // asset id → current value
  debts: Map<string, number>;  // debt id → current principal
  assetLots: Map<string, AssetLot[]>; // asset id → FIFO lots
  fxRates: FXRates;
  creditScore: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebtPayments: number;
  missedPayments: number;
  realizedGains: number;
  taxesPaid: number;
  shockImpact: number;
}

/**
 * A node in the financial DAG.
 * Each node declares its dependencies and exposes prepare/apply.
 */
export interface DAGNode {
  /** Unique node identifier */
  id: string;
  /** IDs of nodes that must execute before this one */
  dependencies: string[];
  /**
   * Prepare step — read state and compute intermediate values.
   * Must NOT mutate state.
   */
  prepare(day: number, state: Readonly<DayState>, input: SimulationInput): void;
  /**
   * Apply step — mutate state with the computed values.
   */
  apply(day: number, state: DayState, input: SimulationInput): void;
}

/**
 * Topologically sort DAG nodes using Kahn's algorithm.
 * Throws if a cycle is detected.
 * Returns nodes in valid execution order.
 */
export function topologicalSort(nodes: DAGNode[]): DAGNode[] {
  const nodeMap = new Map<string, DAGNode>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize
  for (const node of nodes) {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  // Build edges
  for (const node of nodes) {
    for (const dep of node.dependencies) {
      if (!nodeMap.has(dep)) {
        throw new Error(`DAG error: node "${node.id}" depends on unknown node "${dep}"`);
      }
      adjacency.get(dep)!.push(node.id);
      inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  // Sort queue for deterministic ordering when in-degrees are equal
  queue.sort();

  const sorted: DAGNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(nodeMap.get(id)!);

    for (const neighbor of adjacency.get(id)!) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        // Insert in sorted position for determinism
        const insertIdx = queue.findIndex(q => q > neighbor);
        if (insertIdx === -1) {
          queue.push(neighbor);
        } else {
          queue.splice(insertIdx, 0, neighbor);
        }
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error('DAG error: cycle detected in financial component graph');
  }

  return sorted;
}

/** Create a fresh DayState for day 0 from inputs */
export function createInitialState(
  input: SimulationInput,
  runtimeOptions?: SimulationRuntimeOptions,
): DayState {
  const assets = new Map<string, number>();
  const assetLots = new Map<string, AssetLot[]>();
  for (const a of input.assets) {
    assets.set(a.id, a.value);

    const overriddenLots = runtimeOptions?.initialAssetLots?.[a.id];
    if (overriddenLots && overriddenLots.length > 0) {
      assetLots.set(
        a.id,
        overriddenLots.map((lot) => ({ costBasis: lot.costBasis, value: lot.value })),
      );
    } else {
      assetLots.set(a.id, [{ costBasis: a.value, value: a.value }]);
    }
  }

  const debts = new Map<string, number>();
  for (const d of input.debts) {
    debts.set(d.id, d.principal);
  }

  return {
    day: 0,
    balance: input.startingCash,
    assets,
    debts,
    assetLots,
    fxRates: input.fx.baseRates,
    creditScore: 650, // starting credit score
    totalIncome: 0,
    totalExpenses: 0,
    totalDebtPayments: 0,
    missedPayments: 0,
    realizedGains: 0,
    taxesPaid: 0,
    shockImpact: 0,
  };
}

/** Deep-copy a DayState (copy-on-write pattern) */
export function cloneState(state: DayState): DayState {
  return {
    ...state,
    assets: new Map(state.assets),
    debts: new Map(state.debts),
    assetLots: new Map(
      Array.from(state.assetLots.entries()).map(([assetId, lots]) => [
        assetId,
        lots.map((lot) => ({ costBasis: lot.costBasis, value: lot.value })),
      ]),
    ),
  };
}

/** Convert DayState to a DaySnapshot for output */
export function stateToSnapshot(
  state: DayState,
  balanceP5: number,
  balanceP95: number,
  navP5: number,
  navP95: number,
): DaySnapshot {
  let nav = state.balance;
  for (const v of state.assets.values()) nav += v;
  for (const v of state.debts.values()) nav -= v;

  return {
    day: state.day,
    balance: state.balance,
    nav,
    creditScore: state.creditScore,
    balanceP5,
    balanceP95,
    navP5,
    navP95,
  };
}
