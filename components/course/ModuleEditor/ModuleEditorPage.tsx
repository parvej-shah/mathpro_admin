"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useCourseStore } from "@/lib/stores/course-store";
import { useModule } from "@/hooks/useModules";
import { ModuleTypeSelector } from "./ModuleTypeSelector";
import { TextModuleForm } from "./forms/TextModuleForm";
import { VideoModuleForm } from "./forms/VideoModuleForm";
import { QuizModuleForm } from "./forms/QuizModuleForm";
import { PDFModuleForm } from "./forms/PDFModuleForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";
import type { Module, ModuleCategory } from "@/types";

interface ModuleEditorPageProps {
  moduleId: number | null;
}

export function ModuleEditorPage({ moduleId }: ModuleEditorPageProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const chapterId = searchParams?.get("chapterId")
    ? parseInt(searchParams.get("chapterId")!)
    : null;

  const draftModuleType = useCourseStore(
    (state) => state.draftChanges.moduleType as ModuleCategory | undefined
  );
  const clearDraft = useCourseStore((state) => state.clearDraft);
  const setDraft = useCourseStore((state) => state.setDraft);
  const setEditingModuleId = useCourseStore((state) => state.openModuleEditor);
  const closeModuleEditor = useCourseStore((state) => state.closeModuleEditor);

  const { data: module, isLoading, error } = useModule(moduleId);

  const lastInitializedModuleIdRef = useRef<number | null>(null);

  const getModuleCategory = (
    mod: Module | null | undefined
  ): ModuleCategory => {
    if (!mod) return "TEXT";
    if (mod.category) return mod.category as ModuleCategory;
    if (mod.type) return mod.type as ModuleCategory;
    if (mod.data && typeof mod.data === "object") {
      const data = mod.data as Record<string, unknown>;
      if (data.category) return data.category as ModuleCategory;
    }
    return "TEXT";
  };

  // Set store state so forms can read editingModuleId and chapterId
  useEffect(() => {
    setEditingModuleId(moduleId);
    if (chapterId) {
      setDraft("chapterId", chapterId);
    }
    return () => {
      closeModuleEditor();
    };
  }, [moduleId, chapterId]);

  // Initialize draft module type
  useEffect(() => {
    if (moduleId === null) {
      if (!draftModuleType) {
        setDraft("moduleType", "TEXT");
      }
      lastInitializedModuleIdRef.current = null;
      return;
    }

    if (moduleId !== lastInitializedModuleIdRef.current) {
      if (module && !isLoading) {
        const moduleCategory = getModuleCategory(module);
        setDraft("moduleType", moduleCategory);
        lastInitializedModuleIdRef.current = moduleId;
      }
    }
  }, [moduleId, module, isLoading, draftModuleType, setDraft]);

  const category = useMemo((): ModuleCategory => {
    if (draftModuleType) return draftModuleType;
    if (moduleId && module && !isLoading) return getModuleCategory(module);
    return "TEXT";
  }, [moduleId, module, draftModuleType, isLoading]);

  const handleBack = () => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <PageContainer className="py-8">
      <PageHeader
        eyebrow="Module Editor"
        eyebrowIcon={faPuzzlePiece}
        title={moduleId ? "Edit Module" : "Create New Module"}
        description={
          moduleId
            ? "Update module content and settings"
            : "Create a new module for this chapter"
        }
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button type="submit" form="module-editor-form">
              Save Module
            </Button>
          </div>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load module"}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <ModuleTypeSelector module={module} />

            {category === "VIDEO" && (
              <VideoModuleForm
                key={`video-${moduleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "QUIZ" && (
              <QuizModuleForm
                key={`quiz-${moduleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "PDF" && (
              <PDFModuleForm
                key={`pdf-${moduleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "TEXT" && (
              <TextModuleForm
                key={`text-${moduleId || "new"}-${category}`}
                module={module}
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
