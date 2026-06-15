"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { BarChart } from "@/components/analytics/charts/BarChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCheckCircle,
  faTimesCircle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { usePaymentOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatCurrency, formatPercentage } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { PaymentOverviewParams } from "@/types/analytics-v2.types";

interface PaymentOverviewProps {
  params?: PaymentOverviewParams;
}

const CHART_COLORS = ["var(--primary)", "var(--destructive)", "var(--success)"];

export function PaymentOverview({ params }: PaymentOverviewProps) {
  const { data, isLoading, error } = usePaymentOverview(params);
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
              ? "Failed to load payment data"
              : "No payment data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const paymentData = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Total Payments"
          value={paymentData.total_payments.toLocaleString()}
          subtitle="All payment attempts"
          icon={
            <FontAwesomeIcon
              icon={faCreditCard}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "payments", "total_payments")}
        />
        <StatStripCard
          title="Successful Payments"
          value={paymentData.successful_payments.toLocaleString()}
          subtitle={`${formatPercentage(paymentData.success_rate)} success rate`}
          icon={
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "payments", "successful_payments")}
        />
        <StatStripCard
          title="Failed Payments"
          value={paymentData.failed_payments.toLocaleString()}
          subtitle={`${formatPercentage(100 - paymentData.success_rate)} failure rate`}
          icon={
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "payments", "failed_payments")}
        />
        <StatStripCard
          title="Total Amount"
          value={formatCurrency(paymentData.total_amount)}
          subtitle="Total transaction value"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "payments", "total_amount")}
        />
      </div>

      {/* Success Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-4xl font-bold mb-2">
                {formatPercentage(paymentData.success_rate)}
              </div>
              <p className="text-sm text-muted-foreground">
                {paymentData.successful_payments} successful out of{" "}
                {paymentData.total_payments} total payments
              </p>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="var(--muted)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={
                    paymentData.success_rate >= 95
                      ? "var(--success)"
                      : "var(--warning)"
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(paymentData.success_rate / 100) * 351.86} 351.86`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {paymentData.success_rate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      {paymentData.trends && paymentData.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={paymentData.trends}
              xAxisDataKey="period"
              tooltipFormatter={(value) => String(value)}
              bars={[
                {
                  dataKey: "successful",
                  name: "Successful",
                  color: CHART_COLORS[2],
                },
                {
                  dataKey: "failed",
                  name: "Failed",
                  color: CHART_COLORS[1],
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
