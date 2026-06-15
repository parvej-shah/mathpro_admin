"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBook,
  faGift,
  faDollarSign,
  faGraduationCap,
  faChartLine,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { useDashboardOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import {
  formatCurrency,
  calculateGrowthPercentage,
} from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { DashboardOverviewParams } from "@/types/analytics-v2.types";

interface DashboardOverviewProps {
  params?: DashboardOverviewParams;
}

export function DashboardOverview({ params }: DashboardOverviewProps) {
  const { data, isLoading, error } = useDashboardOverview(params);
  const { data: metadataResponse } = useAllMetadata();
  const metadata = metadataResponse?.success
    ? (metadataResponse.data as any)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error ? "Failed to load dashboard data" : "No data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    summary,
    operational,
    revenue,
    enrollments,
    top_courses,
    top_bundles,
  } = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatStripCard
          title="Total Users"
          value={summary.total_users}
          subtitle={`${summary.active_users_30d.toLocaleString()} active (30d)`}
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.total_users"
          )}
        />
        <StatStripCard
          title="Total Courses"
          value={summary.total_courses}
          subtitle={`${summary.total_enrollments.toLocaleString()} enrollments`}
          icon={
            <FontAwesomeIcon icon={faBook} className="h-5 w-5" />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.total_courses"
          )}
        />
        <StatStripCard
          title="Total Bundles"
          value={summary.total_bundles}
          subtitle="Active bundles"
          icon={
            <FontAwesomeIcon icon={faGift} className="h-5 w-5" />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.total_bundles"
          )}
        />
        <StatStripCard
          title="Total Revenue"
          value={formatCurrency(summary.total_revenue)}
          subtitle="All time revenue"
          icon={
            <FontAwesomeIcon
              icon={faDollarSign}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.total_revenue"
          )}
        />
        <StatStripCard
          title="Total Enrollments"
          value={summary.total_enrollments}
          subtitle="Course enrollments"
          icon={
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.total_enrollments"
          )}
        />
        <StatStripCard
          title="Active Users (30d)"
          value={summary.active_users_30d}
          subtitle="Recently active"
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(
            metadata as any,
            "dashboard",
            "summary.active_users_30d"
          )}
        />
      </div>

      {/* Growth Indicators */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatCurrency(revenue.current)}
              </span>
              <span className="text-sm text-muted-foreground">
                vs {formatCurrency(revenue.previous)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {parseFloat(revenue.growth_percentage) >= 0 ? (
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="h-4 w-4 text-success"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="h-4 w-4 text-destructive"
                />
              )}
              <span
                className={`text-sm font-medium ${
                  parseFloat(revenue.growth_percentage) >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {revenue.growth_percentage}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5" />
              Enrollment Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{enrollments.current}</span>
              <span className="text-sm text-muted-foreground">
                vs {enrollments.previous}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {parseFloat(enrollments.growth_percentage) >= 0 ? (
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="h-4 w-4 text-success"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="h-4 w-4 text-destructive"
                />
              )}
              <span
                className={`text-sm font-medium ${
                  parseFloat(enrollments.growth_percentage) >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {enrollments.growth_percentage}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent Enrollments (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operational.recent_enrollments_24h}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent Payments (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operational.recent_payments_24h}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Payment Amount (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(operational.recent_payment_amount_24h)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Failed Payment Rate (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operational.failed_payment_rate_24h.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      {top_courses && top_courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_courses.slice(0, 10).map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrollments} enrollments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(course.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Bundles */}
      {top_bundles && top_bundles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top_bundles.slice(0, 10).map((bundle) => (
                <div
                  key={bundle.bundle_id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium">{bundle.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {bundle.purchases} purchases
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(bundle.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
