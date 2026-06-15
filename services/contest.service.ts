import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface ContestRule {
  [key: string]: unknown;
}

export interface ContestFAQ {
  question: string;
  answer: string;
  [key: string]: unknown;
}

export interface Contest {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  contest_link?: string;
  contest_video_link?: string;
  start_date?: string; // ISO string
  end_date?: string; // ISO string
  thumbnail_link?: string;
  password?: string;
  number_of_problems?: string;
  contest_duration?: string;
  facebook_group_link?: string;
  rules?: ContestRule[];
  faqs?: ContestFAQ[];
  [key: string]: unknown;
}

export interface CreateContestData {
  title: string;
  description?: string;
  contest_link?: string;
  contest_video_link?: string;
  start_date?: string; // ISO string or timestamp
  end_date?: string; // ISO string or timestamp
  thumbnail_link?: string;
  password?: string;
  course_id?: number | string;
  number_of_problems?: string;
  contest_duration?: string;
  facebook_group_link?: string;
  rules?: ContestRule[];
  faqs?: ContestFAQ[];
  [key: string]: unknown;
}

export interface UpdateContestData extends Partial<CreateContestData> {
  [key: string]: unknown;
}

export interface ContestParticipant {
  user_id: number;
  score?: number;
  [key: string]: unknown;
}

export const contestService = {
  /**
   * Get all contests
   */
  getAllContests: async (courseId?: number): Promise<ApiResponse<Contest[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.CONTESTS.LIST(courseId));
    return response.data;
  },

  /**
   * Get single contest by ID
   */
  getContest: async (contestId: number): Promise<ApiResponse<Contest[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.CONTESTS.GET(contestId));
    return response.data;
  },

  /**
   * Create new contest
   */
  createContest: async (
    courseId: number,
    contestData: CreateContestData
  ): Promise<ApiResponse<Contest>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTESTS.CREATE(courseId),
      { data: contestData }
    );
    return response.data;
  },

  /**
   * Update contest
   */
  updateContest: async (
    contestId: number,
    contestData: UpdateContestData
  ): Promise<ApiResponse<Contest>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.CONTESTS.UPDATE(contestId),
      contestData
    );
    return response.data;
  },

  /**
   * Delete contest
   */
  deleteContest: async (contestId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.CONTESTS.DELETE(contestId)
    );
    return response.data;
  },

  /**
   * Get contest participants
   */
  getContestParticipants: async (
    contestId: number
  ): Promise<ApiResponse<ContestParticipant[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.CONTESTS.PARTICIPANTS(contestId)
    );
    return response.data;
  },

  /**
   * Add participant to contest
   */
  addParticipant: async (
    contestId: number,
    userId: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTESTS.ADD_PARTICIPANT(contestId),
      { userId }
    );
    return response.data;
  },

  /**
   * Remove participant from contest
   */
  removeParticipant: async (
    contestId: number,
    userId: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTESTS.REMOVE_PARTICIPANT(contestId),
      { userId }
    );
    return response.data;
  },

  /**
   * Update participant score
   */
  updateParticipantScore: async (
    contestId: number,
    userId: number,
    score: number
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.CONTESTS.UPDATE_SCORE(contestId),
      { userId, score }
    );
    return response.data;
  },

  /**
   * Search users for contest
   */
  searchUsers: async (searchTerm: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.CONTESTS.SEARCH_USERS}?search=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  },

  /**
   * Get courses for contests
   */
  getCourses: async (): Promise<ApiResponse<unknown[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.CONTESTS.COURSES);
    return response.data;
  },
};
