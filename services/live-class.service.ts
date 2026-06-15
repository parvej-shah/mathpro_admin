import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface LiveClass {
  id: number;
  title: string;
  description: string;
  duration: string;
  meeting_id: string;
  meeting_pass: string;
  scheduled_at: number; // Unix timestamp
  can_join: boolean;
  course_id: number;
  course_title?: string;
  teacher_id: number;
  teacher_name?: string;
  thumbnail?: string;
  interested?: number;
  data?: {
    recordedMeetingLink?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CreateLiveClassData {
  title: string;
  description: string;
  thumbnail?: string;
  can_join: boolean;
  scheduled_at: number; // Unix timestamp
  duration: string;
  meeting_id: string;
  meeting_pass: string;
  teacher_id: number;
  data?: {
    recordedMeetingLink?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UpdateLiveClassData extends Partial<CreateLiveClassData> {
  [key: string]: unknown;
}

// Bulk Import Types
export interface BulkImportEntry {
  course_id: number;
  title: string;
  scheduled_at: number;
  description?: string;
  thumbnail?: string;
  can_join?: boolean;
  duration?: string;
  meeting_id?: string;
  meeting_pass?: string;
  teacher_id?: number;
  data?: object;
}

export interface BulkImportResult {
  success: boolean;
  message: string;
  data: {
    imported_count: number;
    imported: Array<{
      index: number;
      id: number;
      title: string;
    }>;
  };
}

export interface BulkImportError {
  success: false;
  error: string;
  code: string;
  details?: string[];
  validCount?: number;
  invalidCount?: number;
}

// Bulk Delete Types
export interface BulkDeleteResult {
  success: boolean;
  message: string;
  data: {
    deleted_count: number;
    deleted: Array<{
      id: number;
      title: string;
    }>;
    not_found?: number[];
  };
}

// Export Types
export interface ExportResult {
  success: boolean;
  exported_at: string;
  count: number;
  live_classes: LiveClass[];
}

// Template Types
export interface TemplateResult {
  success: boolean;
  data: {
    description: string;
    version: string;
    live_classes: BulkImportEntry[];
    field_descriptions: Record<string, string>;
  };
}

export const liveClassService = {
  /**
   * Get all live classes
   */
  getAllLiveClasses: async (): Promise<ApiResponse<LiveClass[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.LIVE_CLASSES.LIST);
    return response.data;
  },

  /**
   * Get single live class by ID
   */
  getLiveClass: async (id: number): Promise<ApiResponse<LiveClass[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.LIVE_CLASSES.GET(id));
    return response.data;
  },

  /**
   * Create new live class
   */
  createLiveClass: async (
    courseId: number,
    liveClassData: CreateLiveClassData
  ): Promise<ApiResponse<{ id: number }[]>> => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.LIVE_CLASSES.CREATE}/${courseId}`,
      liveClassData
    );
    return response.data;
  },

  /**
   * Update live class
   */
  updateLiveClass: async (
    id: number,
    liveClassData: UpdateLiveClassData
  ): Promise<ApiResponse<LiveClass>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.LIVE_CLASSES.UPDATE(id),
      liveClassData
    );
    return response.data;
  },

  /**
   * Delete live class
   */
  deleteLiveClass: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.LIVE_CLASSES.DELETE(id)
    );
    return response.data;
  },

  /**
   * Get interest count for a live class
   */
  getInterestCount: async (id: number): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.LIVE_CLASSES.INTEREST_COUNT(id)
    );
    return response.data;
  },

  /**
   * Bulk import live classes from JSON
   * Maximum 100 entries per request
   */
  bulkImport: async (
    liveClasses: BulkImportEntry[]
  ): Promise<BulkImportResult | BulkImportError> => {
    const response = await apiClient.post(
      API_ENDPOINTS.LIVE_CLASSES.BULK_IMPORT,
      { live_classes: liveClasses }
    );
    return response.data;
  },

  /**
   * Export live classes to CSV or JSON format
   */
  exportLiveClasses: async (
    format: "csv" | "json" = "csv",
    courseId?: number
  ): Promise<string | ExportResult> => {
    const params = new URLSearchParams();
    params.append("format", format);
    if (courseId) params.append("course_id", String(courseId));

    const response = await apiClient.get(
      `${API_ENDPOINTS.LIVE_CLASSES.EXPORT}?${params.toString()}`,
      {
        responseType: format === "csv" ? "text" : "json",
      }
    );
    return response.data;
  },

  /**
   * Get JSON template for bulk importing live classes
   */
  getTemplate: async (withExample: boolean = true): Promise<TemplateResult> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.LIVE_CLASSES.TEMPLATE}?example=${withExample}`
    );
    return response.data;
  },

  /**
   * Bulk delete live classes by IDs
   * Maximum 50 entries per request
   */
  bulkDelete: async (ids: number[]): Promise<BulkDeleteResult> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.LIVE_CLASSES.BULK_DELETE,
      { data: { ids } }
    );
    return response.data;
  },
};
