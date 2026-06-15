"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getCoursesList } from "@/services/course.service";
import type { Course } from "@/types";
import {
  useAttachBookToCourse,
  useBooks,
  useCourseBooks,
  useDetachBookFromCourse,
} from "@/hooks/useBooks";

export function CourseBookManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    getCoursesList()
      .then((list) => {
        if (mounted) setCourses(list);
      })
      .finally(() => {
        if (mounted) setCoursesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const courseId = selectedCourseId ? Number(selectedCourseId) : null;

  const { data: allBooks, isLoading: booksLoading } = useBooks();
  const { data: attachedBooks, isLoading: attachedLoading } =
    useCourseBooks(courseId);
  const attachMutation = useAttachBookToCourse();
  const detachMutation = useDetachBookFromCourse();

  const courseOptions: SearchableSelectOption[] = useMemo(
    () =>
      courses.map((c) => ({
        value: String(c.id),
        label: c.title ?? `Course #${c.id}`,
      })),
    [courses]
  );

  const attachedIds = useMemo(
    () => new Set((attachedBooks ?? []).map((b) => b.id)),
    [attachedBooks]
  );

  const availableBookOptions: SearchableSelectOption[] = useMemo(
    () =>
      (allBooks ?? [])
        .filter((b) => !attachedIds.has(b.id))
        .map((b) => ({
          value: String(b.id),
          label: `${b.title} — ৳${Number(b.price ?? 0).toLocaleString("en-US")}`,
        })),
    [allBooks, attachedIds]
  );

  const handleAttach = () => {
    if (!courseId || !selectedBookId) return;
    attachMutation.mutate(
      { courseId, bookId: Number(selectedBookId) },
      {
        onSuccess: () => setSelectedBookId(""),
      }
    );
  };

  const handleDetach = (bookId: number) => {
    if (!courseId) return;
    detachMutation.mutate({ courseId, bookId });
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Course
            </Label>
            <SearchableSelect
              options={courseOptions}
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              placeholder={
                coursesLoading ? "Loading courses..." : "Select a course..."
              }
              searchPlaceholder="Search courses..."
              emptyText="No courses found."
              disabled={coursesLoading}
              className="h-10 rounded-xl border-border/70 bg-background/60"
            />
          </div>

          {courseId ? (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Attach a book from the catalogue
              </Label>
              <div className="flex gap-2">
                <SearchableSelect
                  options={availableBookOptions}
                  value={selectedBookId}
                  onChange={setSelectedBookId}
                  placeholder={
                    booksLoading ? "Loading books..." : "Select a book..."
                  }
                  searchPlaceholder="Search books..."
                  emptyText="No books available to attach."
                  disabled={booksLoading}
                  className="h-10 flex-1 rounded-xl border-border/70 bg-background/60"
                />
                <Button
                  type="button"
                  onClick={handleAttach}
                  disabled={!selectedBookId || attachMutation.isPending}
                  className="h-10 rounded-xl px-5 font-semibold shadow-sm shadow-primary/20"
                >
                  {attachMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Attach"
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!courseId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              Select a course
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a course above to view and manage its attached books.
            </p>
          </div>
        </div>
      ) : attachedLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (attachedBooks ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              No books attached
            </p>
            <p className="text-sm text-muted-foreground">
              Attach a book from the catalogue to offer it with this course.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {(attachedBooks ?? []).map((book) => (
            <div
              key={book.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/30"
              )}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/40">
                {book.image_url ? (
                  <Image
                    src={book.image_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  ৳{Number(book.price ?? 0).toLocaleString("en-US")}
                  {book.is_active === false ? " · Inactive" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDetach(book.id)}
                disabled={detachMutation.isPending}
                aria-label="Detach book"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
