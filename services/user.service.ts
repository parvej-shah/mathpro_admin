import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { User, ApiResponse, PaginatedResponse } from "@/types";

export interface UserListParams {
  status?: "active" | "inactive" | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "updated_at" | "name" | "email" | "phone";
  sortOrder?: "ASC" | "DESC";
}

export interface CreateUserData {
  name: string;
  email?: string;
  phone?: string;
  login: string;
  login_type: "email" | "phone";
  [key: string]: unknown;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  [key: string]: unknown;
}

export type StudentAccessType = "course" | "bundle";

export interface StudentHistorySummary {
  purchases: number;
  progress_entries: number;
  feedbacks: number;
  module_feedbacks: number;
}

export interface StudentPurchaseItem {
  user_id: number;
  item_id: number;
  item_type: StudentAccessType;
  amount: number | null;
  coupon_id: number | null;
  transaction_id: string | null;
  purchased_at: number | null;
  course_title: string | null;
  bundle_title: string | null;
}

export interface StudentProgressItem {
  user_id: number;
  module_id: number;
  point: number | null;
  timestamp: number | null;
  module_title: string | null;
  module_serial: number | null;
  chapter_id: number | null;
  chapter_title: string | null;
  course_id: number | null;
  course_title: string | null;
}

export interface StudentFeedbackItem {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  course_title: string | null;
}

export interface StudentModuleFeedbackItem {
  id: number;
  user_id: number;
  module_id: number;
  reaction: string;
  reason: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  module_title: string | null;
  chapter_id: number | null;
  chapter_title: string | null;
  course_id: number | null;
  course_title: string | null;
}

export interface StudentHistoryResponse {
  user: User;
  summary: StudentHistorySummary;
  purchases: StudentPurchaseItem[];
  progress: StudentProgressItem[];
  feedbacks: StudentFeedbackItem[];
  module_feedbacks: StudentModuleFeedbackItem[];
}

export interface StudentCourseAccessItem {
  user_id: number;
  course_id: number;
  course_title: string;
  amount: number | null;
  transaction_id: string | null;
  coupon_id: number | null;
  enrolled_at: number | null;
}

export interface StudentBundleAccessItem {
  bundle_access_id: number;
  user_id: number;
  bundle_id: number;
  bundle_title: string;
  amount: number | null;
  transaction_id: string | null;
  coupon_id: number | null;
  enrolled_at: number | null;
}

export interface GrantStudentAccessPayload {
  type: StudentAccessType;
  courseId?: number;
  bundleId?: number;
}

export interface RevokeStudentAccessPayload {
  type: StudentAccessType;
  courseId?: number;
  bundleId?: number;
}

export const userService = {
  /**
   * Get all users with pagination and filtering
   */
  getAllUsers: async (
    params?: UserListParams
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params });
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getUserById: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.GET(id));
    return response.data;
  },

  getUserHistory: async (id: number): Promise<ApiResponse<StudentHistoryResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.HISTORY(id));
    return response.data;
  },

  getUserAccess: async (
    id: number,
    type: StudentAccessType
  ): Promise<ApiResponse<StudentCourseAccessItem[] | StudentBundleAccessItem[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ACCESS(id), {
      params: { type },
    });
    return response.data;
  },

  grantUserAccess: async (
    id: number,
    payload: GrantStudentAccessPayload
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.ACCESS(id), payload);
    return response.data;
  },

  revokeUserAccess: async (
    id: number,
    payload: RevokeStudentAccessPayload
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.ACCESS(id), {
      params: payload,
    });
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (
    userData: CreateUserData
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, userData);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (
    id: number,
    userData: UpdateUserData
  ): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.USERS.UPDATE(id),
      userData
    );
    return response.data;
  },

  /**
   * Delete user (soft or hard)
   */
  deleteUser: async (
    id: number,
    permanent = false
  ): Promise<ApiResponse<void>> => {
    const url = permanent
      ? `${API_ENDPOINTS.USERS.DELETE(id)}?permanent=true`
      : API_ENDPOINTS.USERS.DELETE(id);
    const response = await apiClient.delete(url);
    return response.data;
  },

  /**
   * Reset user password
   */
  resetPassword: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id));
    return response.data;
  },
};
