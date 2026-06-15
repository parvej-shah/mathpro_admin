"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { useCourseModuleReport } from "@/hooks/useFeedback";
import { DISLIKE_REASONS } from "@/types/feedback.types";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faThumbsUp,
  faThumbsDown,
  faExclamationTriangle,
  faUsers,
  faChartPie,
  faLightbulb,
  faTachometerAlt,
  faVolumeUp,
  faVideo,
  faQuestionCircle,
  faClock,
  faCalendarTimes,
  faPuzzlePiece,
  faGraduationCap,
  faCrown,
  faCommentDots,
  faCircleInfo,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

interface ModuleFeedbackStatsProps {
  courseId: number | null;
}

/**
 * Map a dislike reason to a fitting FontAwesome icon.
 * Falls back to a generic comment bubble for unknown / dynamic reasons.
 */
const REASON_ICONS: Record<string, IconDefinition> = {
  too_fast: faTachometerAlt,
  too_slow: faClock,
  unclear: faQuestionCircle,
  outdated: faCalendarTimes,
  audio_issue: faVolumeUp,
  video_issue: faVideo,
  missing_content: faPuzzlePiece,
  too_difficult: faGraduationCap,
  too_easy: faCrown,
  other: faCommentDots,
};

/**
 * Map a dislike reason to an accent tone for visual grouping.
 */
const REASON_TONE: Record<
  string,
  "destructive" | "warning" | "info" | "muted"
> = {
  too_fast: "warning",
  too_slow: "info",
  unclear: "warning",
  outdated: "destructive",
  audio_issue: "destructive",
  video_issue: "destructive",
  missing_content: "destructive",
  too_difficult: "warning",
  too_easy: "info",
  other: "muted",
};

function getReasonLabel(reason: string) {
  return (
    DISLIKE_REASONS.find((r) => r.value === reason)?.label || reason
  );
}

function getReasonAction(reason: string) {
  return (
    DISLIKE_REASONS.find((r) => r.value === reason)?.action ||
    "Review feedback"
  );
}

/**
 * Tone bucket for the like-percentage gauge.
 */
function getLikeTone(percentage: number): {
  label: string;
  tone: "success" | "warning" | "destructive";
} {
  if (percentage >= 75) return { label: "Strong", tone: "success" };
  if (percentage >= 50) return { label: "Mixed", tone: "warning" };
  return { label: "Needs attention", tone: "destructive" };
}

export function ModuleFeedbackStats({ courseId }: ModuleFeedbackStatsProps) {
  const { data: report, isLoading } = useCourseModuleReport(courseId);

  if (!courseId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-muted/30">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <FontAwesomeIcon
            icon={faChartPie}
            className="h-6 w-6 text-muted-foreground"
          />
        </div>
        <p className="text-base font-medium">Select a course</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Choose a course from the filter above to view module feedback
          statistics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatStripCard loading title="Like Percentage" />
          <StatStripCard loading title="Total Reactions" />
          <StatStripCard loading title="Unique Users" />
          <StatStripCard loading title="Problem Modules" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-44 md:col-span-1" />
          <Skeleton className="h-44 md:col-span-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-muted/30">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <FontAwesomeIcon
            icon={faChartPie}
            className="h-6 w-6 text-muted-foreground"
          />
        </div>
        <p className="text-base font-medium">No data available</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          No module feedback data found for this course.
        </p>
      </div>
    );
  }

  const { summary, top_dislike_reasons, problem_modules } = report;
  const totalReactions = summary.total_feedback || 0;
  const likePct = summary.like_percentage || 0;
  const dislikePct = totalReactions
    ? Math.max(0, 100 - likePct)
    : 0;
  const tone = getLikeTone(likePct);
  const hasReactions = totalReactions > 0;

  return (
    <div className="space-y-6">
      {/* ---------- Stat strip cards ---------- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatStripCard
          title="Like Percentage"
          value={`${likePct}%`}
          accent="success"
          icon={<FontAwesomeIcon icon={faThumbsUp} />}
          valueClassName="text-success"
        >
          <div className="flex items-center gap-2 mt-3">
            <Progress
              value={likePct}
              className="h-1.5 flex-1 bg-muted [&>div]:bg-success"
            />
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums w-9 text-right">
              {dislikePct}%
            </span>
          </div>
        </StatStripCard>

        <StatStripCard
          title="Total Reactions"
          value={totalReactions.toLocaleString()}
          accent="info"
          icon={<FontAwesomeIcon icon={faChartPie} />}
        >
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1.5 text-success">
              <FontAwesomeIcon icon={faThumbsUp} className="h-3 w-3" />
              <span className="font-semibold tabular-nums">
                {summary.total_likes || 0}
              </span>
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="flex items-center gap-1.5 text-destructive">
              <FontAwesomeIcon icon={faThumbsDown} className="h-3 w-3" />
              <span className="font-semibold tabular-nums">
                {summary.total_dislikes || 0}
              </span>
            </span>
          </div>
        </StatStripCard>

        <StatStripCard
          title="Unique Users"
          value={(summary.unique_users || 0).toLocaleString()}
          subtitle="provided feedback"
          accent="primary"
          icon={<FontAwesomeIcon icon={faUsers} />}
        />

        <StatStripCard
          title="Problem Modules"
          value={problem_modules?.length || 0}
          subtitle="modules with 3+ dislikes"
          accent="warning"
          icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
          valueClassName="text-warning"
        />
      </div>

      {/* ---------- Reaction Overview hero ---------- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Split gauge */}
        <Card className="relative overflow-hidden md:col-span-1">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-success/15 blur-2xl" />
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sentiment
            </p>
            <div className="my-4 w-full max-w-[200px]">
              <SplitBar like={likePct} dislike={dislikePct} />
            </div>
            <p className="text-4xl font-bold tracking-tight tabular-nums">
              {likePct}%
            </p>
            <p className="text-xs text-muted-foreground">positive feedback</p>
            <span
              className={cn(
                "mt-3 text-xs font-medium px-2.5 py-1 rounded-full",
                tone.tone === "success" && "bg-success/10 text-success",
                tone.tone === "warning" && "bg-warning/10 text-warning",
                tone.tone === "destructive" &&
                  "bg-destructive/10 text-destructive"
              )}
            >
              {tone.label}
            </span>
          </CardContent>
        </Card>

        {/* Snapshot tiles */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SnapshotTile
                label="Likes"
                count={summary.total_likes || 0}
                accent="success"
                icon={faThumbsUp}
              />
              <SnapshotTile
                label="Dislikes"
                count={summary.total_dislikes || 0}
                accent="destructive"
                icon={faThumbsDown}
              />
              <SnapshotTile
                label="Users"
                count={summary.unique_users || 0}
                accent="info"
                icon={faUsers}
              />
              <SnapshotTile
                label="Total"
                count={totalReactions}
                accent="primary"
                emphasis
                icon={faChartPie}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Detailed Sections ---------- */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Dislike Reasons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Top Dislike Reasons
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {top_dislike_reasons?.length || 0} reasons
            </Badge>
          </CardHeader>
          <CardContent>
            {top_dislike_reasons && top_dislike_reasons.length > 0 ? (
              <div className="space-y-2.5">
                {top_dislike_reasons.slice(0, 6).map((item, idx) => {
                  const totalDislikes = summary.total_dislikes || 1;
                  const percentage = (item.count / totalDislikes) * 100;
                  const tone = REASON_TONE[item.reason] || "muted";
                  const Icon = REASON_ICONS[item.reason] || faCommentDots;

                  return (
                    <div
                      key={item.reason}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        idx === 0
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border bg-card hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
                            tone === "destructive" &&
                              "bg-destructive/10 text-destructive",
                            tone === "warning" && "bg-warning/10 text-warning",
                            tone === "info" && "bg-info/10 text-info",
                            tone === "muted" && "bg-muted text-muted-foreground"
                          )}
                        >
                          <FontAwesomeIcon icon={Icon} className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium truncate">
                                {getReasonLabel(item.reason)}
                              </span>
                              {idx === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-4 px-1.5 bg-destructive/15 text-destructive"
                                >
                                  #1
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-semibold tabular-nums shrink-0">
                              {item.count}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Progress
                              value={percentage}
                              className={cn(
                                "h-1.5 flex-1 bg-muted",
                                tone === "destructive" &&
                                  "[&>div]:bg-destructive",
                                tone === "warning" && "[&>div]:bg-warning",
                                tone === "info" && "[&>div]:bg-info",
                                tone === "muted" && "[&>div]:bg-muted-foreground"
                              )}
                            />
                            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 ml-12 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FontAwesomeIcon
                          icon={faLightbulb}
                          className="h-3 w-3 text-warning shrink-0"
                        />
                        <span className="truncate">
                          Suggested: {getReasonAction(item.reason)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={faCheckCircle}
                title="No dislikes recorded"
                description="Students haven't flagged any modules with a specific reason."
                tone="success"
              />
            )}
          </CardContent>
        </Card>

        {/* Problem Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Modules Needing Attention
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "font-normal",
                problem_modules && problem_modules.length > 0
                  ? "border-warning/30 text-warning"
                  : ""
              )}
            >
              {problem_modules?.length || 0} flagged
            </Badge>
          </CardHeader>
          <CardContent>
            {problem_modules && problem_modules.length > 0 ? (
              <div className="space-y-2">
                {problem_modules.slice(0, 8).map((module, idx) => (
                  <div
                    key={module.module_id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                      idx === 0
                        ? "border-warning/30 bg-warning/5"
                        : "border-border bg-card hover:bg-muted/40"
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
                        idx === 0
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {module.module_title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {module.chapter_title}
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="shrink-0 font-normal"
                    >
                      {module.dislike_count} dislikes
                    </Badge>
                  </div>
                ))}
                {problem_modules.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{problem_modules.length - 8} more modules
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon={faCheckCircle}
                title="All good"
                description="No modules with 3+ dislikes — keep it up."
                tone="success"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------- Module Performance Overview ---------- */}
      {report.modules && report.modules.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Module Performance
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              Top{" "}
              {Math.min(
                20,
                report.modules.filter((m) => m.total > 0).length
              )}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {report.modules
                .filter((m) => m.total > 0)
                .sort(
                  (a, b) => (b.like_percentage || 0) - (a.like_percentage || 0)
                )
                .slice(0, 20)
                .map((module) => {
                  const pct = module.like_percentage || 0;
                  const barTone =
                    pct >= 70
                      ? "success"
                      : pct >= 50
                        ? "warning"
                        : "destructive";

                  return (
                    <div
                      key={module.module_id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {module.module_title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Ch {module.chapter_serial} • {module.chapter_title}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs">
                        <span className="flex items-center gap-1 text-success tabular-nums">
                          <FontAwesomeIcon
                            icon={faThumbsUp}
                            className="h-3 w-3"
                          />
                          {module.likes}
                        </span>
                        <span className="flex items-center gap-1 text-destructive tabular-nums">
                          <FontAwesomeIcon
                            icon={faThumbsDown}
                            className="h-3 w-3"
                          />
                          {module.dislikes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 w-32">
                        <Progress
                          value={pct}
                          className={cn(
                            "h-1.5 flex-1 bg-muted",
                            barTone === "success" && "[&>div]:bg-success",
                            barTone === "warning" && "[&>div]:bg-warning",
                            barTone === "destructive" && "[&>div]:bg-destructive"
                          )}
                        />
                        <span className="text-xs font-semibold tabular-nums w-9 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              {report.modules.filter((m) => m.total > 0).length === 0 && (
                <EmptyState
                  icon={faCircleInfo}
                  title="No reactions yet"
                  description="Module performance will appear once students react."
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

function SplitBar({ like, dislike }: { like: number; dislike: number }) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-success transition-all duration-700"
          style={{ width: `${like}%` }}
        />
        <div
          className="h-full bg-destructive transition-all duration-700"
          style={{ width: `${dislike}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-success font-medium">
          <FontAwesomeIcon icon={faThumbsUp} className="h-3 w-3" />
          {like}%
        </span>
        <span className="flex items-center gap-1.5 text-destructive font-medium">
          <FontAwesomeIcon icon={faThumbsDown} className="h-3 w-3" />
          {dislike}%
        </span>
      </div>
    </div>
  );
}

function SnapshotTile({
  label,
  count,
  accent,
  emphasis = false,
  icon,
}: {
  label: string;
  count: number;
  accent: "success" | "warning" | "destructive" | "primary" | "info";
  emphasis?: boolean;
  icon: IconDefinition;
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
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            emphasis ? "text-primary" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <FontAwesomeIcon
          icon={icon}
          className={cn(
            "h-3.5 w-3.5",
            accent === "success" && "text-success",
            accent === "warning" && "text-warning",
            accent === "destructive" && "text-destructive",
            accent === "info" && "text-info",
            accent === "primary" && "text-primary"
          )}
        />
      </div>
      <p
        className={cn(
          "mt-1 font-bold tabular-nums",
          emphasis ? "text-2xl" : "text-xl",
          accent === "success" && "text-success",
          accent === "warning" && "text-warning",
          accent === "destructive" && "text-destructive",
          accent === "info" && "text-info",
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
  tone = "muted",
}: {
  icon: IconDefinition;
  title: string;
  description: string;
  tone?: "success" | "muted";
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center mb-3",
          tone === "success" ? "bg-success/10" : "bg-muted"
        )}
      >
        <FontAwesomeIcon
          icon={icon}
          className={cn(
            "h-4 w-4",
            tone === "success" ? "text-success" : "text-muted-foreground"
          )}
        />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        {description}
      </p>
    </div>
  );
}

