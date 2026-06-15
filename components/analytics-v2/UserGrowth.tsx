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
import { useUserGrowth } from "@/hooks/useAnalyticsV2";
import { getDefaultDateRange } from "@/lib/analytics-v2.utils";
import type { GroupBy } from "@/types/analytics-v2.types";

interface UserGrowthProps {
  startDate?: number;
  endDate?: number;
}

const CHART_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--warning)",
];

export function UserGrowth({ startDate, endDate }: UserGrowthProps) {
  const [groupBy, setGroupBy] = React.useState<GroupBy>("month");
  const defaultRange = getDefaultDateRange();

  const { data, isLoading, error } = useUserGrowth({
    start_date:
      startDate ||
      defaultRange.start ||
      Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
    end_date: endDate || defaultRange.end || Math.floor(Date.now() / 1000),
    group_by: groupBy,
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
              ? "Failed to load user growth data"
              : "No user growth data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { growth, summary } = data.data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Growth Trend</CardTitle>
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
          {growth && growth.length > 0 ? (
            <LineChart
              data={growth}
              xAxisDataKey="period"
              lines={[
                {
                  dataKey: "new_users",
                  name: "New Users",
                  color: CHART_COLORS[0],
                  yAxisId: "left",
                  strokeWidth: 3,
                },
                {
                  dataKey: "total_users",
                  name: "Total Users",
                  color: CHART_COLORS[1],
                  yAxisId: "right",
                  strokeWidth: 2,
                },
                {
                  dataKey: "paying_users",
                  name: "Paying Users",
                  color: CHART_COLORS[2],
                  yAxisId: "right",
                  strokeWidth: 2,
                },
              ]}
            />
          ) : (
            <p className="text-muted-foreground text-center py-12">
              No growth data available
            </p>
          )}
        </CardContent>
      </Card>

      {summary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total New Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.total_new_users}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Average Daily New Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.average_daily_new_users.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
