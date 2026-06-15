"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ComboPageHeader } from "@/components/bundles/ComboPageHeader";
import { FormSection } from "@/components/course/FormSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBundle, useBundleBySlug } from "@/hooks/useBundles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faDownload,
  faLink,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import {
  ChevronLeft,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { purchaseService } from "@/services/purchase.service";
import { toast } from "sonner";
import type { Bundle } from "@/services/bundle.service";

interface Course {
  id: number;
  title: string;
  price?: number;
  [key: string]: unknown;
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

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const comboRef = params?.comboid as string | undefined;
  const isNumericComboId = /^\d+$/.test(String(comboRef || ""));
  const numericBundleId = isNumericComboId ? parseInt(String(comboRef), 10) : null;

  const bundleByIdQuery = useBundle(numericBundleId);
  const bundleBySlugQuery = useBundleBySlug(
    !isNumericComboId && comboRef ? comboRef : null
  );
  const activeQuery = isNumericComboId ? bundleByIdQuery : bundleBySlugQuery;
  const bundle = activeQuery.data?.data as Bundle | undefined;
  const courses = extractCourses((bundle as { courses?: unknown })?.courses);
  const resolvedBundleId = bundle?.id ?? numericBundleId;

  const handleExport = async () => {
    if (!resolvedBundleId) {
      toast.error("Combo not found");
      return;
    }

    try {
      const blob = await purchaseService.exportBundlePurchases(resolvedBundleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bundle_${resolvedBundleId}_purchases_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export completed successfully!");
    } catch {
      toast.error("Failed to export purchases");
    }
  };

  if (activeQuery.isLoading) {
    return (
      <PageContainer className="py-6">
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-[2rem]" />
          <Skeleton className="mx-auto h-40 w-full max-w-3xl" />
          <Skeleton className="mx-auto h-64 w-full max-w-3xl" />
        </div>
      </PageContainer>
    );
  }

  if (activeQuery.error || !bundle) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {activeQuery.error?.message || "Combo not found"}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <ComboPageHeader
        title={bundle.title}
        description="Review this combo, its pricing, slug, and included courses."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="h-11 rounded-full px-5 font-semibold">
              <Link href="/combos" aria-label="Back to combos">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() =>
                router.push(
                  resolvedBundleId ? `/combos/${resolvedBundleId}/edit` : "/combos"
                )
              }
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
              Edit combo
            </Button>
          </div>
        }
        className="mb-8"
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Overview */}
        <FormSection
          title="Overview"
          description="Key details for this combo."
          icon={Info}
        >
          <div className="space-y-4">
            {bundle.short_description && (
              <p className="text-sm text-muted-foreground">
                {bundle.short_description}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <FontAwesomeIcon
                  icon={faTag}
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="font-medium">Price:</span>
                <span>৳{bundle.price?.toLocaleString() ?? 0}</span>
              </div>
              {bundle.url && (
                <div className="flex items-center gap-2 text-sm">
                  <FontAwesomeIcon
                    icon={faLink}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span className="font-medium">Slug:</span>
                  <span className="truncate text-muted-foreground">
                    {bundle.url}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <StatusPill on={!!bundle.is_live} onLabel="Live" offLabel="Not live" />
              <StatusPill
                on={!!bundle.is_active}
                onLabel="Active"
                offLabel="Inactive"
              />
            </div>
          </div>
        </FormSection>

        {/* Courses */}
        <FormSection
          title={`Courses (${courses.length})`}
          description="Courses included in this combo."
          icon={GraduationCap}
        >
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No courses assigned to this combo.
            </p>
          ) : (
            <div className="space-y-1">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span className="text-sm font-medium">{course.title}</span>
                  {course.price != null && (
                    <span className="text-xs text-muted-foreground">
                      ৳{course.price.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </FormSection>
      </div>
    </PageContainer>
  );
}

function StatusPill({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
      {on ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      {on ? onLabel : offLabel}
    </span>
  );
}
