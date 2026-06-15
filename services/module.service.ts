import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Module, ApiResponse, ModuleCategory } from "@/types";

/**
 * Module Service
 * Handles all module-related API calls
 */

export interface CreateModuleData {
  title: string;
  description?: string;
  category: ModuleCategory;
  serial: number;
  score?: number;
  is_live?: boolean;
  is_free?: boolean;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  // New optional fields
  quiz_time_limit?: number; // For quizzes (in minutes)
  quiz_attempt_limit?: number; // For quizzes
}

export interface UpdateModuleData extends Partial<CreateModuleData> {
  id?: number; // Optional, can be in URL
  pdf_drive_link?: string | null;
}

/**
 * Create new module
 */
export async function createModule(
  chapterId: number,
  data: CreateModuleData
): Promise<Module> {
  const response = await apiClient.post<ApiResponse<Module>>(
    API_ENDPOINTS.MODULES.CREATE(chapterId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to create module");
  }
  return response.data.data;
}

/**
 * Get module by ID
 */
export async function getModule(moduleId: number): Promise<Module> {
  const response = await apiClient.get<ApiResponse<Module>>(
    API_ENDPOINTS.MODULES.GET(moduleId)
  );
  if (!response.data.data) {
    throw new Error("Module not found");
  }
  // Handle array response (some APIs return array)
  const moduleData = Array.isArray(response.data.data)
    ? response.data.data[0]
    : response.data.data;
  return moduleData;
}

/**
 * Update module
 */
export async function updateModule(
  moduleId: number,
  data: UpdateModuleData
): Promise<Module> {
  const response = await apiClient.put<ApiResponse<Module>>(
    API_ENDPOINTS.MODULES.UPDATE(moduleId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update module");
  }
  return response.data.data;
}

/**
 * Delete module
 */
export async function deleteModule(moduleId: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.MODULES.DELETE(moduleId));
}

// ============================================
// V2 API Functions (Phase 8 - Enhanced)
// ============================================

const V2_BASE = "/v2/admin/module";

/**
 * Update module with enhanced Phase 8 fields
 * PUT /v2/admin/module/{moduleId}/update-enhanced
 */
export async function updateModuleEnhanced(
  moduleId: number,
  data: UpdateModuleData & {
    quiz_time_limit?: number | null;
    quiz_attempt_limit?: number | null;
    pdf_drive_link?: string | null;
    // Live-Class toggle fields (live overlay on a VIDEO module)
    live_status?: "SCHEDULED" | "LIVE" | "ENDED" | null;
    live_meeting_id?: string | null;
    live_meeting_pass?: string | null;
    live_scheduled_at?: number | null;
    data?: Record<string, unknown>;
  }
): Promise<Module> {
  const response = await apiClient.put<ApiResponse<Module>>(
    `${V2_BASE}/${moduleId}/update-enhanced`,
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update module");
  }
  return response.data.data;
}

/**
 * Import quiz from JSON
 * POST /v2/admin/module/{moduleId}/quiz/import
 * 
 * ✅ NEW: No encryption required - only questions and options
 * Admin selects answers manually in UI after import
 */
export async function importQuiz(
  moduleId: number,
  quizData: {
    quiz: Array<{
      question: string; // Required - plain text
      question_html?: string; // Optional - HTML formatted
      options: string[]; // Required - plain text array (minimum 2 items)
      options_html?: string[]; // Optional - HTML formatted array
      points?: number; // Optional - defaults to 1
    }>;
    // Note: metadata (time_limit, attempt_limit) is set via UI, not imported
  }
): Promise<{
  success: boolean;
  data: {
    imported_count: number;
    total_questions: number;
    module_id: number;
    message: string;
  };
  error?: string;
  code?: string;
  details?: Record<string, string>;
}> {
  try {
    const response = await apiClient.post<
      ApiResponse<{
        imported_count: number;
        total_questions: number;
        module_id: number;
        message: string;
      }>
    >(`${V2_BASE}/${moduleId}/quiz/import`, {
      quiz_data: quizData,
    });

    // Handle case where backend returns success: false with 200 status
    if (response.data && !(response.data as any).success) {
      const errorResponse = response.data as unknown as {
        success: false;
        error: string;
        code?: string;
        details?: Record<string, string>;
      };
      const error = new Error(errorResponse.error || "Failed to import quiz") as any;
      error.code = errorResponse.code;
      error.details = errorResponse.details;
      throw error;
    }

    if (!response.data.data) {
      throw new Error("Failed to import quiz");
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    // Re-throw AxiosErrors as-is so hook can extract error details
    // The API client interceptor already extracts error messages
    throw error;
  }
}

/**
 * Export quiz to JSON
 * GET /v2/admin/module/{moduleId}/quiz/export
 */
export async function exportQuiz(
  moduleId: number,
  options: {
    format?: "full" | "minimal";
    include_answers?: boolean;
  } = {}
): Promise<{
  version: string;
  quiz: Array<unknown>;
  metadata: {
    time_limit?: number;
    attempt_limit?: number;
    total_points?: number;
  };
}> {
  const params = new URLSearchParams();
  if (options.format) params.append("format", options.format);
  if (options.include_answers !== undefined) {
    params.append("include_answers", String(options.include_answers));
  }

  const response = await apiClient.get<ApiResponse<{
    version: string;
    quiz: Array<unknown>;
    metadata: {
      time_limit?: number;
      attempt_limit?: number;
      total_points?: number;
    };
  }>>(
    `${V2_BASE}/${moduleId}/quiz/export?${params.toString()}`
  );

  if (!response.data.data) {
    throw new Error("Failed to export quiz");
  }
  return response.data.data;
}

/**
 * Duplicate module
 * POST /v2/admin/module/{moduleId}/duplicate
 */
export async function duplicateModule(
  moduleId: number,
  options: {
    include_content?: boolean;
    new_chapter_id?: number;
  } = {}
): Promise<{
  original_module_id: number;
  new_module_id: number;
  new_module: Module;
  message: string;
}> {
  const params = new URLSearchParams();
  if (options.include_content !== undefined) {
    params.append("include_content", String(options.include_content));
  }
  if (options.new_chapter_id) {
    params.append("new_chapter_id", String(options.new_chapter_id));
  }

  const response = await apiClient.post<ApiResponse<{
    original_module_id: number;
    new_module_id: number;
    new_module: Module;
    message: string;
  }>>(
    `${V2_BASE}/${moduleId}/duplicate?${params.toString()}`
  );

  if (!response.data.data) {
    throw new Error("Failed to duplicate module");
  }
  return response.data.data;
}
