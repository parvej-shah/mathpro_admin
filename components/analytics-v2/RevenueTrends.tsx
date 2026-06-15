"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "@/components/analytics/charts/LineChart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRevenueTrends } from "@/hooks/useAnalyticsV2";
import { formatCurrency } from "@/lib/analytics-v2.utils";
import { getDefaultDateRange } from "@/lib/analytics-v2.utils";
import type { GroupBy } from "@/types/analytics-v2.types";

interface RevenueTrendsProps {
  startDate?: number;
  endDate?: number;
  courseId?: number;
  bundleId?: number;
}

const CHART_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--warning)",
];

export function RevenueTrends({
  startDate,
  endDate,
  courseId,
  bundleId,
}: RevenueTrendsProps) {
  const [groupBy, setGroupBy] = React.useState<GroupBy>("day");
  const defaultRange = getDefaultDateRange();

  const { data, isLoading, error } = useRevenueTrends({
    start_date:
      startDate ||
      defaultRange.start ||
      Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    end_date: endDate || defaultRange.end || Math.floor(Date.now() / 1000),
    group_by: groupBy,
    course_id: courseId,
    bundle_id: bundleId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error
              ? "Failed to load revenue trends"
              : "No revenue trends data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { trends, summary } = data.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Revenue Trends</CardTitle>
            <Select
              value={groupBy}
              onValueChange={(value) => setGroupBy(value as GroupBy)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {trends && trends.length > 0 ? (
            <LineChart
              data={trends}
              xAxisDataKey="period"
              tooltipFormatter={(value) => formatCurrency(Number(value))}
              lines={[
                {
                  dataKey: "revenue",
                  name: "Revenue",
                  color: CHART_COLORS[0],
                  yAxisId: "left",
                  strokeWidth: 3,
                  tickFormatter: (value) => formatCurrency(value).split(".")[0],
                },
                ...(trends[0]?.course_revenue !== undefined
                  ? [
                      {
                        dataKey: "course_revenue",
                        name: "Course Revenue",
                        color: CHART_COLORS[1],
                        yAxisId: "left",
                        strokeWidth: 2,
                      },
                    ]
                  : []),
                ...(trends[0]?.bundle_revenue !== undefined
                  ? [
                      {
                        dataKey: "bundle_revenue",
                        name: "Bundle Revenue",
                        color: CHART_COLORS[2],
                        yAxisId: "left",
                        strokeWidth: 2,
                      },
                    ]
                  : []),
              ]}
            />
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No trends data available
            </p>
          )}
        </CardContent>
      </Card>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_revenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average Daily Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.average_daily_revenue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
