"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { DEMO_PROFILE } from "@/lib/demo/profile";
import type { SimulationResult, WorkerMessage } from "@/lib/engine/types";
import { simulate } from "@/lib/engine/simulate";
import BalanceChart from "@/components/charts/BalanceChart";
import SummaryPanel from "@/components/SummaryPanel";

export default function DemoPage() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setError(null);
    setProgress(0);

    // Try Web Worker first, fall back to main thread
    try {
      const worker = new Worker(
        new URL("@/lib/worker/sim.worker.ts", import.meta.url)
      );

      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const msg = e.data;
        if (msg.type === "progress") {
          setProgress(Math.round((msg.day / msg.totalDays) * 100));
        } else if (msg.type === "result") {
          setResult(msg.result);
          setRunning(false);
          worker.terminate();
        } else if (msg.type === "error") {
          setError(msg.message);
          setRunning(false);
          worker.terminate();
        }
      };

      worker.onerror = () => {
        // Fallback: run on main thread
        worker.terminate();
        runOnMainThread();
      };

      worker.postMessage({ type: "run", input: DEMO_PROFILE });
    } catch {
      // Web Worker not available — run on main thread
      runOnMainThread();
    }
  }, []);

  const runOnMainThread = useCallback(() => {
    try {
      const res = simulate(DEMO_PROFILE, (day, total) => {
        setProgress(Math.round((day / total) * 100));
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ─── Nav ─── */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[var(--border)]">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight gradient-text"
        >
          FUTURE WALLET
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:border-[var(--accent-green)] transition"
          >
            Dashboard
          </Link>
          <span className="text-sm text-[var(--text-muted)]">
            Demo Mode — No sign-up required
          </span>
        </div>
      </nav>

      <div className="flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full">
        {/* ─── Profile header ─── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{DEMO_PROFILE.name}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {DEMO_PROFILE.horizonDays} day horizon &bull;{" "}
              {DEMO_PROFILE.baseCurrency} &bull;{" "}
              {DEMO_PROFILE.incomes.length} income streams &bull;{" "}
              {DEMO_PROFILE.expenses.length} expenses &bull;{" "}
              {DEMO_PROFILE.debts.length} debts &bull;{" "}
              {DEMO_PROFILE.assets.length} assets
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={running}
            className="px-6 py-3 rounded-lg bg-[var(--accent-green)] text-black font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? `Running... ${progress}%` : "Run Simulation"}
          </button>
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="glass-card p-4 mb-6 border-[var(--accent-red)] text-[var(--accent-red)]">
            Error: {error}
          </div>
        )}

        {/* ─── Results ─── */}
        {result && (
          <div className="space-y-8">
            {/* Summary cards */}
            <SummaryPanel summary={result.summary} computeTimeMs={result.computeTimeMs} />

            {/* Balance chart */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                Balance Over Time (Expected / P5 / P95)
              </h2>
              <BalanceChart snapshots={result.dailySnapshots} />
            </div>

            {/* Shock events */}
            {result.firedShocks.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Shock Events</h2>
                <div className="space-y-2">
                  {result.firedShocks.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm py-2 border-b border-[var(--border)] last:border-0"
                    >
                      <span>
                        Day {s.day} — {s.shockId}
                      </span>
                      <span
                        className={
                          s.amount < 0
                            ? "text-[var(--accent-red)]"
                            : "text-[var(--accent-green)]"
                        }
                      >
                        {s.amount < 0 ? "-" : "+"}$
                        {Math.abs(s.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compute time */}
            <p className="text-xs text-[var(--text-muted)] text-right">
              Computed in {result.computeTimeMs.toFixed(1)}ms
            </p>
          </div>
        )}

        {/* ─── Empty state ─── */}
        {!result && !running && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Ready to Simulate</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              Click &ldquo;Run Simulation&rdquo; to project the demo profile&apos;s
              financial trajectory over {DEMO_PROFILE.horizonDays} days.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
