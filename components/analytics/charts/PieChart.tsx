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
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
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
    ? (props: {
        x: number;
        y: number;
        textAnchor: string;
        name: string;
        percent: number;
      }) => (
        <text
          x={props.x}
          y={props.y}
          textAnchor={props.textAnchor as "start" | "middle" | "end"}
          dominantBaseline="central"
          fill="var(--foreground)"
          fontSize={12}
        >
          {`${props.name}: ${(props.percent * 100).toFixed(0)}%`}
        </text>
      )
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
              border: "1px solid var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
