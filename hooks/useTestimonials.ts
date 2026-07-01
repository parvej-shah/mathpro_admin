import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  testimonialService,
  type CreateManualReviewData,
  type CreateTestimonialData,
  type FeaturedTestimonial,
} from "@/services/testimonial.service";

const QUERY_KEYS = {
  all: ["testimonials"] as const,
  list: () => [...QUERY_KEYS.all, "list"] as const,
};

export function useTestimonials() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: async () => {
      const response = await testimonialService.getTestimonials();
      const payload = response.data;
      return Array.isArray(payload) ? (payload as FeaturedTestimonial[]) : [];
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialData) =>
      testimonialService.createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Testimonial added to public selection");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add testimonial");
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedback_id,
      ...data
    }: {
      feedback_id: string;
      sort_order?: number;
      is_active?: boolean;
      video_url?: string | null;
    }) => testimonialService.updateTestimonial(feedback_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Testimonial updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update testimonial");
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackId: string) => testimonialService.deleteTestimonial(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Testimonial removed from public selection");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove testimonial");
    },
  });
}

export function useCreateManualReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateManualReviewData) =>
      testimonialService.createManualReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseFeedback"] });
      toast.success("Review created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create review");
    },
  });
}

export function useReorderTestimonials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackIdsInOrder: string[]) => {
      await Promise.all(
        feedbackIdsInOrder.map((feedbackId, index) =>
          testimonialService.updateTestimonial(feedbackId, {
            sort_order: index + 1,
          }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
      toast.success("Testimonial order updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reorder testimonials");
    },
  });
}
