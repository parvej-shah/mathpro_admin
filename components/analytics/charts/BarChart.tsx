"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  radius?: number[];
  yAxisId?: string;
}

interface BarChartProps {
  data: unknown[];
  xAxisDataKey: string;
  xAxisAngle?: number;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: unknown, name: string) => string;
  height?: number;
  bars: BarConfig[];
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
}

export function BarChart({
  data,
  xAxisDataKey,
  xAxisAngle = 0,
  yAxisFormatter,
  tooltipFormatter,
  height = 400,
  bars,
  margin = { top: 20, right: 30, left: 20, bottom: 5 },
}: BarChartProps) {
  const defaultMargin = {
    top: 20,
    right: 30,
    left: 20,
    bottom: xAxisAngle !== 0 ? 90 : 5,
  };

  const finalMargin = { ...defaultMargin, ...margin };

  // Get unique yAxisIds
  const yAxisIds = [...new Set(bars.map((bar) => bar.yAxisId || "left"))];

  // Ensure height is always a valid number
  const chartHeight =
    typeof height === "number" && !isNaN(height) && height > 0 ? height : 400;

  return (
    <div className="w-full" style={{ height: `${chartHeight}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={finalMargin}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisDataKey}
            angle={xAxisAngle}
            textAnchor={xAxisAngle !== 0 ? "end" : "middle"}
            height={xAxisAngle !== 0 ? 90 : undefined}
            className="text-muted-foreground text-xs"
          />
          {yAxisIds.map((axisId) => (
            <YAxis
              key={axisId}
              yAxisId={axisId}
              orientation={axisId === "right" ? "right" : "left"}
              className="text-muted-foreground"
              tickFormatter={yAxisFormatter}
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
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={
                (bar.radius as [number, number, number, number]) || [4, 4, 0, 0]
              }
              yAxisId={bar.yAxisId || "left"}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
