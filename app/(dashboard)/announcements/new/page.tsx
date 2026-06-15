"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";

import {
  useCourses,
  useCreateAnnouncement,
  useSendAnnouncement,
} from "@/hooks/useAnnouncements";

import type { CreateAnnouncementData } from "@/services/announcement.service";

export default function NewAnnouncementPage() {
  const router = useRouter();

  const { data: coursesData } = useCourses();
  const courses = useMemo<Array<{ id: number; title: string }>>(() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as
      | Array<{ id: number; title: string }>
      | { data?: Array<{ id: number; title: string }> };
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === "object" && "data" in responseData) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [coursesData]);

  const createAnnouncement = useCreateAnnouncement();
  const sendAnnouncement = useSendAnnouncement();

  const handleSubmit = async (data: {
    courseId: number;
    announcementData: CreateAnnouncementData;
  }) => {
    const created = await createAnnouncement.mutateAsync({
      courseId: data.courseId,
      data: data.announcementData,
    });

    // Try to send immediately if any delivery channel is requested
    const createdId =
      (created as { data?: { id?: number } })?.data?.id ??
      (created as { id?: number })?.id;
    const methods = data.announcementData.sent_methods ?? [];
    if (createdId && methods.length > 0) {
      try {
        await sendAnnouncement.mutateAsync(createdId);
      } catch (err) {
        // Surface a soft error but still navigate back to the list
        console.error("Failed to send announcement", err);
      }
    }

    router.push("/announcements");
  };

  return (
    <AnnouncementForm
      courses={courses}
      onSubmit={handleSubmit}
      isSubmitting={createAnnouncement.isPending}
      isSending={sendAnnouncement.isPending}
      redirectTo="/announcements"
    />
  );
}
