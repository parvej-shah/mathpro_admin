"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { DataTable } from "@/components/analytics/charts/DataTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faUsers,
  faChartLine,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useLearningProgress, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatPercentage } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { LearningProgressParams } from "@/types/analytics-v2.types";

interface LearningProgressProps {
  params?: LearningProgressParams;
}

export function LearningProgress({ params }: LearningProgressProps) {
  const { data, isLoading, error } = useLearningProgress(params);
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
              ? "Failed to load learning data"
              : "No learning data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const learningData = data.data;

  const topLearnersColumns = [
    {
      field: "name",
      header: "Learner",
      render: (row: Record<string, unknown>) => (
        <div>
          <p className="font-medium">{String(row.name)}</p>
          <p className="text-xs text-muted-foreground">
            ID: {String(row.user_id)}
          </p>
        </div>
      ),
    },
    {
      field: "modules_completed",
      header: "Modules Completed",
      align: "right" as const,
      render: (row: Record<string, unknown>) =>
        Number(row.modules_completed || 0).toLocaleString(),
    },
    {
      field: "current_streak",
      header: "Current Streak",
      align: "right" as const,
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center justify-end gap-2">
          <FontAwesomeIcon icon={faFire} className="h-4 w-4 text-orange-500" />
          <span>{Number(row.current_streak || 0)} days</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Modules Completed"
          value={learningData.total_modules_completed.toLocaleString()}
          subtitle="Total completions"
          icon={
            <FontAwesomeIcon
              icon={faBookOpen}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(
            metadata,
            "learning",
            "total_modules_completed"
          )}
        />
        <StatStripCard
          title="Active Learners (30d)"
          value={learningData.active_learners_30d.toLocaleString()}
          subtitle="Recently active"
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "learning", "active_learners_30d")}
        />
        <StatStripCard
          title="Progress Records"
          value={learningData.total_progress_records.toLocaleString()}
          subtitle="Total records"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "learning", "total_progress_records")}
        />
        <StatStripCard
          title="Avg Completion Rate"
          value={formatPercentage(learningData.average_completion_rate)}
          subtitle="Platform average"
          icon={
            <FontAwesomeIcon
              icon={faChartLine}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(
            metadata,
            "learning",
            "average_completion_rate"
          )}
        />
      </div>

      {/* Top Learners */}
      {learningData.top_learners && learningData.top_learners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={
                learningData.top_learners as unknown as Record<
                  string,
                  unknown
                >[]
              }
              columns={topLearnersColumns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
