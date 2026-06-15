import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import type { CreateRoleData, UpdateRoleData } from "@/types";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["roles"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
  permissions: () => [...QUERY_KEYS.all, "permissions"] as const,
  userRoles: (userId: number) => [...QUERY_KEYS.all, "user-roles", userId] as const,
  userPermissions: (userId: number) =>
    [...QUERY_KEYS.all, "user-permissions", userId] as const,
};

/**
 * Get list of permissions (for Create/Edit role form). Use when opening the form.
 */
export function usePermissions(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.permissions(),
    queryFn: () => roleService.getPermissions(),
    enabled,
  });
}

/**
 * Get all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => roleService.listRoles(),
  });
}

/**
 * Get single role by ID
 */
export function useRole(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => roleService.getRole(id!),
    enabled: !!id,
  });
}

/**
 * Create role mutation
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });
}

/**
 * Update role mutation
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleData }) =>
      roleService.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
}

/**
 * Delete role mutation
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(id) });
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
}

/**
 * Get roles assigned to a user
 */
export function useUserRoles(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userRoles(userId!),
    queryFn: () => roleService.getUserRoles(userId!),
    enabled: !!userId,
  });
}

/**
 * Assign role to user mutation
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      roleService.assignRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userRoles(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userPermissions(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Role assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign role");
    },
  });
}

/**
 * Remove role from user mutation
 */
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
    }: {
      userId: number;
      roleId: number;
    }) => roleService.removeRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userRoles(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userPermissions(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Role removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove role");
    },
  });
}

/**
 * Get aggregated permissions for a user
 */
export function useUserPermissions(userId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userPermissions(userId!),
    queryFn: () => roleService.getUserPermissions(userId!),
    enabled: !!userId,
  });
}
