"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { DataTable } from "@/components/analytics/charts/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faGraduationCap,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { useCourseOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatCurrency, formatPercentage } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { CourseOverviewParams } from "@/types/analytics-v2.types";

interface CourseOverviewProps {
  params?: CourseOverviewParams;
}

export function CourseOverview({ params }: CourseOverviewProps) {
  const { data, isLoading, error } = useCourseOverview(params);
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
            {error ? "Failed to load course data" : "No course data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const courseData = data.data;

  const topCoursesColumns = [
    {
      field: "title",
      header: "Course",
      render: (row: Record<string, unknown>) => (
        <div>
          <p className="font-medium">{String(row.title)}</p>
          <p className="text-xs text-muted-foreground">
            ID: {String(row.course_id)}
          </p>
        </div>
      ),
    },
    {
      field: "enrollments",
      header: "Enrollments",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        Number(row.enrollments || 0).toLocaleString(),
    },
    {
      field: "revenue",
      header: "Revenue",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        formatCurrency(Number(row.revenue || 0)),
    },
    {
      field: "completion_rate",
      header: "Completion Rate",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        formatPercentage(Number(row.completion_rate || 0)),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Total Courses"
          value={courseData.total_courses.toLocaleString()}
          subtitle={`${courseData.live_courses} live courses`}
          icon={
            <FontAwesomeIcon icon={faBook} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "courses", "total_courses")}
        />
        <StatStripCard
          title="Live Courses"
          value={courseData.live_courses.toLocaleString()}
          subtitle="Currently active"
          icon={
            <FontAwesomeIcon icon={faBook} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "courses", "live_courses")}
        />
        <StatStripCard
          title="Total Enrollments"
          value={courseData.total_enrollments.toLocaleString()}
          subtitle="All time enrollments"
          icon={
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "courses", "total_enrollments")}
        />
        <StatStripCard
          title="Avg Enrollments/Course"
          value={courseData.average_enrollments_per_course.toFixed(1)}
          subtitle="Per course average"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(
            metadata,
            "courses",
            "average_enrollments_per_course"
          )}
        />
      </div>

      {/* Top Courses */}
      {courseData.top_courses && courseData.top_courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={
                courseData.top_courses as unknown as Record<string, unknown>[]
              }
              columns={topCoursesColumns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
