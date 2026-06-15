/**
 * Analytics V2 Service
 * Service functions for all Analytics V2 API endpoints
 */

import apiClient from "@/lib/api";
import type {
  DashboardOverviewResponse,
  DashboardOverviewParams,
  RevenueSummaryResponse,
  RevenueSummaryParams,
  RevenueTrendsResponse,
  RevenueTrendsParams,
  RevenueByCourseResponse,
  RevenueByCourseParams,
  RevenueByBundleResponse,
  RevenueByBundleParams,
  RevenuePredictionsResponse,
  RevenuePredictionsParams,
  UserOverviewResponse,
  UserOverviewParams,
  UserGrowthResponse,
  UserGrowthParams,
  UserEngagementResponse,
  UserEngagementParams,
  CourseOverviewResponse,
  CourseOverviewParams,
  CourseDetailedResponse,
  CourseDetailedParams,
  CourseCompletionResponse,
  CourseCompletionParams,
  BundleOverviewResponse,
  BundleOverviewParams,
  BundleDetailedResponse,
  BundleDetailedParams,
  LearningProgressResponse,
  LearningProgressParams,
  StreakAnalyticsResponse,
  StreakAnalyticsParams,
  CouponOverviewResponse,
  CouponOverviewParams,
  CouponPerformanceResponse,
  CouponPerformanceParams,
  PaymentOverviewResponse,
  PaymentOverviewParams,
  FilterOptionsResponse,
  FilterType,
  MetadataResponse,
} from "@/types/analytics-v2.types";

const BASE_PATH = "/admin/analytics";

/**
 * Build query string from params object
 * Handles all_time preset by omitting date parameters
 */
function buildQueryString(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  
  const queryParams = new URLSearchParams();
  
  // If period is all_time or all, omit start_date and end_date
  const isAllTime = params.period === "all_time" || params.period === "all";
  
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Skip date params when all_time is selected
      if (isAllTime && (key === "start_date" || key === "end_date")) {
        return;
      }
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const analyticsV2Service = {
  // ============================================================================
  // Dashboard
  // ============================================================================

  /**
   * Get dashboard overview
   * GET /admin/analytics/dashboard/overview
   */
  getDashboardOverview: async (
    params?: DashboardOverviewParams
  ): Promise<DashboardOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/dashboard/overview${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Revenue
  // ============================================================================

  /**
   * Get revenue summary
   * GET /admin/analytics/revenue/summary
   */
  getRevenueSummary: async (
    params?: RevenueSummaryParams
  ): Promise<RevenueSummaryResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/revenue/summary${queryString}`);
    return response.data;
  },

  /**
   * Get revenue trends
   * GET /admin/analytics/revenue/trends
   * Requires start_date and end_date
   */
  getRevenueTrends: async (
    params: RevenueTrendsParams
  ): Promise<RevenueTrendsResponse> => {
    const queryString = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get(`${BASE_PATH}/revenue/trends${queryString}`);
    return response.data;
  },

  /**
   * Get revenue by course
   * GET /admin/analytics/revenue/by-course
   */
  getRevenueByCourse: async (
    params?: RevenueByCourseParams
  ): Promise<RevenueByCourseResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/revenue/by-course${queryString}`);
    return response.data;
  },

  /**
   * Get revenue by bundle
   * GET /admin/analytics/revenue/by-bundle
   */
  getRevenueByBundle: async (
    params?: RevenueByBundleParams
  ): Promise<RevenueByBundleResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/revenue/by-bundle${queryString}`);
    return response.data;
  },

  /**
   * Get revenue predictions
   * GET /admin/analytics/revenue/predictions
   * Requires period
   */
  getRevenuePredictions: async (
    params: RevenuePredictionsParams
  ): Promise<RevenuePredictionsResponse> => {
    const queryString = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get(`${BASE_PATH}/revenue/predictions${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Users
  // ============================================================================

  /**
   * Get user overview
   * GET /admin/analytics/users/overview
   */
  getUserOverview: async (
    params?: UserOverviewParams
  ): Promise<UserOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/users/overview${queryString}`);
    return response.data;
  },

  /**
   * Get user growth
   * GET /admin/analytics/users/growth
   * Requires start_date and end_date
   */
  getUserGrowth: async (
    params: UserGrowthParams
  ): Promise<UserGrowthResponse> => {
    const queryString = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get(`${BASE_PATH}/users/growth${queryString}`);
    return response.data;
  },

  /**
   * Get user engagement
   * GET /admin/analytics/users/engagement
   */
  getUserEngagement: async (
    params?: UserEngagementParams
  ): Promise<UserEngagementResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/users/engagement${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Courses
  // ============================================================================

  /**
   * Get course overview
   * GET /admin/analytics/courses/overview
   */
  getCourseOverview: async (
    params?: CourseOverviewParams
  ): Promise<CourseOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/courses/overview${queryString}`);
    return response.data;
  },

  /**
   * Get course detailed analytics
   * GET /admin/analytics/courses/:courseId/detailed
   */
  getCourseDetailed: async (
    courseId: number,
    params?: CourseDetailedParams
  ): Promise<CourseDetailedResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(
      `${BASE_PATH}/courses/${courseId}/detailed${queryString}`
    );
    return response.data;
  },

  /**
   * Get course completion
   * GET /admin/analytics/courses/completion
   */
  getCourseCompletion: async (
    params?: CourseCompletionParams
  ): Promise<CourseCompletionResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/courses/completion${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Bundles
  // ============================================================================

  /**
   * Get bundle overview
   * GET /admin/analytics/bundles/overview
   */
  getBundleOverview: async (
    params?: BundleOverviewParams
  ): Promise<BundleOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/bundles/overview${queryString}`);
    return response.data;
  },

  /**
   * Get bundle detailed analytics
   * GET /admin/analytics/bundles/:bundleId/detailed
   */
  getBundleDetailed: async (
    bundleId: number,
    params?: BundleDetailedParams
  ): Promise<BundleDetailedResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(
      `${BASE_PATH}/bundles/${bundleId}/detailed${queryString}`
    );
    return response.data;
  },

  // ============================================================================
  // Learning
  // ============================================================================

  /**
   * Get learning progress
   * GET /admin/analytics/learning/progress
   */
  getLearningProgress: async (
    params?: LearningProgressParams
  ): Promise<LearningProgressResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/learning/progress${queryString}`);
    return response.data;
  },

  /**
   * Get streak analytics
   * GET /admin/analytics/learning/streaks
   */
  getStreakAnalytics: async (
    params?: StreakAnalyticsParams
  ): Promise<StreakAnalyticsResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/learning/streaks${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Coupons
  // ============================================================================

  /**
   * Get coupon overview
   * GET /admin/analytics/coupons/overview
   */
  getCouponOverview: async (
    params?: CouponOverviewParams
  ): Promise<CouponOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/coupons/overview${queryString}`);
    return response.data;
  },

  /**
   * Get coupon performance
   * GET /admin/analytics/coupons/performance
   */
  getCouponPerformance: async (
    params?: CouponPerformanceParams
  ): Promise<CouponPerformanceResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(
      `${BASE_PATH}/coupons/performance${queryString}`
    );
    return response.data;
  },

  // ============================================================================
  // Payments
  // ============================================================================

  /**
   * Get payment overview
   * GET /admin/analytics/payments/overview
   */
  getPaymentOverview: async (
    params?: PaymentOverviewParams
  ): Promise<PaymentOverviewResponse> => {
    const queryString = buildQueryString(params as Record<string, unknown> | undefined);
    const response = await apiClient.get(`${BASE_PATH}/payments/overview${queryString}`);
    return response.data;
  },

  // ============================================================================
  // Filters
  // ============================================================================

  /**
   * Get filter options
   * GET /admin/analytics/filters/options?type={type}
   */
  getFilterOptions: async (type: FilterType): Promise<FilterOptionsResponse> => {
    const response = await apiClient.get(
      `${BASE_PATH}/filters/options?type=${type}`
    );
    return response.data;
  },

  // ============================================================================
  // Metadata
  // ============================================================================

  /**
   * Get all metadata
   * GET /admin/analytics/metadata
   */
  getAllMetadata: async (): Promise<MetadataResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/metadata`);
    return response.data;
  },

  /**
   * Get category metadata
   * GET /admin/analytics/metadata/{category}
   */
  getCategoryMetadata: async (
    category: string
  ): Promise<MetadataResponse> => {
    const response = await apiClient.get(`${BASE_PATH}/metadata/${category}`);
    return response.data;
  },

  /**
   * Get specific data point metadata
   * GET /admin/analytics/metadata/{category}/{key}
   */
  getDataPointMetadata: async (
    category: string,
    key: string
  ): Promise<MetadataResponse> => {
    const response = await apiClient.get(
      `${BASE_PATH}/metadata/${category}/${key}`
    );
    return response.data;
  },
};
