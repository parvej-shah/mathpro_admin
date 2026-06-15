/**
 * Analytics V3 Hooks — Hi-Fi Dashboard
 *
 * React Query hooks for the redesigned dashboards. The service layer returns safe
 * empty payloads when an endpoint isn't wired yet, so these hooks always resolve to
 * typed data and the UI renders skeleton → empty states without errors.
 */

import { useQuery } from "@tanstack/react-query";
import { analyticsV3Service } from "@/services/analytics-v3.service";
import type {
  V3DashboardOverviewParams,
  V3TimeseriesParams,
  V3BreakdownParams,
} from "@/types/analytics-v3.types";

export function useV3DashboardOverview(params?: V3DashboardOverviewParams) {
  return useQuery({
    queryKey: ["analytics-v3", "dashboard", "overview", params],
    queryFn: () => analyticsV3Service.getDashboardOverview(params),
  });
}

export function useV3Timeseries(params?: V3TimeseriesParams) {
  return useQuery({
    queryKey: ["analytics-v3", "dashboard", "timeseries", params],
    queryFn: () => analyticsV3Service.getTimeseries(params),
  });
}

export function useV3Breakdown(params: V3BreakdownParams) {
  return useQuery({
    queryKey: ["analytics-v3", "dashboard", "breakdown", params],
    queryFn: () => analyticsV3Service.getBreakdown(params),
    enabled: Boolean(params?.dimension),
  });
}
