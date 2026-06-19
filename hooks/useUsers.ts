import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, type UserListParams, type CreateUserData, type UpdateUserData } from "@/services/user.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: (params?: UserListParams) => [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

/**
 * Get all users with pagination and filtering
 */
export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => userService.getAllUsers(params),
    enabled: true,
  });
}

/**
 * Get single user by ID
 */
export function useUser(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.id) });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permanent }: { id: number; permanent?: boolean }) =>
      userService.deleteUser(id, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

/**
 * Reset user password mutation
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: number) => userService.resetPassword(id),
    onSuccess: (response) => {
      const res = response as unknown as Record<string, unknown>;
      if (res.smsFailed && res.password) {
        toast.warning(
          `Password reset but delivery failed. New password: ${res.password}`,
          { duration: 30000 }
        );
      } else {
        toast.success("Password reset and sent via SMS");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}
