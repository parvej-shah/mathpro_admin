import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface Announcement {
  id: number;
  course_id?: number;
  subject: string;
  description: string;
  user_sender_type?: number; // 3 = Students, 2 = Teachers, -1 = Everyone
  user_type?: number; // Alias for user_sender_type
  sent_methods?: string[]; // ["notification"]
  email_is_sent?: boolean;
  sms_is_sent?: boolean;
  notification_is_sent?: boolean;
  created_at?: number;
  updated_at?: number;
  [key: string]: unknown;
}

export interface CreateAnnouncementData {
  subject: string;
  description: string;
  user_sender_type: number; // 3 = Students, 2 = Teachers, -1 = Everyone
  sent_methods: string[]; // ["notification"]
  [key: string]: unknown;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {
  [key: string]: unknown;
}

export interface AnnouncementListParams {
  limit?: number;
  offset?: number;
}

export const announcementService = {
  /**
   * Get all announcements with pagination
   */
  getAllAnnouncements: async (
    params?: AnnouncementListParams
  ): Promise<ApiResponse<Announcement[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.LIST, {
      params: { limit: params?.limit || 100, offset: params?.offset || 0 },
    });
    return response.data;
  },

  /**
   * Get course-specific announcements
   */
  getCourseAnnouncements: async (
    courseId: number,
    params?: AnnouncementListParams
  ): Promise<ApiResponse<Announcement[]>> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ANNOUNCEMENTS.LIST_BY_COURSE(courseId),
      {
        params: { limit: params?.limit || 100, offset: params?.offset || 0 },
      }
    );
    return response.data;
  },

  /**
   * Get single announcement by ID.
   *
   * Some backends return `ApiResponse<Announcement[]>` from this endpoint
   * (a filtered list) instead of a single object. To stay robust, we
   * normalize both shapes here and always resolve to a single `Announcement`
   * envelope, so the hook/page never has to deal with the array case.
   */
  getAnnouncementById: async (
    id: number
  ): Promise<ApiResponse<Announcement | null>> => {
    const response = await apiClient.get(API_ENDPOINTS.ANNOUNCEMENTS.GET(id));
    const payload = response.data as
      | ApiResponse<Announcement>
      | ApiResponse<Announcement[]>
      | Announcement
      | Announcement[]
      | null
      | undefined;

    if (!payload) {
      return { success: false, data: null } as ApiResponse<Announcement | null>;
    }

    // Already an ApiResponse<Announcement>
    if (!Array.isArray(payload) && "data" in payload && payload.data) {
      const inner = payload.data as Announcement | Announcement[];
      if (Array.isArray(inner)) {
        const match = inner.find((a) => a?.id === id) ?? inner[0] ?? null;
        return { ...(payload as object), data: match } as ApiResponse<
          Announcement | null
        >;
      }
      return payload as ApiResponse<Announcement>;
    }

    // Bare Announcement
    if (!Array.isArray(payload) && (payload as Announcement).id !== undefined) {
      return {
        success: true,
        data: payload as Announcement,
      } as ApiResponse<Announcement | null>;
    }

    // Bare Announcement[]
    if (Array.isArray(payload)) {
      const match = payload.find((a) => a?.id === id) ?? payload[0] ?? null;
      return { success: true, data: match } as ApiResponse<Announcement | null>;
    }

    return { success: false, data: null } as ApiResponse<Announcement | null>;
  },

  /**
   * Create new announcement
   */
  createAnnouncement: async (
    courseId: number,
    announcementData: CreateAnnouncementData
  ): Promise<ApiResponse<Announcement>> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANNOUNCEMENTS.CREATE(courseId),
      announcementData
    );
    return response.data;
  },

  /**
   * Update announcement
   */
  updateAnnouncement: async (
    id: number,
    announcementData: UpdateAnnouncementData
  ): Promise<ApiResponse<Announcement>> => {
    const response = await apiClient.put(
      API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(id),
      announcementData
    );
    return response.data;
  },

  /**
   * Delete announcement
   */
  deleteAnnouncement: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id)
    );
    return response.data;
  },

  /**
   * Send announcement
   */
  sendAnnouncement: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(API_ENDPOINTS.ANNOUNCEMENTS.SEND(id));
    return response.data;
  },
};
