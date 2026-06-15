/**
 * User Types
 */
export interface User {
  id: number;
  name: string;
  type: number;
  login: string;
  login_type: string;
  email: string | null;
  phone: string | null;
  cf_handle: string | null;
  profile: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Admin extends User {
  // Admin-specific fields if any
}

/**
 * Role Management Types
 */
export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface PermissionsResponse {
  all: string[];
  by_resource: Record<string, string[]>;
}

export interface RoleAssignment {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  permissions?: string[];
  assigned_at?: string;
  updated_by?: number | null;
  user_id?: number;
  role_id?: number;
  created_at?: string;
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string | null;
  permissions?: string[];
}

export interface UpdateRoleData {
  name?: string;
  display_name?: string;
  description?: string | null;
  permissions?: string[];
}

/**
 * Course Types
 */
export interface Course {
  id: number;
  title: string;
  description?: string;
  price?: number;
  x_price?: number;
  language?: string;
  short_description?: string;
  intro_video?: string;
  url?: string;
  enrolled?: number;
  is_live?: boolean;
  chips?: Record<string, unknown>;
  chapters?: Chapter[];
  [key: string]: unknown;
}

export interface Chapter {
  id: number;
  course_id: number;
  title: string;
  serial: number;
  serial_string?: string;
  is_free?: boolean;
  is_live?: boolean;
  chips_list?: Record<string, unknown>;
  threshold?: number;
  modules?: Module[];
  [key: string]: unknown;
}

export type ModuleCategory = "VIDEO" | "QUIZ" | "PDF" | "TEXT";

export interface Module {
  id: number;
  chapter_id: number;
  title: string;
  description?: string;
  category: ModuleCategory;
  type?: string; // Legacy field, use category instead
  serial: number;
  score?: number;
  is_live?: boolean;
  is_free?: boolean;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>; // Category-specific data
  // New fields (optional, for enhanced APIs)
  quiz_time_limit?: number; // For quizzes (in minutes)
  quiz_attempt_limit?: number; // For quizzes
  // Live-Class toggle (live overlay on a VIDEO module)
  live_status?: "SCHEDULED" | "LIVE" | "ENDED" | null;
  live_meeting_id?: string | null;
  live_meeting_pass?: string | null;
  live_scheduled_at?: number | null;
  [key: string]: unknown;
}

export interface CourseWithChapters extends Course {
  chapters: Chapter[];
}

export interface ChapterWithModules extends Chapter {
  modules: Module[];
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Auth Types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Common Types
 */
export interface SelectOption {
  label: string;
  value: string | number;
}
