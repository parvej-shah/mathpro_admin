"use client";

import { BaseModuleForm } from "./BaseModuleForm";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUpdateModule,
  useCreateModule,
  useUpdateModuleEnhanced,
} from "@/hooks/useModules";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { useCourseStore } from "@/lib/stores/course-store";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import type { Module, ModuleCategory } from "@/types";

interface PDFModuleFormProps {
  module?: Module | null;
}

/**
 * PDF Module Form
 * Enhanced with dual upload options: S3 or Google Drive
 */
export function PDFModuleForm({ module }: PDFModuleFormProps) {
  const params = useParams();
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const { closeModuleEditor, editingModuleId, draftChanges } = useCourseStore();

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

  // Handle both string (JSON) and object formats for module data
  const getModuleData = (): Record<string, unknown> => {
    if (!module?.data) return {};
    if (typeof module.data === "string") {
      try {
        return JSON.parse(module.data);
      } catch {
        return {};
      }
    }
    return (module.data as Record<string, unknown>) || {};
  };

  // Track module ID to detect when we're editing a different module
  const moduleIdRef = useRef<number | null>(module?.id || null);

  const moduleData = getModuleData();

  // Check for pdf_drive_link (Google Drive), pdf_link (S3), or pdf_url (legacy)
  // Priority: pdf_drive_link > pdf_link > pdf_url
  const [pdfUrl, setPdfUrl] = useState<string>(() => {
    const data = getModuleData();
    return (
      (data.pdf_drive_link as string) ||
      (data.pdf_link as string) ||
      (data.pdf_url as string) ||
      ""
    );
  });
  const [pdfSource, setPdfSource] = useState<"s3" | "drive">(() => {
    const data = getModuleData();
    // If pdf_drive_link exists, it's Drive; otherwise check for pdf_link (S3) or default to S3
    return (data.pdf_drive_link ? "drive" : "s3") as "s3" | "drive";
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Update state when module changes (including when switching between modules)
  useEffect(() => {
    const currentModuleId = module?.id || null;
    const data = getModuleData();

    // If module ID changed, reset all form state
    if (currentModuleId !== moduleIdRef.current) {
      moduleIdRef.current = currentModuleId;

      // Reset all fields from new module (or empty if creating new)
      // Priority: pdf_drive_link > pdf_link > pdf_url
      const url =
        (data.pdf_drive_link as string) ||
        (data.pdf_link as string) ||
        (data.pdf_url as string) ||
        "";
      setPdfUrl(url);
      setPdfSource(data.pdf_drive_link ? "drive" : "s3");
      setPdfFile(null);
      setIsUploadingPdf(false);
    } else if (module) {
      // Same module, but data might have updated - sync state
      // Priority: pdf_drive_link > pdf_link > pdf_url
      const url =
        (data.pdf_drive_link as string) ||
        (data.pdf_link as string) ||
        (data.pdf_url as string) ||
        "";
      setPdfUrl(url);
      setPdfSource(data.pdf_drive_link ? "drive" : "s3");
    }
  }, [module]);

  const handleSubmit = async (data: Partial<Module>) => {
    try {
      // Handle PDF upload if file selected
      let finalPdfUrl = pdfUrl;
      if (pdfFile && pdfSource === "s3") {
        setIsUploadingPdf(true);
        try {
          finalPdfUrl = await uploadImageToS3(pdfFile, {
            purpose: "module-pdf",
          });
          setPdfUrl(finalPdfUrl);
        } catch (error) {
          toast.error("Failed to upload PDF");
          setIsUploadingPdf(false);
          return;
        } finally {
          setIsUploadingPdf(false);
        }
      }

      // Get category from draft (allows type changes)
      const category =
        (draftChanges.moduleType as ModuleCategory) ||
        module?.category ||
        "PDF";

      // OLD PATTERN (required for student frontend compatibility)
      const moduleDataPayload: Record<string, unknown> = {
        answer: "",
        options: [],
        category: category,
      };

      // NEW FIELDS (append after old pattern)
      // Add PDF link based on source - use pdf_link for S3 (old pattern), pdf_drive_link for Drive (new field)
      if (finalPdfUrl) {
        if (pdfSource === "drive") {
          moduleDataPayload.pdf_drive_link = finalPdfUrl; // NEW FIELD for Google Drive
        } else {
          // For S3, use pdf_link (OLD PATTERN - required for student frontend)
          moduleDataPayload.pdf_link = finalPdfUrl;
        }
      }

      if (editingModuleId && module) {
        // Use v2 enhanced API for updates
        // data.description comes from BaseModuleForm
        await updateModuleEnhanced.mutateAsync({
          ...data,
          category: category as ModuleCategory,
          data: moduleDataPayload,
        });
        closeModuleEditor();
        toast.success("PDF module saved successfully");
      } else if (chapterId) {
        // Use legacy API for creates
        // data.description comes from BaseModuleForm
        await createModule.mutateAsync({
          title: data.title || "Untitled PDF Module",
          description: data.description || "",
          category: category as ModuleCategory,
          serial: 1,
          score: data.score || 0,
          is_live: data.is_live || false,
          is_free: data.is_free || false,
          data: moduleDataPayload,
        });
        closeModuleEditor();
        useCourseStore.getState().clearDraft();
        toast.success("PDF module created successfully");
      } else {
        toast.error("Chapter ID is required");
      }
    } catch (error) {
      toast.error("Failed to save PDF module");
    }
  };

  return (
    <BaseModuleForm
      module={module}
      onSubmit={handleSubmit}
      onCancel={closeModuleEditor}
    >
      <div className="space-y-4">
        {/* PDF Source Selection */}
        <div className="space-y-2">
          <Label>PDF Source</Label>
          <Select
            value={pdfSource}
            onValueChange={(v) => setPdfSource(v as "s3" | "drive")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="s3">Upload to S3</SelectItem>
              <SelectItem value="drive">Google Drive Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PDF Input based on source */}
        {pdfSource === "s3" ? (
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Upload PDF to S3</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPdfFile(file);
                }
              }}
              disabled={isUploadingPdf}
            />
            {pdfFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {pdfFile.name} (
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {pdfUrl && pdfSource === "s3" && (
              <p className="text-sm text-muted-foreground">
                Current PDF:{" "}
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View PDF
                </a>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="pdf-drive-link">Google Drive Public Link *</Label>
            <Input
              id="pdf-drive-link"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Paste Google Drive public link here"
              required
            />
            <p className="text-xs text-muted-foreground">
              Make sure the Google Drive file is set to "Anyone with the link
              can view"
            </p>
          </div>
        )}
      </div>
    </BaseModuleForm>
  );
}
