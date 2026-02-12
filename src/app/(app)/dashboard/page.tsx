import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  listCurrentUserScenarios,
  resolveCurrentUserId,
  saveDemoScenarioForCurrentUser,
} from '@/lib/scenarios/service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await resolveCurrentUserId();
  const scenarios = await listCurrentUserScenarios();

  async function saveScenarioAction() {
    'use server';
    const saved = await saveDemoScenarioForCurrentUser();
    if (saved) {
      redirect(`/scenario/${saved.id}`);
    }
  }

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Save and reload deterministic simulation scenarios.
          </p>
        </div>
        <form action={saveScenarioAction}>
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="px-5 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] text-sm"
            >
              Onboarding
            </Link>
            <Link
              href="/scenario/new"
              className="px-5 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] text-sm"
            >
              New Scenario
            </Link>
            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90 transition"
            >
              Save Demo Scenario
            </button>
          </div>
        </form>
      </div>

      {!userId && (
        <div className="glass-card p-4 mb-6 border-[var(--accent-amber)]">
          Clerk is not configured. Set Clerk env vars or use development fallback headers.
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Saved Scenarios</h2>

        {scenarios.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">
            No saved scenarios yet. Use “Save Demo Scenario” to create your first one.
          </p>
        ) : (
          <ul className="space-y-3">
            {scenarios.map((scenario) => (
              <li
                key={scenario.id}
                className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Saved {new Date(scenario.createdAt).toLocaleString()} · Final balance ${' '}
                    {scenario.summary.finalBalance.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <Link
                  href={`/scenario/${scenario.id}`}
                  className="px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] text-sm"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}