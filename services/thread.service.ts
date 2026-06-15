import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface Thread {
  id: number;
  user_name: string;
  user_type: number;
  user_profile?: Record<string, unknown>;
  content: string;
  timestamp: number;
  module_id?: number;
  module_title?: string;
  chapter_id?: number;
  chapter_title?: string;
  course_id?: number;
  course_url?: string;
  [key: string]: unknown;
}

export interface SubDiscussion {
  id: number;
  user_name: string;
  user_type: number;
  user_profile?: Record<string, unknown>;
  content: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface CreateSubDiscussionData {
  content: string;
}

export const threadService = {
  /**
   * Get all threads/discussions
   */
  getAllThreads: async (
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<Thread[]>> => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", String(limit));
    if (offset) queryParams.append("offset", String(offset));
    const query = queryParams.toString();
    const response = await apiClient.get(
      `${API_ENDPOINTS.THREADS.LIST}${query ? `?${query}` : ""}`
    );
    return response.data;
  },

  /**
   * Delete thread/discussion
   */
  deleteThread: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.THREADS.DELETE(id));
    return response.data;
  },

  /**
   * Get sub-discussions for a thread
   */
  getSubDiscussions: async (
    threadId: number
  ): Promise<ApiResponse<SubDiscussion[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.THREADS.SUB_DISCUSSIONS(threadId)
    );
    return response.data;
  },

  /**
   * Create sub-discussion
   */
  createSubDiscussion: async (
    threadId: number,
    data: CreateSubDiscussionData
  ): Promise<ApiResponse<SubDiscussion>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.THREADS.CREATE_SUB_DISCUSSION(threadId),
      data
    );
    return response.data;
  },

  /**
   * Delete sub-discussion
   */
  deleteSubDiscussion: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.THREADS.DELETE_SUB_DISCUSSION(id)
    );
    return response.data;
  },
};
