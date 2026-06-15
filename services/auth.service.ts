import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, LoginResponse } from "@/types";

export interface LoginCredentials {
  login: string;
  password: string;
}

export const authService = {
  /**
   * Admin login
   * Note: API returns token directly in response.data, not nested in ApiResponse structure
   */
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse> | { token: string; user?: unknown }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      // Log response for debugging
      console.log("Login API response:", response.data);
      // API returns { token: "...", user: {...} } directly, not wrapped in ApiResponse
      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },
};
