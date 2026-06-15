import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, Course } from "@/types";

export interface FeaturedCourse extends Course {
  course_id: number;
  sort_order: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface CreateFeaturedCourseData {
  course_id: number;
  sort_order: number;
  is_active: boolean;
}

export interface UpdateFeaturedCourseData {
  sort_order?: number;
  is_active?: boolean;
}

export const featuredCourseService = {
  getFeaturedCourses: async (): Promise<ApiResponse<FeaturedCourse[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.COURSES.FEATURED.LIST);
    return response.data;
  },

  createFeaturedCourse: async (
    data: CreateFeaturedCourseData,
  ): Promise<ApiResponse<FeaturedCourse>> => {
    const response = await apiClient.post(API_ENDPOINTS.COURSES.FEATURED.CREATE, data);
    return response.data;
  },

  updateFeaturedCourse: async (
    courseId: number,
    data: UpdateFeaturedCourseData,
  ): Promise<ApiResponse<FeaturedCourse>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.COURSES.FEATURED.UPDATE(courseId),
      data,
    );
    return response.data;
  },

  deleteFeaturedCourse: async (courseId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.COURSES.FEATURED.DELETE(courseId));
    return response.data;
  },
};
