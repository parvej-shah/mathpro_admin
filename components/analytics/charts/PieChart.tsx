"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PieChartProps {
  data: unknown[];
  dataKey: string;
  nameKey: string;
  tooltipFormatter?: (
    value: unknown,
    name: string,
    props: unknown
  ) => [string, string];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  label?: boolean;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export function PieChart({
  data,
  dataKey,
  nameKey,
  tooltipFormatter,
  height = 400,
  colors = DEFAULT_COLORS,
  innerRadius = 0,
  outerRadius = 120,
  label = true,
}: PieChartProps) {
  const renderLabel = label
    ? ({ name, percent }: { name: string; percent: number }) =>
        `${name}: ${(percent * 100).toFixed(0)}%`
    : undefined;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={label}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={renderLabel}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "none",
              backgroundColor: "hsl(var(--background))",
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
