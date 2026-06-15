"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { DataTable } from "@/components/analytics/charts/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faChartLine,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { useBundleOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatCurrency } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { BundleOverviewParams } from "@/types/analytics-v2.types";

interface BundleOverviewProps {
  params?: BundleOverviewParams;
}

export function BundleOverview({ params }: BundleOverviewProps) {
  const { data, isLoading, error } = useBundleOverview(params);
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
            {error ? "Failed to load bundle data" : "No bundle data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const bundleData = data.data;

  const topBundlesColumns = [
    {
      field: "title",
      header: "Bundle",
      render: (row: Record<string, unknown>) => (
        <div>
          <p className="font-medium">{String(row.title)}</p>
          <p className="text-xs text-muted-foreground">
            ID: {String(row.bundle_id)}
          </p>
        </div>
      ),
    },
    {
      field: "purchases",
      header: "Purchases",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        Number(row.purchases || 0).toLocaleString(),
    },
    {
      field: "revenue",
      header: "Revenue",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        formatCurrency(Number(row.revenue || 0)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Total Bundles"
          value={bundleData.total_bundles.toLocaleString()}
          subtitle={`${bundleData.live_bundles} live bundles`}
          icon={
            <FontAwesomeIcon icon={faGift} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "bundles", "total_bundles")}
        />
        <StatStripCard
          title="Live Bundles"
          value={bundleData.live_bundles.toLocaleString()}
          subtitle="Currently active"
          icon={
            <FontAwesomeIcon icon={faGift} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "bundles", "live_bundles")}
        />
        <StatStripCard
          title="Total Purchases"
          value={bundleData.total_purchases.toLocaleString()}
          subtitle="All time purchases"
          icon={
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "bundles", "total_purchases")}
        />
        <StatStripCard
          title="Total Revenue"
          value={formatCurrency(bundleData.total_revenue)}
          subtitle={`Avg: ${formatCurrency(bundleData.average_revenue_per_bundle)}`}
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "bundles", "total_revenue")}
        />
      </div>

      {/* Top Bundles */}
      {bundleData.top_bundles && bundleData.top_bundles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={
                bundleData.top_bundles as unknown as Record<string, unknown>[]
              }
              columns={topBundlesColumns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
