"use client";

import { BaseModuleForm } from "./BaseModuleForm";
import {
  useUpdateModule,
  useCreateModule,
  useUpdateModuleEnhanced,
} from "@/hooks/useModules";
import { useCourseStore } from "@/lib/stores/course-store";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Module, ModuleCategory } from "@/types";

interface TextModuleFormProps {
  module?: Module | null;
}

/**
 * Text Module Form
 * For TEXT modules, the description field in BaseModuleForm IS the content
 */
export function TextModuleForm({ module }: TextModuleFormProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const { editingModuleId, draftChanges } = useCourseStore();

  const navigateBack = () => router.push(`/courses/${courseId}`);

  // Get chapter ID from module or draft (for new modules)
  const chapterId =
    module?.chapter_id || (draftChanges.chapterId as number) || 0;

  const updateModuleEnhanced = useUpdateModuleEnhanced(
    editingModuleId || 0,
    courseId
  );
  const updateModule = useUpdateModule(
    editingModuleId || 0,
    chapterId,
    courseId
  );
  const createModule = useCreateModule(chapterId, courseId);

  const handleSubmit = async (data: Partial<Module>) => {
    try {
      // Get category from draft (allows type changes)
      const category =
        (draftChanges.moduleType as ModuleCategory) ||
        module?.category ||
        "TEXT";

      if (editingModuleId && module) {
        // Use v2 enhanced API for updates
        // data.description comes from BaseModuleForm
        await updateModuleEnhanced.mutateAsync({
          ...data,
          category: category as ModuleCategory,
        });
        navigateBack();
      } else if (chapterId) {
        // Create new module
        // data.description comes from BaseModuleForm
        await createModule.mutateAsync({
          title: data.title || "Untitled Text Module",
          description: data.description || "",
          category: category as ModuleCategory,
          serial: 1, // Backend should handle proper serial assignment
          score: data.score || 0,
          is_live: data.is_live || false,
          is_free: data.is_free || false,
        });
        navigateBack();
        useCourseStore.getState().clearDraft();
      } else {
        toast.error("Chapter ID is required to create a module");
      }
    } catch (error) {
      toast.error("Failed to save text module");
    }
  };

  // For TEXT modules, the description field in BaseModuleForm IS the content
  // No additional fields needed
  return (
    <BaseModuleForm
      module={module}
      onSubmit={handleSubmit}
      onCancel={navigateBack}
    >
      {/* Text modules only need the description field (which is already in BaseModuleForm) */}
      {/* No additional content fields needed */}
    </BaseModuleForm>
  );
}
