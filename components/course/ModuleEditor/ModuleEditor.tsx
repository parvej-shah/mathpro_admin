"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourseStore } from "@/lib/stores/course-store";
import { useModule } from "@/hooks/useModules";
import { useQueryClient } from "@tanstack/react-query";
import { ModuleTypeSelector } from "./ModuleTypeSelector";
import { TextModuleForm } from "./forms/TextModuleForm";
import { VideoModuleForm } from "./forms/VideoModuleForm";
import { QuizModuleForm } from "./forms/QuizModuleForm";
import { PDFModuleForm } from "./forms/PDFModuleForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Module, ModuleCategory } from "@/types";

/**
 * Module Editor Modal
 * Opens when user clicks edit on a module or creates a new module
 */
export function ModuleEditor() {
  // Use selectors to subscribe to specific store values for reactivity
  const isModuleEditorOpen = useCourseStore(
    (state) => state.isModuleEditorOpen
  );
  const editingModuleId = useCourseStore((state) => state.editingModuleId);
  const closeModuleEditor = useCourseStore((state) => state.closeModuleEditor);
  const draftModuleType = useCourseStore(
    (state) => state.draftChanges.moduleType as ModuleCategory | undefined
  );
  const clearDraft = useCourseStore((state) => state.clearDraft);
  const setDraft = useCourseStore((state) => state.setDraft);

  const queryClient = useQueryClient();

  // Fetch module data if editing existing module
  const { data: module, isLoading, error, refetch: refetchModule } = useModule(editingModuleId);

  // Refetch module data when editor opens or module ID changes to ensure fresh data
  useEffect(() => {
    if (isModuleEditorOpen && editingModuleId) {
      // Refetch module data to ensure we have the latest data after any CRUD operations
      refetchModule();
    }
  }, [isModuleEditorOpen, editingModuleId, refetchModule]);

  // Track the last module ID we initialized for to avoid re-initializing
  const lastInitializedModuleIdRef = useRef<number | null>(null);

  // Helper function to extract category from module
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

  // Initialize draft when editor opens or module changes
  // This effect handles both new modules and existing modules
  useEffect(() => {
    if (!isModuleEditorOpen) {
      // Reset tracking when editor closes
      lastInitializedModuleIdRef.current = null;
      return;
    }

    // For new modules (editingModuleId is null)
    if (editingModuleId === null) {
      // Only initialize if not already set (avoid overwriting user changes)
      if (!draftModuleType) {
        setDraft("moduleType", "TEXT");
      }
      lastInitializedModuleIdRef.current = null;
      return;
    }

    // For existing modules - wait for data to load
    if (editingModuleId !== null) {
      // If this is a different module than we last initialized
      if (editingModuleId !== lastInitializedModuleIdRef.current) {
        // If module data is loaded and we haven't initialized yet
        if (module && !isLoading) {
          const moduleCategory = getModuleCategory(module);
          setDraft("moduleType", moduleCategory);
          lastInitializedModuleIdRef.current = editingModuleId;
        }
        // If still loading, don't initialize yet (will wait for next render)
      }
    }
  }, [
    isModuleEditorOpen,
    editingModuleId,
    module,
    isLoading,
    draftModuleType,
    setDraft,
  ]);

  // Category should be reactive - always prefer draftType (user selection) over module category
  // This ensures immediate UI updates when user changes module type
  const category = useMemo((): ModuleCategory => {
    // Always prefer draftType if set (user has changed it or it's been initialized)
    if (draftModuleType) {
      return draftModuleType;
    }

    // If editing and module is loaded, get from module
    if (editingModuleId && module && !isLoading) {
      return getModuleCategory(module);
    }

    // Default fallback (for new modules or while loading)
    return "TEXT";
  }, [editingModuleId, module, draftModuleType, isLoading]);

  // Handle close
  const handleClose = () => {
    closeModuleEditor();
  };

  return (
    <Dialog open={isModuleEditorOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <DialogHeader>
          <DialogTitle>
            {editingModuleId ? "Edit Module" : "Create New Module"}
          </DialogTitle>
          <DialogDescription>
            {editingModuleId
              ? "Update module content and settings"
              : "Create a new module for this chapter"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
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
          <div className="py-4">
            {/* Module Type Selector - Always show to allow type changes */}
            <ModuleTypeSelector module={module} />

            {/* Module Forms - Use key with category to force re-mount when type changes */}
            {category === "VIDEO" && (
              <VideoModuleForm
                key={`video-${editingModuleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "QUIZ" && (
              <QuizModuleForm
                key={`quiz-${editingModuleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "PDF" && (
              <PDFModuleForm
                key={`pdf-${editingModuleId || "new"}-${category}`}
                module={module}
              />
            )}
            {category === "TEXT" && (
              <TextModuleForm
                key={`text-${editingModuleId || "new"}-${category}`}
                module={module}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
