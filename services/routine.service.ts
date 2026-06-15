import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface Routine {
  id: number;
  course_id: number;
  course_title?: string;
  week_number: number;
  week_start_date: string;
  week_end_date: string;
  routine_image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateRoutineData {
  week_number: number;
  week_start_date: string;
  week_end_date: string;
  routine_image_url?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {
  [key: string]: unknown;
}

export const routineService = {
  /**
   * Get all routines
   */
  getAllRoutines: async (): Promise<ApiResponse<Routine[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.ROUTINES.LIST);
    return response.data;
  },

  /**
   * Get routines by course
   */
  getRoutinesByCourse: async (
    courseId: number
  ): Promise<ApiResponse<Routine[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ROUTINES.GET_BY_COURSE(courseId)
    );
    return response.data;
  },

    /**
     * Get a single routine by id
     */
  getRoutineById: async (id: number): Promise<ApiResponse<Routine>> => {
    const response = await apiClient.get(API_ENDPOINTS.ROUTINES.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create routine
   */
  createRoutine: async (
    courseId: number,
    routineData: CreateRoutineData
  ): Promise<ApiResponse<Routine>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ROUTINES.CREATE(courseId),
      routineData
    );
    return response.data;
  },

  /**
   * Update routine
   */
  updateRoutine: async (
    id: number,
    routineData: UpdateRoutineData
  ): Promise<ApiResponse<Routine>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.ROUTINES.UPDATE(id),
      routineData
    );
    return response.data;
  },

  /**
   * Delete routine
   */
  deleteRoutine: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.ROUTINES.DELETE(id));
    return response.data;
  },

  /**
   * Toggle routine active status
   */
  toggleActive: async (
    id: number,
    isActive: boolean
  ): Promise<ApiResponse<Routine>> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ROUTINES.TOGGLE_ACTIVE(id),
      { is_active: isActive }
    );
    return response.data;
  },
};
