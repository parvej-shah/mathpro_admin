import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Admin, ApiResponse } from "@/types";

export interface CreateAdminData {
  name: string;
  phone: string; // Required - 11-digit BD phone (starts with 01), used as login
  email?: string; // Optional - for Google login
  type: 1 | 2; // 1 = Admin, 2 = Moderator
  profile?: Record<string, unknown>;
}

export interface SearchedUser {
  id: number;
  name: string;
  type: number;
  login: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface UpdateAdminData {
  name?: string;
  type?: 1 | 2; // 1 = Admin, 2 = Moderator
  email?: string; // Requires currentPassword if changing
  phone?: string;
  profile?: Record<string, unknown>;
  password?: string; // New password (requires currentPassword)
  currentPassword?: string; // Required if changing email or password
}

export interface SetPasswordData {
  currentPassword: string;
}

export const adminService = {
  /**
   * Get all admins
   */
  getAllAdmins: async (): Promise<ApiResponse<Admin[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.ADMINS.LIST);
    return response.data;
  },

  /**
   * Get single admin by ID
   */
  getAdmin: async (id: number): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.get(API_ENDPOINTS.ADMINS.GET(id));
    return response.data;
  },

  /**
   * Create new admin
   */
  createAdmin: async (
    adminData: CreateAdminData
  ): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMINS.CREATE,
      adminData
    );
    return response.data;
  },

  /**
   * Update admin
   */
  updateAdmin: async (
    id: number,
    adminData: UpdateAdminData
  ): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMINS.UPDATE(id),
      adminData
    );
    return response.data;
  },

  /**
   * Set password for admin
   */
  setPassword: async (
    id: number,
    passwordData: SetPasswordData
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ADMINS.SET_PASSWORD(id),
      passwordData
    );
    return response.data;
  },

  /**
   * Delete admin
   */
  deleteAdmin: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.ADMINS.DELETE(id));
    return response.data;
  },

  /**
   * Search regular users for promotion
   */
  searchUsers: async (query: string): Promise<ApiResponse<SearchedUser[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.ADMINS.SEARCH_USERS, {
      params: { q: query },
    });
    return response.data;
  },

  /**
   * Promote a regular user to admin/moderator
   */
  promoteUser: async (
    id: number,
    type: 1 | 2
  ): Promise<ApiResponse<Admin>> => {
    const response = await apiClient.post(API_ENDPOINTS.ADMINS.PROMOTE(id), {
      type,
    });
    return response.data;
  },
};
