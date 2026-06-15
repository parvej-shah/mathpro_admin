"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { useCourseFeedbackStats } from "@/hooks/useFeedback";
import { FEEDBACK_CATEGORIES, RATING_LABELS } from "@/types/feedback.types";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faComments,
  faChartBar,
  faTrophy,
  faBookOpen,
  faChalkboardTeacher,
  faLaptop,
  faGraduationCap,
  faCommentDots,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

interface CourseFeedbackStatsProps {
  courseId?: string;
}

/**
 * Map a feedback category to a FontAwesome icon.
 * Falls back to a generic comment bubble for unknown values.
 */
const CATEGORY_ICONS: Record<string, typeof faBookOpen> = {
  content: faBookOpen,
  instructor: faChalkboardTeacher,
  platform: faLaptop,
  course: faGraduationCap,
  other: faCommentDots,
};

/**
 * Human-friendly sentiment label for a 0-5 average rating.
 */
function getSentiment(rating: number): {
  label: string;
  tone: "success" | "warning" | "destructive";
} {
  if (rating >= 4.5) return { label: "Excellent", tone: "success" };
  if (rating >= 3.5) return { label: "Good", tone: "success" };
  if (rating >= 2.5) return { label: "Average", tone: "warning" };
  if (rating >= 1.5) return { label: "Needs work", tone: "warning" };
  return { label: "Poor", tone: "destructive" };
}

export function CourseFeedbackStats({ courseId }: CourseFeedbackStatsProps) {
  const { data: stats, isLoading, error } = useCourseFeedbackStats(courseId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatStripCard loading title="Average Rating" />
          <StatStripCard loading title="Total Feedbacks" />
          <StatStripCard loading title="Positive Reviews" />
          <StatStripCard loading title="Top Category" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-44 md:col-span-1" />
          <Skeleton className="h-44 md:col-span-1" />
          <Skeleton className="h-44 md:col-span-1" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-destructive/20 bg-destructive/5">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="h-10 w-10 text-destructive mb-3"
        />
        <p className="text-base font-medium text-destructive">
          Failed to load statistics
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Top-rated category
  const topCategory = stats.category_distribution?.reduce(
    (max, curr) => (curr.count > (max?.count || 0) ? curr : max),
    stats.category_distribution[0]
  );

  const getCategoryLabel = (cat: string) =>
    FEEDBACK_CATEGORIES.find((c) => c.value === cat)?.label || cat;

  // Sentiment numbers
  const positiveCount =
    stats.rating_distribution
      ?.filter((r) => r.rating >= 4)
      .reduce((sum, r) => sum + r.count, 0) || 0;
  const positivePercentage = stats.total_feedbacks
    ? Math.round((positiveCount / stats.total_feedbacks) * 100)
    : 0;

  const avg = stats.average_rating || 0;
  const sentiment = getSentiment(avg);
  const gaugePercent = Math.max(0, Math.min(100, (avg / 5) * 100));
  const gaugeCircumference = 2 * Math.PI * 56; // r = 56
  const gaugeDash = (gaugePercent / 100) * gaugeCircumference;

  const hasData = stats.total_feedbacks > 0;

  return (
    <div className="space-y-6">
      {/* ---------- Stat strip cards ---------- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Average Rating"
          value={`${avg.toFixed(1)} / 5`}
          accent="warning"
          icon={<FontAwesomeIcon icon={faStar} />}
        >
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                  key={star}
                  icon={faStar}
                  className={cn(
                    "text-sm transition-colors",
                    star <= Math.round(avg)
                      ? "text-warning"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                sentiment.tone === "success" &&
                  "bg-success/10 text-success",
                sentiment.tone === "warning" &&
                  "bg-warning/10 text-warning",
                sentiment.tone === "destructive" &&
                  "bg-destructive/10 text-destructive"
              )}
            >
              {sentiment.label}
            </span>
          </div>
        </StatStripCard>

        <StatStripCard
          title="Total Feedbacks"
          value={stats.total_feedbacks?.toLocaleString() || 0}
          subtitle="reviews submitted"
          accent="info"
          icon={<FontAwesomeIcon icon={faComments} />}
        />

        <StatStripCard
          title="Positive Reviews"
          value={`${positivePercentage}%`}
          subtitle={`${positiveCount} reviews with 4+ stars`}
          accent="success"
          icon={<FontAwesomeIcon icon={faTrophy} />}
          valueClassName="text-success"
        />

        <StatStripCard
          title="Top Category"
          value={topCategory ? getCategoryLabel(topCategory.category) : "N/A"}
          subtitle={`${topCategory?.count || 0} feedbacks`}
          accent="primary"
          icon={<FontAwesomeIcon icon={faChartBar} />}
          valueClassName="text-lg truncate"
        />
      </div>

      {/* ---------- Rating Overview hero ---------- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Gauge */}
        <Card className="relative overflow-hidden md:col-span-1">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-warning/10 blur-2xl" />
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall rating
            </p>
            <div className="relative my-4">
              <svg
                className="h-36 w-36 -rotate-90"
                viewBox="0 0 128 128"
                aria-hidden
              >
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="10"
                  className="fill-none stroke-muted"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className={cn(
                    "fill-none transition-[stroke-dashoffset] duration-700",
                    sentiment.tone === "success" && "stroke-success",
                    sentiment.tone === "warning" && "stroke-warning",
                    sentiment.tone === "destructive" && "stroke-destructive"
                  )}
                  style={{
                    strokeDasharray: gaugeCircumference,
                    strokeDashoffset: gaugeCircumference - gaugeDash,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tracking-tight">
                  {avg.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">out of 5</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-warning">
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesomeIcon
                  key={s}
                  icon={faStar}
                  className={cn(
                    "h-3.5 w-3.5",
                    s <= Math.round(avg)
                      ? "text-warning"
                      : "text-muted-foreground/25"
                  )}
                />
              ))}
            </div>
            <p
              className={cn(
                "mt-2 text-sm font-medium",
                sentiment.tone === "success" && "text-success",
                sentiment.tone === "warning" && "text-warning",
                sentiment.tone === "destructive" && "text-destructive"
              )}
            >
              {sentiment.label}
            </p>
          </CardContent>
        </Card>

        {/* Quick metrics */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SnapshotTile
                label="5-star"
                count={
                  stats.rating_distribution?.find((r) => r.rating === 5)
                    ?.count || 0
                }
                accent="success"
              />
              <SnapshotTile
                label="4-star"
                count={
                  stats.rating_distribution?.find((r) => r.rating === 4)
                    ?.count || 0
                }
                accent="success"
              />
              <SnapshotTile
                label="3-star"
                count={
                  stats.rating_distribution?.find((r) => r.rating === 3)
                    ?.count || 0
                }
                accent="warning"
              />
              <SnapshotTile
                label="2-star"
                count={
                  stats.rating_distribution?.find((r) => r.rating === 2)
                    ?.count || 0
                }
                accent="destructive"
              />
              <SnapshotTile
                label="1-star"
                count={
                  stats.rating_distribution?.find((r) => r.rating === 1)
                    ?.count || 0
                }
                accent="destructive"
              />
              <SnapshotTile
                label="Total"
                count={stats.total_feedbacks || 0}
                accent="primary"
                emphasis
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Detailed Distribution ---------- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Rating Distribution
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {stats.total_feedbacks} total
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasData ? (
              [5, 4, 3, 2, 1].map((rating) => {
                const ratingData = stats.rating_distribution?.find(
                  (r) => r.rating === rating
                );
                const count = ratingData?.count || 0;
                const percentage = stats.total_feedbacks
                  ? (count / stats.total_feedbacks) * 100
                  : 0;

                return (
                  <div key={rating} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-warning font-medium tabular-nums w-12">
                          {rating}
                          <FontAwesomeIcon
                            icon={faStar}
                            className="h-3 w-3"
                          />
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {RATING_LABELS[rating]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">
                          {count}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn(
                        "h-2 bg-muted",
                        rating >= 4 && "[&>div]:bg-success",
                        rating === 3 && "[&>div]:bg-warning",
                        rating < 3 && "[&>div]:bg-destructive"
                      )}
                    />
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={faStar}
                title="No ratings yet"
                description="Once students submit feedback, the rating breakdown will appear here."
              />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Category Breakdown
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {FEEDBACK_CATEGORIES.length} categories
            </Badge>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-3">
                {FEEDBACK_CATEGORIES.map(({ value, label }) => {
                  const catData = stats.category_distribution?.find(
                    (c) => c.category === value
                  );
                  const count = catData?.count || 0;
                  const percentage = stats.total_feedbacks
                    ? (count / stats.total_feedbacks) * 100
                    : 0;
                  const isTop =
                    topCategory?.category === value && count > 0;
                  const Icon = CATEGORY_ICONS[value] || faCommentDots;

                  return (
                    <div
                      key={value}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                        isTop
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-card hover:bg-muted/40"
                      )}
                    >
                      <div
                        className={cn(
                          "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
                          isTop
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <FontAwesomeIcon icon={Icon} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium truncate">
                              {label}
                            </span>
                            {isTop && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary"
                              >
                                Top
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-semibold tabular-nums shrink-0">
                            {count}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={percentage}
                            className={cn(
                              "h-1.5 flex-1 bg-muted",
                              isTop ? "[&>div]:bg-primary" : "[&>div]:bg-info"
                            )}
                          />
                          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={faChartBar}
                title="No categories yet"
                description="Category breakdown will appear once students start giving feedback."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

function SnapshotTile({
  label,
  count,
  accent,
  emphasis = false,
}: {
  label: string;
  count: number;
  accent: "success" | "warning" | "destructive" | "primary";
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        emphasis
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-card hover:bg-muted/40"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wider",
          emphasis ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-bold tabular-nums",
          emphasis ? "text-2xl" : "text-xl",
          accent === "success" && "text-success",
          accent === "warning" && "text-warning",
          accent === "destructive" && "text-destructive",
          accent === "primary" && "text-primary"
        )}
      >
        {count.toLocaleString()}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: typeof faStar;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <FontAwesomeIcon
          icon={icon}
          className="h-4 w-4 text-muted-foreground"
        />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {description}
      </p>
    </div>
  );
}

