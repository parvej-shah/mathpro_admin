import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";
import type {
  CourseAccessWithDetails,
  CourseAccessUser,
  UserCourseAccess,
  AssignCourseAccessData,
} from "@/types/course-access.types";

export const courseAccessService = {
  /**
   * Assign course access to a user
   */
  assignCourseAccess: async (
    data: AssignCourseAccessData
  ): Promise<ApiResponse<CourseAccessWithDetails>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.COURSE_ACCESS.ASSIGN,
      data
    );
    return response.data;
  },

  /**
   * Remove course access from a user
   */
  removeCourseAccess: async (
    courseId: number,
    userId: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.COURSE_ACCESS.REMOVE(courseId, userId)
    );
    return response.data;
  },

  /**
   * Get all users who have access to a specific course
   */
  getCourseUsers: async (
    courseId: number
  ): Promise<ApiResponse<CourseAccessUser[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.COURSE_ACCESS.GET_COURSE_USERS(courseId)
    );
    return response.data;
  },

  /**
   * Get all courses a user has access to
   */
  getUserCourses: async (
    userId: number
  ): Promise<ApiResponse<UserCourseAccess[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.COURSE_ACCESS.GET_USER_COURSES(userId)
    );
    return response.data;
  },
};
