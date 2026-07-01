"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faPlus } from "@fortawesome/free-solid-svg-icons";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { CourseBasicInfoForm } from "@/components/course/CourseBasicInfoForm";
import {
  CourseMetadataForm,
  ThumbnailUploadField,
} from "@/components/course/CourseMetadataForm";
import { InstructorManagement } from "@/components/course/InstructorManagement";
import { FAQManagement } from "@/components/course/FAQManagement";
import { CourseLinkedBooks } from "@/components/course/CourseLinkedBooks";
import { FormSection } from "@/components/course/FormSection";
import {
  Loader2,
  Info,
  SlidersHorizontal,
  Users,
  Image as ImageIcon,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateCourseData } from "@/services/course.service";
import type {
  CourseFormData,
  FAQ,
  Feedback,
  CourseChipsCanonical,
} from "@/types/course.types";
import {
  buildCourseChipsPayload,
  createDefaultCourseChips,
  createDefaultCourseFormData,
  normalizeCourseForEditor,
  serializeFeedbacksForApi,
  serializeTagsForApi,
  serializeYouGetForApi,
} from "@/lib/course-form-mapper";
import { teacherService } from "@/services/teacher.service";

interface CourseFormProps {
  mode: "create" | "edit";
  /** Existing course data (edit mode only). */
  course?: unknown;
  /** Persist the assembled payload; resolve with the saved course. */
  onSubmit: (data: Partial<CreateCourseData>) => Promise<{ id?: number } | void>;
  isSubmitting?: boolean;
}

type TabKey = "basic" | "metadata" | "people" | "thumbnails" | "books";

const TABS: { value: TabKey; label: string; icon: typeof Info }[] = [
  { value: "basic", label: "Basics", icon: Info },
  { value: "metadata", label: "Details", icon: SlidersHorizontal },
  { value: "people", label: "People & FAQ", icon: Users },
  { value: "thumbnails", label: "Thumbnails", icon: ImageIcon },
  { value: "books", label: "Linked Books", icon: BookOpen },
];

async function uploadRenamed(
  file: File,
  folder: string,
  purpose: Parameters<typeof uploadImageToS3>[1]["purpose"]
): Promise<string> {
  const fileName = `courses/${folder}/${Date.now()}_${file.name}`;
  const renamed = new File([file], fileName, {
    type: file.type,
    lastModified: file.lastModified,
  });
  return uploadImageToS3(renamed, { purpose });
}

/**
 * Unified create/edit course form. Owns all form state, image uploads, and
 * payload assembly so the `/courses/new` and `/courses/[id]/edit` pages stay
 * visually identical and free of duplicated logic.
 */
export function CourseForm({
  mode,
  course,
  onSubmit,
  isSubmitting: externalSubmitting,
}: CourseFormProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormData>({
    defaultValues: createDefaultCourseFormData(),
  });

  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<number[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [chips, setChips] = useState<CourseChipsCanonical>(
    createDefaultCourseChips()
  );

  // Hydrate from existing course in edit mode.
  useEffect(() => {
    if (!isEdit || !course) return;
    const normalized = normalizeCourseForEditor(course);
    reset(normalized.formData);
    setSelectedInstructorIds(
      normalized.instructors
        .map((i: { id?: number }) => i.id)
        .filter((id): id is number => typeof id === "number")
    );
    setFaqs(normalized.faqs);
    setFeedbacks(normalized.feedbacks);
    setChips(normalized.chips);
  }, [isEdit, course, reset]);

  const submitting = isSubmitting || externalSubmitting;

  const handleFormSubmit = async (data: CourseFormData) => {
    try {
      const feedbacksWithImages = await Promise.all(
        feedbacks.map(async (feedback) => {
          if (!feedback.image) return feedback;
          try {
            const imageUploadedLink = await uploadRenamed(
              feedback.image,
              "feedbacks",
              "course-feedback-image"
            );
            return { ...feedback, imageUploadedLink };
          } catch {
            toast.error(`Failed to upload image for ${feedback.name}`);
            return feedback;
          }
        })
      );

      const chipsPayload = buildCourseChipsPayload(
        chips,
        isEdit ? (course as { chips?: unknown })?.chips : undefined
      );

      const payload: Partial<CreateCourseData> = {
        title: data.title,
        description: data.description,
        short_description: data.short_description,
        price: data.price,
        x_price: data.x_price,
        language: data.language,
        intro_video: data.intro_video || undefined,
        url: data.hosted_url || undefined,
        is_live: data.is_live,
        enrolled: data.enrolled,
        you_get: serializeYouGetForApi(data.you_get),
        chips: chipsPayload,
        faq_list: { faqs },
        feedback_list: {
          feedbacks: serializeFeedbacksForApi(feedbacksWithImages),
        },
        slug: data.slug || undefined,
        total_seats: data.seat_amount,
        tags: serializeTagsForApi(data.tags),
        course_outline: data.course_outline || undefined,
      };

      const result = await onSubmit(payload);

      // Sync instructor assignments via the junction table
      if (isEdit) {
        const courseId = (course as { id?: number })?.id;
        if (courseId) {
          await teacherService.replaceInstructorsForCourse(courseId, selectedInstructorIds);
        }
      } else {
        const newCourseId = (result as { id?: number } | undefined)?.id;
        if (newCourseId) {
          await teacherService.replaceInstructorsForCourse(newCourseId, selectedInstructorIds);
        }
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} course:`, error);
      // Error toast handled by the mutation.
    }
  };

  const title = watch("title");
  const backHref = isEdit
    ? `/courses/${(course as { id?: number })?.id ?? ""}`
    : "/courses";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="pb-28">
      <PageHeader
        eyebrow="Courses"
        eyebrowIcon={faGraduationCap}
        title={title?.trim() || (isEdit ? "Untitled course" : "Create a course")}
        description={
          isEdit
            ? "Update the course details and settings."
            : "Create a course for SSC, JSC, or HSC students."
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="h-11 rounded-full px-5 font-semibold shadow-sm"
            >
              <Link href={backHref}>Cancel</Link>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-11 rounded-full px-5 font-semibold shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : !isEdit ? (
                <>
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  Create course
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        }
        className="mb-8"
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
        className="w-full"
      >
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:inline-flex sm:w-auto">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "gap-2 rounded-lg px-4 py-2",
                "data-[state=active]:shadow-sm"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mx-auto max-w-3xl">
          <TabsContent value="basic" className="mt-0 space-y-6">
            <CourseBasicInfoForm
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          </TabsContent>

          <TabsContent value="metadata" className="mt-0 space-y-6">
            <CourseMetadataForm chips={chips} onChipsChange={setChips} />
          </TabsContent>

          <TabsContent value="people" className="mt-0 space-y-6">
            <FormSection
              title="Instructors"
              description="People who teach or are credited on this course."
              icon={Users}
            >
              <InstructorManagement
                selectedIds={selectedInstructorIds}
                onSelectedIdsChange={setSelectedInstructorIds}
              />
            </FormSection>

            <FormSection
              title="Frequently asked questions"
              description="Answer common questions shown on the course page."
              icon={HelpCircle}
            >
              <FAQManagement faqs={faqs} onFaqsChange={setFaqs} />
            </FormSection>

          </TabsContent>

          <TabsContent value="thumbnails" className="mt-0 space-y-6">
            <FormSection
              title="Thumbnails"
              description="Upload the banner and card thumbnails used across the course page."
              icon={ImageIcon}
            >
              <div className="space-y-6">
                <ThumbnailUploadField
                  label="course_thumbnail_16_9"
                  description="Banner/slider thumbnail shown on the courses page and the Featured rail."
                  value={chips.thumbnails.course_thumbnail_16_9}
                  purpose="course-thumbnail-banner"
                  aspectRatio="16:9"
                  onChange={(course_thumbnail_16_9) =>
                    setChips((prev) => ({
                      ...prev,
                      thumbnails: {
                        ...prev.thumbnails,
                        course_thumbnail_16_9,
                      },
                    }))
                  }
                />

                <ThumbnailUploadField
                  label="course_thumbnail_card_4_3"
                  description="Card thumbnail shown in course grids. Falls back to the banner image above until set."
                  value={chips.thumbnails.course_thumbnail_card_4_3}
                  purpose="course-thumbnail-card"
                  aspectRatio="4:3"
                  onChange={(course_thumbnail_card_4_3) =>
                    setChips((prev) => ({
                      ...prev,
                      thumbnails: {
                        ...prev.thumbnails,
                        course_thumbnail_card_4_3,
                      },
                    }))
                  }
                />
              </div>
            </FormSection>
          </TabsContent>

          {isEdit && (
            <TabsContent value="books" className="mt-0 space-y-6">
              <FormSection
                title="Linked books"
                description="Books offered alongside this course. Managed via the Book module."
                icon={BookOpen}
              >
                <CourseLinkedBooks courseId={(course as { id: number }).id} />
              </FormSection>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </form>
  );
}
