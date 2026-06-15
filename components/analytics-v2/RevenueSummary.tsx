"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { PieChart } from "@/components/analytics/charts/PieChart";
import { BarChart } from "@/components/analytics/charts/BarChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faChartLine,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { useRevenueSummary, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatCurrency } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { RevenueSummaryParams } from "@/types/analytics-v2.types";

interface RevenueSummaryProps {
  params?: RevenueSummaryParams;
}

const CHART_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--warning)",
  "var(--destructive)",
  "var(--info)",
];

export function RevenueSummary({ params }: RevenueSummaryProps) {
  const { data, isLoading, error } = useRevenueSummary(params);
  const { data: metadataResponse } = useAllMetadata();
  const metadata = metadataResponse?.success
    ? (metadataResponse.data as any)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error
              ? "Failed to load revenue data"
              : "No revenue data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const revenueData = data.data;

  // Prepare pie chart data
  const revenueBreakdown = [
    {
      name: "Course Revenue",
      value: revenueData.course_revenue,
    },
    {
      name: "Bundle Revenue",
      value: revenueData.bundle_revenue,
    },
  ];

  const couponBreakdown = [
    {
      name: "With Coupon",
      value: revenueData.with_coupon_revenue,
    },
    {
      name: "Without Coupon",
      value: revenueData.without_coupon_revenue,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Total Revenue"
          value={formatCurrency(revenueData.total_revenue)}
          subtitle={`${revenueData.total_transactions} transactions`}
          icon={
            <FontAwesomeIcon
              icon={faDollarSign}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "revenue", "total_revenue")}
        />
        <StatStripCard
          title="Course Revenue"
          value={formatCurrency(revenueData.course_revenue)}
          subtitle="From courses"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "revenue", "course_revenue")}
        />
        <StatStripCard
          title="Bundle Revenue"
          value={formatCurrency(revenueData.bundle_revenue)}
          subtitle="From bundles"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "revenue", "bundle_revenue")}
        />
        <StatStripCard
          title="Average Order Value"
          value={formatCurrency(revenueData.average_order_value)}
          subtitle="Per transaction"
          icon={
            <FontAwesomeIcon
              icon={faDollarSign}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "revenue", "average_order_value")}
        />
      </div>

      {/* Coupon Impact */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Discount Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(revenueData.discount_given)}
            </div>
            <p className="text-sm text-muted-foreground">
              Total discount applied via coupons
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coupon Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(revenueData.with_coupon_revenue)}
            </div>
            <p className="text-sm text-muted-foreground">
              Revenue from coupon transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={revenueBreakdown}
              dataKey="value"
              nameKey="name"
              tooltipFormatter={(value, name) => [
                formatCurrency(Number(value)),
                String(name),
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={couponBreakdown}
              dataKey="value"
              nameKey="name"
              tooltipFormatter={(value, name) => [
                formatCurrency(Number(value)),
                String(name),
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      {revenueData.trends && revenueData.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={revenueData.trends}
              xAxisDataKey="period"
              tooltipFormatter={(value) => formatCurrency(Number(value))}
              bars={[
                {
                  dataKey: "revenue",
                  name: "Revenue",
                  color: CHART_COLORS[0],
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
