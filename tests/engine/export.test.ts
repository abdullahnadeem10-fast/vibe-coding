import { describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '../../src/lib/demo/profile';
import { simulate } from '../../src/lib/engine/simulate';
import { toScenarioCsv } from '../../src/lib/export/toCsv';
import { toScenarioJson } from '../../src/lib/export/toJson';

describe('Export helpers', () => {
  it('exports deterministic CSV with header and rows', () => {
    const result = simulate({ ...DEMO_PROFILE, horizonDays: 7 });
    const csv = toScenarioCsv(result, 'Test Scenario');

    const lines = csv.trim().split('\n');
    expect(lines[0]).toContain('scenarioName,day,balance');
    expect(lines.length).toBeGreaterThan(2);
  });

  it('exports deterministic JSON including summary and snapshots', () => {
    const result = simulate({ ...DEMO_PROFILE, horizonDays: 7 });
    const json = toScenarioJson(result, 'Test Scenario');
    const parsed = JSON.parse(json) as {
      scenarioName: string;
      summary: { finalBalance: number };
      weeklySnapshots: unknown[];
    };

    expect(parsed.scenarioName).toBe('Test Scenario');
    expect(typeof parsed.summary.finalBalance).toBe('number');
    expect(parsed.weeklySnapshots.length).toBeGreaterThan(0);
  });
});
