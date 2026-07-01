import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export type FeaturedItemType = "course" | "bundle";

export interface FeaturedItem {
  item_type: FeaturedItemType;
  item_id: number;
  sort_order: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
  title?: string;
  is_live?: boolean;
}

export interface CreateFeaturedItemData {
  item_type: FeaturedItemType;
  item_id: number;
  sort_order: number;
  is_active: boolean;
}

export interface UpdateFeaturedItemData {
  sort_order?: number;
  is_active?: boolean;
}

export interface ReorderFeaturedItemEntry {
  item_type: FeaturedItemType;
  item_id: number;
  sort_order: number;
}

export const featuredItemService = {
  getFeaturedItems: async (): Promise<ApiResponse<FeaturedItem[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.FEATURED_ITEMS.LIST);
    return response.data;
  },

  createFeaturedItem: async (
    data: CreateFeaturedItemData,
  ): Promise<ApiResponse<FeaturedItem>> => {
    const response = await apiClient.post(API_ENDPOINTS.FEATURED_ITEMS.CREATE, data);
    return response.data;
  },

  updateFeaturedItem: async (
    itemType: FeaturedItemType,
    itemId: number,
    data: UpdateFeaturedItemData,
  ): Promise<ApiResponse<FeaturedItem>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.FEATURED_ITEMS.UPDATE(itemType, itemId),
      data,
    );
    return response.data;
  },

  reorderFeaturedItems: async (
    items: ReorderFeaturedItemEntry[],
  ): Promise<ApiResponse<ReorderFeaturedItemEntry[]>> => {
    const response = await apiClient.post(API_ENDPOINTS.FEATURED_ITEMS.REORDER, { items });
    return response.data;
  },

  deleteFeaturedItem: async (
    itemType: FeaturedItemType,
    itemId: number,
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.FEATURED_ITEMS.DELETE(itemType, itemId),
    );
    return response.data;
  },
};
