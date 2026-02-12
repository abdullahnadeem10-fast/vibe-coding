import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Create your first scenario with a minimal guided flow.
        </p>
      </header>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Step 1: Basics</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Pick a horizon, cash baseline, and save your scenario.
        </p>
        <Link
          href="/scenario/new"
          className="inline-flex px-5 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90"
        >
          Continue to Scenario Builder
        </Link>
      </div>
    </main>
  );
}
