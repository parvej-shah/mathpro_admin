import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Chapter, ApiResponse } from "@/types";

/**
 * Chapter Service
 * Handles all chapter-related API calls
 */

export interface CreateChapterData {
  title: string;
  serial_string?: string;
  chips_list?: Record<string, unknown>;
  is_free?: boolean;
  is_live?: boolean;
}

export interface UpdateChapterData extends Partial<CreateChapterData> {
  serial?: number;
  threshold?: number;
}

/**
 * Create new chapter
 */
export async function createChapter(
  courseId: number,
  data: CreateChapterData
): Promise<Chapter> {
  const response = await apiClient.post<ApiResponse<Chapter>>(
    API_ENDPOINTS.CHAPTERS.CREATE(courseId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to create chapter");
  }
  return response.data.data;
}

/**
 * Get chapter by ID
 */
export async function getChapter(chapterId: number): Promise<Chapter> {
  const response = await apiClient.get<ApiResponse<Chapter | Chapter[]>>(
    API_ENDPOINTS.CHAPTERS.GET(chapterId)
  );
  if (!response.data.data) {
    throw new Error("Chapter not found");
  }
  // Handle both array and single object responses
  const chapterData = Array.isArray(response.data.data)
    ? response.data.data[0]
    : response.data.data;
  if (!chapterData) {
    throw new Error("Chapter not found");
  }
  return chapterData;
}

/**
 * Update chapter
 */
export async function updateChapter(
  chapterId: number,
  data: UpdateChapterData
): Promise<Chapter> {
  const response = await apiClient.put<ApiResponse<Chapter>>(
    API_ENDPOINTS.CHAPTERS.UPDATE(chapterId),
    data
  );
  if (!response.data.data) {
    throw new Error("Failed to update chapter");
  }
  return response.data.data;
}

/**
 * Delete chapter
 */
export async function deleteChapter(chapterId: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.CHAPTERS.DELETE(chapterId));
}
