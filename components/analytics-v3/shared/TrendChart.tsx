"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { V3SeriesPoint } from "@/types/analytics-v3.types";

// ─── Shared themed tooltip ───────────────────────────────────────────────────

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p
          key={`${p.name}-${i}`}
          style={{ color: p.color }}
          className="text-xs tabular-nums"
        >
          {p.name ? `${p.name}: ` : ""}
          {formatter && typeof p.value === "number"
            ? formatter(p.value)
            : (p.value ?? 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

interface TrendChartProps {
  data: V3SeriesPoint[];
  /** CSS var token name without the var() wrapper, e.g. "--primary". */
  colorToken?: string;
  height?: number;
  /** Series name shown in the tooltip. */
  name?: string;
  /** Value formatter for axis + tooltip. */
  formatter?: (v: number) => string;
  /** Hide axes/grid for a compact sparkline. */
  sparkline?: boolean;
  /** Unique id so multiple gradients on a page don't collide. */
  gradientId?: string;
}

/**
 * Reusable themed area chart. Full mode (axes + grid + tooltip) for the main
 * dashboard chart; `sparkline` mode for inline KPI-tile micro charts.
 */
export function TrendChart({
  data,
  colorToken = "--primary",
  height = 240,
  name,
  formatter,
  sparkline = false,
  gradientId,
}: TrendChartProps) {
  const color = `var(${colorToken})`;
  const id = React.useId();
  const gid = gradientId ?? `trend-grad-${id}`;

  if (sparkline) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gid})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.28} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={
            formatter ? (v) => formatter(Number(v)) : undefined
          }
        />
        <Tooltip
          content={<ChartTooltip formatter={formatter} />}
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
