"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileUp, Link2, Loader2, X } from "lucide-react";
import {
  deleteStorageObject,
  uploadImageToS3,
} from "@/lib/s3-upload";
import type { CourseFormData } from "@/types/course.types";

interface CourseBasicInfoFormProps {
  register: UseFormRegister<CourseFormData>;
  errors: FieldErrors<CourseFormData>;
  setValue: UseFormSetValue<CourseFormData>;
  watch: UseFormWatch<CourseFormData>;
}

export function CourseBasicInfoForm({
  register,
  errors,
  setValue,
  watch,
}: CourseBasicInfoFormProps) {
  const language = watch("language");
  const isLive = watch("is_live");
  const isFree = watch("is_free");
  const courseOutline = watch("course_outline") || "";
  const outlineFileInputRef = useRef<HTMLInputElement>(null);
  const [outlineMode, setOutlineMode] = useState<"link" | "upload">("link");
  const [outlineUploading, setOutlineUploading] = useState(false);

  const storagePublicUrlBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL_BASE;
  const isStorageOutlineUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !storagePublicUrlBase) return false;

    try {
      const current = new URL(trimmed);
      const base = new URL(storagePublicUrlBase);
      const basePath = base.pathname.endsWith("/")
        ? base.pathname
        : `${base.pathname}/`;

      return (
        current.origin === base.origin &&
        (base.pathname === "/" ||
          current.pathname === base.pathname ||
          current.pathname.startsWith(basePath))
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!courseOutline) return;
    setOutlineMode(isStorageOutlineUrl(courseOutline) ? "upload" : "link");
  }, [courseOutline]);

  const clearOutlineFileInput = () => {
    if (outlineFileInputRef.current) {
      outlineFileInputRef.current.value = "";
    }
  };

  const handleOutlineModeChange = async (nextMode: "link" | "upload") => {
    if (nextMode === outlineMode) return;

    const currentValue = courseOutline.trim();
    setOutlineMode(nextMode);

    if (nextMode === "upload") {
      if (currentValue && isStorageOutlineUrl(currentValue)) {
        try {
          await deleteStorageObject({ publicUrl: currentValue });
        } catch (error) {
          console.error("Failed to delete previous course outline:", error);
          toast.error("Could not remove the previous uploaded outline.");
        }
      }
      setValue("course_outline", "", { shouldDirty: true, shouldValidate: true });
      clearOutlineFileInput();
      return;
    }

    if (currentValue && isStorageOutlineUrl(currentValue)) {
      try {
        await deleteStorageObject({ publicUrl: currentValue });
      } catch (error) {
        console.error("Failed to delete previous course outline:", error);
        toast.error("Could not remove the uploaded outline.");
      }
    }

    setValue("course_outline", "", { shouldDirty: true, shouldValidate: true });
    clearOutlineFileInput();
  };

  const handleOutlineFileChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousValue = courseOutline.trim();
    setOutlineUploading(true);

    try {
      const uploadedUrl = await uploadImageToS3(file, {
        purpose: "course-outline",
      });
      setValue("course_outline", uploadedUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (previousValue && isStorageOutlineUrl(previousValue) && previousValue !== uploadedUrl) {
        try {
          await deleteStorageObject({ publicUrl: previousValue });
        } catch (error) {
          console.error("Failed to delete previous course outline:", error);
          toast.error("Uploaded the new outline, but could not delete the old one.");
        }
      }

      setOutlineMode("upload");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload outline PDF"
      );
    } finally {
      setOutlineUploading(false);
      clearOutlineFileInput();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Course Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register("title", { required: "Course title is required" })}
            placeholder="Enter SSC / JSC / HSC course title"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Hosted URL */}
        <div className="space-y-2">
          <Label htmlFor="hosted_url">Course Hosted URL</Label>
          <Input
            id="hosted_url"
            {...register("hosted_url", {
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Invalid URL format",
              },
            })}
            placeholder="https://mathpro.com/courses/ssc-27-physics"
            className={errors.hosted_url ? "border-destructive" : ""}
          />
          {errors.hosted_url && (
            <p className="text-sm text-destructive">
              {errors.hosted_url.message}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            {...register("slug", {
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "Use lowercase letters, numbers, and dashes only",
              },
            })}
            placeholder="ssc-27-physics"
            className={errors.slug ? "border-destructive" : ""}
          />
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pretty route id used by the public course page. Must be unique.
            </p>
          )}
        </div>

        {/* Course Outline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Course Outline</Label>
            <div className="inline-flex rounded-lg border border-border/70 bg-background/60 p-1">
              <Button
                type="button"
                variant={outlineMode === "link" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleOutlineModeChange("link")}
                className="h-8"
              >
                <Link2 className="mr-2 h-4 w-4" />
                Link
              </Button>
              <Button
                type="button"
                variant={outlineMode === "upload" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleOutlineModeChange("upload")}
                className="h-8"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            </div>
          </div>

          {outlineMode === "link" ? (
            <div className="space-y-2">
              <Input
                id="course_outline"
                {...register("course_outline", {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Invalid URL format",
                  },
                })}
                placeholder="https://drive.google.com/file/d/..."
                className={errors.course_outline ? "border-destructive" : ""}
              />
              {errors.course_outline && (
                <p className="text-sm text-destructive">
                  {errors.course_outline.message}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-dashed border-border/70 bg-background/40 p-4">
              <input
                ref={outlineFileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleOutlineFileChange}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => outlineFileInputRef.current?.click()}
                  disabled={outlineUploading}
                >
                  {outlineUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  {courseOutline ? "Replace PDF" : "Upload PDF"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOutlineModeChange("link")}
                  disabled={outlineUploading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Use link instead
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                {courseOutline
                  ? isStorageOutlineUrl(courseOutline)
                    ? "PDF uploaded. Replace it or switch back to a link."
                    : "No PDF uploaded yet."
                  : "Upload a PDF outline instead of pasting a link."}
              </p>

              {courseOutline && (
                <p className="break-all text-sm text-muted-foreground">
                  {courseOutline}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Intro Video Link */}
        <div className="space-y-2">
          <Label htmlFor="intro_video">Course Intro Video Link</Label>
          <Input
            id="intro_video"
            {...register("intro_video", {
              pattern: {
                value: /^https?:\/\/.+/,
                message: "Invalid URL format",
              },
            })}
            placeholder="https://www.youtube.com/watch?v=..."
            className={errors.intro_video ? "border-destructive" : ""}
          />
          {errors.intro_video && (
            <p className="text-sm text-destructive">
              {errors.intro_video.message}
            </p>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="short_description">
            Short Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="short_description"
            {...register("short_description", {
              required: "Short description is required",
            })}
            placeholder="SSC/HSC exam prep, chapter coverage, and support details in 1-2 lines"
            rows={4}
            className={errors.short_description ? "border-destructive" : ""}
          />
          {errors.short_description && (
            <p className="text-sm text-destructive">
              {errors.short_description.message}
            </p>
          )}
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Full Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Explain who the course is for, what chapters it covers, and how it helps students prepare for board exams"
            rows={6}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Price Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="x_price">
              Original Price (৳) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="x_price"
              type="number"
              {...register("x_price", {
                valueAsNumber: true,
                required: "Original price is required",
                min: { value: 0, message: "Price must be positive" },
              })}
              placeholder="0"
              className={errors.x_price ? "border-destructive" : ""}
            />
            {errors.x_price && (
              <p className="text-sm text-destructive">
                {errors.x_price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Discounted Price (৳) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              {...register("price", {
                valueAsNumber: true,
                required: "Price is required",
                min: { value: 0, message: "Price must be positive" },
              })}
              placeholder="0"
              className={errors.price ? "border-destructive" : ""}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_free">Free Course</Label>
            <input type="hidden" {...register("is_free")} />
            <div className="h-10 px-3 border rounded-md flex items-center justify-between">
              <span className="text-sm">
                {isFree ? "Free" : "Paid"}
              </span>
              <Switch
                id="is_free"
                checked={!!isFree}
                onCheckedChange={(checked) => {
                  setValue("is_free", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label htmlFor="you_get">Features</Label>
          <Input
            id="you_get"
            {...register("you_get")}
            placeholder="সিলেবাস রেডি, chapter test, live class replay, note PDF,..."
          />
          <p className="text-sm text-muted-foreground">
            Separate each feature with a comma
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="SSC 27, SSC, JSC, HSC 28"
          />
          <p className="text-sm text-muted-foreground">
            Use exam, batch, or board-prep tags students already search for.
          </p>
        </div>

        {/* Language and Enrolled */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">
              Language <span className="text-destructive">*</span>
            </Label>
            <input
              type="hidden"
              {...register("language", { required: "Language is required" })}
            />
            <Select
              value={language}
              onValueChange={(value) => {
                setValue("language", value as "বাংলা" | "English", {
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger
                id="language"
                className={errors.language ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="বাংলা">বাংলা</SelectItem>
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-destructive">
                {errors.language.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_live">Course Status</Label>
            <input type="hidden" {...register("is_live")} />
            <div className="h-10 px-3 border rounded-md flex items-center justify-between">
              <span className="text-sm">
                {isLive ? "Live" : "Not Live"}
              </span>
              <Switch
                id="is_live"
                checked={!!isLive}
                onCheckedChange={(checked) => {
                  setValue("is_live", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrolled">
              Enrolled Members <span className="text-destructive">*</span>
            </Label>
            <Input
              id="enrolled"
              type="number"
              {...register("enrolled", {
                valueAsNumber: true,
                required: "Enrolled count is required",
                min: { value: 0, message: "Enrolled count must be positive" },
              })}
              placeholder="0"
              className={errors.enrolled ? "border-destructive" : ""}
            />
            {errors.enrolled && (
              <p className="text-sm text-destructive">
                {errors.enrolled.message}
              </p>
            )}
          </div>
        </div>

        {/* Total Seats */}
        <div className="space-y-2">
          <Label htmlFor="seat_amount">
            Total Seats <span className="text-destructive">*</span>
          </Label>
          <Input
            id="seat_amount"
            type="number"
            {...register("seat_amount", {
              valueAsNumber: true,
              required: "Seat amount is required",
              min: { value: 1, message: "Seat amount must be at least 1" },
            })}
            placeholder="0"
            className={errors.seat_amount ? "border-destructive" : ""}
          />
          {errors.seat_amount && (
            <p className="text-sm text-destructive">
              {errors.seat_amount.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
