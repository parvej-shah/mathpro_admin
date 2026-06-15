/**
 * Analytics V2 Hooks
 * React Query hooks for all Analytics V2 API endpoints
 */

import { useQuery } from "@tanstack/react-query";
import { analyticsV2Service } from "@/services/analytics-v2.service";
import type {
  DashboardOverviewParams,
  RevenueSummaryParams,
  RevenueTrendsParams,
  RevenueByCourseParams,
  RevenueByBundleParams,
  RevenuePredictionsParams,
  UserOverviewParams,
  UserGrowthParams,
  UserEngagementParams,
  CourseOverviewParams,
  CourseDetailedParams,
  CourseCompletionParams,
  BundleOverviewParams,
  BundleDetailedParams,
  LearningProgressParams,
  StreakAnalyticsParams,
  CouponOverviewParams,
  CouponPerformanceParams,
  PaymentOverviewParams,
  FilterType,
} from "@/types/analytics-v2.types";

// ============================================================================
// Query Keys
// ============================================================================

const QUERY_KEYS = {
  all: ["analytics-v2"] as const,
  dashboard: () => [...QUERY_KEYS.all, "dashboard"] as const,
  dashboardOverview: (params?: DashboardOverviewParams) =>
    [...QUERY_KEYS.dashboard(), "overview", params] as const,
  revenue: () => [...QUERY_KEYS.all, "revenue"] as const,
  revenueSummary: (params?: RevenueSummaryParams) =>
    [...QUERY_KEYS.revenue(), "summary", params] as const,
  revenueTrends: (params: RevenueTrendsParams) =>
    [...QUERY_KEYS.revenue(), "trends", params] as const,
  revenueByCourse: (params?: RevenueByCourseParams) =>
    [...QUERY_KEYS.revenue(), "by-course", params] as const,
  revenueByBundle: (params?: RevenueByBundleParams) =>
    [...QUERY_KEYS.revenue(), "by-bundle", params] as const,
  revenuePredictions: (params: RevenuePredictionsParams) =>
    [...QUERY_KEYS.revenue(), "predictions", params] as const,
  users: () => [...QUERY_KEYS.all, "users"] as const,
  userOverview: (params?: UserOverviewParams) =>
    [...QUERY_KEYS.users(), "overview", params] as const,
  userGrowth: (params: UserGrowthParams) =>
    [...QUERY_KEYS.users(), "growth", params] as const,
  userEngagement: (params?: UserEngagementParams) =>
    [...QUERY_KEYS.users(), "engagement", params] as const,
  courses: () => [...QUERY_KEYS.all, "courses"] as const,
  courseOverview: (params?: CourseOverviewParams) =>
    [...QUERY_KEYS.courses(), "overview", params] as const,
  courseDetailed: (courseId: number, params?: CourseDetailedParams) =>
    [...QUERY_KEYS.courses(), "detailed", courseId, params] as const,
  courseCompletion: (params?: CourseCompletionParams) =>
    [...QUERY_KEYS.courses(), "completion", params] as const,
  bundles: () => [...QUERY_KEYS.all, "bundles"] as const,
  bundleOverview: (params?: BundleOverviewParams) =>
    [...QUERY_KEYS.bundles(), "overview", params] as const,
  bundleDetailed: (bundleId: number, params?: BundleDetailedParams) =>
    [...QUERY_KEYS.bundles(), "detailed", bundleId, params] as const,
  learning: () => [...QUERY_KEYS.all, "learning"] as const,
  learningProgress: (params?: LearningProgressParams) =>
    [...QUERY_KEYS.learning(), "progress", params] as const,
  streakAnalytics: (params?: StreakAnalyticsParams) =>
    [...QUERY_KEYS.learning(), "streaks", params] as const,
  coupons: () => [...QUERY_KEYS.all, "coupons"] as const,
  couponOverview: (params?: CouponOverviewParams) =>
    [...QUERY_KEYS.coupons(), "overview", params] as const,
  couponPerformance: (params?: CouponPerformanceParams) =>
    [...QUERY_KEYS.coupons(), "performance", params] as const,
  payments: () => [...QUERY_KEYS.all, "payments"] as const,
  paymentOverview: (params?: PaymentOverviewParams) =>
    [...QUERY_KEYS.payments(), "overview", params] as const,
  filters: () => [...QUERY_KEYS.all, "filters"] as const,
  filterOptions: (type: FilterType) =>
    [...QUERY_KEYS.filters(), "options", type] as const,
  metadata: () => [...QUERY_KEYS.all, "metadata"] as const,
  allMetadata: () => [...QUERY_KEYS.metadata(), "all"] as const,
  categoryMetadata: (category: string) =>
    [...QUERY_KEYS.metadata(), "category", category] as const,
  dataPointMetadata: (category: string, key: string) =>
    [...QUERY_KEYS.metadata(), "datapoint", category, key] as const,
};

// ============================================================================
// Filter Options Caching
// ============================================================================

const FILTER_CACHE_KEY_PREFIX = "analytics-v2-filters-";
const FILTER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedFilterData {
  data: unknown;
  timestamp: number;
}

function getCachedFilterOptions(type: FilterType): unknown | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(`${FILTER_CACHE_KEY_PREFIX}${type}`);
    if (!cached) return null;
    
    const parsed: CachedFilterData = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    
    if (age < FILTER_CACHE_DURATION) {
      return parsed.data;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(`${FILTER_CACHE_KEY_PREFIX}${type}`);
    return null;
  } catch {
    return null;
  }
}

function setCachedFilterOptions(type: FilterType, data: unknown): void {
  if (typeof window === "undefined") return;
  
  try {
    const cacheData: CachedFilterData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${FILTER_CACHE_KEY_PREFIX}${type}`,
      JSON.stringify(cacheData)
    );
  } catch {
    // Ignore localStorage errors
  }
}

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Get dashboard overview
 */
export function useDashboardOverview(params?: DashboardOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardOverview(params),
    queryFn: () => analyticsV2Service.getDashboardOverview(params),
  });
}

// ============================================================================
// Revenue Hooks
// ============================================================================

/**
 * Get revenue summary
 */
export function useRevenueSummary(params?: RevenueSummaryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.revenueSummary(params),
    queryFn: () => analyticsV2Service.getRevenueSummary(params),
  });
}

/**
 * Get revenue trends
 * Requires start_date and end_date
 */
export function useRevenueTrends(params: RevenueTrendsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.revenueTrends(params),
    queryFn: () => analyticsV2Service.getRevenueTrends(params),
    enabled: !!params.start_date && !!params.end_date,
  });
}

/**
 * Get revenue by course
 */
export function useRevenueByCourse(params?: RevenueByCourseParams) {
  return useQuery({
    queryKey: QUERY_KEYS.revenueByCourse(params),
    queryFn: () => analyticsV2Service.getRevenueByCourse(params),
  });
}

/**
 * Get revenue by bundle
 */
export function useRevenueByBundle(params?: RevenueByBundleParams) {
  return useQuery({
    queryKey: QUERY_KEYS.revenueByBundle(params),
    queryFn: () => analyticsV2Service.getRevenueByBundle(params),
  });
}

/**
 * Get revenue predictions
 * Requires period
 */
export function useRevenuePredictions(params: RevenuePredictionsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.revenuePredictions(params),
    queryFn: () => analyticsV2Service.getRevenuePredictions(params),
    enabled: !!params.period,
  });
}

// ============================================================================
// User Hooks
// ============================================================================

/**
 * Get user overview
 */
export function useUserOverview(params?: UserOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.userOverview(params),
    queryFn: () => analyticsV2Service.getUserOverview(params),
  });
}

/**
 * Get user growth
 * Requires start_date and end_date
 */
export function useUserGrowth(params: UserGrowthParams) {
  return useQuery({
    queryKey: QUERY_KEYS.userGrowth(params),
    queryFn: () => analyticsV2Service.getUserGrowth(params),
    enabled: !!params.start_date && !!params.end_date,
  });
}

/**
 * Get user engagement
 */
export function useUserEngagement(params?: UserEngagementParams) {
  return useQuery({
    queryKey: QUERY_KEYS.userEngagement(params),
    queryFn: () => analyticsV2Service.getUserEngagement(params),
  });
}

// ============================================================================
// Course Hooks
// ============================================================================

/**
 * Get course overview
 */
export function useCourseOverview(params?: CourseOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.courseOverview(params),
    queryFn: () => analyticsV2Service.getCourseOverview(params),
  });
}

/**
 * Get course detailed analytics
 */
export function useCourseDetailed(
  courseId: number | null,
  params?: CourseDetailedParams
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseDetailed(courseId || 0, params),
    queryFn: () => analyticsV2Service.getCourseDetailed(courseId!, params),
    enabled: !!courseId,
  });
}

/**
 * Get course completion
 */
export function useCourseCompletion(params?: CourseCompletionParams) {
  return useQuery({
    queryKey: QUERY_KEYS.courseCompletion(params),
    queryFn: () => analyticsV2Service.getCourseCompletion(params),
  });
}

// ============================================================================
// Bundle Hooks
// ============================================================================

/**
 * Get bundle overview
 */
export function useBundleOverview(params?: BundleOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.bundleOverview(params),
    queryFn: () => analyticsV2Service.getBundleOverview(params),
  });
}

/**
 * Get bundle detailed analytics
 */
export function useBundleDetailed(
  bundleId: number | null,
  params?: BundleDetailedParams
) {
  return useQuery({
    queryKey: QUERY_KEYS.bundleDetailed(bundleId || 0, params),
    queryFn: () => analyticsV2Service.getBundleDetailed(bundleId!, params),
    enabled: !!bundleId,
  });
}

// ============================================================================
// Learning Hooks
// ============================================================================

/**
 * Get learning progress
 */
export function useLearningProgress(params?: LearningProgressParams) {
  return useQuery({
    queryKey: QUERY_KEYS.learningProgress(params),
    queryFn: () => analyticsV2Service.getLearningProgress(params),
  });
}

/**
 * Get streak analytics
 */
export function useStreakAnalytics(params?: StreakAnalyticsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.streakAnalytics(params),
    queryFn: () => analyticsV2Service.getStreakAnalytics(params),
  });
}

// ============================================================================
// Engagement Hooks
// ============================================================================


// ============================================================================
// Coupon Hooks
// ============================================================================

/**
 * Get coupon overview
 */
export function useCouponOverview(params?: CouponOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.couponOverview(params),
    queryFn: () => analyticsV2Service.getCouponOverview(params),
  });
}

/**
 * Get coupon performance
 */
export function useCouponPerformance(params?: CouponPerformanceParams) {
  return useQuery({
    queryKey: QUERY_KEYS.couponPerformance(params),
    queryFn: () => analyticsV2Service.getCouponPerformance(params),
  });
}

// ============================================================================
// Payment Hooks
// ============================================================================

/**
 * Get payment overview
 */
export function usePaymentOverview(params?: PaymentOverviewParams) {
  return useQuery({
    queryKey: QUERY_KEYS.paymentOverview(params),
    queryFn: () => analyticsV2Service.getPaymentOverview(params),
  });
}

// ============================================================================
// Filter Hooks
// ============================================================================

/**
 * Get filter options (with localStorage caching)
 */
export function useFilterOptions(type: FilterType) {
  return useQuery({
    queryKey: QUERY_KEYS.filterOptions(type),
    queryFn: async () => {
      // Check cache first
      const cached = getCachedFilterOptions(type);
      if (cached) {
        return cached as Awaited<ReturnType<typeof analyticsV2Service.getFilterOptions>>;
      }
      
      // Fetch from API
      const response = await analyticsV2Service.getFilterOptions(type);
      
      // Cache the response
      if (response.success && response.data) {
        setCachedFilterOptions(type, response);
      }
      
      return response;
    },
    staleTime: FILTER_CACHE_DURATION, // Consider data fresh for 5 minutes
    gcTime: FILTER_CACHE_DURATION * 2, // Keep in cache for 10 minutes
  });
}

// ============================================================================
// Metadata Hooks
// ============================================================================

/**
 * Get all metadata
 * Fetches complete metadata for all data points across all categories
 */
export function useAllMetadata() {
  return useQuery({
    queryKey: QUERY_KEYS.allMetadata(),
    queryFn: () => analyticsV2Service.getAllMetadata(),
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes (metadata rarely changes)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}

/**
 * Get category metadata
 * Fetches metadata for all data points in a specific category
 */
export function useCategoryMetadata(category: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.categoryMetadata(category),
    queryFn: () => analyticsV2Service.getCategoryMetadata(category),
    enabled: enabled && !!category,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}

/**
 * Get specific data point metadata
 * Fetches metadata for a specific data point (e.g., dashboard.summary.total_revenue)
 */
export function useDataPointMetadata(
  category: string,
  key: string,
  enabled = true
) {
  return useQuery({
    queryKey: QUERY_KEYS.dataPointMetadata(category, key),
    queryFn: () => analyticsV2Service.getDataPointMetadata(category, key),
    enabled: enabled && !!category && !!key,
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
