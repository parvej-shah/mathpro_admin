"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { DataTable } from "@/components/analytics/charts/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faTag, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { useCouponOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatCurrency, formatPercentage } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { CouponOverviewParams } from "@/types/analytics-v2.types";

interface CouponOverviewProps {
  params?: CouponOverviewParams;
}

export function CouponOverview({ params }: CouponOverviewProps) {
  const { data, isLoading, error } = useCouponOverview(params);
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
            {error ? "Failed to load coupon data" : "No coupon data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const couponData = data.data;

  const topCouponsColumns = [
    {
      field: "code",
      header: "Coupon Code",
      render: (row: Record<string, unknown>) => (
        <div>
          <p className="font-medium font-mono">{String(row.code)}</p>
          <p className="text-xs text-muted-foreground">
            ID: {String(row.coupon_id)}
          </p>
        </div>
      ),
    },
    {
      field: "usage_count",
      header: "Usage Count",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        Number(row.usage_count || 0).toLocaleString(),
    },
    {
      field: "discount_given",
      header: "Discount Given",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        formatCurrency(Number(row.discount_given || 0)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Total Coupons"
          value={couponData.total_coupons.toLocaleString()}
          subtitle={`${couponData.active_coupons} active`}
          icon={
            <FontAwesomeIcon icon={faGift} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "coupons", "total_coupons")}
        />
        <StatStripCard
          title="Active Coupons"
          value={couponData.active_coupons.toLocaleString()}
          subtitle="Currently active"
          icon={
            <FontAwesomeIcon icon={faTag} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "coupons", "active_coupons")}
        />
        <StatStripCard
          title="Total Usage"
          value={couponData.total_usage.toLocaleString()}
          subtitle="Times used"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "coupons", "total_usage")}
        />
        <StatStripCard
          title="Total Discount Given"
          value={formatCurrency(couponData.total_discount_given)}
          subtitle={`${formatPercentage(couponData.conversion_rate)} conversion`}
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "coupons", "total_discount_given")}
        />
      </div>

      {/* Conversion Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">
            {formatPercentage(couponData.conversion_rate)}
          </div>
          <p className="text-sm text-muted-foreground">
            {couponData.total_usage} uses out of {couponData.total_coupons}{" "}
            total coupons
          </p>
        </CardContent>
      </Card>

      {/* Top Coupons */}
      {couponData.top_coupons && couponData.top_coupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={
                couponData.top_coupons as unknown as Record<string, unknown>[]
              }
              columns={topCouponsColumns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
