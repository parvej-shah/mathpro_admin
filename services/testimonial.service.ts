import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface FeaturedTestimonial {
  feedback_id: string;
  sort_order: number;
  is_active: boolean;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string;
  category?: string | null;
  user_name: string;
  user_email?: string;
  course_name?: string;
  feedback_created_at?: string;
}

export interface CreateTestimonialData {
  feedback_id: string;
  sort_order: number;
  is_active: boolean;
}

export interface UpdateTestimonialData {
  feedback_id: string;
  sort_order?: number;
  is_active?: boolean;
}

export const testimonialService = {
  getTestimonials: async (): Promise<ApiResponse<FeaturedTestimonial[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.TESTIMONIALS.LIST);
    return response.data;
  },

  createTestimonial: async (
    data: CreateTestimonialData,
  ): Promise<ApiResponse<FeaturedTestimonial>> => {
    const response = await apiClient.post(API_ENDPOINTS.TESTIMONIALS.CREATE, data);
    return response.data;
  },

  updateTestimonial: async (
    feedbackId: string,
    data: Omit<UpdateTestimonialData, "feedback_id">,
  ): Promise<ApiResponse<FeaturedTestimonial>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.TESTIMONIALS.UPDATE(feedbackId),
      data,
    );
    return response.data;
  },

  deleteTestimonial: async (feedbackId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.TESTIMONIALS.DELETE(feedbackId));
    return response.data;
  },
};
