import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import SummaryPanel from '@/components/SummaryPanel';
import BalanceChart from '@/components/charts/BalanceChart';
import { createShareTokenForCurrentUser, loadCurrentUserScenarioById } from '@/lib/scenarios/service';
import { simulate } from '@/lib/engine/simulate';
import { toScenarioCsv } from '@/lib/export/toCsv';
import { toScenarioJson } from '@/lib/export/toJson';

export const dynamic = 'force-dynamic';

export default async function ScenarioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { shareToken?: string };
}) {
  const scenario = await loadCurrentUserScenarioById(params.id);

  if (!scenario) {
    notFound();
  }

  const replay = simulate(scenario.input);
  const csvDataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(toScenarioCsv(replay, scenario.name))}`;
  const jsonDataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(toScenarioJson(replay, scenario.name))}`;

  async function createShareAction() {
    'use server';

    const token = await createShareTokenForCurrentUser(params.id);
    if (!token) {
      redirect(`/scenario/${params.id}`);
    }

    redirect(`/scenario/${params.id}?shareToken=${token}`);
  }

  const shareUrl = searchParams.shareToken
    ? `/api/share/${searchParams.shareToken}`
    : null;

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{scenario.name}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Saved {new Date(scenario.createdAt).toLocaleString()} · {scenario.weeklySnapshots.length} weekly snapshots
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/scenario/${params.id}/insights`} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Insights</Link>
        <Link href={`/scenario/${params.id}/branch`} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Branch</Link>
        <Link href={`/scenario/${params.id}/compare`} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Compare</Link>
        <a href={csvDataUrl} download={`${scenario.name.replace(/\s+/g, '_')}.csv`} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Export CSV</a>
        <a href={jsonDataUrl} download={`${scenario.name.replace(/\s+/g, '_')}.json`} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Export JSON</a>
        <form action={createShareAction}>
          <button type="submit" className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:border-[var(--accent-green)]">Create Share Link</button>
        </form>
      </div>

      {shareUrl && (
        <div className="glass-card p-4 text-sm">
          Read-only share endpoint: <a href={shareUrl} className="underline">{shareUrl}</a>
        </div>
      )}

      <SummaryPanel summary={scenario.summary} computeTimeMs={0} />

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Balance Timeline</h2>
        <BalanceChart snapshots={scenario.weeklySnapshots} />
      </div>
    </main>
  );
}