import type { SimulationSummary, VibeTier } from "@/lib/engine/types";

interface SummaryPanelProps {
  summary: SimulationSummary;
  computeTimeMs: number;
}

const VIBE_CONFIG: Record<VibeTier, { emoji: string; color: string; label: string }> = {
  Thriving: { emoji: "🌟", color: "var(--accent-green)", label: "Thriving" },
  Stable: { emoji: "✅", color: "var(--accent-blue)", label: "Stable" },
  Stressed: { emoji: "⚠️", color: "var(--accent-amber)", label: "Stressed" },
  Crisis: { emoji: "🔥", color: "var(--accent-red)", label: "Crisis" },
  Collapse: { emoji: "💀", color: "var(--accent-red)", label: "Collapse" },
};

export default function SummaryPanel({ summary, computeTimeMs }: SummaryPanelProps) {
  const vibe = VIBE_CONFIG[summary.vibeTier];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Final Balance */}
      <MetricCard
        label="Final Balance"
        value={`$${summary.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        sub={`P5: $${summary.finalBalanceP5.toLocaleString(undefined, { maximumFractionDigits: 0 })} — P95: $${summary.finalBalanceP95.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        color={summary.finalBalance >= 0 ? "var(--accent-green)" : "var(--accent-red)"}
      />

      {/* NAV */}
      <MetricCard
        label="Net Asset Value"
        value={`$${summary.finalNAV.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        sub={`Liquidity: ${(summary.liquidityRatio * 100).toFixed(1)}%`}
        color="var(--accent-blue)"
      />

      {/* Credit Score */}
      <MetricCard
        label="Credit Score"
        value={summary.finalCreditScore.toFixed(0)}
        sub={`RSI: ${summary.shockResilienceIndex.toFixed(0)} / 100`}
        color={
          summary.finalCreditScore >= 700
            ? "var(--accent-green)"
            : summary.finalCreditScore >= 550
              ? "var(--accent-amber)"
              : "var(--accent-red)"
        }
      />

      {/* Vibe / Risk */}
      <MetricCard
        label="Financial Vibe"
        value={`${vibe.emoji} ${vibe.label}`}
        sub={`Collapse risk: ${(summary.collapseProbability * 100).toFixed(1)}% — ${summary.deficitDays} deficit days`}
        color={vibe.color}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>
    </div>
  );
}
