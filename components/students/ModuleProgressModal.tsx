"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faX,
  faCheckCircle,
  faCircle,
  faVideo,
  faQuestionCircle,
  faFileAlt,
  faBook,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Module {
  moduleId: number;
  moduleName: string;
  moduleType: string;
  completed: boolean;
  point?: number | null;
  moduleMaxScore?: number | null;
  [key: string]: unknown;
}

interface Chapter {
  chapter_id: number;
  chapter_name: string;
  completed_modules: number;
  total_modules_assigned: number;
  completion_percentage: string;
  modules: Module[];
}

interface ModuleProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  courseId: number;
}

const getModuleIcon = (type: string) => {
  // Normalize the type string (uppercase, trim)
  const normalizedType = String(type || "")
    .toUpperCase()
    .trim();

  switch (normalizedType) {
    case "VIDEO":
      return faVideo;
    case "QUIZ":
      return faQuestionCircle;
    case "SLIDE":
    case "SLIDES":
      return faFileAlt; // Use file icon for slides
    case "LECTURE":
      return faVideo; // Use video icon for lectures
    default:
      return faBook;
  }
};

// Helper function to determine module type from module name
// This function prioritizes the module name over the API type field
// since the API might return incorrect types
const inferModuleType = (moduleName: string, apiType: string): string => {
  const name = String(moduleName || "").toLowerCase();
  const apiTypeUpper = String(apiType || "")
    .toUpperCase()
    .trim();

  // Check module name first - it's more reliable
  // Check for slides/presentations (highest priority for common issue)
  if (
    name.startsWith("slide:") ||
    name.includes("slide:") ||
    name.includes("slides:") ||
    name.includes("presentation") ||
    (name.includes("slide") && !name.includes("video"))
  ) {
    return "SLIDE";
  }

  // Check for quiz/test/exam
  if (
    name.includes("quiz") ||
    name.includes("test") ||
    name.includes("exam") ||
    name.includes("assessment")
  ) {
    return "QUIZ";
  }

  // Check for lecture/video
  if (
    name.includes("lecture") ||
    (name.includes("video") && !name.includes("slide"))
  ) {
    return "VIDEO";
  }

  // If API type is provided and doesn't seem wrong, use it
  // But if it's always "VIDEO" and name suggests otherwise, trust the name
  if (apiTypeUpper && apiTypeUpper !== "VIDEO") {
    return apiTypeUpper;
  }

  // Default fallback to VIDEO only if name doesn't suggest otherwise
  return "VIDEO";
};

export function ModuleProgressModal({
  open,
  onOpenChange,
  studentId,
  courseId,
}: ModuleProgressModalProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!open || !studentId || !courseId) {
      return;
    }

    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(
          API_ENDPOINTS.MODULES.USER_PROGRESS(courseId, studentId)
        );

        const data = response.data?.data || [];

        // Process chapters to avoid duplicate modules
        const processedChapters: Chapter[] = data.map(
          (chapter: Chapter, idx: number) => {
            const completedModules = parseInt(
              String(chapter.completed_modules || 0)
            );

            // Use a Set to track unique module IDs to prevent duplicates
            const seenModuleIds = new Set<number>();
            const processedModules: Module[] = [];

            // Process modules and ensure uniqueness
            if (Array.isArray(chapter.modules)) {
              chapter.modules.forEach((module: Module, moduleIdx: number) => {
                const moduleId = module.moduleId || moduleIdx;

                // Only add if we haven't seen this module ID before
                if (!seenModuleIds.has(moduleId)) {
                  seenModuleIds.add(moduleId);

                  // Extract module name from various possible field names
                  const moduleName =
                    (module.moduleName as string) ||
                    (module.name as string) ||
                    (module.module_name as string) ||
                    (module.title as string) ||
                    "";

                  // Extract module type from various possible field names
                  const apiModuleType =
                    (module.moduleType as string) ||
                    (module.type as string) ||
                    (module.module_type as string) ||
                    (module.moduleTypeName as string) ||
                    "";

                  // Always infer from module name first, as API might return incorrect types
                  // This fixes the issue where all modules show as VIDEO
                  const moduleType = inferModuleType(moduleName, apiModuleType);

                  processedModules.push({
                    ...module,
                    moduleType: moduleType.toUpperCase().trim(),
                    moduleName: moduleName,
                    completed: moduleIdx < completedModules,
                  });
                }
              });
            }

            return {
              ...chapter,
              modules: processedModules,
              done: processedModules.every((m) => m.completed),
            };
          }
        );

        setChapters(processedChapters);
        if (processedChapters.length > 0) {
          setActiveChapterIndex(0);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [open, studentId, courseId]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setChapters([]);
      setActiveChapterIndex(null);
      setIsLoading(true);
    }
  }, [open]);

  // Calculate overall progress
  const overallProgress =
    chapters.length > 0
      ? (
          chapters.reduce(
            (sum, chapter) =>
              sum + parseFloat(chapter.completion_percentage || "0"),
            0
          ) / chapters.length
        ).toFixed(2)
      : "0";

  const totalCompletedModules = chapters.reduce(
    (sum, chapter) => sum + parseInt(String(chapter.completed_modules || 0)),
    0
  );

  const totalModules = chapters.reduce(
    (sum, chapter) =>
      sum + parseInt(String(chapter.total_modules_assigned || 0)),
    0
  );

  const activeChapter =
    activeChapterIndex !== null ? chapters[activeChapterIndex] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-6xl flex-col overflow-hidden border-primary/20 p-0">
        <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-primary via-primary/90 to-indigo-500 px-6 pb-4 pt-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faSchool} className="h-6 w-6" />
              <DialogTitle className="text-2xl">Course Progress</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => onOpenChange(false)}
            >
              <FontAwesomeIcon icon={faX} className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="shrink-0 border-b bg-gradient-to-r from-muted/50 to-transparent px-6 pb-4 pt-4">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {overallProgress}%
                </span>
              </div>
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-primary/20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 36 * (1 - parseFloat(overallProgress) / 100)
                  }`}
                  className="text-primary transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Overall Progress
              </p>
              <p className="text-xl font-semibold">
                {totalCompletedModules} / {totalModules} Modules
              </p>
              <p className="text-xs text-muted-foreground">
                Completed across all chapters
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="space-y-4 w-full max-w-md">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="max-h-[calc(90vh-280px)] w-full shrink-0 overflow-y-auto border-b bg-muted/20 md:w-80 md:border-b-0 md:border-r">
              <div className="p-3">
                {chapters.map((chapter, idx) => {
                  const isActive = activeChapterIndex === idx;
                  const completionPercent = parseFloat(
                    chapter.completion_percentage || "0"
                  );

                  return (
                    <button
                      key={chapter.chapter_id || idx}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={cn(
                        "mb-2 w-full rounded-xl border p-3 text-left transition-all",
                        isActive
                          ? "border-primary/30 bg-primary/10 shadow-sm"
                          : "border-transparent hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Chapter {idx + 1}
                        </span>
                        <Badge
                          variant={
                            completionPercent > 0 ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {chapter.completion_percentage}%
                        </Badge>
                      </div>
                      <p
                        className={cn(
                          "text-xs mb-2 line-clamp-2",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {chapter.chapter_name}
                      </p>
                      <Progress value={completionPercent} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {chapter.completed_modules} of{" "}
                        {chapter.total_modules_assigned} modules
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[calc(90vh-280px)]">
              <div className="p-6">
                {activeChapter ? (
                  <>
                    <div className="mb-4">
                      <h3 className="mb-2 text-xl font-bold">
                        {activeChapter.chapter_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {activeChapter.completed_modules} of{" "}
                          {activeChapter.total_modules_assigned} modules
                          completed
                        </p>
                        <Badge
                          variant={
                            parseFloat(
                              activeChapter.completion_percentage || "0"
                            ) > 0
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {activeChapter.completion_percentage}%
                        </Badge>
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="space-y-3">
                      {activeChapter.modules.map((module, moduleIdx) => {
                        const moduleType = String(module.moduleType || "")
                          .toUpperCase()
                          .trim();
                        const moduleIcon = getModuleIcon(moduleType);
                        const isQuiz = moduleType === "QUIZ";
                        const hasScore =
                          isQuiz &&
                          module.point !== null &&
                          module.point !== undefined;

                        return (
                          <div
                            key={module.moduleId || moduleIdx}
                            className="flex items-center justify-between rounded-xl border border-primary/10 bg-gradient-to-r from-background to-muted/20 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  module.completed
                                    ? "bg-success/15 text-success"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    module.completed ? faCheckCircle : faCircle
                                  }
                                  className="h-5 w-5"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    <FontAwesomeIcon
                                      icon={moduleIcon}
                                      className="h-3 w-3 mr-1"
                                    />
                                    {moduleType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Module {moduleIdx + 1}
                                  </span>
                                </div>
                                <p className="font-medium text-sm">
                                  {module.moduleName}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4">
                              {isQuiz && hasScore ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-info/15 text-info"
                                >
                                  {module.point} / {module.moduleMaxScore || 0}
                                </Badge>
                              ) : module.completed ? (
                                <Badge
                                  variant="default"
                                  className="bg-success hover:bg-success/90"
                                >
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Not Started</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Select a chapter to view modules
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
