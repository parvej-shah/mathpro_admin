"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faEdit,
  faTrash,
  faUserShield,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import type { Teacher } from "@/services/teacher.service";
import { cn } from "@/lib/utils";

interface TeacherListProps {
  teachers: Teacher[];
  loading: boolean;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

function getInitials(name?: string | null) {
  if (!name) return "T";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase() || "T";
}

function getResolvedImage(teacher: Teacher): string | null {
  return (
    teacher.image ||
    (teacher.profile?.imageUploadedLink as string | undefined) ||
    (teacher.imagePreviewLink as string | undefined) ||
    null
  );
}

function getAssignedCoursesCount(teacher: Teacher): number {
  return (
    teacher.courses_teaching?.length ||
    (teacher.profile?.selectedCourse as number[] | undefined)?.length ||
    0
  );
}

function TeacherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 border-t border-border/60 p-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-center justify-between border-t border-border/60 p-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

function TeacherCard({
  teacher,
  onEdit,
  onDelete,
}: {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}) {
  const image = getResolvedImage(teacher);
  const coursesCount = getAssignedCoursesCount(teacher);
  const isActive = teacher.isActive !== false;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border/70 bg-card overflow-hidden",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        !isActive && "opacity-80"
      )}
    >
      {/* Top — avatar + identity */}
      <div className="flex items-center gap-4 p-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={teacher.name}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-border/70"
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-base font-bold text-foreground ring-1 ring-border/70">
            {getInitials(teacher.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
              {teacher.name}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {teacher.university || teacher.login || "—"}
          </p>
          <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground/80">
            {teacher.role || teacher.category || "Instructor"}
          </p>
        </div>
      </div>

      {/* Middle — bio + meta */}
      <div className="flex-1 space-y-3 border-t border-border/60 px-4 py-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {teacher.bio || "No bio added yet."}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              Inactive
            </span>
          )}

          {teacher.isPrivileged && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-info/20 bg-info/10 px-2.5 py-0.5 text-[11px] font-semibold text-info">
              <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
              Admin
            </span>
          )}

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              coursesCount > 0
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <FontAwesomeIcon icon={faUserGraduate} className="h-3 w-3" />
            {coursesCount} course{coursesCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Footer — actions */}
      <div className="mt-auto flex items-center justify-between border-t border-border/60 px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          {teacher.login || "—"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(teacher)}
            aria-label="Edit teacher"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(teacher)}
            aria-label="Delete teacher"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TeacherList({
  teachers,
  loading,
  onEdit,
  onDelete,
}: TeacherListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <TeacherCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FontAwesomeIcon icon={faChalkboardUser} className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold">No teachers yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Get started by adding a new teacher to your team.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {teachers.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
