import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bundleService,
  type CreateBundleData,
  type UpdateBundleData,
} from "@/services/bundle.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["bundles"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
  stats: (id: number) => [...QUERY_KEYS.detail(id), "stats"] as const,
  purchases: (id?: number) => [...QUERY_KEYS.all, "purchases", id] as const,
  prebookings: (id?: number) => [...QUERY_KEYS.all, "prebookings", id] as const,
};

export function useBundles() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => bundleService.getAllBundles(),
  });
}

export function useBundle(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => bundleService.getBundle(id!),
    enabled: !!id,
  });
}

export function useBundleBySlug(slug: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.details(), "slug", slug] as const,
    queryFn: () => bundleService.getBundleBySlug(slug!),
    enabled: !!slug,
  });
}

export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBundleData) => bundleService.createBundle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Bundle created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create bundle");
    },
  });
}

export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBundleData }) =>
      bundleService.updateBundle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Bundle updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update bundle");
    },
  });
}

export function useDeleteBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bundleService.deleteBundle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Bundle deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete bundle");
    },
  });
}

export function useBundleStats(bundleId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.stats(bundleId!),
    queryFn: () => bundleService.getBundleStats(bundleId!),
    enabled: !!bundleId,
  });
}

export function useBundlePurchases(bundleId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.purchases(bundleId),
    queryFn: () => bundleService.getBundlePurchases(bundleId),
  });
}

export function useBundlePrebookings(bundleId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.prebookings(bundleId),
    queryFn: () => bundleService.getBundlePrebookings(bundleId),
  });
}
