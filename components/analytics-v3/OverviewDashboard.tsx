"use client";

import * as React from "react";
import {
  DollarSign,
  GraduationCap,
  Users,
  UserCheck,
  Percent,
  Boxes,
  UserPlus,
  CreditCard,
  TriangleAlert,
  Activity,
  BookOpen,
  Package,
} from "lucide-react";
import { useV3DashboardOverview } from "@/hooks/useAnalyticsV3";
import {
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
} from "@/lib/analytics-v2.utils";
import type {
  V3DashboardOverviewParams,
  V3TrendMetric,
  V3SeriesPoint,
} from "@/types/analytics-v3.types";
import { cn } from "@/lib/utils";
import {
  KpiTile,
  ChartCard,
  TrendChart,
  RankTable,
  MetricToggle,
  DeltaBadge,
} from "@/components/analytics-v3/shared";

interface OverviewDashboardProps {
  params?: V3DashboardOverviewParams;
}

const METRIC_OPTIONS: { value: V3TrendMetric; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "enrollments", label: "Enrollments" },
  { value: "users", label: "Users" },
];

const METRIC_META: Record<
  V3TrendMetric,
  { token: string; name: string; format: (v: number) => string }
> = {
  revenue: { token: "--success", name: "Revenue", format: formatCurrency },
  enrollments: {
    token: "--primary",
    name: "Enrollments",
    format: (v) => v.toLocaleString(),
  },
  users: { token: "--info", name: "Users", format: (v) => v.toLocaleString() },
};

// ─── Operational mini-card ───────────────────────────────────────────────────

function OperationalRow({
  icon: Icon,
  label,
  value,
  accent = "--muted-foreground",
  highlight = false,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        highlight
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/60 bg-muted/30"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          highlight ? "bg-destructive/10" : "border border-border/60 bg-background"
        )}
      >
        <Icon
          className="h-4 w-4"
          style={{ color: `var(${highlight ? "--destructive" : accent})` }}
        />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function OverviewDashboard({ params }: OverviewDashboardProps) {
  const { data, isLoading } = useV3DashboardOverview(params);
  const [metric, setMetric] = React.useState<V3TrendMetric>("revenue");

  const d = data?.data;
  const summary = d?.summary;
  const operational = d?.operational;
  const revenue = d?.revenue;
  const enrollments = d?.enrollments;
  const trends = d?.trends ?? [];

  // Series for the selected metric in the main chart.
  const chartSeries: V3SeriesPoint[] = React.useMemo(
    () => trends.map((t) => ({ period: t.period, value: t[metric] })),
    [trends, metric]
  );

  // Per-KPI sparkline series (prefer dedicated summary series, fall back to trends).
  const revSpark =
    summary?.revenue_series ??
    trends.map((t) => ({ period: t.period, value: t.revenue }));
  const enrSpark =
    summary?.enrollments_series ??
    trends.map((t) => ({ period: t.period, value: t.enrollments }));
  const usrSpark =
    summary?.users_series ??
    trends.map((t) => ({ period: t.period, value: t.users }));

  const meta = METRIC_META[metric];

  return (
    <div className="space-y-5">
      {/* ── KPI row (6 dense tiles) ── */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile
          loading={isLoading}
          label="Total Revenue"
          value={formatCurrency(summary?.total_revenue ?? 0)}
          icon={DollarSign}
          accent="--success"
          delta={revenue?.growth_percentage ?? summary?.revenue_delta}
          series={revSpark}
        />
        <KpiTile
          loading={isLoading}
          label="Enrollments"
          value={(summary?.total_enrollments ?? 0).toLocaleString()}
          icon={GraduationCap}
          accent="--primary"
          delta={enrollments?.growth_percentage ?? summary?.enrollments_delta}
          series={enrSpark}
        />
        <KpiTile
          loading={isLoading}
          label="Total Users"
          value={(summary?.total_users ?? 0).toLocaleString()}
          icon={Users}
          accent="--info"
          delta={summary?.users_delta}
          series={usrSpark}
        />
        <KpiTile
          loading={isLoading}
          label="Active (30d)"
          value={(summary?.active_users_30d ?? 0).toLocaleString()}
          icon={UserCheck}
          accent="--teal"
          delta={summary?.active_users_delta}
        />
        <KpiTile
          loading={isLoading}
          label="Conversion"
          value={formatPercentage(summary?.conversion_rate ?? 0, 1)}
          icon={Percent}
          accent="--warning"
          delta={summary?.conversion_delta}
        />
        <KpiTile
          loading={isLoading}
          label="Bundles"
          value={(summary?.total_bundles ?? 0).toLocaleString()}
          subtitle={`${summary?.total_courses ?? 0} courses`}
          icon={Boxes}
          accent="--accent"
        />
      </div>

      {/* ── Main trend chart + operational panel ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Performance Trend"
          subtitle="Revenue, enrollments & user growth over time"
          icon={Activity}
          loading={isLoading}
          empty={!isLoading && chartSeries.length < 2}
          emptyLabel="No trend data for this period yet"
          minHeight={260}
          toolbar={
            <MetricToggle
              value={metric}
              onChange={setMetric}
              options={METRIC_OPTIONS}
            />
          }
        >
          <TrendChart
            data={chartSeries}
            colorToken={meta.token}
            name={meta.name}
            formatter={meta.format}
            height={260}
          />
        </ChartCard>

        <ChartCard
          title="Last 24 Hours"
          icon={Activity}
          loading={isLoading}
          minHeight={260}
          bodyClassName="space-y-2.5"
        >
          <OperationalRow
            icon={UserPlus}
            label="New Enrollments"
            value={(operational?.recent_enrollments_24h ?? 0).toLocaleString()}
            accent="--primary"
          />
          <OperationalRow
            icon={CreditCard}
            label="Payments Processed"
            value={(operational?.recent_payments_24h ?? 0).toLocaleString()}
            accent="--success"
          />
          <OperationalRow
            icon={DollarSign}
            label="Payment Amount"
            value={formatCurrency(operational?.recent_payment_amount_24h ?? 0)}
            accent="--success"
          />
          <OperationalRow
            icon={TriangleAlert}
            label="Failed Payment Rate"
            value={formatPercentage(
              operational?.failed_payment_rate_24h ?? 0,
              1
            )}
            highlight={(operational?.failed_payment_rate_24h ?? 0) > 5}
          />
        </ChartCard>
      </div>

      {/* ── Compact revenue vs enrollment summary strip ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Revenue"
          subtitle="Current vs previous period"
          icon={DollarSign}
          loading={isLoading}
          minHeight={120}
          toolbar={<DeltaBadge value={revenue?.growth_percentage} />}
          bodyClassName="flex items-end justify-between gap-4 pt-3"
        >
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-xl font-bold tabular-nums">
              {formatCurrency(revenue?.current ?? 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="text-xl font-semibold tabular-nums text-muted-foreground">
              {formatCurrency(revenue?.previous ?? 0)}
            </p>
          </div>
        </ChartCard>

        <ChartCard
          title="Enrollments"
          subtitle="Current vs previous period"
          icon={GraduationCap}
          loading={isLoading}
          minHeight={120}
          toolbar={<DeltaBadge value={enrollments?.growth_percentage} />}
          bodyClassName="flex items-end justify-between gap-4 pt-3"
        >
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-xl font-bold tabular-nums">
              {(enrollments?.current ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="text-xl font-semibold tabular-nums text-muted-foreground">
              {(enrollments?.previous ?? 0).toLocaleString()}
            </p>
          </div>
        </ChartCard>
      </div>

      {/* ── Top performers ── */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Top Performing Courses"
          icon={BookOpen}
          loading={isLoading}
          empty={!isLoading && (d?.top_courses?.length ?? 0) === 0}
          emptyLabel="No course revenue yet"
          flush
          minHeight={200}
        >
          <RankTable
            rows={(d?.top_courses ?? []).slice(0, 8).map((c) => ({
              id: c.course_id,
              label: c.title,
              value: c.revenue,
              secondary: c.enrollments,
            }))}
            valueLabel="Revenue"
            secondaryLabel="Enrollments"
            formatValue={formatCurrency}
            formatSecondary={formatCompactNumber}
          />
        </ChartCard>

        <ChartCard
          title="Top Performing Bundles"
          icon={Package}
          loading={isLoading}
          empty={!isLoading && (d?.top_bundles?.length ?? 0) === 0}
          emptyLabel="No bundle revenue yet"
          flush
          minHeight={200}
        >
          <RankTable
            rows={(d?.top_bundles ?? []).slice(0, 8).map((b) => ({
              id: b.bundle_id,
              label: b.title,
              value: b.revenue,
              secondary: b.purchases,
            }))}
            valueLabel="Revenue"
            secondaryLabel="Purchases"
            formatValue={formatCurrency}
            formatSecondary={formatCompactNumber}
          />
        </ChartCard>
      </div>
    </div>
  );
}
