import type { SimulationResult } from '@/lib/engine/types';

export function toScenarioJson(result: SimulationResult, scenarioName: string): string {
  return JSON.stringify(
    {
      scenarioName,
      generatedAt: new Date().toISOString(),
      summary: result.summary,
      weeklySnapshots: result.weeklySnapshots,
      firedShocks: result.firedShocks,
    },
    null,
    2,
  );
}
