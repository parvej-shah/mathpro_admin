import apiClient from "@/lib/api";
import { uploadImageToS3 } from "@/lib/s3-upload";
import type { ApiResponse } from "@/types";
import { AxiosError } from "axios";

// V2 API Base URL
const V2_BASE = "/v2/admin/teacher";

/**
 * Teacher/Instructor Interface (Enhanced - Phase 8)
 * Matches new v2 API structure
 */
export interface Teacher {
  id: number;
  name: string;
  login: string; // Phone or email
  role: string | null;
  university: string | null;
  bio: string | null;
  image: string | null;
  achievements: string[];
  social: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  courses_teaching: number[]; // Course IDs
  courses_teaching_details?: unknown[]; // Full course objects (in full response)
  category: "instructor" | "teacher" | string;
  isActive: boolean;
  isPrivileged: boolean; // Controls admin panel access
  created_at?: string;
  updated_at?: string;
  // Legacy fields (for backward compatibility)
  type?: number;
  profile?: {
    email?: string;
    credibility?: string;
    imageUploadedLink?: string;
    selectedCourse?: number[];
  };
  [key: string]: unknown;
}

/**
 * Create Teacher Data (Enhanced - Phase 8)
 */
export interface CreateTeacherData {
  name: string;
  login: string; // Phone or email
  role?: string;
  university?: string;
  bio?: string;
  image?: string;
  achievements?: string[];
  social?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  courses_teaching?: number[]; // Optional - array of course IDs
  category?: string; // Default: "instructor"
  isActive?: boolean; // Default: true
  isPrivileged?: boolean; // CRITICAL: Controls admin panel access (default: false)
}

/**
 * Update Teacher Data (Enhanced - Phase 8)
 */
export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  [key: string]: unknown;
}

export const teacherService = {
  /**
   * Get all teachers (names only - lightweight)
   * GET /v2/admin/teacher/list-names
   */
  getTeachersNames: async (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
    const response = await apiClient.get(`${V2_BASE}/list-names`);
    return response.data;
  },

  /**
   * Atomically replace all instructor assignments for a course
   * POST /v2/admin/teacher/replace-course-instructors
   */
  replaceInstructorsForCourse: async (
    courseId: number,
    teacherIds: number[]
  ): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.post(`${V2_BASE}/replace-course-instructors`, {
      course_id: courseId,
      teacher_ids: teacherIds,
    });
    return response.data;
  },

  /**
   * Get all teachers (full info)
   * GET /v2/admin/teacher/list-full
   */
  getAllTeachers: async (): Promise<ApiResponse<Teacher[]>> => {
    const response = await apiClient.get(`${V2_BASE}/list-full`);
    return response.data;
  },

  /**
   * Get single teacher by ID (full info)
   * GET /v2/admin/teacher/{teacherId}/full
   */
  getTeacher: async (id: number): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.get(`${V2_BASE}/${id}/full`);
    return response.data;
  },

  /**
   * Create new teacher (enhanced)
   * POST /v2/admin/teacher/create-enhanced
   */
  createTeacher: async (
    teacherData: CreateTeacherData
  ): Promise<ApiResponse<Teacher & { credentials_sent?: boolean; message?: string }>> => {
    try {
      const response = await apiClient.post(
        `${V2_BASE}/create-enhanced`,
        teacherData
      );
      return response.data;
    } catch (error) {
      // Handle Axios errors
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const errorData = error.response?.data as 
          | { error?: string; message?: string; details?: Record<string, string> }
          | undefined;

        // Handle 409 Conflict errors (duplicate login/phone/email)
        if (status === 409) {
          const errorMessage =
            errorData?.error ||
            errorData?.message ||
            `A teacher with this phone/email (${teacherData.login}) already exists. Please use a different phone number or email.`;
          
          const conflictError = new Error(errorMessage);
          (conflictError as any).status = 409;
          (conflictError as any).response = error.response;
          throw conflictError;
        }

        // Handle 500 Internal Server Error (database constraint violations, etc.)
        if (status === 500) {
          // Check for database constraint errors in the error message
          const rawError = errorData?.error || errorData?.message || error.message || "";
          const errorString = typeof rawError === 'string' ? rawError : JSON.stringify(rawError);
          
          let errorMessage = "Failed to create teacher due to a server error.";
          
          // Check for specific database constraint violations
          if (errorString.includes('null value in column') && errorString.includes('violates not-null constraint')) {
            if (errorString.includes('type') && errorString.includes('managerial_auth')) {
              errorMessage = `Failed to create teacher: The backend is missing required data. This appears to be a backend configuration issue. Please contact support or try again with "Grant Admin Panel Access" enabled.`;
            } else {
              errorMessage = `Failed to create teacher: Missing required field. ${errorString.includes('column') ? 'Please check all required fields are filled.' : ''}`;
            }
          } else if (errorString.includes('violates not-null constraint')) {
            errorMessage = `Failed to create teacher: Missing required field. Please ensure all required information is provided.`;
          } else if (errorString.includes('duplicate key') || errorString.includes('already exists')) {
            errorMessage = `A teacher with this information already exists. Please use different details.`;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
          
          const serverError = new Error(errorMessage);
          (serverError as any).status = 500;
          (serverError as any).response = error.response;
          (serverError as any).originalError = errorString;
          throw serverError;
        }

        // Handle other HTTP errors (400, 422, etc.)
        if (status && status >= 400) {
          const errorMessage =
            errorData?.error ||
            errorData?.message ||
            `Failed to create teacher (HTTP ${status})`;
          const httpError = new Error(errorMessage);
          (httpError as any).status = status;
          (httpError as any).response = error.response;
          throw httpError;
        }
      }

      // Re-throw if not an AxiosError or if we couldn't handle it
      throw error;
    }
  },

  /**
   * Update teacher (enhanced)
   * PUT /v2/admin/teacher/{teacherId}/update-enhanced
   */
  updateTeacher: async (
    id: number,
    teacherData: UpdateTeacherData
  ): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.put(
      `${V2_BASE}/${id}/update-enhanced`,
      teacherData
    );
    return response.data;
  },

  /**
   * Delete teacher
   * Tries v2 API first, falls back to legacy if v2 doesn't exist
   */
  deleteTeacher: async (id: number): Promise<ApiResponse<void>> => {
    try {
      // Try v2 API first
      const response = await apiClient.delete(`${V2_BASE}/${id}`);
      return response.data;
    } catch (error: any) {
      // If v2 API returns 404 or doesn't exist, fall back to legacy
      if (error?.response?.status === 404) {
        const response = await apiClient.delete(`/admin/teacher/delete/${id}`);
        return response.data;
      }
      // Re-throw other errors (better error messages from v2)
      throw error;
    }
  },

  /**
   * Get teachers by course
   * GET /v2/admin/teacher/by-course/{courseId}
   */
  getTeachersByCourse: async (courseId: number): Promise<ApiResponse<Teacher[]>> => {
    const response = await apiClient.get(`${V2_BASE}/by-course/${courseId}`);
    return response.data;
  },

  /**
   * Search teachers
   * GET /v2/admin/teacher/search
   */
  searchTeachers: async (params: {
    q?: string;
    category?: string;
    isActive?: boolean;
    isPrivileged?: boolean;
    hasCourses?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Teacher[] & { count?: number }>> => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append("q", params.q);
    if (params.category) queryParams.append("category", params.category);
    if (params.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
    if (params.isPrivileged !== undefined) queryParams.append("isPrivileged", String(params.isPrivileged));
    if (params.hasCourses !== undefined) queryParams.append("hasCourses", String(params.hasCourses));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.offset) queryParams.append("offset", String(params.offset));

    const response = await apiClient.get(`${V2_BASE}/search?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Upload teacher image
   * POST /v2/admin/teacher/{teacherId}/image
   */
  uploadImage: async (
    id: number,
    imageFile: File
  ): Promise<ApiResponse<{ teacher_id: number; image: string; message: string }>> => {
    const imageUrl = await uploadImageToS3(imageFile, {
      purpose: "teacher-image",
    });

    const response = await apiClient.post(
      `${V2_BASE}/${id}/image`,
      { image_url: imageUrl }
    );
    return response.data;
  },

  /**
   * Delete teacher image
   * DELETE /v2/admin/teacher/{teacherId}/image
   */
  deleteImage: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`${V2_BASE}/${id}/image`);
    return response.data;
  },

  /**
   * Toggle teacher active status
   * PUT /v2/admin/teacher/{teacherId}/toggle-active
   */
  toggleActive: async (
    id: number,
    isActive: boolean
  ): Promise<ApiResponse<{ teacher_id: number; isActive: boolean; message: string }>> => {
    const response = await apiClient.put(
      `${V2_BASE}/${id}/toggle-active`,
      { isActive }
    );
    return response.data;
  },
};
