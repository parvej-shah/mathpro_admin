import { useQuery } from "@tanstack/react-query";
import { purchaseService } from "@/services/purchase.service";

const QUERY_KEYS = {
  all: ["purchases"] as const,
  coursePurchases: (courseId: number) =>
    [...QUERY_KEYS.all, "course", courseId] as const,
  bundlePurchases: (bundleId?: number) =>
    [...QUERY_KEYS.all, "bundle", bundleId] as const,
  coursePrebookings: (courseId: number) =>
    [...QUERY_KEYS.all, "prebookings", "course", courseId] as const,
  bundlePrebookings: (bundleId?: number) =>
    [...QUERY_KEYS.all, "prebookings", "bundle", bundleId] as const,
};

export function useCoursePurchases(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.coursePurchases(courseId!),
    queryFn: () => purchaseService.getCoursePurchases(courseId!),
    enabled: !!courseId,
  });
}

export function useBundlePurchases(bundleId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.bundlePurchases(bundleId || undefined),
    queryFn: () => purchaseService.getBundlePurchases(bundleId || undefined),
    enabled: !!bundleId,
  });
}

export function useCoursePrebookings(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.coursePrebookings(courseId!),
    queryFn: () => purchaseService.getCoursePrebookings(courseId!),
    enabled: !!courseId,
  });
}

export function useBundlePrebookings(bundleId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.bundlePrebookings(bundleId || undefined),
    queryFn: () =>
      purchaseService.getBundlePrebookings(bundleId || undefined),
    enabled: !!bundleId,
  });
}
