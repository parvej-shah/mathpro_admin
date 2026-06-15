"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";

import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import {
  useAnnouncement,
  useCourses,
  useUpdateAnnouncement,
  useSendAnnouncement,
} from "@/hooks/useAnnouncements";

import type { CreateAnnouncementData } from "@/services/announcement.service";

interface PageProps {
  params: Promise<{ announcementId: string }>;
}

export default function EditAnnouncementPage({ params }: PageProps) {
  const router = useRouter();
  const { announcementId } = use(params);
  const id = Number(announcementId);

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

  const {
    data: announcementData,
    isLoading,
    isError,
    error,
  } = useAnnouncement(Number.isFinite(id) ? id : null);

  const announcement = useMemo(() => {
    if (!announcementData?.data) return null;
    const d = announcementData.data as
      | { id: number; subject: string; description: string; [k: string]: unknown }
      | { data?: { id: number; subject: string; description: string; [k: string]: unknown } };
    if ("id" in d) return d;
    if ("data" in d && d.data && "id" in d.data) return d.data;
    return null;
  }, [announcementData]);

  const updateAnnouncement = useUpdateAnnouncement();
  const sendAnnouncement = useSendAnnouncement();

  const handleSubmit = async (data: {
    courseId: number;
    announcementData: CreateAnnouncementData;
  }) => {
    if (!announcement) return;
    await updateAnnouncement.mutateAsync({
      id: announcement.id,
      data: data.announcementData,
    });
    router.push("/announcements");
  };

  const handleSend = async (announcementIdToSend: number) => {
    await sendAnnouncement.mutateAsync(announcementIdToSend);
    router.push("/announcements");
  };

  if (isLoading) {
    return <EditSkeleton />;
  }

  if (isError || !announcement) {
    const errMessage =
      (error as { message?: string } | null)?.message ||
      (isError
        ? "We couldn't load this announcement from the server."
        : "The announcement you're trying to edit doesn't exist or has been removed.");
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-lg font-semibold">
          {isError ? "Couldn't load announcement" : "Announcement not found"}
        </p>
        <p className="text-sm text-muted-foreground max-w-md">{errMessage}</p>
        {isError ? (
          <p className="text-xs text-muted-foreground/70 font-mono">
            GET /admin/announcement/get/{Number.isFinite(id) ? id : "?"}
          </p>
        ) : null}
        <Button
          onClick={() => router.push("/announcements")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to announcements
        </Button>
      </div>
    );
  }

  return (
    <AnnouncementForm
      courses={courses}
      announcement={announcement}
      onSubmit={handleSubmit}
      onSend={handleSend}
      isSubmitting={updateAnnouncement.isPending}
      isSending={sendAnnouncement.isPending}
      redirectTo="/announcements"
    />
  );
}

function EditSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="rounded-2xl border bg-card p-5 sm:p-8 space-y-7">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
