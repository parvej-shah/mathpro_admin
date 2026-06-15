import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface Bundle {
  id: number;
  title: string;
  price: number;
  url?: string;
  short_description?: string;
  you_get?: string[];
  chips?: string[];
  faq_list?: Array<{ question: string; answer: string }>;
  feedback_list?: Array<{ name: string; feedback: string }>;
  intro_video?: string;
  is_live?: boolean;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface CreateBundleData {
  title: string;
  price: number;
  url?: string;
  short_description?: string;
  you_get?: string[];
  chips?: string[];
  faq_list?: Array<{ question: string; answer: string }>;
  feedback_list?: Array<{ name: string; feedback: string }>;
  intro_video?: string;
  is_live?: boolean;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface UpdateBundleData extends Partial<CreateBundleData> {
  [key: string]: unknown;
}

function unwrapSingleBundleResponse(
  response: ApiResponse<Bundle> | ApiResponse<Bundle[]>
): ApiResponse<Bundle> {
  const payload = response.data;

  if (Array.isArray(payload)) {
    return {
      ...response,
      data: payload[0],
    } as ApiResponse<Bundle>;
  }

  return response as ApiResponse<Bundle>;
}

export const bundleService = {
  /**
   * Get all bundles
   */
  getAllBundles: async (): Promise<ApiResponse<Bundle[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.BUNDLES.LIST);
    return response.data;
  },

  /**
   * Get single bundle by ID
   */
  getBundle: async (bundleId: number): Promise<ApiResponse<Bundle>> => {
    const response = await apiClient.get(API_ENDPOINTS.BUNDLES.GET(bundleId));
    return unwrapSingleBundleResponse(response.data);
  },

  /**
   * Get single bundle by slug
   */
  getBundleBySlug: async (slug: string): Promise<ApiResponse<Bundle>> => {
    const response = await apiClient.get(API_ENDPOINTS.BUNDLES.GET_BY_SLUG(slug));
    return unwrapSingleBundleResponse(response.data);
  },

  /**
   * Create new bundle
   */
  createBundle: async (
    bundleData: CreateBundleData
  ): Promise<ApiResponse<Bundle>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.BUNDLES.CREATE_ENHANCED,
      bundleData
    );
    return unwrapSingleBundleResponse(response.data);
  },

  /**
   * Update bundle
   */
  updateBundle: async (
    bundleId: number,
    bundleData: UpdateBundleData
  ): Promise<ApiResponse<Bundle>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.BUNDLES.UPDATE_ENHANCED(bundleId),
      bundleData
    );
    return unwrapSingleBundleResponse(response.data);
  },

  /**
   * Delete bundle
   */
  deleteBundle: async (bundleId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.BUNDLES.DELETE(bundleId)
    );
    return response.data;
  },

  /**
   * Get bundle courses
   */
  getBundleCourses: async (
    bundleId: number
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BUNDLES.GET_COURSES(bundleId)
    );
    return response.data;
  },

  /**
   * Add courses to bundle
   */
  addCoursesToBundle: async (
    bundleId: number,
    courseIds: number[]
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.BUNDLES.ADD_COURSES(bundleId),
      { courseIds }
    );
    return response.data;
  },

  /**
   * Get bundle statistics
   */
  getBundleStats: async (bundleId: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(API_ENDPOINTS.BUNDLES.STATS(bundleId));
    return response.data;
  },

  /**
   * Get bundle purchases
   */
  getBundlePurchases: async (
    bundleId?: number
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BUNDLES.PURCHASES(bundleId)
    );
    return response.data;
  },

  /**
   * Get bundle prebookings
   */
  getBundlePrebookings: async (
    bundleId?: number
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.BUNDLES.PREBOOKINGS(bundleId)
    );
    return response.data;
  },
};
