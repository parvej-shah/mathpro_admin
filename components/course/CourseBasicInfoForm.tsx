"use client";

import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  FieldErrors,
} from "react-hook-form";
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
          <Label htmlFor="course_outline">Course Outline Link</Label>
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
