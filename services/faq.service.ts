import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export const FAQ_CATEGORIES = [
  "courses",
  "enrollment",
  "payment",
  "support",
  "certificate",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface PublicFaq {
  id: number;
  question: string;
  answer: string;
  category: FaqCategory | null;
  sort_order: number;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface CreateFaqData {
  question: string;
  answer: string;
  category: FaqCategory | null;
  sort_order: number;
  is_active: boolean;
}

export interface UpdateFaqData extends Partial<CreateFaqData> {
  id: number;
}

export const faqService = {
  getFaqs: async (): Promise<ApiResponse<PublicFaq[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.FAQ.LIST);
    return response.data;
  },

  getFaqById: async (id: number): Promise<ApiResponse<PublicFaq[] | PublicFaq>> => {
    const response = await apiClient.get(API_ENDPOINTS.FAQ.GET(id));
    return response.data;
  },

  createFaq: async (data: CreateFaqData): Promise<ApiResponse<PublicFaq>> => {
    const response = await apiClient.post(API_ENDPOINTS.FAQ.CREATE, data);
    return response.data;
  },

  updateFaq: async (id: number, data: Partial<CreateFaqData>): Promise<ApiResponse<PublicFaq>> => {
    const response = await apiClient.put(API_ENDPOINTS.FAQ.UPDATE(id), data);
    return response.data;
  },

  deleteFaq: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.FAQ.DELETE(id));
    return response.data;
  },
};
