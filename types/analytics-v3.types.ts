/**
 * Analytics V3 API Types — Hi-Fi Dashboard Contract
 *
 * This is the *target* contract the redesigned Overview & Analytics dashboards
 * consume. The UI is built against these shapes; the backend / service layer is
 * wired to match afterward. Every field the UI needs is typed here, including the
 * time-series (`trends` / `series`) that powers real trend charts and KPI
 * sparklines (the previous overview only carried scalar current/previous values,
 * which is why the growth charts rendered as flat 2-point lines).
 *
 * Gated by the analytics.manage.all (global) permission.
 */

import type { ApiResponse } from "./index";
import type { DatePreset, GroupBy } from "./analytics-v2.types";

// ─── Shared primitives ───────────────────────────────────────────────────────

/** A single point in a metric time-series. */
export interface V3SeriesPoint {
  /** Bucket label — ISO date ("2026-01-31") or period label ("Jan", "W12"). */
  period: string;
  value: number;
}

/**
 * Period-over-period comparison for a metric.
 * `growth_percentage` may arrive as a string from loose backends — coerce with
 * Number() at the UI boundary (DeltaBadge handles this).
 */
export interface V3GrowthMetrics {
  current: number;
  previous: number;
  growth_percentage: number | string;
  /** Optional intra-period series for sparklines / the main trend chart. */
  series?: V3SeriesPoint[];
}

// ─── Summary (KPI tiles) ─────────────────────────────────────────────────────

/**
 * Headline KPI numbers. Each optional `*_delta` is a period-over-period %
 * (number | string) used by the KPI tiles; optional `*_series` drives the inline
 * sparkline. Core totals are always present.
 */
export interface V3DashboardSummary {
  total_revenue: number;
  total_enrollments: number;
  total_users: number;
  total_courses: number;
  total_bundles: number;
  active_users_30d: number;
  conversion_rate?: number;

  // Optional deltas (period-over-period %).
  revenue_delta?: number | string;
  enrollments_delta?: number | string;
  users_delta?: number | string;
  active_users_delta?: number | string;
  conversion_delta?: number | string;

  // Optional sparkline series.
  revenue_series?: V3SeriesPoint[];
  enrollments_series?: V3SeriesPoint[];
  users_series?: V3SeriesPoint[];
}

// ─── Operational (Last 24h) ──────────────────────────────────────────────────

export interface V3DashboardOperational {
  recent_enrollments_24h: number;
  recent_payments_24h: number;
  recent_payment_amount_24h: number;
  failed_payment_rate_24h: number;
}

// ─── Ranked tables ───────────────────────────────────────────────────────────

export interface V3TopCourse {
  course_id: number;
  title: string;
  enrollments: number;
  revenue: number;
}

export interface V3TopBundle {
  bundle_id: number;
  title: string;
  purchases: number;
  revenue: number;
}

/** Generic ranked row consumed by the shared RankTable component. */
export interface V3RankRow {
  id: number | string;
  label: string;
  /** Primary metric (already formatted upstream or formatted in the cell). */
  value: number;
  /** Secondary metric (e.g. enrollments next to revenue). */
  secondary?: number;
}

// ─── Combined multi-metric trend (main chart) ────────────────────────────────

/**
 * One bucket carrying every chartable metric, so the main trend chart can switch
 * metrics (Revenue / Enrollments / Users) without refetching.
 */
export interface V3TrendPoint {
  period: string;
  revenue: number;
  enrollments: number;
  users: number;
}

export type V3TrendMetric = "revenue" | "enrollments" | "users";

// ─── Dashboard overview (the single rich payload) ────────────────────────────

export interface V3DashboardOverviewData {
  summary: V3DashboardSummary;
  operational: V3DashboardOperational;
  revenue: V3GrowthMetrics;
  enrollments: V3GrowthMetrics;
  /** Combined trend buckets for the main chart + KPI sparklines. */
  trends?: V3TrendPoint[];
  top_courses: V3TopCourse[];
  top_bundles: V3TopBundle[];
}

export interface V3DashboardOverviewParams {
  start_date?: number;
  end_date?: number;
  period?: DatePreset;
  group_by?: GroupBy;
}

export interface V3DateRangeMeta {
  period: string;
  start_date?: number;
  end_date?: number;
  group_by?: GroupBy;
}

export type V3DashboardOverviewResponse = ApiResponse<V3DashboardOverviewData> & {
  meta?: V3DateRangeMeta;
};

// ─── Timeseries endpoint (dedicated chart feed) ──────────────────────────────

export interface V3TimeseriesParams {
  start_date?: number;
  end_date?: number;
  period?: DatePreset;
  group_by?: GroupBy;
  metric?: V3TrendMetric;
}

export interface V3TimeseriesData {
  trends: V3TrendPoint[];
  summary: {
    total_revenue: number;
    total_enrollments: number;
    total_users: number;
    average_daily_revenue: number;
  };
}

export type V3TimeseriesResponse = ApiResponse<V3TimeseriesData> & {
  meta?: V3DateRangeMeta;
};

// ─── Breakdown endpoint (ranked dimensions) ──────────────────────────────────

export type V3BreakdownDimension = "course" | "bundle" | "category" | "coupon";

export interface V3BreakdownParams {
  start_date?: number;
  end_date?: number;
  period?: DatePreset;
  dimension: V3BreakdownDimension;
  limit?: number;
}

export interface V3BreakdownRow {
  id: number | string;
  label: string;
  value: number;
  secondary?: number;
  /** Share of the total (0–1), if provided. */
  share?: number;
}

export interface V3BreakdownData {
  dimension: V3BreakdownDimension;
  rows: V3BreakdownRow[];
  total: number;
}

export type V3BreakdownResponse = ApiResponse<V3BreakdownData> & {
  meta?: V3DateRangeMeta;
};
