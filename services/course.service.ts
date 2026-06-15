import apiClient from "@/lib/api";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Course, CourseWithChapters, ApiResponse } from "@/types";
import { AxiosError } from "axios";

/**
 * Course Service
 * Handles all course-related API calls
 */

export interface CreateCourseData {
  title: string;
  description?: string;
  price?: number;
  x_price?: number;
  language?: string;
  short_description?: string;
  intro_video?: string;
  url?: string;
  is_live?: boolean;
  chips?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: number;
}

export interface UpdateCourseFullData {
  id: number;
  title?: string;
  description?: string;
  price?: number;
  x_price?: number;
  language?: string;
  short_description?: string;
  intro_video?: string;
  url?: string;
  is_live?: boolean;
  chips?: Record<string, unknown>;
  chapters?: Array<{
    id?: number;
    title: string;
    serial: number;
    serial_string?: string;
    is_free?: boolean;
    is_live?: boolean;
    chips_list?: Record<string, unknown>;
    threshold?: number;
    modules?: Array<{
      id?: number;
      title: string;
      description?: string;
      category: string;
      serial: number;
      score?: number;
      is_live?: boolean;
      is_free?: boolean;
      metadata?: Record<string, unknown>;
      data?: Record<string, unknown>;
      quiz_time_limit?: number;
      quiz_attempt_limit?: number;
    }>;
  }>;
  [key: string]: unknown;
}

/**
 * Get list of all courses
 */
export async function getCoursesList(): Promise<Course[]> {
  const response = await apiClient.get<ApiResponse<Course[]>>(
    API_ENDPOINTS.COURSES.LIST
  );
  const payload = response.data?.data as unknown;

  if (Array.isArray(payload)) {
    return payload as Course[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "courses" in payload &&
    Array.isArray((payload as { courses?: unknown }).courses)
  ) {
    return (payload as { courses: Course[] }).courses;
  }

  return [];
}

/**
 * Get course by ID (basic info)
 * Handles multiple response formats for backward compatibility
 */
export async function getCourse(courseId: number): Promise<Course> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.COURSES.GET(courseId)
    );
    
    // Handle multiple response formats:
    // 1. ApiResponse wrapper: { data: { data: Course } }
    // 2. Direct data: { data: Course }
    // 3. Direct response: Course (old format)
    let courseData: Course | undefined;
    
    // Check if response has ApiResponse wrapper
    if (response.data?.data !== undefined) {
      // Has wrapper - could be array or single object
    if (Array.isArray(response.data.data)) {
      courseData = response.data.data[0];
    } else {
      courseData = response.data.data;
      }
    } else if (response.data) {
      // No wrapper - data is directly in response.data
      if (Array.isArray(response.data)) {
        courseData = response.data[0];
      } else {
        courseData = response.data;
      }
    }
    
    if (!courseData) {
      console.error(`Course ${courseId} not found. Response:`, response.data);
      throw new Error("Course not found");
    }
    
    return courseData;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 404) {
        throw new Error("Course not found");
      }
      const errorData = error.response?.data as { error?: string; message?: string } | undefined;
      const errorMessage = errorData?.error || errorData?.message || "Failed to load course";
      console.error(`Error loading course ${courseId}:`, {
        status,
        error: errorMessage,
        response: error.response?.data,
      });
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to load course. Please try again.");
  }
}

/**
 * Get course with full structure (chapters and modules)
 * Handles multiple response formats for backward compatibility
 */
export async function getCourseFull(
  courseId: number
): Promise<CourseWithChapters> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.COURSES.GET_FULL(courseId)
    );
    
    // Handle multiple response formats:
    // 1. ApiResponse wrapper: { data: { data: Course } }
    // 2. Direct data: { data: Course }
    // 3. Direct response: Course (old format)
    let courseData: CourseWithChapters | undefined;
    
    // Check if response has ApiResponse wrapper
    if (response.data?.data !== undefined) {
      // Has wrapper - could be array or single object
    if (Array.isArray(response.data.data)) {
      courseData = response.data.data[0];
    } else {
      courseData = response.data.data;
      }
    } else if (response.data) {
      // No wrapper - data is directly in response.data
      if (Array.isArray(response.data)) {
        courseData = response.data[0];
      } else {
        courseData = response.data;
      }
    }
    
    if (!courseData) {
      console.error(`Course ${courseId} not found. Response:`, response.data);
      throw new Error("Course not found");
    }
    
    // Validate that we have the expected structure
    if (!courseData.id && !courseData.title) {
      console.error(`Invalid course data structure for course ${courseId}:`, courseData);
      throw new Error("Invalid course data structure");
    }
    
    return courseData;
  } catch (error: unknown) {
    // Better error handling
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 404) {
        throw new Error("Course not found");
      }
      const errorData = error.response?.data as { error?: string; message?: string } | undefined;
      const errorMessage = errorData?.error || errorData?.message || "Failed to load course";
      console.error(`Error loading course ${courseId}:`, {
        status,
        error: errorMessage,
        response: error.response?.data,
      });
      throw new Error(errorMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to load course. Please try again.");
  }
}

/**
 * Get course with full structure (enhanced v2 API)
 * Includes Phase 8 fields: quiz_time_limit, quiz_attempt_limit, etc.
 * GET /v2/admin/course/{courseId}/getFull-enhanced
 * Falls back to regular getFull API if enhanced endpoint fails
 */
export async function getCourseFullEnhanced(
  courseId: number
): Promise<CourseWithChapters> {
  // First, try the enhanced v2 API
  try {
    const response = await apiClient.get(
      `/v2/admin/course/${courseId}/getFull-enhanced`
    );
    
    // Handle multiple response formats (same as getCourseFull)
    let courseData: CourseWithChapters | undefined;
    
    // Check if response has ApiResponse wrapper
    if (response.data?.data !== undefined) {
      // Has wrapper - could be array or single object
    if (Array.isArray(response.data.data)) {
      courseData = response.data.data[0];
    } else {
      courseData = response.data.data;
      }
    } else if (response.data) {
      // No wrapper - data is directly in response.data
      if (Array.isArray(response.data)) {
        courseData = response.data[0];
      } else {
        courseData = response.data;
      }
    }
    
    // Check if response has data
    if (courseData && (courseData.id || courseData.title)) {
      console.log(`Successfully loaded course ${courseId} from enhanced v2 API`);
      return courseData;
    }
    
    // If enhanced endpoint returns success but no data, try fallback
    if (response.data?.success === false) {
      const errorMsg = response.data.error || response.data.message || "Course not found";
      console.warn(`Enhanced API returned error for course ${courseId}: ${errorMsg}, trying fallback`);
      return getCourseFull(courseId);
    }
    
    // If no data in response, try fallback to regular API
    console.warn(`Enhanced API returned no data for course ${courseId}, falling back to regular API`);
    return getCourseFull(courseId);
  } catch (error: unknown) {
    // If enhanced endpoint fails (404, 500, etc.), try fallback to regular API
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const errorData = error.response?.data as { error?: string; message?: string } | undefined;
      const errorMessage = errorData?.error || errorData?.message || error.message;
      
      // Log the error for debugging
      console.warn(`Enhanced API error for course ${courseId}:`, {
        status,
        message: errorMessage,
        url: `/v2/admin/course/${courseId}/getFull-enhanced`,
      });
      
      // For 404 or "not found" errors, try fallback
      if (status === 404 || errorMessage?.toLowerCase().includes("not found")) {
        console.warn(`Enhanced API endpoint returned 404/not found for course ${courseId}, falling back to regular API`);
        try {
          return getCourseFull(courseId);
        } catch (fallbackError) {
          // If fallback also fails, provide helpful error
          console.error(`Both enhanced and regular APIs failed for course ${courseId}:`, fallbackError);
          throw new Error(`Course not found (ID: ${courseId}). Please verify the course exists.`);
        }
      }
      
      // For other HTTP errors, try fallback first, then throw
      if (status && status >= 400) {
        console.warn(`Enhanced API returned ${status} for course ${courseId}, trying fallback`);
        try {
          return getCourseFull(courseId);
        } catch (fallbackError) {
          throw new Error(errorMessage || `Failed to load course (HTTP ${status})`);
        }
      }
      
      // Network errors or other issues
      console.warn(`Enhanced API network error for course ${courseId}, trying fallback:`, error.message);
      try {
        return getCourseFull(courseId);
      } catch (fallbackError) {
        throw new Error(errorMessage || "Failed to load course. Please check your connection.");
      }
    }
    
    // If it's already an Error, check if it's a "not found" error and try fallback
    if (error instanceof Error) {
      const isNotFound = error.message.toLowerCase().includes("not found") || 
                         error.message.toLowerCase().includes("404");
      
      if (isNotFound) {
        console.warn(`Enhanced API error for course ${courseId}, trying fallback: ${error.message}`);
        try {
          return getCourseFull(courseId);
        } catch (fallbackError) {
          throw new Error(`Course not found (ID: ${courseId}). Please verify the course exists.`);
        }
      }
      throw error;
    }
    
    // Unknown error - try fallback as last resort
    console.warn(`Unknown error loading course ${courseId}, trying fallback`);
    try {
      return getCourseFull(courseId);
    } catch (fallbackError) {
      throw new Error("Failed to load course. Please try again.");
    }
  }
}

/**
 * Create new course
 */
export async function createCourse(
  data: CreateCourseData
): Promise<Course> {
  const response = await apiClient.post<ApiResponse<Course>>(
    API_ENDPOINTS.COURSES.CREATE,
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to create course");
  }
  return response.data.data;
}

/**
 * Update course basic info
 */
export async function updateCourse(
  courseId: number,
  data: Partial<CreateCourseData>
): Promise<Course> {
  const response = await apiClient.put<ApiResponse<Course>>(
    API_ENDPOINTS.COURSES.UPDATE(courseId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update course");
  }
  return response.data.data;
}

/**
 * Update course with full structure (chapters and modules)
 */
export async function updateCourseFull(
  courseId: number,
  data: UpdateCourseFullData
): Promise<CourseWithChapters> {
  const response = await apiClient.put<ApiResponse<CourseWithChapters>>(
    API_ENDPOINTS.COURSES.UPDATE_FULL(courseId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update course");
  }
  return response.data.data;
}

/**
 * Delete course
 */
export async function deleteCourse(courseId: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.COURSES.GET(courseId));
}

// ============================================
// V2 API Functions (Phase 8 - Enhanced)
// ============================================

const V2_COURSE_BASE = "/v2/admin/course";

/**
 * Reorder modules across chapters
 * PUT /v2/admin/course/{courseId}/modules/reorder
 */
export async function reorderModules(
  courseId: number,
  moduleOrders: Array<{
    module_id: number;
    chapter_id: number;
    serial: number;
  }>
): Promise<{
  success: boolean;
  message: string;
  updated_count: number;
}> {
  const response = await apiClient.put<ApiResponse<{
    success: boolean;
    message: string;
    updated_count: number;
  }>>(
    `${V2_COURSE_BASE}/${courseId}/modules/reorder`,
    { module_orders: moduleOrders }
  );

  if (!response.data.data) {
    throw new Error("Failed to reorder modules");
  }
  return response.data.data;
}

/**
 * Export course to JSON or CSV
 * GET /v2/admin/course/{courseId}/export
 */
export async function exportCourse(
  courseId: number,
  options: {
    format?: "json" | "csv";
    include_content?: boolean;
    include_quiz_answers?: boolean;
  } = {}
): Promise<unknown> {
  const params = new URLSearchParams();
  if (options.format) params.append("format", options.format);
  if (options.include_content !== undefined) {
    params.append("include_content", String(options.include_content));
  }
  if (options.include_quiz_answers !== undefined) {
    params.append("include_quiz_answers", String(options.include_quiz_answers));
  }

  const response = await apiClient.get<ApiResponse<unknown>>(
    `${V2_COURSE_BASE}/${courseId}/export?${params.toString()}`
  );

  if (!response.data.data) {
    throw new Error("Failed to export course");
  }
  return response.data.data;
}

/**
 * Import course from CSV or JSON
 * POST /v2/admin/course/import
 */
export async function importCourse(
  file: File,
  options: {
    format?: "csv" | "json";
    import_mode?: "create" | "update" | "upsert";
    validate_only?: boolean;
  } = {}
): Promise<{
  import_id: string;
  status: string;
  message: string;
}> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "json") {
    throw new Error("Invalid file type. Allowed: CSV, JSON");
  }

  const uploadedFileUrl = await uploadImageToS3(file, {
    purpose: "course-import",
  });
  const uploadUrl = new URL(uploadedFileUrl);
  const uploadKey = decodeURIComponent(uploadUrl.pathname.replace(/^\/+/, ""));
  if (!uploadKey) {
    throw new Error("Failed to resolve uploaded file key");
  }

  const response = await apiClient.post<ApiResponse<{
    import_id: string;
    status: string;
    message: string;
  }>>(
    `${V2_COURSE_BASE}/import`,
    {
      upload_key: uploadKey,
      format: options.format,
      import_mode: options.import_mode,
      validate_only: options.validate_only,
    }
  );

  if (!response.data.data) {
    throw new Error("Failed to import course");
  }
  return response.data.data;
}

/**
 * Get import status
 * GET /v2/admin/course/import/{importId}/status
 */
export async function getImportStatus(importId: string): Promise<{
  import_id: string;
  status: "processing" | "completed" | "failed" | "partial";
  course_id?: number;
  summary?: {
    course_created: boolean;
    chapters_created: number;
    modules_created: number;
  };
  errors: Array<{
    line?: number;
    field?: string;
    message: string;
  }>;
  warnings: Array<{
    line?: number;
    field?: string;
    message: string;
  }>;
  progress?: {
    total_items: number;
    processed_items: number;
    percentage: number;
  };
  started_at?: string;
  completed_at?: string;
}> {
  const response = await apiClient.get<ApiResponse<{
    import_id: string;
    status: "processing" | "completed" | "failed" | "partial";
    course_id?: number;
    summary?: {
      course_created: boolean;
      chapters_created: number;
      modules_created: number;
    };
    errors: Array<{
      line?: number;
      field?: string;
      message: string;
    }>;
    warnings: Array<{
      line?: number;
      field?: string;
      message: string;
    }>;
    progress?: {
      total_items: number;
      processed_items: number;
      percentage: number;
    };
    started_at?: string;
    completed_at?: string;
  }>>(
    `${V2_COURSE_BASE}/import/${importId}/status`
  );

  if (!response.data.data) {
    throw new Error("Failed to get import status");
  }
  // Return data directly (not wrapped in ApiResponse.data)
  const statusData = response.data.data;
  return statusData;
}

/**
 * Download import template
 * GET /v2/admin/course/import/template
 */
export async function downloadImportTemplate(
  format: "json" | "csv" = "json",
  exampleData: boolean = true
): Promise<Blob> {
  const params = new URLSearchParams();
  params.append("format", format);
  params.append("example_data", String(exampleData));

  const response = await apiClient.get<Blob>(
    `${V2_COURSE_BASE}/import/template?${params.toString()}`,
    {
      responseType: "blob",
    }
  );

  return response.data;
}
