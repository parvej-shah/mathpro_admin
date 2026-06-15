"use client";

import { BaseModuleForm } from "./BaseModuleForm";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

interface VideoModuleFormProps {
  module?: Module | null;
}

/**
 * Video Module Form
 * Video URL, hosting selection, description, and optional PDF attachment
 */
export function VideoModuleForm({ module }: VideoModuleFormProps) {
  const params = useParams();
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const { closeModuleEditor, editingModuleId, draftChanges } = useCourseStore();

  const chapterId =
    module?.chapter_id || (draftChanges.chapterId as number) || 0;

  // Use v2 enhanced API for updates, legacy for creates (until v2 create is available)
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

  // Extract video data from module
  // Handle both string (JSON) and object formats
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

  const [videoHost, setVideoHost] = useState<string>(
    (moduleData.videoHost as string) || "Youtube"
  );
  const [videoUrl, setVideoUrl] = useState<string>(
    (moduleData.videoUrl as string) || ""
  );

  // NEW: Optional PDF attachment (S3 or Google Drive)
  const [pdfAttachment, setPdfAttachment] = useState<string>(
    (moduleData.pdf_drive_link as string) ||
      (moduleData.pdf_attachment as string) ||
      ""
  );
  const [pdfSource, setPdfSource] = useState<"s3" | "drive">(
    (moduleData.pdf_drive_link ? "drive" : "s3") as "s3" | "drive"
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Live-Class toggle (live overlay on a VIDEO module). Stored in flat module columns.
  const [isLiveClass, setIsLiveClass] = useState<boolean>(
    !!module?.live_status
  );
  const [liveStatus, setLiveStatus] = useState<"SCHEDULED" | "LIVE" | "ENDED">(
    (module?.live_status as "SCHEDULED" | "LIVE" | "ENDED") || "SCHEDULED"
  );
  const [liveMeetingId, setLiveMeetingId] = useState<string>(
    module?.live_meeting_id || ""
  );
  const [liveMeetingPass, setLiveMeetingPass] = useState<string>(
    module?.live_meeting_pass || ""
  );
  const [liveScheduledAt, setLiveScheduledAt] = useState<string>(
    module?.live_scheduled_at
      ? new Date(module.live_scheduled_at * 1000).toISOString().slice(0, 16)
      : ""
  );

  // Update state when module changes (including when switching between modules)
  useEffect(() => {
    const currentModuleId = module?.id || null;
    const data = getModuleData();

    // If module ID changed, reset all form state
    if (currentModuleId !== moduleIdRef.current) {
      moduleIdRef.current = currentModuleId;

      // Reset all fields from new module (or empty if creating new)
      setVideoHost((data.videoHost as string) || "Youtube");
      setVideoUrl((data.videoUrl as string) || "");
      setPdfAttachment(
        (data.pdf_drive_link as string) || (data.pdf_attachment as string) || ""
      );
      setPdfSource((data.pdf_drive_link ? "drive" : "s3") as "s3" | "drive");
      setPdfFile(null);
      setIsUploadingPdf(false);
      setIsLiveClass(!!module?.live_status);
      setLiveStatus(
        (module?.live_status as "SCHEDULED" | "LIVE" | "ENDED") || "SCHEDULED"
      );
      setLiveMeetingId(module?.live_meeting_id || "");
      setLiveMeetingPass(module?.live_meeting_pass || "");
      setLiveScheduledAt(
        module?.live_scheduled_at
          ? new Date(module.live_scheduled_at * 1000).toISOString().slice(0, 16)
          : ""
      );
    } else if (module) {
      // Same module, but data might have updated - sync state
      setVideoHost((data.videoHost as string) || "Youtube");
      setVideoUrl((data.videoUrl as string) || "");
      setPdfAttachment(
        (data.pdf_drive_link as string) || (data.pdf_attachment as string) || ""
      );
      setPdfSource((data.pdf_drive_link ? "drive" : "s3") as "s3" | "drive");
      setIsLiveClass(!!module.live_status);
      setLiveStatus(
        (module.live_status as "SCHEDULED" | "LIVE" | "ENDED") || "SCHEDULED"
      );
      setLiveMeetingId(module.live_meeting_id || "");
      setLiveMeetingPass(module.live_meeting_pass || "");
      setLiveScheduledAt(
        module.live_scheduled_at
          ? new Date(module.live_scheduled_at * 1000).toISOString().slice(0, 16)
          : ""
      );
    }
  }, [module]);

  const handleSubmit = async (data: Partial<Module>) => {
    try {
      // Handle PDF upload if file selected
      let pdfUrl = pdfAttachment;
      if (pdfFile && pdfSource === "s3") {
        setIsUploadingPdf(true);
        try {
          pdfUrl = await uploadImageToS3(pdfFile, {
            purpose: "module-video-attachment",
          });
          setPdfAttachment(pdfUrl);
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
        "VIDEO";

      // OLD PATTERN (required for student frontend compatibility)
      const moduleDataPayload: Record<string, unknown> = {
        answer: "",
        options: [],
        category: category,
        videoUrl: videoUrl,
        videoHost: videoHost,
      };

      // NEW FIELDS (append after old pattern)
      // Add PDF link based on source
      if (pdfUrl) {
        if (pdfSource === "drive") {
          moduleDataPayload.pdf_drive_link = pdfUrl;
        } else {
          // For S3, store in pdf_attachment (new field)
          moduleDataPayload.pdf_attachment = pdfUrl;
        }
      }

      if (editingModuleId && module) {
        // Use v2 enhanced API for updates
        // data.description comes from BaseModuleForm
        await updateModuleEnhanced.mutateAsync({
          ...data,
          category: category as ModuleCategory,
          data: moduleDataPayload,
          // Live-Class toggle: clear all live fields when toggled off
          live_status: isLiveClass ? liveStatus : null,
          live_meeting_id: isLiveClass ? liveMeetingId || null : null,
          live_meeting_pass: isLiveClass ? liveMeetingPass || null : null,
          live_scheduled_at:
            isLiveClass && liveScheduledAt && !isNaN(Date.parse(liveScheduledAt))
              ? Math.floor(new Date(liveScheduledAt).getTime() / 1000)
              : null,
        });
        closeModuleEditor();
        toast.success("Video module saved successfully");
      } else if (chapterId) {
        // Use legacy API for creates (until v2 create is available)
        // data.description comes from BaseModuleForm
        await createModule.mutateAsync({
          title: data.title || "Untitled Video Module",
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
        toast.success("Video module created successfully");
      } else {
        toast.error("Chapter ID is required");
      }
    } catch (error) {
      toast.error("Failed to save video module");
    }
  };

  return (
    <BaseModuleForm
      module={module}
      onSubmit={handleSubmit}
      onCancel={closeModuleEditor}
    >
      <div className="space-y-4">
        {/* Video Hosting */}
        <div className="space-y-2">
          <Label htmlFor="video-host">Video Hosting Site</Label>
          <Select value={videoHost} onValueChange={setVideoHost}>
            <SelectTrigger id="video-host">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Youtube">YouTube</SelectItem>
              <SelectItem value="BunnyCDN">BunnyCDN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Video URL */}
        <div className="space-y-2">
          <Label htmlFor="video-url">Video URL *</Label>
          <Input
            id="video-url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={
              videoHost === "Youtube"
                ? "https://www.youtube.com/embed/VIDEO_ID"
                : "Enter BunnyCDN video URL"
            }
            required
          />
        </div>

        {/* Note: Description is handled by BaseModuleForm with Lexical editor */}

        {/* Live Class toggle — live overlay on this video module */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="video-live-class"
              checked={isLiveClass}
              onCheckedChange={(checked) => setIsLiveClass(checked === true)}
            />
            <Label htmlFor="video-live-class" className="cursor-pointer">
              Live Class
            </Label>
          </div>
          {isLiveClass && (
            <div className="space-y-4 pl-6">
              <p className="text-sm text-muted-foreground">
                Shows zoom info while live and pins to the top. After class, set
                status to Ended and fill in the Video URL above — it then plays
                as a normal recording.
              </p>
              <div className="space-y-2">
                <Label htmlFor="live-status">Status</Label>
                <Select
                  value={liveStatus}
                  onValueChange={(v) =>
                    setLiveStatus(v as "SCHEDULED" | "LIVE" | "ENDED")
                  }
                >
                  <SelectTrigger id="live-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="ENDED">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="live-scheduled-at">Scheduled At</Label>
                <Input
                  id="live-scheduled-at"
                  type="datetime-local"
                  value={liveScheduledAt}
                  onChange={(e) => setLiveScheduledAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="live-meeting-id">Zoom Meeting ID</Label>
                <Input
                  id="live-meeting-id"
                  value={liveMeetingId}
                  onChange={(e) => setLiveMeetingId(e.target.value)}
                  placeholder="Zoom meeting ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="live-meeting-pass">Zoom Passcode</Label>
                <Input
                  id="live-meeting-pass"
                  value={liveMeetingPass}
                  onChange={(e) => setLiveMeetingPass(e.target.value)}
                  placeholder="Zoom passcode"
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Optional PDF Attachment */}
        <div className="space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label>Optional PDF Attachment</Label>
            <p className="text-sm text-muted-foreground">
              Attach a PDF that will be shown under the video
              (expandable/collapsible in user frontend)
            </p>

            {/* PDF Source Selection */}
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

            {/* PDF Input based on source */}
            {pdfSource === "s3" ? (
              <div key="pdf-source-s3" className="space-y-2">
                <Label htmlFor="pdf-upload">Upload PDF to S3</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPdfFile(file);
                      // Preview will be shown after upload
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
                {pdfAttachment && pdfSource === "s3" && (
                  <p className="text-sm text-muted-foreground">
                    Current PDF:{" "}
                    <a
                      href={pdfAttachment}
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
              <div key="pdf-source-drive" className="space-y-2">
                <Label htmlFor="pdf-drive-link">Google Drive Public Link</Label>
                <Input
                  id="pdf-drive-link"
                  value={pdfAttachment}
                  onChange={(e) => setPdfAttachment(e.target.value)}
                  placeholder="Paste Google Drive public link here"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the Google Drive file is set to "Anyone with the
                  link can view"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseModuleForm>
  );
}
