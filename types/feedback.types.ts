/**
 * Feedback Types - Course and Module Feedback Management
 */

// ============================================
// Course Feedback Types
// ============================================

export type CourseFeedbackCategory = 
  | "content" 
  | "instructor" 
  | "platform" 
  | "course" 
  | "other";

export interface CourseFeedback {
  id: string;
  course_id: string;
  course_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number; // 1-5
  comment: string;
  category: CourseFeedbackCategory;
  created_at: string;
  updated_at?: string;
}

export interface CourseFeedbackStats {
  total_feedbacks: number;
  average_rating: number;
  rating_distribution: RatingDistribution[];
  category_distribution: CategoryDistribution[];
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface CategoryDistribution {
  category: CourseFeedbackCategory;
  count: number;
}

export interface CourseFeedbackListParams {
  page?: number;
  limit?: number;
  courseId?: string;
  rating?: number;
  category?: CourseFeedbackCategory;
  sortBy?: "createdAt" | "rating";
  order?: "asc" | "desc";
}

export interface CourseFeedbackListResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  feedbacks: CourseFeedback[];
}

export interface CourseFeedbackExportParams {
  courseId?: string;
  startDate?: string;
  endDate?: string;
  format?: "csv" | "json";
}

// ============================================
// Module Feedback Types
// ============================================

export type ModuleFeedbackReaction = "like" | "dislike";

// Legacy hardcoded reasons (for backward compatibility)
export type ModuleFeedbackReason = 
  | "too_fast"
  | "too_slow"
  | "unclear"
  | "outdated"
  | "audio_issue"
  | "video_issue"
  | "missing_content"
  | "too_difficult"
  | "too_easy"
  | "other"
  | string; // Allow dynamic reasons from API

// Dynamic feedback reason from API
export interface ModuleFeedbackReasonItem {
  id: number;
  reason_key: string;
  reason_label: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackReasonData {
  reason_key: string;
  reason_label: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFeedbackReasonData {
  reason_label?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ReorderFeedbackReasonsData {
  orders: Array<{
    id: number;
    display_order: number;
  }>;
}

export interface ModuleFeedback {
  id: number;
  module_id: number;
  module_title: string;
  chapter_title: string;
  course_id?: number; // For course name lookup fallback
  course_title: string;
  reaction: ModuleFeedbackReaction;
  reason: ModuleFeedbackReason | null;
  comment: string | null;
  user_name: string;
  user_login: string;
  created_at: string;
}

export interface ModuleFeedbackListParams {
  courseId?: number;
  moduleId?: number;
  reaction?: ModuleFeedbackReaction;
  reason?: ModuleFeedbackReason;
  page?: number;
  limit?: number;
}

export interface ModuleFeedbackListResponse {
  success: boolean;
  data: ModuleFeedback[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ModuleStats {
  module_id: number;
  likes: number;
  dislikes: number;
  total: number;
  like_percentage: number;
  dislike_reasons: DislikeReasonCount[];
  recent_comments: RecentComment[];
}

export interface DislikeReasonCount {
  reason: ModuleFeedbackReason;
  count: number;
}

export interface RecentComment {
  reaction: ModuleFeedbackReaction;
  reason: ModuleFeedbackReason | null;
  comment: string;
  user_name: string;
  created_at: string;
}

export interface CourseModuleReport {
  course_id: number;
  summary: CourseReportSummary;
  top_dislike_reasons: DislikeReasonCount[];
  problem_modules: ProblemModule[];
  modules: ModuleReportItem[];
}

export interface CourseReportSummary {
  total_likes: number;
  total_dislikes: number;
  total_feedback: number;
  unique_users: number;
  modules_with_feedback: number;
  like_percentage: number;
}

export interface ProblemModule {
  module_id: number;
  module_title: string;
  chapter_title: string;
  dislike_count: number;
}

export interface ModuleReportItem {
  module_id: number;
  module_title: string;
  chapter_title: string;
  chapter_serial: number;
  module_serial: number;
  likes: number;
  dislikes: number;
  total: number;
  like_percentage: number | null;
}

export interface ModuleFeedbackExportParams {
  courseId?: number;
  reaction?: ModuleFeedbackReaction;
}

// ============================================
// UI Helper Types
// ============================================

export interface FeedbackTab {
  id: "course" | "module";
  label: string;
  icon: string;
}

export const FEEDBACK_CATEGORIES: { value: CourseFeedbackCategory; label: string }[] = [
  { value: "content", label: "Content Quality" },
  { value: "instructor", label: "Instructor" },
  { value: "platform", label: "Platform" },
  { value: "course", label: "General Course" },
  { value: "other", label: "Other" },
];

export const DISLIKE_REASONS: { value: ModuleFeedbackReason; label: string; action: string }[] = [
  { value: "too_fast", label: "Too Fast", action: "Slow down pacing" },
  { value: "too_slow", label: "Too Slow", action: "Trim content" },
  { value: "unclear", label: "Unclear", action: "Add examples" },
  { value: "outdated", label: "Outdated", action: "Update content" },
  { value: "audio_issue", label: "Audio Issue", action: "Re-record audio" },
  { value: "video_issue", label: "Video Issue", action: "Re-record video" },
  { value: "missing_content", label: "Missing Content", action: "Add content" },
  { value: "too_difficult", label: "Too Difficult", action: "Add prerequisites" },
  { value: "too_easy", label: "Too Easy", action: "Review audience" },
  { value: "other", label: "Other", action: "Read comment" },
];

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

