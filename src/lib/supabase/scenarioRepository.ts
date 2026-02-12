import type { DaySnapshot, SimulationInput, SimulationSummary } from '@/lib/engine/types';

export interface ScenarioRecord {
  id: string;
  userId: string;
  name: string;
  input: SimulationInput;
  summary: SimulationSummary;
  weeklySnapshots: DaySnapshot[];
  createdAt: string;
  updatedAt: string;
  parentScenarioId: string | null;
  branchFromDay: number | null;
}

export interface SaveScenarioPayload {
  userId: string;
  name: string;
  input: SimulationInput;
  summary: SimulationSummary;
  weeklySnapshots: DaySnapshot[];
  parentScenarioId?: string | null;
  branchFromDay?: number | null;
}

export interface LoadScenarioPayload {
  userId: string;
  scenarioId: string;
}

export interface ScenarioStore {
  save(payload: SaveScenarioPayload): Promise<ScenarioRecord>;
  list(userId: string): Promise<ScenarioRecord[]>;
  load(payload: LoadScenarioPayload): Promise<ScenarioRecord | null>;
}

function downsampleToWeekly(snapshots: DaySnapshot[]): DaySnapshot[] {
  return snapshots.filter((snapshot) => snapshot.day % 7 === 0);
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class InMemoryScenarioStore implements ScenarioStore {
  private scenarios: ScenarioRecord[] = [];

  async save(payload: SaveScenarioPayload): Promise<ScenarioRecord> {
    const now = new Date().toISOString();
    const row: ScenarioRecord = {
      id: createId(),
      userId: payload.userId,
      name: payload.name,
      input: payload.input,
      summary: payload.summary,
      weeklySnapshots: downsampleToWeekly(payload.weeklySnapshots),
      createdAt: now,
      updatedAt: now,
      parentScenarioId: payload.parentScenarioId ?? null,
      branchFromDay: payload.branchFromDay ?? null,
    };

    this.scenarios.unshift(row);
    return row;
  }

  async list(userId: string): Promise<ScenarioRecord[]> {
    return this.scenarios.filter((scenario) => scenario.userId === userId);
  }

  async load(payload: LoadScenarioPayload): Promise<ScenarioRecord | null> {
    const scenario = this.scenarios.find((row) => row.id === payload.scenarioId);
    if (!scenario || scenario.userId !== payload.userId) return null;
    return scenario;
  }
}

interface SupabaseConfig {
  url: string;
  apiKey: string;
  authToken: string;
}

interface ScenarioRow {
  id: string;
  user_id: string;
  name: string;
  inputs_json: SimulationInput;
  results_summary_json: SimulationSummary;
  created_at: string;
  updated_at: string;
  parent_scenario_id: string | null;
  branch_from_day: number | null;
}

interface SnapshotRow {
  day_index: number;
  balance: number;
  nav: number;
  credit_score: number;
  balance_p5: number;
  balance_p95: number;
  nav_p5: number;
  nav_p95: number;
}

class SupabaseScenarioStore implements ScenarioStore {
  constructor(private readonly config: SupabaseConfig) {}

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.config.apiKey,
        Authorization: `Bearer ${this.config.authToken}`,
        Prefer: 'return=representation',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${message}`);
    }

    return (await response.json()) as T;
  }

  private static toScenarioRecord(row: ScenarioRow, snapshots: SnapshotRow[]): ScenarioRecord {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      input: row.inputs_json,
      summary: row.results_summary_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      parentScenarioId: row.parent_scenario_id,
      branchFromDay: row.branch_from_day,
      weeklySnapshots: snapshots.map((snapshot) => ({
        day: snapshot.day_index,
        balance: snapshot.balance,
        nav: snapshot.nav,
        creditScore: snapshot.credit_score,
        balanceP5: snapshot.balance_p5,
        balanceP95: snapshot.balance_p95,
        navP5: snapshot.nav_p5,
        navP95: snapshot.nav_p95,
      })),
    };
  }

  async save(payload: SaveScenarioPayload): Promise<ScenarioRecord> {
    const scenarios = await this.request<ScenarioRow[]>('scenarios', {
      method: 'POST',
      body: JSON.stringify([
        {
          user_id: payload.userId,
          name: payload.name,
          inputs_json: payload.input,
          results_summary_json: payload.summary,
          parent_scenario_id: payload.parentScenarioId ?? null,
          branch_from_day: payload.branchFromDay ?? null,
        },
      ]),
    });

    const scenario = scenarios[0];
    const weekly = downsampleToWeekly(payload.weeklySnapshots);

    if (weekly.length > 0) {
      await this.request<SnapshotRow[]>('scenario_weekly_snapshots', {
        method: 'POST',
        body: JSON.stringify(
          weekly.map((snapshot) => ({
            scenario_id: scenario.id,
            day_index: snapshot.day,
            balance: snapshot.balance,
            nav: snapshot.nav,
            credit_score: snapshot.creditScore,
            balance_p5: snapshot.balanceP5,
            balance_p95: snapshot.balanceP95,
            nav_p5: snapshot.navP5,
            nav_p95: snapshot.navP95,
          })),
        ),
      });
    }

    return {
      id: scenario.id,
      userId: scenario.user_id,
      name: scenario.name,
      input: scenario.inputs_json,
      summary: scenario.results_summary_json,
      createdAt: scenario.created_at,
      updatedAt: scenario.updated_at,
      parentScenarioId: scenario.parent_scenario_id,
      branchFromDay: scenario.branch_from_day,
      weeklySnapshots: weekly,
    };
  }

  async list(userId: string): Promise<ScenarioRecord[]> {
    const rows = await this.request<ScenarioRow[]>(
      `scenarios?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
      { method: 'GET', headers: { Prefer: 'return=minimal' } },
    );

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      input: row.inputs_json,
      summary: row.results_summary_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      parentScenarioId: row.parent_scenario_id,
      branchFromDay: row.branch_from_day,
      weeklySnapshots: [],
    }));
  }

  async load(payload: LoadScenarioPayload): Promise<ScenarioRecord | null> {
    const rows = await this.request<ScenarioRow[]>(
      `scenarios?id=eq.${encodeURIComponent(payload.scenarioId)}&user_id=eq.${encodeURIComponent(payload.userId)}&limit=1`,
      { method: 'GET', headers: { Prefer: 'return=minimal' } },
    );

    const scenario = rows[0];
    if (!scenario) return null;

    const snapshots = await this.request<SnapshotRow[]>(
      `scenario_weekly_snapshots?scenario_id=eq.${encodeURIComponent(scenario.id)}&order=day_index.asc`,
      { method: 'GET', headers: { Prefer: 'return=minimal' } },
    );

    return SupabaseScenarioStore.toScenarioRecord(scenario, snapshots);
  }
}

let memoryStoreSingleton: InMemoryScenarioStore | null = null;

function isNonProduction(env: Record<string, string | undefined>): boolean {
  return env.NODE_ENV !== 'production';
}

export function createScenarioStore(env: Record<string, string | undefined> = process.env): ScenarioStore {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const userAccessToken = env.FUTURE_WALLET_SUPABASE_ACCESS_TOKEN;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const allowServiceRoleFallback =
    isNonProduction(env) && env.FUTURE_WALLET_ALLOW_SERVICE_ROLE_SCENARIO_STORE === 'true';

  if (url && anonKey && userAccessToken) {
    return new SupabaseScenarioStore({
      url,
      apiKey: anonKey,
      authToken: userAccessToken,
    });
  }

  if (url && serviceRoleKey && allowServiceRoleFallback) {
    return new SupabaseScenarioStore({
      url,
      apiKey: serviceRoleKey,
      authToken: serviceRoleKey,
    });
  }

  if (!memoryStoreSingleton) {
    memoryStoreSingleton = new InMemoryScenarioStore();
  }

  return memoryStoreSingleton;
}

export class ScenarioRepository {
  constructor(private readonly store: ScenarioStore = createScenarioStore()) {}

  async saveScenario(payload: SaveScenarioPayload): Promise<ScenarioRecord> {
    return this.store.save(payload);
  }

  async listScenarios(userId: string): Promise<ScenarioRecord[]> {
    return this.store.list(userId);
  }

  async loadScenarioById(payload: LoadScenarioPayload): Promise<ScenarioRecord | null> {
    return this.store.load(payload);
  }
}