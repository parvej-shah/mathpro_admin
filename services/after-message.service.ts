import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface AfterMessage {
  id: number;
  type: string;
  course_ids?: string | null; // Comma-separated string
  bundle_ids?: string | null; // Comma-separated string
  messages: string[]; // Array of message strings
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface CreateAfterMessageData {
  type: "afterPurchaseMessage";
  course_ids?: string | null; // Comma-separated string like "1,2,3"
  bundle_ids?: string | null; // Comma-separated string like "5,6"
  messages: string[]; // Array of message strings
  [key: string]: unknown;
}

export interface UpdateAfterMessageData
  extends Partial<CreateAfterMessageData> {
  [key: string]: unknown;
}

export const afterMessageService = {
  /**
   * Get all after-purchase messages
   */
  getAllMessages: async (): Promise<ApiResponse<AfterMessage[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.AFTER_MESSAGES.LIST);
    return response.data;
  },

  /**
   * Create new message
   */
  createMessage: async (
    messageData: CreateAfterMessageData
  ): Promise<ApiResponse<AfterMessage>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AFTER_MESSAGES.CREATE,
      messageData
    );
    return response.data;
  },

  /**
   * Update message
   */
  updateMessage: async (
    id: number,
    messageData: UpdateAfterMessageData
  ): Promise<ApiResponse<AfterMessage>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.AFTER_MESSAGES.UPDATE(id),
      messageData
    );
    return response.data;
  },

  /**
   * Delete message
   */
  deleteMessage: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.AFTER_MESSAGES.DELETE(id)
    );
    return response.data;
  },
};
