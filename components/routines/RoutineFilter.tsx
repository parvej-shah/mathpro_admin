"use client";

import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCourses } from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoutineFilterProps {
  selectedCourse: number | null;
  onFilterChange: (courseId: number | null) => void;
}

/**
 * Sleek modern filter bar for the routine management page.
 * Renders a pill-style course selector with a clear "all" affordance.
 */
export function RoutineFilter({
  selectedCourse,
  onFilterChange,
}: RoutineFilterProps) {
  const { data: coursesData, isLoading } = useCourses();

  const courses: Array<{ id: number; title: string }> = useMemo(() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as
      | Array<{ id: number; title: string }>
      | { data?: Array<{ id: number; title: string }> };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [coursesData]);

  const selectedCourseTitle = courses.find((c) => c.id === selectedCourse)
    ?.title;

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-2 self-start rounded-full border border-border/70 bg-card/60 py-1.5 pl-1.5 pr-1.5"
      )}
    >
      {/* Course select */}
      <Select
        value={selectedCourse ? String(selectedCourse) : "all"}
        onValueChange={(value) =>
          onFilterChange(value === "all" ? null : parseInt(value, 10))
        }
        disabled={isLoading}
      >
        <SelectTrigger className="h-9 min-w-55 max-w-[320px] rounded-full border-transparent bg-transparent px-4 text-sm font-medium text-foreground shadow-none hover:bg-muted/40 focus:ring-2 focus:ring-primary/30">
          <SelectValue placeholder="All courses" />
        </SelectTrigger>
        <SelectContent className="min-w-(--radix-select-trigger-width) rounded-xl border-border/70 shadow-lg">
          <SelectItem value="all" className="rounded-lg">
            All courses
          </SelectItem>
          {courses.map((course) => (
            <SelectItem
              key={course.id}
              value={String(course.id)}
              className="rounded-lg"
            >
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active filter chip + clear */}
      {selectedCourse && (
        <button
          type="button"
          onClick={() => onFilterChange(null)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 py-0.5 pl-2.5 pr-1.5",
            "text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
          )}
        >
          <span className="line-clamp-1 max-w-[16ch]">
            {selectedCourseTitle ?? `Course #${selectedCourse}`}
          </span>
          <FontAwesomeIcon icon={faXmark} className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
