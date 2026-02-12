"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import type { DaySnapshot } from "@/lib/engine/types";

interface BalanceChartProps {
  snapshots: DaySnapshot[];
}

export default function BalanceChart({ snapshots }: BalanceChartProps) {
  // Downsample for rendering if over 500 points
  const data =
    snapshots.length > 500
      ? snapshots.filter((_, i) => i % Math.ceil(snapshots.length / 500) === 0)
      : snapshots;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="day"
          stroke="var(--text-muted)"
          fontSize={12}
          tickFormatter={(day) => `D${day}`}
        />
        <YAxis
          stroke="var(--text-muted)"
          fontSize={12}
          tickFormatter={formatCurrency}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text-primary)",
            fontSize: "12px",
          }}
          formatter={(value: number | string | undefined, name: string | undefined) => {
            const label = name ?? 'Value';
            const numericValue = typeof value === 'number' ? value : Number(value);
            if (!Number.isFinite(numericValue)) {
              return ['—', label];
            }

            return [
              `$${numericValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              label,
            ];
          }}
          labelFormatter={(day) => `Day ${day}`}
        />

        {/* P5-P95 band */}
        <Area
          type="monotone"
          dataKey="balanceP95"
          stroke="none"
          fill="var(--accent-green)"
          fillOpacity={0.08}
          name="P95"
        />
        <Area
          type="monotone"
          dataKey="balanceP5"
          stroke="none"
          fill="var(--bg-primary)"
          fillOpacity={1}
          name="P5"
        />

        {/* Expected balance line */}
        <Line
          type="monotone"
          dataKey="balance"
          stroke="var(--accent-green)"
          strokeWidth={2}
          dot={false}
          name="Expected Balance"
        />

        {/* P5 and P95 boundary lines */}
        <Line
          type="monotone"
          dataKey="balanceP5"
          stroke="var(--accent-blue)"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
          name="P5 (Pessimistic)"
        />
        <Line
          type="monotone"
          dataKey="balanceP95"
          stroke="var(--accent-amber)"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
          name="P95 (Optimistic)"
        />

        {/* NAV line */}
        <Line
          type="monotone"
          dataKey="nav"
          stroke="var(--accent-purple)"
          strokeWidth={2}
          dot={false}
          name="Net Asset Value"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
