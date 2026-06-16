"use client";

import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCourseFullEnhanced,
  useUpdateCourseFull,
  useReorderModules,
  useExportCourse,
  useImportCourse,
  useImportStatus,
  useDownloadImportTemplate,
} from "@/hooks/useCourse";
import {
  useCreateChapter,
  useDeleteChapter,
  useUpdateChapter,
} from "@/hooks/useChapters";
import { useDeleteModule } from "@/hooks/useModules";
import { createModule as createModuleService } from "@/services/module.service";
import { CourseHeader } from "@/components/course/CourseHeader";
import { ChapterList } from "@/components/course/ChapterList";
import { ModuleEditor } from "@/components/course/ModuleEditor/ModuleEditor";
import { ImportDialog } from "@/components/course/BulkImport/ImportDialog";
import { ModuleSerializerModal } from "@/components/course/ModuleSerializerModal";
import { useCourseStore } from "@/lib/stores/course-store";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  useKeyboardShortcuts,
  COURSE_SHORTCUTS,
} from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle, ShieldX, GripVertical } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  reorderModulesInChapter,
  prepareCourseForUpdate,
  moveModuleBetweenChapters,
} from "@/lib/serialization/serialization-utils";
import type { CourseWithChapters, Chapter, Module } from "@/types";
import { toast } from "sonner";

/**
 * Course View Page
 * Modern course editing interface with drag-and-drop
 */
export default function CourseViewPage() {
  const params = useParams();
  const courseIdParam = params?.courseId;

  // Early validation
  if (!courseIdParam || isNaN(parseInt(courseIdParam as string))) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid course ID</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const courseId = parseInt(courseIdParam as string);

  // Data fetching - Use enhanced v2 API for Phase 8 fields
  // Falls back to regular API automatically if v2 is not available
  const queryClient = useQueryClient();
  const { data: course, isLoading, error } = useCourseFullEnhanced(courseId);
  const updateCourseFull = useUpdateCourseFull(courseId);
  const reorderModules = useReorderModules(courseId);
  const exportCourse = useExportCourse();
  const importCourse = useImportCourse();
  const createChapter = useCreateChapter(courseId);
  const deleteChapter = useDeleteChapter(courseId);
  const deleteModule = useDeleteModule(courseId);

  // UI State
  const [isNewChapterDialogOpen, setIsNewChapterDialogOpen] = useState(false);
  const [isEditChapterDialogOpen, setIsEditChapterDialogOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [isNewModuleDialogOpen, setIsNewModuleDialogOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterIsFree, setNewChapterIsFree] = useState(false);
  const [newChapterIsLive, setNewChapterIsLive] = useState(false);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterIsFree, setEditChapterIsFree] = useState(false);
  const [editChapterIsLive, setEditChapterIsLive] = useState(false);
  const [editChapterSerial, setEditChapterSerial] = useState<number>(1);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importId, setImportId] = useState<string | null>(null);
  const [isSerializerOpen, setIsSerializerOpen] = useState(false);

  // Get chapter data from course data instead of separate API call
  const editingChapter = editingChapterId
    ? course?.chapters?.find((ch) => ch.id === editingChapterId)
    : null;
  const updateChapter = useUpdateChapter(editingChapterId || 0, courseId);

  // Populate edit form when chapter data is available
  useEffect(() => {
    if (editingChapter && isEditChapterDialogOpen) {
      setEditChapterTitle(editingChapter.title || "");
      setEditChapterIsFree(editingChapter.is_free || false);
      setEditChapterIsLive(editingChapter.is_live || false);
      setEditChapterSerial(editingChapter.serial || 1);
    }
  }, [editingChapter, isEditChapterDialogOpen]);

  // Store
  const { saveStatus, setSaveStatus, openModuleEditor, setDraft } =
    useCourseStore();

  // Drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save
  const { triggerSave } = useAutoSave({
    onSave: async () => {
      if (!course) return;
      const preparedCourse = prepareCourseForUpdate(course);
      await updateCourseFull.mutateAsync(preparedCourse);
    },
    debounceMs: 2000,
    enabled: !!course,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...COURSE_SHORTCUTS.SAVE,
        handler: () => {
          if (course) {
            triggerSave();
          }
        },
      },
      {
        ...COURSE_SHORTCUTS.CANCEL,
        handler: () => {
          setIsNewChapterDialogOpen(false);
          setIsEditChapterDialogOpen(false);
          setIsNewModuleDialogOpen(false);
        },
      },
      {
        ...COURSE_SHORTCUTS.ADD_CHAPTER,
        handler: () => {
          setIsNewChapterDialogOpen(true);
        },
      },
    ],
    enabled: !!course,
  });

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !course) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle module reordering within chapter
    if (activeId.startsWith("module-") && overId.startsWith("module-")) {
      const activeModuleId = parseInt(activeId.replace("module-", ""));
      const overModuleId = parseInt(overId.replace("module-", ""));

      // Find chapters containing these modules
      let sourceChapter: Chapter | null = null;
      let destinationChapter: Chapter | null = null;
      let sourceIndex = -1;
      let destinationIndex = -1;

      for (const chapter of course.chapters || []) {
        const modules = chapter.modules || [];
        const activeIndex = modules.findIndex((m) => m.id === activeModuleId);
        const overIndex = modules.findIndex((m) => m.id === overModuleId);

        if (activeIndex !== -1) {
          sourceChapter = chapter;
          sourceIndex = activeIndex;
        }
        if (overIndex !== -1) {
          destinationChapter = chapter;
          destinationIndex = overIndex;
        }
      }

      if (
        sourceChapter &&
        destinationChapter &&
        sourceChapter.id === destinationChapter.id
      ) {
        // Reorder within same chapter - use global serialization
        const updatedCourse = reorderModulesInChapter(
          course,
          sourceChapter.id,
          sourceIndex,
          destinationIndex
        );

        // Build module orders array for v2 API with global serials
        const moduleOrders: Array<{
          module_id: number;
          chapter_id: number;
          serial: number;
        }> = [];

        (updatedCourse.chapters || []).forEach((chapter) => {
          (chapter.modules || []).forEach((module) => {
            moduleOrders.push({
              module_id: module.id,
              chapter_id: chapter.id,
              serial: module.serial, // This is now global serial
            });
          });
        });

        // Use v2 reorder API
        reorderModules.mutate(moduleOrders, {
          onSuccess: async () => {
            // Immediately refetch course data to get updated module order
            await queryClient.refetchQueries({
              queryKey: ["course", courseId, "full-enhanced"],
            });
            await queryClient.refetchQueries({
              queryKey: ["course", courseId, "full"],
            });
            // Invalidate all module queries since order changed
            queryClient.invalidateQueries({
              queryKey: ["module"],
            });
          },
        });
      } else if (sourceChapter && destinationChapter) {
        // Cross-chapter move - use v2 API
        const updatedCourse = moveModuleBetweenChapters(
          course,
          activeModuleId,
          sourceChapter.id,
          destinationChapter.id,
          destinationIndex
        );

        // Build module orders for all chapters with global serials
        const moduleOrders: Array<{
          module_id: number;
          chapter_id: number;
          serial: number;
        }> = [];

        (updatedCourse.chapters || []).forEach((chapter) => {
          (chapter.modules || []).forEach((module) => {
            moduleOrders.push({
              module_id: module.id,
              chapter_id: chapter.id,
              serial: module.serial, // Already global serial from recalculateAllModuleSerials
            });
          });
        });

        // Use v2 reorder API
        reorderModules.mutate(moduleOrders, {
          onSuccess: async () => {
            // Immediately refetch course data to get updated module order
            await queryClient.refetchQueries({
              queryKey: ["course", courseId, "full-enhanced"],
            });
            await queryClient.refetchQueries({
              queryKey: ["course", courseId, "full"],
            });
            // Invalidate all module queries since order changed
            queryClient.invalidateQueries({
              queryKey: ["module"],
            });
          },
        });
      }
    }

    setActiveId(null);
  };

  // Handlers
  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      toast.error("Chapter title is required");
      return;
    }

    try {
      await createChapter.mutateAsync({
        title: newChapterTitle,
        serial_string: String((course?.chapters?.length || 0) + 1),
        is_free: newChapterIsFree,
        is_live: newChapterIsLive,
        chips_list: {},
      });

      setIsNewChapterDialogOpen(false);
      setNewChapterTitle("");
      setNewChapterIsFree(false);
      setNewChapterIsLive(false);
      toast.success("Chapter created successfully");
    } catch (error) {
      toast.error("Failed to create chapter");
    }
  };

  // Note: handleAddModule is now handled by opening the module editor
  // The old dialog-based flow is replaced with the module editor modal
  // Keeping this for backward compatibility if needed
  const handleAddModule = async () => {
    // This is now handled by the module editor
    // Keeping the function for now but it's not used
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this chapter? All modules in this chapter will also be deleted."
      )
    ) {
      return;
    }

    try {
      await deleteChapter.mutateAsync(chapterId);
      toast.success("Chapter deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chapter");
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }

    try {
      await deleteModule.mutateAsync(moduleId);
      toast.success("Module deleted successfully");
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleExportCourse = async () => {
    try {
      const data = await exportCourse.mutateAsync({
        courseId,
        options: {
          format: "json",
          include_content: true,
          include_quiz_answers: false,
        },
      });

      // Download as file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `course_${courseId}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Course exported successfully");
    } catch (error) {
      toast.error("Failed to export course");
    }
  };

  const handleImportCourse = async (file: File) => {
    try {
      const result = await importCourse.mutateAsync({
        file,
        options: {
          format: file.name.endsWith(".csv") ? "csv" : "json",
          import_mode: "create",
          validate_only: false,
        },
      });
      setImportId(result.import_id);
      setIsImportDialogOpen(false);
      toast.success("Import started. Checking status...");
    } catch (error) {
      toast.error("Failed to start import");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error || !course) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load course";
    const normalizedError = errorMessage.toLowerCase();

    // Check if it's a "not found" error
    const isNotFound =
      normalizedError.includes("not found") || normalizedError.includes("404");

    return (
      <PageContainer className="py-6">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-lg border border-destructive/30 bg-destructive/5 p-8">
            <div className="flex flex-col items-center text-center gap-3">
              {isNotFound ? (
                <AlertCircle className="h-10 w-10 text-destructive" />
              ) : (
                <ShieldX className="h-10 w-10 text-destructive" />
              )}
              <h2 className="text-2xl font-bold">
                {isNotFound ? "Course Not Found" : "Access Blocked"}
              </h2>
              <p className="text-muted-foreground">
                {isNotFound
                  ? "This course does not exist or may have been removed."
                  : "You do not have permission to open this course."}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = isNotFound
                      ? "/courses"
                      : "/course-access")
                  }
                >
                  {isNotFound ? "Back to Courses" : "Open Course Access"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6 max-w-[1440px]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Header / workspace command bar */}
        <CourseHeader
          course={course}
          onExport={handleExportCourse}
          onImport={() => setIsImportDialogOpen(true)}
          onSerialize={() => setIsSerializerOpen(true)}
          saveStatus={saveStatus}
        />

        {/* Content section */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Course content
              </h2>
              <p className="text-sm text-muted-foreground">
                {(course.chapters?.length || 0) === 0
                  ? "Build your curriculum by adding chapters and modules."
                  : "Drag modules to reorder. Click a chapter to expand."}
              </p>
            </div>
            {(course.chapters?.length || 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewChapterDialogOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add chapter
              </Button>
            )}
          </div>

          {(course.chapters?.length || 0) === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No chapters yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Chapters group your modules into a structured curriculum. Add
                your first one to get started.
              </p>
              <Button
                className="mt-5"
                onClick={() => setIsNewChapterDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first chapter
              </Button>
            </div>
          ) : (
            <ChapterList
              chapters={course.chapters || []}
              courseId={course.id}
              onAddModule={(chapterId) => {
                setActiveChapterId(chapterId);
                // Open module editor for new module creation
                openModuleEditor(null);
                // Store chapterId in draft for module creation
                setDraft("chapterId", chapterId);
              }}
              onEditChapter={(chapterId) => {
                setEditingChapterId(chapterId);
                setIsEditChapterDialogOpen(true);
              }}
              onDeleteChapter={handleDeleteChapter}
              onDeleteModule={handleDeleteModule}
            />
          )}
        </section>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-2 rounded-lg border border-primary bg-card px-3 py-2 text-sm font-medium shadow-xl">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              Moving module…
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* New Chapter Dialog */}
      <Dialog
        open={isNewChapterDialogOpen}
        onOpenChange={setIsNewChapterDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chapter</DialogTitle>
            <DialogDescription>
              Add a new chapter to organize your course content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Enter chapter title"
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chapter-free"
                checked={newChapterIsFree}
                onCheckedChange={(checked) =>
                  setNewChapterIsFree(checked === true)
                }
              />
              <Label htmlFor="chapter-free" className="cursor-pointer">
                Free Chapter
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="chapter-live"
                checked={newChapterIsLive}
                onCheckedChange={(checked) =>
                  setNewChapterIsLive(checked === true)
                }
              />
              <Label htmlFor="chapter-live" className="cursor-pointer">
                Publish
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewChapterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
            >
              Create Chapter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Chapter Dialog */}
      <Dialog
        open={isEditChapterDialogOpen}
        onOpenChange={(open) => {
          setIsEditChapterDialogOpen(open);
          if (!open) {
            setEditingChapterId(null);
            setEditChapterTitle("");
            setEditChapterIsFree(false);
            setEditChapterIsLive(false);
            setEditChapterSerial(1);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Update chapter details and settings.
            </DialogDescription>
          </DialogHeader>
          {editingChapter ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-chapter-title">Chapter Title</Label>
                <Input
                  id="edit-chapter-title"
                  value={editChapterTitle}
                  onChange={(e) => setEditChapterTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-chapter-serial">Chapter Number</Label>
                <Input
                  id="edit-chapter-serial"
                  type="number"
                  min="1"
                  value={editChapterSerial}
                  onChange={(e) =>
                    setEditChapterSerial(parseInt(e.target.value) || 1)
                  }
                  placeholder="Enter chapter number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-chapter-free"
                  checked={editChapterIsFree}
                  onCheckedChange={(checked) =>
                    setEditChapterIsFree(checked === true)
                  }
                />
                <Label htmlFor="edit-chapter-free" className="cursor-pointer">
                  Free Chapter
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-chapter-live"
                  checked={editChapterIsLive}
                  onCheckedChange={(checked) =>
                    setEditChapterIsLive(checked === true)
                  }
                />
                <Label htmlFor="edit-chapter-live" className="cursor-pointer">
                  Publish
                </Label>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Loading chapter...
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditChapterDialogOpen(false);
                setEditingChapterId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editingChapterId || !editChapterTitle.trim()) return;
                updateChapter.mutate(
                  {
                    title: editChapterTitle,
                    serial: editChapterSerial,
                    is_free: editChapterIsFree,
                    is_live: editChapterIsLive,
                  },
                  {
                    onSuccess: () => {
                      setIsEditChapterDialogOpen(false);
                      setEditingChapterId(null);
                      setEditChapterTitle("");
                      setEditChapterIsFree(false);
                      setEditChapterIsLive(false);
                      setEditChapterSerial(1);
                    },
                  }
                );
              }}
              disabled={
                !editChapterTitle.trim() ||
                updateChapter.isPending ||
                !editingChapter
              }
            >
              {updateChapter.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Module Dialog - Replaced by ModuleEditor modal */}
      {/* Keeping state for now but dialog is handled by ModuleEditor */}

      {/* Module Editor Modal */}
      <ModuleEditor />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportCourse}
        importId={importId}
        courseId={courseId}
      />

      {/* Module Serializer Modal */}
      <ModuleSerializerModal
        courseId={courseId}
        isOpen={isSerializerOpen}
        onClose={() => setIsSerializerOpen(false)}
      />
    </PageContainer>
  );
}
