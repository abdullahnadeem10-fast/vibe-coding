import type { SimulationResult } from '@/lib/engine/types';

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toScenarioCsv(result: SimulationResult, scenarioName: string): string {
  const header = [
    'scenarioName',
    'day',
    'balance',
    'balanceP5',
    'balanceP95',
    'nav',
    'navP5',
    'navP95',
    'creditScore',
  ].join(',');

  const rows = result.dailySnapshots.map((snapshot) => [
    escapeCsv(scenarioName),
    snapshot.day,
    snapshot.balance,
    snapshot.balanceP5,
    snapshot.balanceP95,
    snapshot.nav,
    snapshot.navP5,
    snapshot.navP95,
    snapshot.creditScore,
  ].join(','));

  return `${header}\n${rows.join('\n')}\n`;
}
