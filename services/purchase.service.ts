import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface CoursePurchase {
  user_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  login_type?: "phone" | "email";
  amount?: number;
  timestamp: number;
  transaction_id?: string;
  profile?: {
    currentAcademicLevel?: string;
    currentInstitution?: string;
    department?: string;
    [key: string]: unknown;
  };
  // Coupon information
  coupon_used?: boolean;
  coupon_code?: string | null;
  coupon_name?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  original_price?: number | null;
  discount_amount?: number | null;
  final_price?: number | null;
  amount_saved?: number;
  [key: string]: unknown;
}

export interface BundlePurchase {
  user_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  login_type?: "phone" | "email";
  bundle_title?: string;
  amount: number;
  timestamp: number;
  transaction_id: string;
  payment_method?: string;
  // Coupon information
  coupon_used?: boolean;
  coupon_code?: string | null;
  coupon_name?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  original_price?: number | null;
  discount_amount?: number | null;
  final_price?: number | null;
  amount_saved?: number;
  [key: string]: unknown;
}

export interface PrebookedUser {
  id?: number;
  user_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  utm?: string;
  timestamp: number;
  [key: string]: unknown;
}

export const purchaseService = {
  /**
   * Get course purchases
   */
  getCoursePurchases: async (
    courseId: number
  ): Promise<ApiResponse<CoursePurchase[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.COURSES.PURCHASES(courseId)
    );
    return response.data;
  },

  /**
   * Get bundle purchases
   */
  getBundlePurchases: async (
    bundleId?: number
  ): Promise<ApiResponse<BundlePurchase[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BUNDLES.PURCHASES(bundleId)
    );
    
    // Transform API response to match BundlePurchase interface
    // API returns user_name, user_phone, user_email but we need name, phone, email
    if (response.data?.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((purchase: Record<string, unknown>) => ({
        ...purchase,
        name: purchase.user_name || purchase.name || "",
        phone: purchase.user_phone ?? purchase.phone ?? null,
        email: purchase.user_email ?? purchase.email ?? null,
        user_id: purchase.user_id || purchase.userId || 0,
        amount: purchase.amount || 0,
        timestamp: purchase.timestamp || 0,
        transaction_id: purchase.transaction_id || purchase.transactionId || "",
        bundle_title: purchase.bundle_title || purchase.bundleTitle || "",
        payment_method: purchase.payment_method || purchase.paymentMethod || "",
        login_type: purchase.login_type || purchase.loginType || (purchase.user_phone ? "phone" : "email"),
      }));
    }
    
    return response.data;
  },

  /**
   * Export bundle purchases as CSV
   */
  exportBundlePurchases: async (bundleId?: number): Promise<Blob> => {
    const endpoint = bundleId
      ? `${API_ENDPOINTS.BUNDLES.PURCHASES(bundleId)}/export`
      : "/admin/bundle/purchases/export";
    const response = await apiClient.get(endpoint, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Get course prebookings
   */
  getCoursePrebookings: async (
    courseId: number
  ): Promise<ApiResponse<PrebookedUser[]>> => {
    const response = await apiClient.get(
      `/admin/course/getAllPrebookingsApi?identifier=${639 * courseId}`
    );
    return response.data;
  },

  /**
   * Get bundle prebookings
   */
  getBundlePrebookings: async (
    bundleId?: number
  ): Promise<ApiResponse<PrebookedUser[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BUNDLES.PREBOOKINGS(bundleId)
    );
    return response.data;
  },

  /**
   * Export bundle prebookings as CSV
   */
  exportBundlePrebookings: async (bundleId?: number): Promise<Blob> => {
    const endpoint = bundleId
      ? `${API_ENDPOINTS.BUNDLES.PREBOOKINGS(bundleId)}/export`
      : "/admin/bundle/prebookings/export";
    const response = await apiClient.get(endpoint, {
      responseType: "blob",
    });
    return response.data;
  },
};
