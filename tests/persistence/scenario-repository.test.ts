import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';
import { simulate } from '../../src/lib/engine/simulate';
import {
  createScenarioStore,
  InMemoryScenarioStore,
  ScenarioRepository,
} from '../../src/lib/supabase/scenarioRepository';

describe('ScenarioRepository', () => {
  it('saves scenario input, summary, and weekly snapshots', async () => {
    const store = new InMemoryScenarioStore();
    const repository = new ScenarioRepository(store);
    const result = simulate(DEMO_PROFILE);

    const saved = await repository.saveScenario({
      userId: 'user-1',
      name: DEMO_PROFILE.name,
      input: DEMO_PROFILE,
      summary: result.summary,
      weeklySnapshots: result.weeklySnapshots,
    });

    expect(saved.id.length).toBeGreaterThan(0);
    expect(saved.userId).toBe('user-1');
    expect(saved.name).toBe(DEMO_PROFILE.name);
    expect(saved.summary.finalBalance).toBe(result.summary.finalBalance);
    expect(saved.weeklySnapshots.length).toBe(result.weeklySnapshots.length);
    for (const snapshot of saved.weeklySnapshots) {
      expect(snapshot.day % 7).toBe(0);
    }
  });

  it('lists scenarios only for the requesting user', async () => {
    const store = new InMemoryScenarioStore();
    const repository = new ScenarioRepository(store);
    const result = simulate(DEMO_PROFILE);

    await repository.saveScenario({
      userId: 'user-a',
      name: 'A',
      input: DEMO_PROFILE,
      summary: result.summary,
      weeklySnapshots: result.weeklySnapshots,
    });
    await repository.saveScenario({
      userId: 'user-b',
      name: 'B',
      input: DEMO_PROFILE,
      summary: result.summary,
      weeklySnapshots: result.weeklySnapshots,
    });

    const userAScenarios = await repository.listScenarios('user-a');
    expect(userAScenarios).toHaveLength(1);
    expect(userAScenarios[0].name).toBe('A');
  });

  it('prevents loading another user scenario', async () => {
    const store = new InMemoryScenarioStore();
    const repository = new ScenarioRepository(store);
    const result = simulate(DEMO_PROFILE);

    const saved = await repository.saveScenario({
      userId: 'owner-1',
      name: 'Owned scenario',
      input: DEMO_PROFILE,
      summary: result.summary,
      weeklySnapshots: result.weeklySnapshots,
    });

    const denied = await repository.loadScenarioById({
      userId: 'attacker',
      scenarioId: saved.id,
    });

    expect(denied).toBeNull();
  });

  it('keeps local/test behavior with in-memory fallback when Supabase is not configured', () => {
    const store = createScenarioStore({ NODE_ENV: 'test' });
    expect(store).toBeInstanceOf(InMemoryScenarioStore);
  });

  it('does not default to service role store in production', () => {
    const store = createScenarioStore({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    });

    expect(store).toBeInstanceOf(InMemoryScenarioStore);
  });

  it('allows explicit service role fallback only in development', () => {
    const store = createScenarioStore({
      NODE_ENV: 'development',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      FUTURE_WALLET_ALLOW_SERVICE_ROLE_SCENARIO_STORE: 'true',
    });

    expect(store).not.toBeInstanceOf(InMemoryScenarioStore);
  });
});