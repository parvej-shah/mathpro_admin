"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ComboPageHeader } from "@/components/bundles/ComboPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "@/components/course/FormSection";
import { ThumbnailUploadField } from "@/components/course/CourseMetadataForm";
import { useCourses } from "@/hooks/useAnnouncements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useBundle,
  useBundleBySlug,
  useCreateBundle,
  useUpdateBundle,
} from "@/hooks/useBundles";
import { bundleService } from "@/services/bundle.service";
import { toast } from "sonner";
import {
  ChevronLeft,
  Loader2,
  Info,
  ImageIcon,
  GraduationCap,
  Search,
  AlertCircle,
} from "lucide-react";
import type {
  Bundle,
  BundleChips,
  CreateBundleData,
} from "@/services/bundle.service";

interface BundleFormProps {
  mode: "create" | "edit";
  /** Numeric bundle id (edit mode only). */
  bundleId?: number;
  /** Route ref which may be a numeric id or slug (edit mode only). */
  bundleRef?: string;
}

interface Course {
  id: number;
  title: string;
  price?: number;
  [key: string]: unknown;
}

function normalizeBundleChips(chips: unknown): BundleChips {
  if (!chips || typeof chips !== "object") return {};
  return chips as BundleChips;
}

function getBundleThumb43(chips: unknown): string {
  return normalizeBundleChips(chips).thumbnails?.bundle_thumb_4_3 || "";
}

function setBundleThumb43(chips: unknown, nextThumb: string): BundleChips {
  const current = normalizeBundleChips(chips);
  return {
    ...current,
    thumbnails: {
      ...(current.thumbnails || {}),
      bundle_thumb_4_3: nextThumb,
    },
  };
}

function extractCourses(data: unknown): Course[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Course[];
  if (typeof data === "object") {
    const obj = data as { data?: Course[]; courses?: Course[] };
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.courses)) return obj.courses;
  }
  return [];
}

/**
 * Unified create/edit bundle form. Owns all form state and persistence so the
 * `/combos/new` and `/combos/[id]/edit` pages stay
 * visually identical to the course editor and free of duplicated logic.
 */
export function BundleForm({ mode, bundleId, bundleRef }: BundleFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const normalizedBundleRef = bundleRef ?? (bundleId != null ? String(bundleId) : undefined);
  const isNumericBundleRef = /^\d+$/.test(String(normalizedBundleRef || ""));
  const initialBundleId =
    isEdit && isNumericBundleRef ? parseInt(String(normalizedBundleRef), 10) : bundleId ?? null;

  const bundleByIdQuery = useBundle(isEdit ? initialBundleId : null);
  const bundleBySlugQuery = useBundleBySlug(
    isEdit && !isNumericBundleRef && normalizedBundleRef ? normalizedBundleRef : null
  );
  const activeBundleQuery = isEdit && !isNumericBundleRef ? bundleBySlugQuery : bundleByIdQuery;
  const { data: bundleData, isLoading: loadingBundle, error: bundleError } = activeBundleQuery;
  const { data: coursesData } = useCourses();
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();

  const [formData, setFormData] = useState<CreateBundleData>({
    title: "",
    price: 0,
    url: "",
    short_description: "",
    chips: {
      thumbnails: {
        bundle_thumb_4_3: "",
      },
    },
    is_live: false,
    is_active: true,
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseSearch, setCourseSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const courses = useMemo(
    () => extractCourses(coursesData?.data),
    [coursesData]
  );

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  const resolvedBundle = bundleData?.data as Bundle | undefined;
  const resolvedBundleId = resolvedBundle?.id ?? initialBundleId ?? undefined;

  // Hydrate from existing bundle in edit mode.
  useEffect(() => {
    if (!isEdit || !bundleData?.data) return;
    const bundle = bundleData.data as Bundle;
    setFormData({
      title: bundle.title || "",
      price: bundle.price || 0,
      url: bundle.url || "",
      short_description: bundle.short_description || "",
      chips: normalizeBundleChips(bundle.chips),
      is_live: bundle.is_live || false,
      is_active: bundle.is_active ?? true,
    });

    setSelectedCourseIds(
      extractCourses((bundle as { courses?: unknown })?.courses).map(
        (course) => course.id
      )
    );
  }, [isEdit, bundleData]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.title?.trim()) next.title = "Title is required";
    if (formData.price == null || formData.price < 0)
      next.price = "Price must be 0 or greater";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (isEdit && !resolvedBundleId) {
      toast.error("Combo not found");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && resolvedBundleId) {
        await updateBundle.mutateAsync({ id: resolvedBundleId, data: formData });
        if (selectedCourseIds.length > 0) {
          await bundleService.addCoursesToBundle(resolvedBundleId, selectedCourseIds);
        }
        router.push(`/combos/${resolvedBundleId}`);
      } else {
        const response = await createBundle.mutateAsync(formData);
        const created = response.data as Bundle | { data?: Bundle };
        const newId =
          (created as Bundle).id ?? (created as { data?: Bundle }).data?.id ?? 0;
        if (newId && selectedCourseIds.length > 0) {
          await bundleService.addCoursesToBundle(newId, selectedCourseIds);
        }
        router.push(newId ? `/combos/${newId}` : "/combos");
      }
    } catch {
      // Error toast handled by the mutation.
    } finally {
      setSubmitting(false);
    }
  };

  const generateUrl = () => {
    if (!formData.title?.trim()) {
      toast.warning("Please enter a combo title first");
      return;
    }
    const url = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, url }));
  };

  const bundleThumbnail = getBundleThumb43(formData.chips);

  const toggleCourse = (id: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const backHref = isEdit
    ? resolvedBundleId
      ? `/combos/${resolvedBundleId}`
      : "/combos"
    : "/combos";

  if (isEdit && loadingBundle) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-[2rem] bg-muted" />
        <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isEdit && (bundleError || !resolvedBundle)) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {bundleError?.message || "Combo not found"}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      <ComboPageHeader
        title={
          formData.title?.trim() ||
          (isEdit ? "Edit Combo" : "Create Combo")
        }
        description={
          isEdit
            ? "Update this combo's pricing, slug, description, and included courses."
            : "Create a new combo and choose the courses learners will unlock."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="h-11 rounded-full px-5 font-semibold">
              <Link href={backHref} aria-label="Back to combos">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(backHref)}
              className="h-11 rounded-full px-5 font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" form="combo-form" disabled={submitting} className="h-11 min-w-32 rounded-full px-5 font-semibold shadow-sm">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create combo"
              )}
            </Button>
          </div>
        }
      />

      <form id="combo-form" onSubmit={handleSubmit}>
        <div className="mx-auto max-w-3xl space-y-6">
        {/* Details */}
          <FormSection
            title="Combo details"
            description="The basics shown to learners on the combo page."
            icon={Info}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Combo title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter combo title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="combo-slug"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateUrl}
                    className="whitespace-nowrap"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                value={formData.short_description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    short_description: e.target.value,
                  }))
                }
                placeholder="Enter combo description"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_live"
                  checked={formData.is_live}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_live: checked === true,
                    }))
                  }
                />
                <Label htmlFor="is_live" className="cursor-pointer">
                  Live
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: checked === true,
                    }))
                  }
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            </div>
          </FormSection>

          <FormSection
            title="Media"
            description="Upload the main combo thumbnail used across the student site."
            icon={ImageIcon}
          >
            <ThumbnailUploadField
              label="bundle_thumb_4_3"
              description="Primary combo thumbnail shown in combo cards and detail pages."
              value={bundleThumbnail}
              onChange={(nextThumb) =>
                setFormData((prev) => ({
                  ...prev,
                  chips: setBundleThumb43(prev.chips, nextThumb),
                }))
              }
            />
          </FormSection>

          {/* Courses */}
          <FormSection
            title="Courses in this combo"
            description="Pick the courses learners get when they buy this combo."
            icon={GraduationCap}
            action={
              selectedCourseIds.length > 0 ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {selectedCourseIds.length} selected
                </span>
              ) : undefined
            }
          >
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search courses…"
                className="pl-9"
              />
            </div>

            <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border p-2">
              {filteredCourses.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  {courses.length === 0
                    ? "No courses available"
                    : "No courses match your search"}
                </p>
              ) : (
                filteredCourses.map((course) => {
                  const checked = selectedCourseIds.includes(course.id);
                  return (
                    <label
                      key={course.id}
                      htmlFor={`course-${course.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60 has-[:checked]:bg-primary/5"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={checked}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <span className="flex-1 text-sm font-medium">
                        {course.title}
                      </span>
                      {course.price != null && (
                        <span className="text-xs text-muted-foreground">
                          ৳{course.price.toLocaleString()}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </FormSection>
        </div>
      </form>
    </div>
  );
}
