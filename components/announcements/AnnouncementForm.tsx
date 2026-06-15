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
  Bell,
  Mail,
  Megaphone,
  PencilLine,
  Send,
  Users,
  GraduationCap,
  Globe2,
  BookOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

type Recipient = "3" | "2" | "-1";

const recipientOptions: Array<{
  value: Recipient;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "3", label: "Students", icon: GraduationCap },
  { value: "2", label: "Teachers", icon: Users },
  { value: "-1", label: "Everyone", icon: Globe2 },
];

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
  const [recipient, setRecipient] = useState<Recipient>("3");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);

  useEffect(() => {
    if (announcement) {
      setCourseId(announcement.course_id?.toString() || "");
      setSubject(announcement.subject || "");
      setDescription(announcement.description || "");
      setRecipient(
        (
          (announcement.user_sender_type ??
            announcement.user_type ??
            3) as number
        ).toString() as Recipient
      );
      setSendEmail(!!announcement.email_is_sent);
      setSendNotification(!!announcement.notification_is_sent);
    } else {
      setCourseId(courses.length > 0 ? courses[0].id.toString() : "");
      setSubject("");
      setDescription("");
      setRecipient("3");
      setSendEmail(false);
      setSendNotification(false);
    }
  }, [announcement, courses]);

  const sanitized = sanitizeHtmlContent(description);
  const subjectValid = subject.trim().length > 0;
  const descriptionValid = sanitized.length > 0;
  const courseValid = !!courseId;
  const channelsValid = sendEmail || sendNotification;
  const isValid = courseValid && subjectValid && descriptionValid && channelsValid;

  const buildPayload = () => {
    const methods: string[] = [];
    if (sendEmail) methods.push("email");
    if (sendNotification) methods.push("notification");
    return {
      courseId: parseInt(courseId, 10),
      announcementData: {
        subject: subject.trim(),
        description: sanitized,
        user_sender_type: parseInt(recipient, 10),
        sent_methods: methods,
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

            {/* Recipient segmented */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Send to
              </Label>
              <div className="inline-flex w-full rounded-xl border bg-muted/30 p-1">
                {recipientOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = recipient === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRecipient(opt.value)}
                      className={cn(
                        "flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery channels */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Channels
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <ChannelToggle
                  icon={Mail}
                  label="Email"
                  description="Send via email"
                  active={sendEmail}
                  onToggle={() => setSendEmail((v) => !v)}
                />
                <ChannelToggle
                  icon={Bell}
                  label="Push"
                  description="In-app notification"
                  active={sendNotification}
                  onToggle={() => setSendNotification((v) => !v)}
                />
              </div>
              {!channelsValid && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Pick at least one channel to deliver.
                </p>
              )}
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
                : "Fill in subject, message and at least one channel."}
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

function ChannelToggle({
  icon: Icon,
  label,
  description,
  active,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
        active
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : "hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
          active
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-none">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
      <span
        className={cn(
          "h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
          active
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {active && (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
