import apiClient from "@/lib/api";
import type {
  CourseFeedback,
  CourseFeedbackCategory,
  CourseFeedbackStats,
  CourseFeedbackListParams,
  CourseFeedbackListResponse,
  CourseFeedbackExportParams,
  ModuleFeedback,
  ModuleFeedbackListParams,
  ModuleFeedbackListResponse,
  ModuleStats,
  CourseModuleReport,
  ModuleFeedbackExportParams,
  ModuleFeedbackReasonItem,
  CreateFeedbackReasonData,
  UpdateFeedbackReasonData,
  ReorderFeedbackReasonsData,
} from "@/types/feedback.types";

/**
 * Feedback Service
 * Handles all feedback-related API calls for both Course and Module feedback
 */

// ============================================
// Course Feedback API
// ============================================

const COURSE_FEEDBACK_BASE = "/admin/feedback";

/**
 * Get paginated list of course feedback
 */
export async function getCourseFeedbackList(
  params: CourseFeedbackListParams = {}
): Promise<CourseFeedbackListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.courseId) queryParams.append("courseId", params.courseId);
  if (params.rating) queryParams.append("rating", String(params.rating));
  if (params.category) queryParams.append("category", params.category);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.order) queryParams.append("order", params.order);

  const response = await apiClient.get(
    `${COURSE_FEEDBACK_BASE}?${queryParams.toString()}`
  );
  
  const apiResponse = response.data;
  
  // Transform API response - handle both camelCase and snake_case field names
  const result: CourseFeedbackListResponse = {
    success: apiResponse.success ?? true,
    page: apiResponse.page || 1,
    limit: apiResponse.limit || 20,
    total: apiResponse.total || 0,
    totalPages: apiResponse.totalPages || apiResponse.total_pages || 1,
    feedbacks: (apiResponse.feedbacks || apiResponse.data || []).map((f: Record<string, unknown>) => ({
      id: f.id,
      course_id: f.course_id || f.courseId,
      course_name: f.course_name || f.courseName || "",
      user_id: f.user_id || f.userId,
      user_name: f.user_name || f.userName || "",
      user_email: f.user_email || f.userEmail || "",
      rating: f.rating,
      comment: f.comment || "",
      category: f.category,
      created_at: f.created_at || f.createdAt,
      updated_at: f.updated_at || f.updatedAt,
    })),
  };
  
  return result;
}

/**
 * Get course feedback statistics
 */
export async function getCourseFeedbackStats(
  courseId?: string
): Promise<CourseFeedbackStats> {
  const queryParams = new URLSearchParams();
  if (courseId) queryParams.append("courseId", courseId);

  const response = await apiClient.get(
    `${COURSE_FEEDBACK_BASE}/stats?${queryParams.toString()}`
  );
  
  const apiResponse = response.data;
  
  // Transform API response (camelCase + objects) to expected format (snake_case + arrays)
  // API returns: { totalFeedbacks, averageRating, ratingDistribution: {1: 0, 2: 0, ...}, categoryDistribution: {course: 3, ...} }
  // We need: { total_feedbacks, average_rating, rating_distribution: [{rating, count}], category_distribution: [{category, count}] }
  
  // Transform ratingDistribution object to array
  const ratingDistributionObj = apiResponse.ratingDistribution || apiResponse.rating_distribution || {};
  const rating_distribution = Object.entries(ratingDistributionObj).map(([rating, count]) => ({
    rating: parseInt(rating, 10),
    count: count as number,
  }));
  
  // Transform categoryDistribution object to array
  const categoryDistributionObj = apiResponse.categoryDistribution || apiResponse.category_distribution || {};
  const category_distribution = Object.entries(categoryDistributionObj).map(([category, count]) => ({
    category: category as CourseFeedbackCategory,
    count: count as number,
  }));
  
  const stats: CourseFeedbackStats = {
    total_feedbacks: apiResponse.totalFeedbacks ?? apiResponse.total_feedbacks ?? 0,
    average_rating: apiResponse.averageRating ?? apiResponse.average_rating ?? 0,
    rating_distribution,
    category_distribution,
  };
  
  return stats;
}

/**
 * Export course feedback as CSV or JSON
 */
export async function exportCourseFeedback(
  params: CourseFeedbackExportParams = {}
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  
  if (params.courseId) queryParams.append("courseId", params.courseId);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.format) queryParams.append("format", params.format);

  const response = await apiClient.get<Blob>(
    `${COURSE_FEEDBACK_BASE}/export?${queryParams.toString()}`,
    { responseType: "blob" }
  );
  
  return response.data;
}

/**
 * Delete a course feedback
 */
export async function deleteCourseFeedback(feedbackId: string): Promise<void> {
  await apiClient.delete(`${COURSE_FEEDBACK_BASE}/${feedbackId}`);
}

// ============================================
// Module Feedback API
// ============================================

const MODULE_FEEDBACK_BASE = "/admin/module-feedback";

/**
 * Get paginated list of module feedback
 */
export async function getModuleFeedbackList(
  params: ModuleFeedbackListParams = {}
): Promise<ModuleFeedbackListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.courseId) queryParams.append("courseId", String(params.courseId));
  if (params.moduleId) queryParams.append("moduleId", String(params.moduleId));
  if (params.reaction) queryParams.append("reaction", params.reaction);
  if (params.reason) queryParams.append("reason", params.reason);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  const response = await apiClient.get(
    `${MODULE_FEEDBACK_BASE}?${queryParams.toString()}`
  );
  
  const responseData = response.data;
  
  // The API returns { success: true, data: [...], pagination: {...} }
  // We need to transform this to match our expected structure
  if (responseData && typeof responseData === 'object') {
    // If response has 'data' array at top level (new format)
    if ('data' in responseData && Array.isArray(responseData.data)) {
      return responseData as ModuleFeedbackListResponse;
    }
    // If response is wrapped in another 'data' property
    if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
      return responseData.data as ModuleFeedbackListResponse;
    }
  }
  
  return responseData as ModuleFeedbackListResponse;
}

/**
 * Get detailed statistics for a specific module
 */
export async function getModuleStats(moduleId: number): Promise<ModuleStats> {
  const response = await apiClient.get<{ success: boolean; data: ModuleStats }>(
    `${MODULE_FEEDBACK_BASE}/stats/${moduleId}`
  );
  
  return response.data.data;
}

/**
 * Get comprehensive feedback report for a course
 */
export async function getCourseModuleReport(courseId: number): Promise<CourseModuleReport> {
  const response = await apiClient.get(
    `${MODULE_FEEDBACK_BASE}/course/${courseId}/report`
  );
  
  const apiResponse = response.data;
  
  // Extract the actual data (may be nested in 'data' property)
  const rawData = apiResponse?.data || apiResponse;
  
  // Transform camelCase to snake_case and handle structure differences
  const summary = rawData.summary || rawData;
  const transformedSummary = {
    total_feedback: summary.totalFeedback ?? summary.total_feedback ?? 0,
    total_likes: summary.totalLikes ?? summary.total_likes ?? 0,
    total_dislikes: summary.totalDislikes ?? summary.total_dislikes ?? 0,
    like_percentage: summary.likePercentage ?? summary.like_percentage ?? 0,
    unique_users: summary.uniqueUsers ?? summary.unique_users ?? 0,
    modules_with_feedback: summary.modulesWithFeedback ?? summary.modules_with_feedback ?? 0,
  };
  
  // Transform modules array - API returns snake_case, just pass through with defaults
  const rawModules = rawData.modules || [];
  
  const transformedModules = rawModules.map((m: Record<string, unknown>) => ({
    module_id: (m.module_id ?? m.moduleId) as number,
    module_title: (m.module_title ?? m.moduleTitle ?? "") as string,
    chapter_id: (m.chapter_id ?? m.chapterId) as number,
    chapter_title: (m.chapter_title ?? m.chapterTitle ?? "") as string,
    chapter_serial: (m.chapter_serial ?? m.chapterSerial ?? 0) as number,
    module_serial: (m.module_serial ?? m.moduleSerial ?? 0) as number,
    likes: (m.likes ?? 0) as number,
    dislikes: (m.dislikes ?? 0) as number,
    total: (m.total ?? 0) as number,
    like_percentage: (m.like_percentage ?? m.likePercentage ?? 0) as number | null,
  }));
  
  // Transform top_dislike_reasons
  const rawReasons = rawData.topDislikeReasons ?? rawData.top_dislike_reasons ?? [];
  const transformedReasons = rawReasons.map((r: Record<string, unknown>) => ({
    reason: r.reason ?? "",
    count: r.count ?? 0,
  }));
  
  // Transform problem_modules
  const rawProblemModules = rawData.problemModules ?? rawData.problem_modules ?? [];
  const transformedProblemModules = rawProblemModules.map((m: Record<string, unknown>) => ({
    module_id: m.moduleId ?? m.module_id,
    module_title: m.moduleTitle ?? m.module_title ?? "",
    chapter_title: m.chapterTitle ?? m.chapter_title ?? "",
    dislike_count: m.dislikeCount ?? m.dislike_count ?? 0,
    top_reason: m.topReason ?? m.top_reason ?? "",
  }));
  
  const result: CourseModuleReport = {
    course_id: rawData.courseId ?? rawData.course_id ?? courseId,
    summary: transformedSummary,
    modules: transformedModules,
    top_dislike_reasons: transformedReasons,
    problem_modules: transformedProblemModules,
  };
  
  return result;
}

/**
 * Export module feedback as CSV
 */
export async function exportModuleFeedback(
  params: ModuleFeedbackExportParams = {}
): Promise<Blob> {
  const queryParams = new URLSearchParams();
  
  if (params.courseId) queryParams.append("courseId", String(params.courseId));
  if (params.reaction) queryParams.append("reaction", params.reaction);

  const response = await apiClient.get<Blob>(
    `${MODULE_FEEDBACK_BASE}/export?${queryParams.toString()}`,
    { responseType: "blob" }
  );
  
  return response.data;
}

// ============================================
// Module Feedback Reasons API
// ============================================

const MODULE_FEEDBACK_REASONS_BASE = "/admin/module-feedback/reasons";

/**
 * Get all feedback reasons
 */
export async function getFeedbackReasons(activeOnly?: boolean): Promise<ModuleFeedbackReasonItem[]> {
  const queryParams = new URLSearchParams();
  if (activeOnly) queryParams.append("activeOnly", "true");

  const response = await apiClient.get<{ success: boolean; data: ModuleFeedbackReasonItem[] }>(
    `${MODULE_FEEDBACK_REASONS_BASE}?${queryParams.toString()}`
  );
  
  return response.data.data || [];
}

/**
 * Get feedback reason by ID
 */
export async function getFeedbackReason(id: number): Promise<ModuleFeedbackReasonItem> {
  const response = await apiClient.get<{ success: boolean; data: ModuleFeedbackReasonItem }>(
    `${MODULE_FEEDBACK_REASONS_BASE}/${id}`
  );
  
  return response.data.data;
}

/**
 * Create new feedback reason
 */
export async function createFeedbackReason(
  data: CreateFeedbackReasonData
): Promise<ModuleFeedbackReasonItem> {
  const response = await apiClient.post<{ success: boolean; data: ModuleFeedbackReasonItem }>(
    MODULE_FEEDBACK_REASONS_BASE,
    data
  );
  
  return response.data.data;
}

/**
 * Update feedback reason
 */
export async function updateFeedbackReason(
  id: number,
  data: UpdateFeedbackReasonData
): Promise<ModuleFeedbackReasonItem> {
  const response = await apiClient.put<{ success: boolean; data: ModuleFeedbackReasonItem }>(
    `${MODULE_FEEDBACK_REASONS_BASE}/${id}`,
    data
  );
  
  return response.data.data;
}

/**
 * Delete feedback reason
 */
export async function deleteFeedbackReason(id: number): Promise<void> {
  await apiClient.delete(`${MODULE_FEEDBACK_REASONS_BASE}/${id}`);
}

/**
 * Bulk reorder feedback reasons
 */
export async function reorderFeedbackReasons(
  data: ReorderFeedbackReasonsData
): Promise<void> {
  await apiClient.patch(`${MODULE_FEEDBACK_REASONS_BASE}/reorder`, data);
}

