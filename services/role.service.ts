import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  Role,
  RoleAssignment,
  PermissionsResponse,
  CreateRoleData,
  UpdateRoleData,
} from "@/types";

export interface PermissionsApiResponse extends ApiResponse<PermissionsResponse> {
  count?: number;
}

export interface RolesListApiResponse extends ApiResponse<Role[]> {
  count?: number;
}

export interface UserRolesApiResponse extends ApiResponse<RoleAssignment[]> {
  count?: number;
}

export interface UserPermissionsApiResponse extends ApiResponse<string[]> {
  count?: number;
}

export const roleService = {
  /**
   * Get list of permissions (for Create/Edit role form).
   * Use data.by_resource for grouped UI, data.all for flat list.
   */
  getPermissions: async (): Promise<PermissionsApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.PERMISSIONS);
    return response.data;
  },

  /**
   * List all roles
   */
  listRoles: async (): Promise<RolesListApiResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
    return response.data;
  },

  /**
   * Get a single role by ID
   */
  getRole: async (id: number): Promise<ApiResponse<Role>> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.GET(id));
    return response.data;
  },

  /**
   * Create a new role
   */
  createRole: async (
    data: CreateRoleData
  ): Promise<ApiResponse<Role>> => {
    const response = await apiClient.post(API_ENDPOINTS.ROLES.CREATE, data);
    return response.data;
  },

  /**
   * Update an existing role
   */
  updateRole: async (
    id: number,
    data: UpdateRoleData
  ): Promise<ApiResponse<Role>> => {
    const response = await apiClient.put(API_ENDPOINTS.ROLES.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete a role (fails for system roles or roles assigned to users)
   */
  deleteRole: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
    return response.data;
  },

  /**
   * Get all roles assigned to a user
   */
  getUserRoles: async (
    userId: number
  ): Promise<UserRolesApiResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ROLES.USER_ROLES(userId)
    );
    return response.data;
  },

  /**
   * Assign a role to a user
   */
  assignRole: async (
    userId: number,
    roleId: number
  ): Promise<ApiResponse<RoleAssignment & { role?: Role }>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ROLES.ASSIGN_ROLE(userId),
      { role_id: roleId }
    );
    return response.data;
  },

  /**
   * Remove a role from a user
   */
  removeRole: async (
    userId: number,
    roleId: number
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.ROLES.REMOVE_ROLE(userId, roleId)
    );
    return response.data;
  },

  /**
   * Get aggregated permissions for a user (from all assigned roles)
   */
  getUserPermissions: async (
    userId: number
  ): Promise<UserPermissionsApiResponse> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ROLES.USER_PERMISSIONS(userId)
    );
    return response.data;
  },
};
