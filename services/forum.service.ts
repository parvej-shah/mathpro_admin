import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface SupportIssue {
  id: number;
  name: string;
  status: string;
  timestamp: number;
  data: {
    subject: string;
    description: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SupportResponse {
  id?: number;
  name: string;
  timestamp: number;
  data: {
    response: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CreateResponseData {
  data: {
    response: string;
  };
}

export const forumService = {
  /**
   * Get all pending issues
   */
  getAllPendingIssues: async (): Promise<ApiResponse<SupportIssue[]>> => {
    const response = await apiClient.get(
      "/user/support/issue/getAllPendingIssues"
    );
    return response.data;
  },

  /**
   * Get responses for an issue
   */
  getIssueResponses: async (
    issueId: number
  ): Promise<ApiResponse<SupportResponse[]>> => {
    const response = await apiClient.get(
      `/user/support/issue/getResponses/${issueId}`
    );
    return response.data;
  },

  /**
   * Create response for an issue
   */
  createResponse: async (
    issueId: number,
    data: CreateResponseData
  ): Promise<ApiResponse<SupportResponse>> => {
    const response = await apiClient.post(
      `/user/support/response/create/${issueId}`,
      data
    );
    return response.data;
  },

  /**
   * Resolve/close an issue
   */
  resolveIssue: async (issueId: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(
      `/user/support/issue/resolve/${issueId}`,
      {}
    );
    return response.data;
  },
};
