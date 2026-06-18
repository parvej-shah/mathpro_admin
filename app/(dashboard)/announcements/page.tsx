"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { AnnouncementGrid } from "@/components/announcements/AnnouncementGrid";
import { CourseFilterPopover } from "@/components/announcements/CourseFilterPopover";

import {
  useAnnouncements,
  useCourseAnnouncements,
  useCourses,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";

import type { Announcement } from "@/services/announcement.service";

type StatusFilter = "all" | "sent" | "draft";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");

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

  const { data: allAnnouncementsData, isLoading: allLoading } = useAnnouncements({
    limit,
    offset: page * limit,
  });
  const { data: courseAnnouncementsData, isLoading: courseLoading } =
    useCourseAnnouncements(courseId, { limit, offset: page * limit });

  const isLoading = courseId ? courseLoading : allLoading;
  const announcementsData = courseId ? courseAnnouncementsData : allAnnouncementsData;

  const announcements: Announcement[] = useMemo(() => {
    if (!announcementsData?.data) return [];
    const responseData = announcementsData.data as
      | Announcement[]
      | { data?: Announcement[] };
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === "object" && "data" in responseData) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [announcementsData]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.subject.toLowerCase().includes(q)) return false;
      }
      const isSent = !!a.notification_is_sent;
      if (status === "sent" && !isSent) return false;
      if (status === "draft" && isSent) return false;
      return true;
    });
  }, [announcements, searchQuery, status]);

  const deleteAnnouncement = useDeleteAnnouncement();

  const handleCreate = () => {
    router.push("/announcements/new");
  };
  const handleEdit = (a: Announcement) => {
    router.push(`/announcements/${a.id}/edit`);
  };
  const handleDelete = (a: Announcement) => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    ) {
      deleteAnnouncement.mutate(a.id);
    }
  };

  const hasFilters = !!searchQuery || !!courseId || status !== "all";

  return (
    <PageContainer className="py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-background via-background to-muted/40 p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Reach your students instantly
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Announcements
              </h1>
              <p className="text-muted-foreground max-w-lg">
                Compose, schedule and send course updates. Keep your community
                in the loop with clean, focused messages.
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleCreate}
              className="rounded-full shadow-sm shadow-primary/20 h-11 px-5"
            >
              <Plus className="h-4 w-4 mr-2" />
              New announcement
            </Button>
          </div>
        </section>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements…"
                className="pl-9 h-10 rounded-full border-muted-foreground/20 bg-muted/30 focus-visible:bg-background"
              />
            </div>
            <CourseFilterPopover
              courses={courses}
              value={courseId}
              onChange={(id: number | null) => {
                setCourseId(id);
                setPage(0);
              }}
            />
          </div>

          {/* Segmented status filter */}
          <div className="inline-flex rounded-full border bg-muted/30 p-1 text-sm">
            {(["all", "sent", "draft"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(0);
                }}
                className={`relative px-4 h-8 rounded-full transition-colors ${
                  status === s
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status === s && (
                  <span className="absolute inset-0 rounded-full bg-background shadow-sm" />
                )}
                <span className="relative z-10 capitalize">{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 -mt-2">
            {searchQuery && (
              <FilterChip
                label={`"${searchQuery}"`}
                onRemove={() => setSearchQuery("")}
              />
            )}
            {courseId && (
              <FilterChip
                label={courses.find((c) => c.id === courseId)?.title || "Course"}
                onRemove={() => setCourseId(null)}
              />
            )}
            {status !== "all" && (
              <FilterChip
                label={status[0].toUpperCase() + status.slice(1)}
                onRemove={() => setStatus("all")}
              />
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setCourseId(null);
                setStatus("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        <AnnouncementGrid
          announcements={filteredAnnouncements}
          courses={courses}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Empty state for filtered result */}
        {!isLoading && announcements.length > 0 && filteredAnnouncements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No matches for the current filters</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or clearing filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredAnnouncements.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing{" "}
              <span className="text-foreground font-medium">
                {page * limit + 1}–{Math.min((page + 1) * limit, filteredAnnouncements.length)}
              </span>{" "}
              of <span className="text-foreground font-medium">{filteredAnnouncements.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-full"
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= filteredAnnouncements.length}
                className="rounded-full"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* ---------- Local atoms ---------- */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-full px-3 py-1 gap-1.5 font-normal bg-muted/60 hover:bg-muted"
    >
      {label}
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground leading-none"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </Badge>
  );
}
