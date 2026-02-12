import { headers } from 'next/headers';
import { DEMO_PROFILE } from '@/lib/demo/profile';
import { simulate } from '@/lib/engine/simulate';
import type { SimulationInput } from '@/lib/engine/types';
import { resolveAuthenticatedUserId } from '@/lib/auth/clerk';
import { ScenarioRepository, type ScenarioRecord } from '@/lib/supabase/scenarioRepository';
import { createShareTokenStore } from '@/lib/shareTokens/store';

const repository = new ScenarioRepository();
const shareTokenStore = createShareTokenStore();

export async function resolveCurrentUserId(): Promise<string | null> {
  const headerStore = headers();
  return resolveAuthenticatedUserId(headerStore, process.env);
}

export async function listCurrentUserScenarios(): Promise<ScenarioRecord[]> {
  const userId = await resolveCurrentUserId();
  if (!userId) return [];

  return repository.listScenarios(userId);
}

export async function loadCurrentUserScenarioById(scenarioId: string): Promise<ScenarioRecord | null> {
  const userId = await resolveCurrentUserId();
  if (!userId) return null;

  return repository.loadScenarioById({ userId, scenarioId });
}

export async function saveDemoScenarioForCurrentUser(): Promise<ScenarioRecord | null> {
  const userId = await resolveCurrentUserId();
  if (!userId) return null;

  const result = simulate(DEMO_PROFILE);

  return repository.saveScenario({
    userId,
    name: `${DEMO_PROFILE.name} — ${new Date().toISOString().slice(0, 10)}`,
    input: DEMO_PROFILE,
    summary: result.summary,
    weeklySnapshots: result.weeklySnapshots,
  });
}

export async function createScenarioForCurrentUser(
  input: SimulationInput,
  name?: string,
): Promise<ScenarioRecord | null> {
  const userId = await resolveCurrentUserId();
  if (!userId) return null;

  const result = simulate(input);

  return repository.saveScenario({
    userId,
    name: name ?? input.name,
    input,
    summary: result.summary,
    weeklySnapshots: result.weeklySnapshots,
  });
}

export async function createBranchedScenarioForCurrentUser(payload: {
  parentScenarioId: string;
  branchFromDay: number;
  name?: string;
}): Promise<ScenarioRecord | null> {
  const userId = await resolveCurrentUserId();
  if (!userId) return null;

  const parent = await repository.loadScenarioById({ userId, scenarioId: payload.parentScenarioId });
  if (!parent) return null;

  const branchInput: SimulationInput = {
    ...parent.input,
    name: payload.name ?? `${parent.name} (Branch D${payload.branchFromDay})`,
    startingCash:
      parent.weeklySnapshots.find((snapshot) => snapshot.day === payload.branchFromDay)?.balance ??
      parent.summary.finalBalance,
  };

  const result = simulate(branchInput);

  return repository.saveScenario({
    userId,
    name: branchInput.name,
    input: branchInput,
    summary: result.summary,
    weeklySnapshots: result.weeklySnapshots,
    parentScenarioId: parent.id,
    branchFromDay: payload.branchFromDay,
  });
}

export async function createShareTokenForCurrentUser(scenarioId: string): Promise<string | null> {
  const userId = await resolveCurrentUserId();
  if (!userId) return null;

  const scenario = await repository.loadScenarioById({ userId, scenarioId });
  if (!scenario) return null;

  return shareTokenStore.create({ userId, scenarioId: scenario.id });
}

export async function loadSharedScenarioByToken(token: string): Promise<ScenarioRecord | null> {
  const resolved = await shareTokenStore.resolve({ token });
  if (!resolved) return null;

  return repository.loadScenarioById({
    userId: resolved.userId,
    scenarioId: resolved.scenarioId,
  });
}