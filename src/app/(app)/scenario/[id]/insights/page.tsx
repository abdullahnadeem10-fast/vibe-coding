import { notFound } from 'next/navigation';
import { simulateWithCounterfactual } from '@/lib/engine/simulate';
import { loadCurrentUserScenarioById } from '@/lib/scenarios/service';

export default async function ScenarioInsightsPage({
  params,
}: {
  params: { id: string };
}) {
  const scenario = await loadCurrentUserScenarioById(params.id);
  if (!scenario) notFound();

  const counterfactual = simulateWithCounterfactual(scenario.input);

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-5xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Shock Insights</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{scenario.name}</p>
      </header>

      <div className="glass-card p-6 space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">No-shocks counterfactual delta</p>
        <p className="text-2xl font-bold text-[var(--accent-green)]">
          ${counterfactual.insights.balanceDeltaNoShocksVsActual.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Actual final balance: ${counterfactual.withShocks.summary.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          No-shocks final balance: ${counterfactual.withoutShocks.summary.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </main>
  );
}
