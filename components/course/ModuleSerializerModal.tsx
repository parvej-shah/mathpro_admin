"use client";

import { useState, useEffect, useMemo } from "react";
import { useCourseFullEnhanced, useUpdateCourseFull } from "@/hooks/useCourse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Save } from "lucide-react";
import type { CourseWithChapters, Module } from "@/types";
import { toast } from "sonner";

interface ModuleSerializerModalProps {
  courseId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ModuleSerializerModal({
  courseId,
  isOpen,
  onClose,
}: ModuleSerializerModalProps) {
  // Data fetching
  const {
    data: courseData,
    isLoading,
    error,
  } = useCourseFullEnhanced(isOpen && courseId ? courseId : null);
  const updateCourseFull = useUpdateCourseFull(courseId);

  // State for serial numbers
  const [moduleSerials, setModuleSerials] = useState<Record<number, number>>(
    {}
  );

  // Initialize serials when course data loads
  useEffect(() => {
    if (courseData?.chapters) {
      const serials: Record<number, number> = {};
      courseData.chapters.forEach((chapter) => {
        chapter.modules?.forEach((module) => {
          serials[module.id] = module.serial;
        });
      });
      setModuleSerials(serials);
    }
  }, [courseData]);

  // Handle serial change
  const handleSerialChange = (moduleId: number, value: string) => {
    const newSerial = parseInt(value, 10);
    if (!isNaN(newSerial) && newSerial > 0) {
      setModuleSerials((prev) => ({
        ...prev,
        [moduleId]: newSerial,
      }));
    }
  };

  // Validate serials
  const validateSerials = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const serialValues = Object.values(moduleSerials);
    const duplicates = serialValues.filter(
      (serial, index) => serialValues.indexOf(serial) !== index
    );

    if (duplicates.length > 0) {
      errors.push(
        "Duplicate serial numbers found. Please ensure all serials are unique."
      );
    }

    const missing = Object.values(moduleSerials).some(
      (serial) => !serial || serial <= 0
    );
    if (missing) {
      errors.push(
        "All modules must have a valid serial number (greater than 0)."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Handle save
  const handleSave = async () => {
    const validation = validateSerials();
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    if (!courseData) return;

    try {
      // Prepare updated course data with new serials
      const updatedChapters = courseData.chapters.map((chapter) => ({
        ...chapter,
        modules: chapter.modules?.map((module) => ({
          ...module,
          serial: moduleSerials[module.id] || module.serial,
        })),
      }));

      const updatedCourse: CourseWithChapters = {
        ...courseData,
        chapters: updatedChapters,
      };

      await updateCourseFull.mutateAsync(updatedCourse);
      toast.success("Module serials updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update module serials");
    }
  };

  // Get total module count
  const totalModules = useMemo(() => {
    if (!courseData?.chapters) return 0;
    return courseData.chapters.reduce(
      (sum, chapter) => sum + (chapter.modules?.length || 0),
      0
    );
  }, [courseData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Module Serializer</DialogTitle>
          <DialogDescription>
            Update serial numbers for all modules in this course. Serials should
            be unique and sequential. Total modules: {totalModules}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load course data. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {courseData && !isLoading && (
          <div className="space-y-6">
            {courseData.chapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No chapters in this course yet.</p>
              </div>
            ) : (
              courseData.chapters.map((chapter, chapterIndex) => (
                <div key={chapter.id} className="space-y-2">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  {chapter.modules && chapter.modules.length > 0 ? (
                    <div className="space-y-2 pl-4">
                      {chapter.modules.map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <Label className="text-sm font-medium">
                              {module.title}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {module.category} • Current Serial:{" "}
                              {module.serial}
                            </p>
                          </div>
                          <div className="w-32 flex-shrink-0">
                            <Input
                              type="number"
                              min="1"
                              value={moduleSerials[module.id] ?? module.serial}
                              onChange={(e) =>
                                handleSerialChange(module.id, e.target.value)
                              }
                              className="text-center"
                              placeholder="Serial"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-4">
                      No modules in this chapter
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              updateCourseFull.isPending || isLoading || totalModules === 0
            }
          >
            {updateCourseFull.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Serials
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
