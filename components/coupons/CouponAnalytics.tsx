"use client";

import { useMemo } from "react";
import {
  Calendar,
  CircleDollarSign,
  Percent,
  Sparkles,
  Tag,
  TicketPercent,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart } from "@/components/analytics/charts/BarChart";
import { LineChart } from "@/components/analytics/charts/LineChart";
import { PieChart } from "@/components/analytics/charts/PieChart";
import { cn } from "@/lib/utils";
import { useCouponStatistics, useCouponDashboard } from "@/hooks/useCoupons";
import type { Coupon } from "@/services/coupon.service";

interface CouponAnalyticsProps {}

interface AnalyticsOverview {
  total_coupons?: number;
  active_coupons?: number;
  expired_coupons?: number;
  inactive_coupons?: number;
  total_usage?: number;
  successful_redemptions?: number;
  total_discount_given?: number;
  total_revenue_generated?: number;
  average_discount_amount?: number;
  average_discount_percentage?: number;
  conversion_rate?: number;
  unique_coupons_used?: number;
  unique_users?: number;
  unique_courses?: number;
}

interface AnalyticsTrend {
  period: string;
  usage_count: number;
  successful_count?: number;
  total_discount?: number;
  revenue_generated?: number;
}

interface AnalyticsData {
  overview?: AnalyticsOverview;
  trends?: AnalyticsTrend[];
  top_coupons?: Coupon[];
}

export function CouponAnalytics(_props: CouponAnalyticsProps) {
  const { data, isLoading } = useCouponStatistics();
  const { data: dashboardData, isLoading: dashboardLoading } =
    useCouponDashboard();

  const analytics: AnalyticsData = useMemo(() => {
    const raw = data?.data as AnalyticsData | undefined;
    return raw ?? {};
  }, [data]);

  const overview: AnalyticsOverview = analytics.overview ?? {};

  const topCoupons: Coupon[] = useMemo(() => {
    const fromStats = analytics.top_coupons;
    if (fromStats && fromStats.length > 0) return fromStats;
    const fromDash =
      (dashboardData?.data as { top_coupons?: Coupon[] } | undefined)
        ?.top_coupons;
    return fromDash ?? [];
  }, [analytics, dashboardData]);

  const monthly: { month: string; count: number }[] = useMemo(() => {
    const trends = analytics.trends ?? [];
    return trends.map((t) => ({
      month: t.period,
      count: Number(t.usage_count) || 0,
    }));
  }, [analytics]);

  if (isLoading || dashboardLoading) {
    return <AnalyticsSkeleton />;
  }

  const hasData =
    (overview.total_coupons ?? 0) > 0 ||
    topCoupons.length > 0 ||
    monthly.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Tag className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">No analytics yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create a coupon and start sharing it to see performance here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<TicketPercent className="h-4 w-4" />}
          label="Total coupons"
          value={overview.total_coupons}
          tone="primary"
          sparkline={monthly}
          sparklineKey="coupons"
        />
        <KpiCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Active"
          value={overview.active_coupons}
          tone="success"
          sparkline={monthly}
          sparklineKey="active"
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Total redemptions"
          value={overview.total_usage}
          tone="info"
          sparkline={monthly}
          sparklineKey="count"
        />
        <KpiCard
          icon={<CircleDollarSign className="h-4 w-4" />}
          label="Discount given"
          value={formatTaka(overview.total_discount_given)}
          tone="warning"
          isText
          sparkline={monthly}
          sparklineKey="count"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Redemptions over time
                </h3>
                <p className="text-xs text-muted-foreground">
                  Last 6 months of coupon usage
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
            </header>

            {monthly.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-10 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">No usage yet</p>
                <p className="text-xs text-muted-foreground">
                  Redeemed coupons will appear here.
                </p>
              </div>
            ) : (
              <UsageBars data={monthly} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80">
          <CardContent className="space-y-4 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Average discount
                </h3>
                <p className="text-xs text-muted-foreground">
                  Per successful redemption
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Percent className="h-4 w-4" />
              </span>
            </header>
            <p className="text-3xl font-bold tracking-tight">
              {formatTaka(overview.average_discount_amount)}
            </p>
            {overview.conversion_rate !== undefined ? (
              <p className="text-sm text-muted-foreground">
                {Math.round(overview.conversion_rate)}% conversion rate
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 bg-card/80">
          <CardContent className="space-y-4 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Status breakdown
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active vs expired coupons
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
            </header>
            <StatusBreakdown
              active={overview.active_coupons ?? 0}
              expired={overview.expired_coupons ?? 0}
              total={overview.total_coupons ?? 0}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 lg:col-span-2">
          <CardContent className="space-y-4 p-5">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Top performing coupons
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ranked by total redemptions
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="h-4 w-4" />
              </span>
            </header>

          {topCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-10 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Trophy className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No redemptions yet</p>
              <p className="text-xs text-muted-foreground">
                Share your coupons to see them climb the leaderboard.
              </p>
            </div>
          ) : (
            <ol className="space-y-2">
              {topCoupons.slice(0, 5).map((coupon, idx) => (
                <li
                  key={coupon.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : idx === 1
                          ? "bg-slate-400/15 text-slate-600 dark:text-slate-300"
                          : idx === 2
                            ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-semibold">
                      {coupon.code}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {coupon.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {coupon.usage_count ?? 0}× used
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatTaka(coupon.total_discount)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function StatusBreakdown({
  active,
  expired,
  total,
}: {
  active: number;
  expired: number;
  total: number;
}) {
  const inactive = Math.max(total - active - expired, 0);
  const data = [
    { name: "Active", value: active, color: "#10b981" },
    { name: "Expired", value: expired, color: "#f59e0b" },
    { name: "Inactive", value: inactive, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-8 text-center">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Tag className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">No coupons yet</p>
        <p className="text-xs text-muted-foreground">
          Create your first coupon to see status.
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <PieChart
        data={data}
        dataKey="value"
        nameKey="name"
        height={224}
        innerRadius={45}
        outerRadius={75}
        label={false}
        colors={data.map((d) => d.color)}
        tooltipFormatter={(value, name) => [
          `${Number(value).toLocaleString("en-US")} coupon${
            Number(value) === 1 ? "" : "s"
          }`,
          name,
        ]}
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
  isText,
  sparkline,
  sparklineKey,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string | undefined;
  tone: "primary" | "success" | "info" | "warning";
  isText?: boolean;
  sparkline?: { month: string; count: number }[];
  sparklineKey?: string;
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  const strokeColors: Record<typeof tone, string> = {
    primary: "hsl(var(--primary))",
    success: "#10b981",
    info: "#0ea5e9",
    warning: "#f59e0b",
  };

  const trend = useMemo(() => computeTrend(sparkline, sparklineKey), [sparkline, sparklineKey]);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-xl",
            toneClasses[tone]
          )}
        >
          {icon}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className={cn(
            "font-semibold tracking-tight",
            isText ? "text-2xl" : "text-3xl"
          )}
        >
          {value ?? "—"}
        </p>
        {trend !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trend >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3 h-10 w-full">
          <Sparkline data={sparkline} color={strokeColors[tone]} />
        </div>
      )}
    </div>
  );
}

function computeTrend(
  data: { month: string; count: number }[] | undefined,
  _key?: string
): number | null {
  if (!data || data.length < 2) return null;
  const first = data[0].count;
  const last = data[data.length - 1].count;
  if (first === 0) return last > 0 ? 100 : 0;
  return ((last - first) / first) * 100;
}

function Sparkline({
  data,
  color,
}: {
  data: { month: string; count: number }[];
  color: string;
}) {
  return (
    <LineChart
      data={data}
      xAxisDataKey="month"
      height={40}
      margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
      lines={[
        {
          dataKey: "count",
          name: "Trend",
          color,
          strokeWidth: 2,
          dot: { r: 0, strokeWidth: 0 },
          activeDot: { r: 0, strokeWidth: 0 },
        },
      ]}
    />
  );
}

function UsageBars({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <BarChart
        data={data}
        xAxisDataKey="month"
        height={256}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        yAxisFormatter={(value) => value.toLocaleString("en-US")}
        tooltipFormatter={(value) =>
          `${Number(value).toLocaleString("en-US")} redemptions`
        }
        bars={[
          {
            dataKey: "count",
            name: "Redemptions",
            color: "hsl(var(--primary))",
            radius: [6, 6, 0, 0],
          },
        ]}
      />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card/80 p-4"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

function formatTaka(value: number | undefined) {
  if (value === undefined || value === null) return "—";
  if (!value) return "৳0";
  return `৳${Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}
