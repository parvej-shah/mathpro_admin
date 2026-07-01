"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ImagePlus, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteStorageObject, uploadImageToS3, type UploadPurpose } from "@/lib/s3-upload";
import type { CourseChipsCanonical, LabeledValue } from "@/types/course.types";
import { dateToUnixSeconds, unixSecondsToDate } from "@/lib/course-form-mapper";

interface CourseMetadataFormProps {
  chips: CourseChipsCanonical;
  onChipsChange: (chips: CourseChipsCanonical) => void;
}

const ENROLLED_ONLY_SOCIAL_KEYS = new Set(["facebook_private_group", "telegram_group"]);

function ObjectEditor({
  title,
  description,
  data,
  onChange,
  valuePlaceholder,
}: {
  title: string;
  description?: string;
  data: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  valuePlaceholder: string;
}) {
  const entries = Object.entries(data);

  const updateValue = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {key}
              {ENROLLED_ONLY_SOCIAL_KEYS.has(key) && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  Enrolled only
                </span>
              )}
            </Label>
            <Input
              value={value}
              placeholder={valuePlaceholder}
              onChange={(e) => updateValue(key, e.target.value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ThumbnailUploadField({
  label,
  description,
  value,
  onChange,
  purpose,
  aspectRatio,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (next: string) => void;
  purpose: UploadPurpose;
  aspectRatio: "4:3" | "16:9";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocalPreview, setHasLocalPreview] = useState(false);

  useEffect(() => {
    if (!hasLocalPreview) {
      setPreview(value);
    }
    setError(null);
  }, [hasLocalPreview, value]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const canLoadImage = (src: string) =>
    new Promise<boolean>((resolve) => {
      const image = new window.Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousValue = value.trim();

    const nextPreview = URL.createObjectURL(file);
    setError(null);
    setUploading(true);
    setHasLocalPreview(true);
    setPreview(nextPreview);

    try {
      const uploadedUrl = await uploadImageToS3(file, {
        purpose,
      });
      onChange(uploadedUrl);

      const remoteImageLoaded = await canLoadImage(uploadedUrl);
      if (remoteImageLoaded) {
        URL.revokeObjectURL(nextPreview);
        setHasLocalPreview(false);
        setPreview(uploadedUrl);
      } else {
        toast.warning(
          "Image uploaded, but the public URL is not reachable yet. The local preview will stay visible for now."
        );
      }

      if (previousValue && previousValue !== uploadedUrl) {
        try {
          await deleteStorageObject({ publicUrl: previousValue });
        } catch (deleteError) {
          console.error("Failed to delete previous thumbnail:", deleteError);
          toast.error("Uploaded the new thumbnail, but could not delete the old one.");
        }
      }
    } catch (err) {
      URL.revokeObjectURL(nextPreview);
      setHasLocalPreview(false);
      setPreview(value);
      setError(
        err instanceof Error ? err.message : "Failed to upload thumbnail"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleClear = async () => {
    const currentValue = value.trim();
    if (!currentValue) {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setHasLocalPreview(false);
      setPreview("");
      setError(null);
      onChange("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await deleteStorageObject({ publicUrl: currentValue });
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
      setHasLocalPreview(false);
      setPreview("");
      onChange("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete thumbnail"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="space-y-3 rounded-lg border border-border/70 bg-background/40 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border/70 bg-background/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:h-40 sm:w-56">
            {preview ? (
              <img
                src={preview}
                alt={label}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Upload image</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                {preview ? "Replace image" : "Upload image"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                disabled={!preview || uploading}
              >
                Clear
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {preview
                ? "The uploaded URL is stored automatically."
                : `Select a ${aspectRatio} image. It will be converted to webp and uploaded immediately.`}
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollmentDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
  const date = unixSecondsToDate(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Not set"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(d) => onChange(dateToUnixSeconds(d || null))}
            initialFocus
          />
          {date && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange(null)}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function CourseMetadataForm({
  chips,
  onChipsChange,
}: CourseMetadataFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Optional dates shown on the course page.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnrollmentDateField
            label="Prebooking End Date"
            value={chips.enrollment_details.prebooking_end_date}
            onChange={(prebooking_end_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  prebooking_end_date,
                },
              })
            }
          />
          <EnrollmentDateField
            label="Enrollment End Date"
            value={chips.enrollment_details.enrollment_end_date}
            onChange={(enrollment_end_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  enrollment_end_date,
                },
              })
            }
          />
          <EnrollmentDateField
            label="Course Start Date"
            value={chips.enrollment_details.course_start_date}
            onChange={(course_start_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  course_start_date,
                },
              })
            }
          />
        </CardContent>
      </Card>

      <ObjectEditor
        title="Social Links"
        description="Telegram group and the private Facebook group are only shown to enrolled students."
        data={chips.socials}
        valuePlaceholder="Value"
        onChange={(socials) => onChipsChange({ ...chips, socials })}
      />

      <Card>
        <CardHeader>
          <CardTitle>Combo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="bundle_id">Combo ID</Label>
          <Input
            id="bundle_id"
            type="number"
            value={chips.bundle_id}
            placeholder="Leave empty if not part of a combo"
            onChange={(e) => onChipsChange({ ...chips, bundle_id: e.target.value })}
          />
        </CardContent>
      </Card>

      {/*
      <DynamicObjectEditor
        title="Additional Metadata"
        description="Extra chip keys not covered by the fields above."
        data={chips.extra}
        onChange={(extra) => onChipsChange({ ...chips, extra })}
      />
      */}
    </div>
  );
}
