/**
 * Analytics V2 API Types
 * Based on Analytics V2 Frontend Integration Guide
 */

import type { ApiResponse } from "./index";

// ============================================================================
// Common Types
// ============================================================================

export type DatePreset =
  | "all_time"
  | "all"
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "last_year"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_365_days";

export type GroupBy = "day" | "week" | "month" | "quarter" | "year";

export type SortBy = "revenue" | "enrollments" | "purchases";

export type SortOrder = "asc" | "desc";

export type PredictionPeriod = "week" | "month" | "quarter" | "year";

export type PredictionMethod = "average" | "trend";

export type ConfidenceLevel = "low" | "medium" | "high";

export type FilterType = "courses" | "bundles" | "coupons" | "users" | "teachers";

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface DateRangeMeta {
  period?: string;
  start_date?: number;
  end_date?: number;
}

// ============================================================================
// Dashboard Overview Types
// ============================================================================

export interface DashboardSummary {
  total_users: number;
  total_courses: number;
  total_bundles: number;
  total_revenue: number;
  total_enrollments: number;
  active_users_30d: number;
}

export interface DashboardOperational {
  recent_enrollments_24h: number;
  recent_payments_24h: number;
  recent_payment_amount_24h: number;
  failed_payment_rate_24h: number;
}

export interface GrowthMetrics {
  current: number;
  previous: number;
  growth_percentage: string;
}

export interface TopCourse {
  course_id: number;
  title: string;
  enrollments: number;
  revenue: number;
}

export interface TopBundle {
  bundle_id: number;
  title: string;
  purchases: number;
  revenue: number;
}

export interface DashboardOverviewData {
  summary: DashboardSummary;
  operational: DashboardOperational;
  revenue: GrowthMetrics;
  enrollments: GrowthMetrics;
  top_courses: TopCourse[];
  top_bundles: TopBundle[];
}

export interface DashboardOverviewParams {
  start_date?: number;
  end_date?: number;
  period?: DatePreset;
}

export type DashboardOverviewResponse = ApiResponse<DashboardOverviewData> & {
  meta?: DateRangeMeta;
};

// ============================================================================
// Revenue Types
// ============================================================================

export interface RevenueTrend {
  period: string;
  revenue: number;
  enrollments?: number;
  course_revenue?: number;
  bundle_revenue?: number;
}

export interface RevenueSummaryData {
  total_revenue: number;
  course_revenue: number;
  bundle_revenue: number;
  with_coupon_revenue: number;
  without_coupon_revenue: number;
  discount_given: number;
  average_order_value: number;
  total_transactions: number;
  trends?: RevenueTrend[];
}

export interface RevenueSummaryParams {
  start_date?: number;
  end_date?: number;
  group_by?: GroupBy;
  course_id?: number;
  bundle_id?: number;
}

export type RevenueSummaryResponse = ApiResponse<RevenueSummaryData>;

export interface RevenueTrendsData {
  trends: RevenueTrend[];
  summary: {
    total_revenue: number;
    average_daily_revenue: number;
  };
}

export interface RevenueTrendsParams {
  start_date: number;
  end_date: number;
  group_by?: GroupBy;
  course_id?: number;
  bundle_id?: number;
}

export type RevenueTrendsResponse = ApiResponse<RevenueTrendsData>;

export interface RevenueByCourseItem {
  course_id: number;
  title: string;
  revenue: number;
  enrollments: number;
  average_revenue_per_student: number;
  with_coupon_revenue: number;
  without_coupon_revenue: number;
}

export interface RevenueByCourseData {
  courses: RevenueByCourseItem[];
  meta: PaginationMeta;
}

export interface RevenueByCourseParams {
  start_date?: number;
  end_date?: number;
  limit?: number;
  offset?: number;
  sort_by?: SortBy;
  order?: SortOrder;
}

export type RevenueByCourseResponse = ApiResponse<RevenueByCourseData>;

export interface RevenueByBundleItem {
  bundle_id: number;
  title: string;
  revenue: number;
  purchases: number;
  average_revenue_per_purchase: number;
  with_coupon_revenue: number;
  without_coupon_revenue: number;
}

export interface RevenueByBundleData {
  bundles: RevenueByBundleItem[];
  meta: PaginationMeta;
}

export interface RevenueByBundleParams {
  start_date?: number;
  end_date?: number;
  limit?: number;
  offset?: number;
  sort_by?: SortBy;
  order?: SortOrder;
}

export type RevenueByBundleResponse = ApiResponse<RevenueByBundleData>;

export interface RevenuePrediction {
  period: string;
  predicted_revenue: number;
  confidence: ConfidenceLevel;
  method: PredictionMethod;
  based_on: {
    historical_periods: number;
    average_revenue: number;
    growth_rate: number;
  };
}

export interface RevenuePredictionsData {
  prediction: RevenuePrediction;
  disclaimer: string;
}

export interface RevenuePredictionsParams {
  period: PredictionPeriod;
  method?: PredictionMethod;
}

export type RevenuePredictionsResponse = ApiResponse<RevenuePredictionsData>;

// ============================================================================
// User Types
// ============================================================================

export interface UserOverviewData {
  total_users: number;
  regular_users: number;
  admins: number;
  new_users_today: number;
  new_users_this_month: number;
  new_users_in_range: number;
  active_users_7d: number;
  active_users_30d: number;
  paying_users: number;
  conversion_rate: number;
}

export interface UserOverviewParams {
  start_date?: number;
  end_date?: number;
}

export type UserOverviewResponse = ApiResponse<UserOverviewData>;

export interface UserGrowthItem {
  period: string;
  new_users: number;
  total_users: number;
  paying_users: number;
}

export interface UserGrowthData {
  growth: UserGrowthItem[];
  summary: {
    total_new_users: number;
    average_daily_new_users: number;
  };
}

export interface UserGrowthParams {
  start_date: number;
  end_date: number;
  group_by?: GroupBy;
}

export type UserGrowthResponse = ApiResponse<UserGrowthData>;

export interface UserEngagementData {
  active_users_7d: number;
  active_users_30d: number;
  users_with_progress: number;
  users_with_discussions: number;
  average_modules_completed: number;
  average_streak_days: number;
}

export interface UserEngagementParams {
  start_date?: number;
  end_date?: number;
  user_id?: number;
}

export type UserEngagementResponse = ApiResponse<UserEngagementData>;

// ============================================================================
// Course Types
// ============================================================================

export interface TopCourseItem {
  course_id: number;
  title: string;
  enrollments: number;
  revenue: number;
  completion_rate: number;
}

export interface CourseOverviewData {
  total_courses: number;
  live_courses: number;
  total_enrollments: number;
  average_enrollments_per_course: number;
  top_courses: TopCourseItem[];
}

export interface CourseOverviewParams {
  start_date?: number;
  end_date?: number;
  course_id?: number;
}

export type CourseOverviewResponse = ApiResponse<CourseOverviewData>;

export interface CourseInfo {
  id: number;
  title: string;
  price: number;
}

export interface CourseEnrollments {
  total: number;
  this_month: number;
  last_month: number;
  growth_percentage: string;
}

export interface CourseRevenue {
  total: number;
  this_month: number;
  last_month: number;
}

export interface CourseCompletion {
  total_enrolled: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
}

export interface CourseEngagement {
  discussions: number;
  average_streak: number;
}

export interface CourseDetailedData {
  course: CourseInfo;
  enrollments: CourseEnrollments;
  revenue: CourseRevenue;
  completion: CourseCompletion;
  engagement: CourseEngagement;
}

export interface CourseDetailedParams {
  start_date?: number;
  end_date?: number;
}

export type CourseDetailedResponse = ApiResponse<CourseDetailedData>;

export interface CourseCompletionItem {
  course_id: number;
  title: string;
  total_enrolled: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
}

export interface CourseCompletionData {
  courses: CourseCompletionItem[];
  meta: PaginationMeta;
}

export interface CourseCompletionParams {
  course_id?: number;
  limit?: number;
  offset?: number;
}

export type CourseCompletionResponse = ApiResponse<CourseCompletionData>;

// ============================================================================
// Bundle Types
// ============================================================================

export interface TopBundleItem {
  bundle_id: number;
  title: string;
  purchases: number;
  revenue: number;
}

export interface BundleOverviewData {
  total_bundles: number;
  live_bundles: number;
  total_purchases: number;
  total_revenue: number;
  average_revenue_per_bundle: number;
  top_bundles: TopBundleItem[];
}

export interface BundleOverviewParams {
  start_date?: number;
  end_date?: number;
}

export type BundleOverviewResponse = ApiResponse<BundleOverviewData>;

export interface BundleInfo {
  id: number;
  title: string;
  price: number;
}

export interface BundlePurchases {
  total: number;
  this_month: number;
  last_month: number;
  growth_percentage: string;
}

export interface BundleRevenue {
  total: number;
  this_month: number;
  last_month: number;
}

export interface BundleDetailedData {
  bundle: BundleInfo;
  purchases: BundlePurchases;
  revenue: BundleRevenue;
}

export interface BundleDetailedParams {
  start_date?: number;
  end_date?: number;
}

export type BundleDetailedResponse = ApiResponse<BundleDetailedData>;

// ============================================================================
// Learning Types
// ============================================================================

export interface TopLearner {
  user_id: number;
  name: string;
  modules_completed: number;
  current_streak: number;
}

export interface LearningProgressData {
  total_modules_completed: number;
  active_learners_30d: number;
  total_progress_records: number;
  average_completion_rate: number;
  top_learners: TopLearner[];
}

export interface LearningProgressParams {
  start_date?: number;
  end_date?: number;
  course_id?: number;
}

export type LearningProgressResponse = ApiResponse<LearningProgressData>;

export interface StreakItem {
  user_id: number;
  name: string;
  course_id: number;
  course_title: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface StreakAnalyticsData {
  streaks: StreakItem[];
  meta: PaginationMeta;
}

export interface StreakAnalyticsParams {
  course_id?: number;
  limit?: number;
  offset?: number;
}

export type StreakAnalyticsResponse = ApiResponse<StreakAnalyticsData>;

// ============================================================================
// Coupon Types
// ============================================================================

export interface TopCoupon {
  coupon_id: number;
  code: string;
  usage_count: number;
  discount_given: number;
}

export interface CouponOverviewData {
  total_coupons: number;
  active_coupons: number;
  total_usage: number;
  total_discount_given: number;
  conversion_rate: number;
  top_coupons: TopCoupon[];
}

export interface CouponOverviewParams {
  start_date?: number;
  end_date?: number;
}

export type CouponOverviewResponse = ApiResponse<CouponOverviewData>;

export interface CouponPerformanceItem {
  coupon_id: number;
  code: string;
  usage_count: number;
  discount_given: number;
  revenue_generated: number;
  conversion_rate: number;
}

export interface CouponPerformanceData {
  coupons: CouponPerformanceItem[];
  meta: PaginationMeta;
}

export interface CouponPerformanceParams {
  coupon_id?: number;
  start_date?: number;
  end_date?: number;
  limit?: number;
  offset?: number;
}

export type CouponPerformanceResponse = ApiResponse<CouponPerformanceData>;

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentTrend {
  period: string;
  successful: number;
  failed: number;
}

export interface PaymentOverviewData {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  success_rate: number;
  total_amount: number;
  trends: PaymentTrend[];
}

export interface PaymentOverviewParams {
  start_date?: number;
  end_date?: number;
}

export type PaymentOverviewResponse = ApiResponse<PaymentOverviewData>;

// ============================================================================
// Filter Types
// ============================================================================

export interface FilterOption {
  id: number;
  name: string;
  value: number;
}

export interface FilterOptionsData {
  options: FilterOption[];
}

export type FilterOptionsResponse = ApiResponse<FilterOptionsData>;

// ============================================================================
// Metadata Types
// ============================================================================

export interface DataPointMetadata {
  label: string;
  helpText: string;
  unit: string;
  category: string;
}

export interface CategoryMetadata {
  [key: string]: DataPointMetadata | CategoryMetadata;
}

export interface AllMetadata {
  dashboard?: CategoryMetadata;
  revenue?: CategoryMetadata;
  users?: CategoryMetadata;
  courses?: CategoryMetadata;
  bundles?: CategoryMetadata;
  learning?: CategoryMetadata;
  engagement?: CategoryMetadata;
  coupons?: CategoryMetadata;
  payments?: CategoryMetadata;
}

export interface MetadataData {
  [key: string]: DataPointMetadata | CategoryMetadata | AllMetadata;
}

export type MetadataResponse = ApiResponse<MetadataData | CategoryMetadata | DataPointMetadata>;
