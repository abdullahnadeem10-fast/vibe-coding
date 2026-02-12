import { redirect } from 'next/navigation';
import { createBranchedScenarioForCurrentUser, loadCurrentUserScenarioById } from '@/lib/scenarios/service';

export default async function BranchScenarioPage({
  params,
}: {
  params: { id: string };
}) {
  const scenario = await loadCurrentUserScenarioById(params.id);
  if (!scenario) {
    redirect('/dashboard');
  }

  async function branchAction(formData: FormData) {
    'use server';

    const branchFromDay = Number(formData.get('branchFromDay') ?? 0);
    const name = String(formData.get('name') ?? '').trim();

    const created = await createBranchedScenarioForCurrentUser({
      parentScenarioId: params.id,
      branchFromDay: Number.isFinite(branchFromDay) ? Math.max(0, branchFromDay) : 0,
      name: name.length > 0 ? name : undefined,
    });

    if (created) {
      redirect(`/scenario/${created.id}`);
    }

    redirect(`/scenario/${params.id}`);
  }

  return (
    <main className="min-h-screen px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Branch Scenario</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Parent: {scenario.name}</p>
      </header>

      <form action={branchAction} className="glass-card p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm mb-1">Branch Name</label>
          <input id="name" name="name" defaultValue={`${scenario.name} Branch`} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
        </div>
        <div>
          <label htmlFor="branchFromDay" className="block text-sm mb-1">Branch From Day</label>
          <input id="branchFromDay" name="branchFromDay" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
        </div>
        <button type="submit" className="px-5 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90">
          Create Branch
        </button>
      </form>
    </main>
  );
}
