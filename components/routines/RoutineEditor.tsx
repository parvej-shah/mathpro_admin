"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendar,
  faCalendarWeek,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faCloudUpload,
  faFloppyDisk,
  faInfoCircle,
  faLayerGroup,
  faX,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoutineImageUpload } from "@/hooks/useRoutineImageUpload";
import { cn } from "@/lib/utils";
import type {
  CreateRoutineData,
  Routine,
} from "@/services/routine.service";

export type RoutineEditorMode = "create" | "edit";

interface RoutineEditorProps {
  mode: RoutineEditorMode;
  /** Required in edit mode. */
  routine?: Routine | null;
  /** Available courses for the dropdown. */
  courses: Array<{ id: number; title: string }>;
  /** Called with the prepared payload + selected courseId. */
  onSubmit: (
    courseId: number,
    data: CreateRoutineData,
    routineId?: number
  ) => Promise<void>;
  /** Disable the submit button / show spinner when true. */
  isSubmitting?: boolean;
}

interface FormState {
  course_id: string;
  week_number: string;
  week_start_date: string;
  week_end_date: string;
  routine_image_url: string;
  is_active: boolean;
}

const buildInitialState = (routine?: Routine | null): FormState => ({
  course_id: routine?.course_id ? String(routine.course_id) : "",
  week_number: routine?.week_number ? String(routine.week_number) : "",
  week_start_date: toDateInputValue(routine?.week_start_date),
  week_end_date: toDateInputValue(routine?.week_end_date),
  routine_image_url: routine?.routine_image_url || "",
  is_active: routine?.is_active ?? true,
});

/**
 * Normalise a backend date value to the `yyyy-MM-dd` format our form / date
 * picker use. Accepts:
 *   - "yyyy-MM-dd"            → returned as-is
 *   - ISO with time            ("2025-06-09T00:00:00.000Z")
 *   - Slash / dot formats      ("06/09/2025", "09.06.2025")
 * Returns "" if the value can't be parsed.
 */
const toDateInputValue = (value?: string | null): string => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
};

const safeParseDate = (value?: string | null): Date | undefined => {
  const normalised = toDateInputValue(value);
  if (!normalised) return undefined;
  const d = new Date(`${normalised}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d;
};

const daysBetween = (a: string, b: string): number | null => {
  if (!a || !b) return null;
  const start = safeParseDate(a);
  const end = safeParseDate(b);
  if (!start || !end) return null;
  return Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export function RoutineEditor({
  mode,
  routine = null,
  courses,
  onSubmit,
  isSubmitting = false,
}: RoutineEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(() => buildInitialState(routine));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    routine?.routine_image_url || ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { uploadImage, uploading, progress } = useRoutineImageUpload();

  // Hydrate when the routine finishes loading in edit mode.
  useEffect(() => {
    if (mode === "edit" && routine) {
      const next = buildInitialState(routine);
      setForm(next);
      setImagePreview(routine.routine_image_url || "");
      setImageFile(null);
    }
  }, [mode, routine]);

  // Revoke object URLs on unmount/new selection to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Please select a valid image file" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: "File size must be less than 10MB" }));
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((e) => {
      const { image: _omit, ...rest } = e;
      void _omit;
      return rest;
    });
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    setForm((f) => ({ ...f, routine_image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.course_id) next.course_id = "Course is required";

    if (!form.week_number) {
      next.week_number = "Week number is required";
    } else {
      const n = parseInt(form.week_number, 10);
      if (isNaN(n) || n <= 0) next.week_number = "Week number must be positive";
    }

    if (!form.week_start_date) next.week_start_date = "Start date is required";
    if (!form.week_end_date) next.week_end_date = "End date is required";

    if (form.week_start_date && form.week_end_date) {
      const start = safeParseDate(form.week_start_date);
      const end = safeParseDate(form.week_end_date);
      if (start && end) {
        if (end < start) {
          next.week_end_date = "End date must be after start date";
        } else {
          const diff = daysBetween(form.week_start_date, form.week_end_date);
          if (diff !== 6) {
            next.week_end_date = "Date range must be exactly 7 days (1 week)";
          }
        }
      }
    }

    if (mode === "create" && !imageFile && !form.routine_image_url) {
      next.image = "Routine image is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (uploading || isSubmitting) return;

    try {
      let imageUrl = form.routine_image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload: CreateRoutineData = {
        week_number: parseInt(form.week_number, 10),
        routine_image_url: imageUrl,
        week_start_date: form.week_start_date,
        week_end_date: form.week_end_date,
        is_active: form.is_active,
      };

      await onSubmit(
        parseInt(form.course_id, 10),
        payload,
        mode === "edit" ? routine?.id : undefined
      );
    } catch {
      // surfaced via toast in hooks
    }
  };

  const isEdit = mode === "edit";
  const pageTitle = isEdit ? "Edit routine" : "Create new routine";
  const pageEyebrow = isEdit ? "Routine" : "Routines";
  const submitLabel = isSubmitting
    ? "Saving…"
    : isEdit
      ? "Save changes"
      : "Create routine";

  const selectedCourseTitle =
    courses.find((c) => String(c.id) === form.course_id)?.title ||
    routine?.course_title ||
    "—";

  const dateDiff =
    form.week_start_date && form.week_end_date
      ? daysBetween(form.week_start_date, form.week_end_date)
      : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      {/* ───── Main column ───── */}
      <div className="space-y-6">
        {/* Section: Schedule */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <FontAwesomeIcon icon={faCalendarWeek} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Schedule
              </h2>
              <p className="text-xs text-muted-foreground/80">
                Pick the course and the week this routine covers.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Course */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={form.course_id}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, course_id: value }))
                }
                disabled={isEdit}
              >
                <SelectTrigger
                  id="course"
                  className={cn(
                    "h-11 rounded-xl",
                    errors.course_id &&
                      "border-destructive focus:ring-destructive/30"
                  )}
                >
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-[11px] text-muted-foreground">
                  Course can't be changed after creation.
                </p>
              )}
              {errors.course_id && (
                <p className="text-xs text-destructive">{errors.course_id}</p>
              )}
            </div>

            {/* Week number */}
            <div className="space-y-1.5">
              <Label htmlFor="week">Week number</Label>
              <Input
                id="week"
                type="number"
                min={1}
                value={form.week_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, week_number: e.target.value }))
                }
                placeholder="e.g. 1"
                className={cn(
                  "h-11 rounded-xl",
                  errors.week_number &&
                    "border-destructive focus-visible:ring-destructive/30"
                )}
              />
              {errors.week_number && (
                <p className="text-xs text-destructive">
                  {errors.week_number}
                </p>
              )}
            </div>

            {/* Quick preset chips for "this week / next week" */}
            <div className="space-y-1.5">
              <Label>Quick range</Label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const day = today.getDay() || 7; // Sun=0 → 7
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - (day - 1));
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);
                    setForm((f) => ({
                      ...f,
                      week_start_date: format(monday, "yyyy-MM-dd"),
                      week_end_date: format(sunday, "yyyy-MM-dd"),
                    }));
                  }}
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  This week
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const day = today.getDay() || 7;
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - (day - 1) + 7);
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);
                    setForm((f) => ({
                      ...f,
                      week_start_date: format(monday, "yyyy-MM-dd"),
                      week_end_date: format(sunday, "yyyy-MM-dd"),
                    }));
                  }}
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  Next week
                </button>
              </div>
            </div>

            {/* Start date */}
            <div className="space-y-1.5">
              <Label htmlFor="start">Week start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start"
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start rounded-xl px-3 text-left font-normal",
                      !form.week_start_date && "text-muted-foreground",
                      errors.week_start_date &&
                        "border-destructive focus-visible:ring-destructive/30"
                    )}
                  >
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="mr-2 h-4 w-4 text-muted-foreground"
                    />
                    {form.week_start_date
                      ? format(
                          safeParseDate(form.week_start_date) ?? new Date(),
                          "MMM dd, yyyy"
                        )
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-2xl border border-border/70 p-0 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={safeParseDate(form.week_start_date)}
                    onSelect={(date) => {
                      if (!date) return;
                      setForm((f) => ({
                        ...f,
                        week_start_date: format(date, "yyyy-MM-dd"),
                      }));
                    }}
                    components={{
                      Chevron: (props) => (
                        <FontAwesomeIcon
                          icon={
                            props.orientation === "right"
                              ? faChevronRight
                              : faChevronLeft
                          }
                          className="h-4 w-4"
                        />
                      ),
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.week_start_date && (
                <p className="text-xs text-destructive">
                  {errors.week_start_date}
                </p>
              )}
            </div>

            {/* End date */}
            <div className="space-y-1.5">
              <Label htmlFor="end">Week end</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end"
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start rounded-xl px-3 text-left font-normal",
                      !form.week_end_date && "text-muted-foreground",
                      errors.week_end_date &&
                        "border-destructive focus-visible:ring-destructive/30"
                    )}
                  >
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="mr-2 h-4 w-4 text-muted-foreground"
                    />
                    {form.week_end_date
                      ? format(
                          safeParseDate(form.week_end_date) ?? new Date(),
                          "MMM dd, yyyy"
                        )
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-2xl border border-border/70 p-0 shadow-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={safeParseDate(form.week_end_date)}
                    onSelect={(date) => {
                      if (!date) return;
                      setForm((f) => ({
                        ...f,
                        week_end_date: format(date, "yyyy-MM-dd"),
                      }));
                    }}
                    components={{
                      Chevron: (props) => (
                        <FontAwesomeIcon
                          icon={
                            props.orientation === "right"
                              ? faChevronRight
                              : faChevronLeft
                          }
                          className="h-4 w-4"
                        />
                      ),
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.week_end_date && (
                <p className="text-xs text-destructive">
                  {errors.week_end_date}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section: Image */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <header className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <FontAwesomeIcon icon={faCloudUpload} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Routine image
              </h2>
              <p className="text-xs text-muted-foreground/80">
                Upload a clear schedule image (16:9). Converted to webp, max 200KB.
              </p>
            </div>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/30 px-6 py-12 text-center transition-colors",
                "hover:border-primary/50 hover:bg-primary/5",
                errors.image && "border-destructive/60"
              )}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <FontAwesomeIcon icon={faCloudUpload} className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  16:9 image, converted to webp
                </p>
              </div>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Routine preview"
                className="aspect-video w-full object-contain"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-8 rounded-full bg-black/60 px-3 text-xs text-white hover:bg-black/80"
                >
                  <FontAwesomeIcon icon={faCloudUpload} className="mr-1.5 h-3 w-3" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                  className="h-8 w-8 rounded-full"
                >
                  <FontAwesomeIcon icon={faX} className="h-3.5 w-3.5" />
                </Button>
              </div>

              {uploading && (
                <div className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-white">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span>Uploading…</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.image && (
            <p className="mt-2 text-xs text-destructive">{errors.image}</p>
          )}
        </section>

        {/* Section: Status */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <header className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info">
              <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Visibility
              </h2>
              <p className="text-xs text-muted-foreground/80">
                Inactive routines are hidden from students.
              </p>
            </div>
          </header>

          <label
            htmlFor="is-active"
            className="flex cursor-pointer items-center justify-between rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                Active routine
              </p>
              <p className="text-xs text-muted-foreground">
                Show this routine to students right away.
              </p>
            </div>
            <Switch
              id="is-active"
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, is_active: checked }))
              }
            />
          </label>
        </section>
      </div>

      {/* ───── Sticky side summary ───── */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              {pageEyebrow}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>

          {/* Live preview card */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/40">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Routine preview"
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="grid aspect-video w-full place-items-center bg-linear-to-br from-primary/15 to-accent/15 text-primary">
                <FontAwesomeIcon icon={faCalendarWeek} className="h-8 w-8" />
              </div>
            )}
            <div className="space-y-1.5 p-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedCourseTitle}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FontAwesomeIcon icon={faLayerGroup} className="h-3 w-3" />
                Week {form.week_number || "—"}
              </p>
              {form.week_start_date && form.week_end_date ? (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                  {format(
                    safeParseDate(form.week_start_date) ?? new Date(),
                    "MMM d"
                  )}{" "}
                  –{" "}
                  {format(
                    safeParseDate(form.week_end_date) ?? new Date(),
                    "MMM d, yyyy"
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/70">
                  No dates selected
                </p>
              )}

              {typeof dateDiff === "number" && dateDiff !== 6 && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertDescription className="text-[11px]">
                    Range is {dateDiff + 1} days. Weekly routines must be 7
                    days.
                  </AlertDescription>
                </Alert>
              )}

              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                  form.is_active
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    form.is_active ? "bg-success" : "bg-muted-foreground"
                  )}
                />
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              type="submit"
              disabled={uploading || isSubmitting}
              className="h-11 w-full rounded-full font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={isEdit ? faCheck : faFloppyDisk}
                    className="mr-2 h-4 w-4"
                  />
                  {submitLabel}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/routines")}
              disabled={uploading || isSubmitting}
              className="h-11 w-full rounded-full"
            >
              <FontAwesomeIcon icon={faXmark} className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            Routines let students see their weekly schedule at a glance. Keep
            images clear and high-contrast for best readability.
          </p>
        </div>

        {/* Back link */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/routines")}
          className="mt-3 h-9 w-full rounded-full text-muted-foreground"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3.5 w-3.5" />
          Back to routines
        </Button>
      </aside>
    </form>
  );
}

export function RoutineEditorSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
