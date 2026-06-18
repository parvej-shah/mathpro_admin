"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LexicalEditor } from "./LexicalEditor";
import {
  ArrowLeft,
  Megaphone,
  PencilLine,
  Send,
  BookOpen,
  Loader2,
} from "lucide-react";
import { sanitizeHtmlContent } from "@/lib/helpers";
import type {
  Announcement,
  CreateAnnouncementData,
} from "@/services/announcement.service";

interface Course {
  id: number;
  title: string;
}

interface AnnouncementFormProps {
  courses: Course[];
  announcement?: Announcement | null;
  onSubmit: (data: {
    courseId: number;
    announcementData: CreateAnnouncementData;
  }) => Promise<void>;
  onSend?: (announcementId: number) => Promise<void>;
  isSubmitting?: boolean;
  isSending?: boolean;
  /** Optional redirect after success; default goes back to /announcements */
  redirectTo?: string;
}

export function AnnouncementForm({
  courses,
  announcement,
  onSubmit,
  onSend,
  isSubmitting = false,
  isSending = false,
  redirectTo = "/announcements",
}: AnnouncementFormProps) {
  const router = useRouter();
  const isEdit = !!announcement;

  const [courseId, setCourseId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (announcement) {
      setCourseId(announcement.course_id?.toString() || "");
      setSubject(announcement.subject || "");
      setDescription(announcement.description || "");
    } else {
      setCourseId(courses.length > 0 ? courses[0].id.toString() : "");
      setSubject("");
      setDescription("");
    }
  }, [announcement, courses]);

  const sanitized = sanitizeHtmlContent(description);
  const subjectValid = subject.trim().length > 0;
  const descriptionValid = sanitized.length > 0;
  const courseValid = !!courseId;
  const isValid = courseValid && subjectValid && descriptionValid;

  const buildPayload = () => {
    return {
      courseId: parseInt(courseId, 10),
      announcementData: {
        subject: subject.trim(),
        description: sanitized,
        user_sender_type: 3,
        sent_methods: ["notification"],
      } as CreateAnnouncementData,
    };
  };

  const navigateBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(redirectTo);
    }
  };

  const handleSaveOnly = async () => {
    if (!isValid) return;
    await onSubmit(buildPayload());
  };

  const handleSaveAndSend = async () => {
    if (!isValid) return;
    await onSubmit(buildPayload());
    if (announcement?.id && onSend) {
      await onSend(announcement.id);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Page header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={navigateBack}
              className="h-9 w-9 rounded-full shrink-0"
              aria-label="Back to announcements"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  {isEdit ? (
                    <PencilLine className="h-3.5 w-3.5" />
                  ) : (
                    <Megaphone className="h-3.5 w-3.5" />
                  )}
                </span>
                <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                  {isEdit ? "Edit announcement" : "New announcement"}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {isEdit
                  ? "Update your message and resend to recipients."
                  : "Compose a clean, focused message for your audience."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={navigateBack}
              className="rounded-full hidden sm:inline-flex"
            >
              Cancel
            </Button>
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={!isValid || isSubmitting}
                onClick={handleSaveOnly}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSaveAndSend}
              disabled={!isValid || isSubmitting || isSending}
              className="rounded-full shadow-sm shadow-primary/20"
            >
              {isSubmitting || isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Save & send" : "Send now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveAndSend();
        }}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="p-5 sm:p-8 space-y-7">
            {/* Course */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Course
              </Label>
              {isEdit ? (
                <div className="flex items-center gap-2 px-3 h-11 rounded-xl border bg-muted/30 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {courses.find((c) => c.id === announcement?.course_id)?.title ||
                    "N/A"}
                </div>
              ) : (
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this announcement about?"
                className="h-12 text-base rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Message
              </Label>
              <div className="rounded-xl border bg-background focus-within:ring-1 focus-within:ring-ring transition-shadow overflow-hidden">
                <LexicalEditor
                  initialHtml={announcement?.description}
                  onChange={setDescription}
                  placeholder="Write your announcement…"
                />
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="px-5 sm:px-8 py-4 border-t bg-muted/20 rounded-b-2xl flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {isValid
                ? "Ready to send."
                : "Fill in subject and message."}
            </span>
            <span className="hidden sm:inline">
              {isEdit ? "Edits apply on send" : "Sends immediately"}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
