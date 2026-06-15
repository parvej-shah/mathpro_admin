import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface Level {
  id: number;
  title: string;
  threshold: number;
  logo?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CreateLevelData {
  title: string;
  threshold: number;
  logo?: string;
  data?: Record<string, unknown>;
}

export interface UpdateLevelData extends Partial<CreateLevelData> {
  [key: string]: unknown;
}

export const rewardService = {
  /**
   * Get all levels for a course
   */
  getLevels: async (courseId: number): Promise<ApiResponse<Level[]>> => {
    const response = await apiClient.get(`/admin/level/list/${courseId}`);
    return response.data;
  },

  /**
   * Create level
   */
  createLevel: async (
    courseId: number,
    data: CreateLevelData
  ): Promise<ApiResponse<Level>> => {
    const response = await apiClient.post(`/admin/level/create/${courseId}`, data);
    return response.data;
  },

  /**
   * Update level
   */
  updateLevel: async (
    levelId: number,
    data: UpdateLevelData
  ): Promise<ApiResponse<Level>> => {
    const response = await apiClient.put(`/admin/level/update/${levelId}`, data);
    return response.data;
  },

  /**
   * Delete level
   */
  deleteLevel: async (levelId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/level/delete/${levelId}`);
    return response.data;
  },
};
