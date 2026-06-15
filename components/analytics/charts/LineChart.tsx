"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  yAxisId?: string;
  strokeWidth?: number;
  dot?: { r: number; strokeWidth: number };
  activeDot?: { r: number; strokeWidth: number };
  tickFormatter?: (value: number) => string;
}

interface LineChartProps {
  data: unknown[];
  xAxisDataKey: string;
  tooltipFormatter?: (value: unknown, name: string) => string;
  height?: number;
  lines: LineConfig[];
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
}

export function LineChart({
  data,
  xAxisDataKey,
  tooltipFormatter,
  height = 400,
  lines,
  margin = { top: 20, right: 30, left: 20, bottom: 5 },
}: LineChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisDataKey}
            className="text-muted-foreground text-xs"
          />
          {lines.map((line, index) => (
            <YAxis
              key={`axis-${index}`}
              yAxisId={line.yAxisId || "left"}
              orientation={line.yAxisId === "right" ? "right" : "left"}
              className="text-muted-foreground"
              tickFormatter={line.tickFormatter}
            />
          ))}
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
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              yAxisId={line.yAxisId || "left"}
              strokeWidth={line.strokeWidth || 3}
              dot={line.dot || { r: 4, strokeWidth: 2 }}
              activeDot={line.activeDot || { r: 8, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
