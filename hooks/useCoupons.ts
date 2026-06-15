import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  couponService,
  type CouponListParams,
  type CreateCouponData,
  type UpdateCouponData,
} from "@/services/coupon.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["coupons"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: (params?: CouponListParams) =>
    [...QUERY_KEYS.lists(), params] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
  courses: (id: number) => [...QUERY_KEYS.detail(id), "courses"] as const,
  availableCourses: () => [...QUERY_KEYS.all, "available-courses"] as const,
};

export function useCoupons(params?: CouponListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => couponService.getAllCoupons(params),
  });
}

export function useCoupon(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => couponService.getCoupon(id!),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponData) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Coupon created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponData }) =>
      couponService.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Coupon updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Coupon deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });
}

export function useCouponCourses(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.courses(id!),
    queryFn: () => couponService.getCouponCourses(id!),
    enabled: !!id,
  });
}

export function useAddCoursesToCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      courseIds,
    }: {
      id: number;
      courseIds: number[];
    }) => couponService.addCoursesToCoupon(id, courseIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courses(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Courses added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add courses");
    },
  });
}

export function useRemoveCoursesFromCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      courseIds,
    }: {
      id: number;
      courseIds: number[];
    }) => couponService.removeCoursesFromCoupon(id, courseIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courses(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Courses removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove courses");
    },
  });
}

export function useAvailableCourses() {
  return useQuery({
    queryKey: QUERY_KEYS.availableCourses(),
    queryFn: () => couponService.getAvailableCourses(),
  });
}

export function useCouponBundles(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.detail(id!), "bundles"],
    queryFn: () => couponService.getCouponBundles(id!),
    enabled: !!id,
  });
}

export function useAvailableBundles(couponId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, "available-bundles", couponId],
    queryFn: () => couponService.getAvailableBundles(couponId),
  });
}

export function useAddBundlesToCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      bundleIds,
    }: {
      id: number;
      bundleIds: number[];
    }) => couponService.addBundlesToCoupon(id, bundleIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Bundles added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add bundles");
    },
  });
}

export function useRemoveBundlesFromCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      bundleIds,
    }: {
      id: number;
      bundleIds: number[];
    }) => couponService.removeBundlesFromCoupon(id, bundleIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Bundles removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove bundles");
    },
  });
}

export function useCouponStatistics() {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, "statistics"],
    queryFn: () => couponService.getStatistics(),
  });
}

export function useCouponDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEYS.all, "dashboard"],
    queryFn: () => couponService.getDashboard(),
  });
}
