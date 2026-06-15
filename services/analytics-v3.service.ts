/**
 * Analytics V3 Service — Hi-Fi Dashboard
 *
 * Target endpoints for the redesigned Overview & Analytics dashboards. The UI is
 * built against these method signatures; the actual endpoints are wired/finalized
 * on the backend afterward. Until then each method degrades gracefully — a failed
 * or missing endpoint resolves to a typed empty payload instead of throwing, so
 * the UI renders clean skeleton/empty states rather than crashing.
 *
 * Base: GET /admin/analytics/...
 */

import apiClient from "@/lib/api";
import type {
  V3DashboardOverviewParams,
  V3DashboardOverviewResponse,
  V3TimeseriesParams,
  V3TimeseriesResponse,
  V3BreakdownParams,
  V3BreakdownResponse,
} from "@/types/analytics-v3.types";

const BASE_PATH = "/admin/analytics";

function buildQueryString(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const queryParams = new URLSearchParams();
  const isAllTime = params.period === "all_time" || params.period === "all";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (isAllTime && (key === "start_date" || key === "end_date")) return;
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : "";
}

// ─── Empty fallbacks ─────────────────────────────────────────────────────────

const EMPTY_OVERVIEW: V3DashboardOverviewResponse = {
  success: true,
  data: {
    summary: {
      total_revenue: 0,
      total_enrollments: 0,
      total_users: 0,
      total_courses: 0,
      total_bundles: 0,
      active_users_30d: 0,
      conversion_rate: 0,
    },
    operational: {
      recent_enrollments_24h: 0,
      recent_payments_24h: 0,
      recent_payment_amount_24h: 0,
      failed_payment_rate_24h: 0,
    },
    revenue: { current: 0, previous: 0, growth_percentage: 0, series: [] },
    enrollments: { current: 0, previous: 0, growth_percentage: 0, series: [] },
    trends: [],
    top_courses: [],
    top_bundles: [],
  },
};

const EMPTY_TIMESERIES: V3TimeseriesResponse = {
  success: true,
  data: {
    trends: [],
    summary: {
      total_revenue: 0,
      total_enrollments: 0,
      total_users: 0,
      average_daily_revenue: 0,
    },
  },
};

function emptyBreakdown(
  dimension: V3BreakdownParams["dimension"]
): V3BreakdownResponse {
  return { success: true, data: { dimension, rows: [], total: 0 } };
}

export const analyticsV3Service = {
  /**
   * GET /admin/analytics/dashboard/overview
   * Rich single-payload overview: summary (with optional deltas/series),
   * operational 24h, revenue/enrollment growth, combined trends, top tables.
   */
  getDashboardOverview: async (
    params?: V3DashboardOverviewParams
  ): Promise<V3DashboardOverviewResponse> => {
    try {
      const qs = buildQueryString(params as Record<string, unknown> | undefined);
      const response = await apiClient.get(
        `${BASE_PATH}/dashboard/overview${qs}`
      );
      return response.data;
    } catch {
      // Endpoint not wired yet → render empty state, not an error.
      return EMPTY_OVERVIEW;
    }
  },

  /**
   * GET /admin/analytics/dashboard/timeseries
   * Dedicated multi-metric trend feed for the main chart.
   */
  getTimeseries: async (
    params?: V3TimeseriesParams
  ): Promise<V3TimeseriesResponse> => {
    try {
      const qs = buildQueryString(params as Record<string, unknown> | undefined);
      const response = await apiClient.get(
        `${BASE_PATH}/dashboard/timeseries${qs}`
      );
      return response.data;
    } catch {
      return EMPTY_TIMESERIES;
    }
  },

  /**
   * GET /admin/analytics/dashboard/breakdown
   * Ranked rows for a given dimension (course / bundle / category / coupon).
   */
  getBreakdown: async (
    params: V3BreakdownParams
  ): Promise<V3BreakdownResponse> => {
    try {
      const qs = buildQueryString(
        params as unknown as Record<string, unknown>
      );
      const response = await apiClient.get(
        `${BASE_PATH}/dashboard/breakdown${qs}`
      );
      return response.data;
    } catch {
      return emptyBreakdown(params.dimension);
    }
  },
};
