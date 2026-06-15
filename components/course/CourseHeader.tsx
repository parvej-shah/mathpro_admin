"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Pencil,
  ListOrdered,
  ChevronLeft,
  Users,
  Layers,
  BookOpen,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface CourseHeaderProps {
  course: Course;
  onExport?: () => void;
  onImport?: () => void;
  onSerialize?: () => void;
  saveStatus?: SaveStatus;
}

function getThumbnail(course: Course): string | undefined {
  const chips = course.chips as
    | {
        course_thumbnail_link?: string;
        thumbnails?: {
          course_thumbnail_16_9?: string;
          course_thumbnail_link_16_9?: string;
        };
      }
    | undefined;
  return (
    chips?.thumbnails?.course_thumbnail_16_9 ||
    chips?.course_thumbnail_link ||
    chips?.thumbnails?.course_thumbnail_link_16_9
  );
}

function formatPrice(price?: number): string {
  if (!price) return "Free";
  return `৳${price.toLocaleString("en-US")}`;
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map = {
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      text: "Saving…",
      cls: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      text: "All changes saved",
      cls: "text-success",
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      text: "Error saving",
      cls: "text-destructive",
    },
  } as const;
  const cfg = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        cfg.cls
      )}
    >
      {cfg.icon}
      {cfg.text}
    </span>
  );
}

/**
 * Course workspace header — thumbnail, title, status, key stats, and a
 * grouped action toolbar. Designed as the command bar for the course editor.
 */
export function CourseHeader({
  course,
  onExport,
  onImport,
  onSerialize,
  saveStatus = "idle",
}: CourseHeaderProps) {
  const thumbnail = getThumbnail(course);
  const chapters = course.chapters || [];
  const chapterCount = chapters.length;
  const moduleCount = chapters.reduce(
    (sum, ch) => sum + (ch.modules?.length || 0),
    0
  );

  const stats = [
    { icon: Layers, label: "Chapters", value: chapterCount },
    { icon: BookOpen, label: "Modules", value: moduleCount },
    {
      icon: Users,
      label: "Enrolled",
      value: course.enrolled ?? 0,
    },
  ];

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          All courses
        </Link>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Main */}
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* Thumbnail */}
          <div className="relative hidden h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground/70" />
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  course.is_live
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    course.is_live ? "bg-success" : "bg-muted-foreground/50"
                  )}
                />
                {course.is_live ? "Live" : "Draft"}
              </span>
              {course.language && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {course.language}
                </span>
              )}
              <span className="text-xs font-semibold text-primary">
                {formatPrice(course.price)}
              </span>
            </div>
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
          )}
          {onSerialize && (
            <Button variant="outline" size="sm" onClick={onSerialize}>
              <ListOrdered className="mr-1.5 h-4 w-4" />
              Serializer
            </Button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x border-t">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 sm:px-5"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-base font-bold leading-tight">
                {value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
