import { listCurrentUserScenarios, loadCurrentUserScenarioById } from '@/lib/scenarios/service';

export default async function CompareScenarioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ids?: string };
}) {
  const allScenarios = await listCurrentUserScenarios();
  const base = await loadCurrentUserScenarioById(params.id);

  if (!base) {
    return null;
  }

  const selectedIds = (searchParams.ids ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 2);

  const compared = await Promise.all(selectedIds.map((id) => loadCurrentUserScenarioById(id)));
  const scenarios = [base, ...compared.filter((scenario): scenario is NonNullable<typeof scenario> => Boolean(scenario))].slice(0, 3);

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-6xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Compare Scenarios</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Overlay up to 3 scenarios by final metrics.</p>
      </header>

      <div className="glass-card p-6 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              <th className="py-2 pr-4">Scenario</th>
              <th className="py-2 pr-4">Final Balance</th>
              <th className="py-2 pr-4">Final NAV</th>
              <th className="py-2 pr-4">Credit</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => (
              <tr key={scenario.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-4">{scenario.name}</td>
                <td className="py-2 pr-4">${scenario.summary.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="py-2 pr-4">${scenario.summary.finalNAV.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className="py-2 pr-4">{scenario.summary.finalCreditScore.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-card p-6">
        <p className="text-sm text-[var(--text-secondary)] mb-2">Add comparison IDs in query</p>
        <p className="text-sm">/scenario/{params.id}/compare?ids={allScenarios.filter((scenario) => scenario.id !== params.id).slice(0, 2).map((scenario) => scenario.id).join(',')}</p>
      </div>
    </main>
  );
}
