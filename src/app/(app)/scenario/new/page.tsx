import { redirect } from 'next/navigation';
import { DEMO_PROFILE } from '@/lib/demo/profile';
import { createScenarioForCurrentUser } from '@/lib/scenarios/service';

export default function NewScenarioPage() {
  async function createFromDemoAction() {
    'use server';

    const saved = await createScenarioForCurrentUser(
      { ...DEMO_PROFILE, name: `${DEMO_PROFILE.name} (Onboarding)` },
      `${DEMO_PROFILE.name} (Onboarding)`,
    );

    if (saved) {
      redirect(`/scenario/${saved.id}`);
    }

    redirect('/dashboard');
  }

  async function createCustomAction(formData: FormData) {
    'use server';

    const name = String(formData.get('name') ?? '').trim() || 'New Scenario';
    const horizonDays = Number(formData.get('horizonDays') ?? 365);
    const startingCash = Number(formData.get('startingCash') ?? DEMO_PROFILE.startingCash);

    const saved = await createScenarioForCurrentUser(
      {
        ...DEMO_PROFILE,
        name,
        horizonDays: Number.isFinite(horizonDays) ? Math.max(1, Math.min(1825, horizonDays)) : 365,
        startingCash: Number.isFinite(startingCash) ? startingCash : DEMO_PROFILE.startingCash,
      },
      name,
    );

    if (saved) {
      redirect(`/scenario/${saved.id}`);
    }

    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Create Scenario</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Minimal MVP builder with demo autopopulation.
        </p>
      </header>

      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
        <form action={createFromDemoAction}>
          <button
            type="submit"
            className="px-5 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90"
          >
            Auto-populate Demo Profile
          </button>
        </form>
      </section>

      <section className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-3">Custom Basics</h2>
        <form action={createCustomAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm mb-1">Scenario Name</label>
            <input
              id="name"
              name="name"
              defaultValue="My First Plan"
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horizonDays" className="block text-sm mb-1">Horizon Days</label>
              <input
                id="horizonDays"
                name="horizonDays"
                type="number"
                min={1}
                max={1825}
                defaultValue={365}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="startingCash" className="block text-sm mb-1">Starting Cash</label>
              <input
                id="startingCash"
                name="startingCash"
                type="number"
                defaultValue={DEMO_PROFILE.startingCash}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)]"
          >
            Create Scenario
          </button>
        </form>
      </section>
    </main>
  );
}
