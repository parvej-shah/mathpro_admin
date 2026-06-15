import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface Coupon {
  id: number;
  name: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  usage_limit?: number;
  usage_count?: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  per_user_limit?: number;
  start_time?: number;
  end_time?: number;
  status: CouponStatus;
  is_public?: boolean;
  total_discount?: number;
  courses?: number[] | { id: number }[];
  bundles?: number[] | { id: number }[];
  applicable_courses?: number[] | { id: number }[];
  applicable_bundles?: number[] | { id: number }[];
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

export interface CouponListParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "all";
  discountType?: "percentage" | "fixed";
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export type DiscountType = "percentage" | "fixed";
export type CouponStatus = "active" | "inactive";

export interface CouponFormData {
  code: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  start_time?: number;
  end_time?: number;
  status: CouponStatus;
  is_public?: boolean;
  [key: string]: unknown;
}

export interface CreateCouponData extends Partial<CouponFormData> {
  name: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  [key: string]: unknown;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  [key: string]: unknown;
}

export const couponService = {
  /**
   * Get all coupons with filters and pagination
   */
  getAllCoupons: async (
    params?: CouponListParams
  ): Promise<ApiResponse<Coupon[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `${API_ENDPOINTS.COUPONS.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get single coupon by ID
   */
  getCoupon: async (id: number): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.get(API_ENDPOINTS.COUPONS.GET(id));
    return response.data;
  },

  /**
   * Create new coupon
   */
  createCoupon: async (
    couponData: CreateCouponData
  ): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.COUPONS.CREATE,
      couponData
    );
    return response.data;
  },

  /**
   * Update coupon
   */
  updateCoupon: async (
    id: number,
    couponData: UpdateCouponData
  ): Promise<ApiResponse<Coupon>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.COUPONS.UPDATE(id),
      couponData
    );
    return response.data;
  },

  /**
   * Delete coupon
   */
  deleteCoupon: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.COUPONS.DELETE(id));
    return response.data;
  },

  /**
   * Add courses to coupon
   */
  addCoursesToCoupon: async (
    id: number,
    courseIds: number[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.COUPONS.ADD_COURSES(id),
      { courseIds }
    );
    return response.data;
  },

  /**
   * Remove courses from coupon
   */
  removeCoursesFromCoupon: async (
    id: number,
    courseIds: number[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.COUPONS.REMOVE_COURSES(id),
      { data: { courseIds } }
    );
    return response.data;
  },

  /**
   * Get coupon's associated courses
   */
  getCouponCourses: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(API_ENDPOINTS.COUPONS.GET_COURSES(id));
    return response.data;
  },

  /**
   * Get all available courses
   */
  getAvailableCourses: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.COUPONS.AVAILABLE_COURSES
    );
    return response.data;
  },

  /**
   * Get coupon's associated bundles
   */
  getCouponBundles: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(`/admin/coupon/${id}/bundles`);
    return response.data;
  },

  /**
   * Add bundles to coupon
   */
  addBundlesToCoupon: async (
    id: number,
    bundleIds: number[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/admin/coupon/${id}/bundles`, {
      bundleIds,
    });
    return response.data;
  },

  /**
   * Remove bundles from coupon
   */
  removeBundlesFromCoupon: async (
    id: number,
    bundleIds: number[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/coupon/${id}/bundles`, {
      data: { bundleIds },
    });
    return response.data;
  },

  /**
   * Get available bundles
   */
  getAvailableBundles: async (
    couponId?: number
  ): Promise<ApiResponse<unknown>> => {
    const url = couponId
      ? `/admin/coupon/available-bundles?couponId=${couponId}`
      : "/admin/coupon/available-bundles";
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get coupon statistics
   */
  getStatistics: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get("/admin/coupon/analytics/statistics");
    return response.data;
  },

  /**
   * Get coupon dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get("/admin/coupon/analytics/dashboard");
    return response.data;
  },
};
