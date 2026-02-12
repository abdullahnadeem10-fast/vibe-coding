import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ─── Nav ─── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)]">
        <span className="text-lg font-bold tracking-tight gradient-text">
          FUTURE WALLET
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] transition"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90 transition"
          >
            Try Demo
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="gradient-text">Model Your</span>
            <br />
            Financial Future
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            A deterministic simulation engine that projects your economic trajectory
            with daily precision — income, expenses, assets, debts, and shocks —
            all computed locally in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/demo"
              className="px-8 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold text-lg hover:opacity-90 transition glow"
            >
              Launch Demo →
            </Link>
          </div>
        </div>

        {/* ─── Feature cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
          <FeatureCard
            title="Deterministic Engine"
            description="Identical inputs always produce bit-exact identical outputs. No Monte Carlo — just pure math."
            icon="⚙️"
          />
          <FeatureCard
            title="Daily Granularity"
            description="Every state transition computed per-day over up to 5 years (1,825 days)."
            icon="📅"
          />
          <FeatureCard
            title="What-If Branching"
            description="Clone from any day and compare scenarios side-by-side — promotion, emergency fund, or debt payoff."
            icon="🔀"
          />
          <FeatureCard
            title="DAG Execution"
            description="Financial components resolve as a directed acyclic graph — income → expenses → debts → assets → taxes."
            icon="🧬"
          />
          <FeatureCard
            title="Multi-Currency"
            description="USD, EUR, PKR with deterministic FX dynamics and volatility bands."
            icon="💱"
          />
          <FeatureCard
            title="Client-Side Compute"
            description="Runs entirely in a Web Worker. Your data never leaves your browser."
            icon="🔒"
          />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="text-center py-8 text-sm text-[var(--text-muted)] border-t border-[var(--border)]">
        DATAFEST&apos;26 — Future Wallet Engine
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="glass-card p-6 text-left hover:border-[var(--accent-green)] transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
