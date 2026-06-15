"use client";

import { format } from "date-fns";
import {
  Send,
  Mail,
  Bell,
  Trash2,
  Megaphone,
  Users,
  GraduationCap,
  Globe2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { Announcement } from "@/services/announcement.service";

interface Course {
  id: number;
  title: string;
}

interface AnnouncementGridProps {
  announcements: Announcement[];
  courses: Course[];
  loading: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

function getRecipient(
  type?: number
): { label: string; icon: React.ComponentType<{ className?: string }> } {
  switch (type) {
    case 3:
      return { label: "Students", icon: GraduationCap };
    case 2:
      return { label: "Teachers", icon: Users };
    case -1:
      return { label: "Everyone", icon: Globe2 };
    default:
      return { label: "Recipients", icon: Users };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function timeAgo(timestamp?: number): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp * 1000);
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return format(date, "MMM d, yyyy");
}

export function AnnouncementGrid({
  announcements,
  loading,
  onEdit,
  onDelete,
  courses,
}: AnnouncementGridProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Megaphone className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No announcements yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          When you create announcements they will appear here, ready to send to
          your students or teachers.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {announcements.map((a) => (
        <AnnouncementRow
          key={a.id}
          announcement={a}
          course={courses.find((c) => c.id === a.course_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function AnnouncementRow({
  announcement,
  course,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  course?: Course;
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
}) {
  const recipientType =
    announcement.user_sender_type ?? announcement.user_type;
  const recipient = getRecipient(recipientType);
  const RecipientIcon = recipient.icon;

  const isSent = announcement.email_is_sent || announcement.notification_is_sent;
  const emailSent = !!announcement.email_is_sent;
  const notifSent = !!announcement.notification_is_sent;
  const preview = stripHtml(announcement.description || "").slice(0, 180);

  return (
    <li
      className={cn(
        "group relative rounded-2xl border bg-card px-5 py-4",
        "hover:border-foreground/15 hover:shadow-sm transition-all"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Status dot */}
        <div className="mt-1.5 flex-shrink-0">
          <span
            className={cn(
              "block h-2.5 w-2.5 rounded-full",
              isSent ? "bg-emerald-500" : "bg-amber-400"
            )}
            aria-hidden
          />
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-base truncate">
                {announcement.subject || "Untitled announcement"}
              </h3>
              {preview && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {preview}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(announcement)}
                className="h-8 rounded-full text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Edit & send
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(announcement)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete"
                aria-label="Delete announcement"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
              <RecipientIcon className="h-3.5 w-3.5" />
              {recipient.label}
            </span>

            {course && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 max-w-[200px]">
                <span className="truncate">{course.title}</span>
              </span>
            )}

            {emailSent && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2.5 py-1"
                title="Email sent"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </span>
            )}
            {notifSent && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-1"
                title="Notification sent"
              >
                <Bell className="h-3.5 w-3.5" />
                Push
              </span>
            )}

            <span className="ml-auto text-xs text-muted-foreground/80">
              {timeAgo(announcement.created_at)}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}
