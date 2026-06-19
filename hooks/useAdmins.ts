import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  type CreateAdminData,
  type UpdateAdminData,
  type SetPasswordData,
} from "@/services/admin.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["admins"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

/**
 * Get all admins
 */
export function useAdmins() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => adminService.getAllAdmins(),
  });
}

/**
 * Get single admin by ID
 */
export function useAdmin(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => adminService.getAdmin(id!),
    enabled: !!id,
  });
}

/**
 * Create admin mutation
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminData) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Admin created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create admin");
    },
  });
}

/**
 * Update admin mutation
 */
export function useUpdateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdminData }) =>
      adminService.updateAdmin(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Admin updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update admin");
    },
  });
}

/**
 * Set admin password mutation
 * Note: New password is auto-generated and sent via SMS
 */
export function useSetAdminPassword() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: SetPasswordData;
    }) => adminService.setPassword(id, data),
    onSuccess: () => {
      toast.success("Password has been reset and sent via SMS");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

/**
 * Search regular users for promotion
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, "search-users", query] as const,
    queryFn: () => adminService.searchUsers(query),
    enabled: query.length >= 2,
  });
}

/**
 * Promote user mutation
 */
export function usePromoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.promoteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("User promoted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to promote user");
    },
  });
}

/**
 * Delete admin mutation
 */
export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Admin deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete admin");
    },
  });
}
