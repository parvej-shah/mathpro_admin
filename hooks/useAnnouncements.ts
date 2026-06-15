import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementService,
  type CreateAnnouncementData,
  type UpdateAnnouncementData,
  type AnnouncementListParams,
} from "@/services/announcement.service";
import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["announcements"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: (params?: AnnouncementListParams) =>
    [...QUERY_KEYS.lists(), params] as const,
  courseList: (courseId: number, params?: AnnouncementListParams) =>
    [...QUERY_KEYS.lists(), "course", courseId, params] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

export function useAnnouncements(params?: AnnouncementListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.list(params),
    queryFn: () => announcementService.getAllAnnouncements(params),
  });
}

export function useCourseAnnouncements(
  courseId: number | null,
  params?: AnnouncementListParams
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseList(courseId!, params),
    queryFn: () =>
      announcementService.getCourseAnnouncements(courseId!, params),
    enabled: !!courseId,
  });
}

export function useAnnouncement(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => announcementService.getAnnouncementById(id!),
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateAnnouncementData;
    }) => announcementService.createAnnouncement(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Announcement created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create announcement");
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateAnnouncementData;
    }) => announcementService.updateAnnouncement(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Announcement updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Announcement deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });
}

export function useSendAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => announcementService.sendAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Announcement sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send announcement");
    },
  });
}

export interface Course {
  id: number;
  title: string;
  [key: string]: unknown;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses", "list"],
    queryFn: async (): Promise<ApiResponse<Course[]>> => {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.LIST);
      return response.data;
    },
  });
}
