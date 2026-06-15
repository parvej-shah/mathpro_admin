"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useCreateLiveClass,
  useUpdateLiveClass,
  useLiveClass,
} from "@/hooks/useLiveClasses";
import { useCourses } from "@/hooks/useAnnouncements";
import { useTeachersNames } from "@/hooks/useTeachers";
import { useLiveClassImageUpload } from "@/hooks/useLiveClassImageUpload";
import { LexicalEditor } from "@/components/announcements/LexicalEditor";
import { DateTimePicker } from "./DateTimePicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faGraduationCap,
  faUser,
  faVideo,
  faClock,
  faKey,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import type {
  CreateLiveClassData,
  UpdateLiveClassData,
} from "@/services/live-class.service";
import { sanitizeHtmlContent } from "@/lib/helpers";

interface Course {
  id: number;
  title: string;
}

// Teacher interface matches new API structure
interface Teacher {
  id: number;
  name: string;
  image?: string | null;
  // Legacy support
  profile?: {
    imageUploadedLink?: string;
  };
}

interface LiveClassFormProps {
  classId?: number | null;
  onSuccess?: () => void;
}

export function LiveClassForm({ classId, onSuccess }: LiveClassFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    meetingId: "",
    meetingPass: "",
    scheduledAt: null as Date | null,
    canJoin: true,
    courseId: null as number | null,
    teacherId: null as number | null,
    recordedMeetingLink: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: liveClassData } = useLiveClass(classId || null);
  const { data: coursesData } = useCourses();
  const { data: teachersData } = useTeachersNames(); // Use lightweight names API
  const createLiveClass = useCreateLiveClass();
  const updateLiveClass = useUpdateLiveClass();
  const { uploadImage, uploading: isUploading } = useLiveClassImageUpload();

  const courses: Course[] = (() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as Course[] | { data?: Course[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  // Extract teachers from new API response (list-names returns { id, name }[])
  const teachers: Teacher[] = (() => {
    if (!teachersData?.data) return [];
    const responseData = teachersData.data;
    if (Array.isArray(responseData)) {
      // New API format: Array<{ id: number; name: string }>
      return responseData.map((t) => ({ id: t.id, name: t.name }));
    }
    return [];
  })();

  // Load existing live class data for edit mode
  useEffect(() => {
    if (classId && liveClassData?.data) {
      const liveClass = Array.isArray(liveClassData.data)
        ? liveClassData.data[0]
        : null;
      if (liveClass) {
        setFormData({
          title: liveClass.title || "",
          description: liveClass.description || "",
          duration: liveClass.duration || "",
          meetingId: liveClass.meeting_id || "",
          meetingPass: liveClass.meeting_pass || "",
          scheduledAt: liveClass.scheduled_at
            ? new Date(liveClass.scheduled_at * 1000)
            : null,
          canJoin: liveClass.can_join ?? true,
          courseId: liveClass.course_id || null,
          teacherId: liveClass.teacher_id || null,
          recordedMeetingLink: liveClass.data?.recordedMeetingLink || "",
        });
        if (liveClass.thumbnail) {
          setThumbnailPreview(liveClass.thumbnail);
        }
      }
    } else if (!classId) {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        duration: "",
        meetingId: "",
        meetingPass: "",
        scheduledAt: null,
        canJoin: true,
        courseId: null,
        teacherId: null,
        recordedMeetingLink: "",
      });
      setThumbnailFile(null);
      setThumbnailPreview("");
    }
  }, [classId, liveClassData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof window === "undefined") return;
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.teacherId || !formData.scheduledAt) {
      return;
    }

    try {
      let thumbnailUrl = thumbnailPreview;

      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile);
      }

      // Sanitize description - remove empty HTML boilerplate from Lexical editor
      const sanitizedDescription = sanitizeHtmlContent(formData.description);

      const liveClassData: CreateLiveClassData = {
        title: formData.title,
        description: sanitizedDescription,
        thumbnail: thumbnailUrl || undefined,
        can_join: formData.canJoin,
        scheduled_at: Math.floor(formData.scheduledAt.getTime() / 1000),
        duration: formData.duration,
        meeting_id: formData.meetingId,
        meeting_pass: formData.meetingPass,
        teacher_id: formData.teacherId,
        data: formData.recordedMeetingLink
          ? { recordedMeetingLink: formData.recordedMeetingLink }
          : undefined,
      };

      if (classId) {
        await updateLiveClass.mutateAsync({
          id: classId,
          data: liveClassData as UpdateLiveClassData,
        });
      } else {
        await createLiveClass.mutateAsync({
          courseId: formData.courseId,
          data: liveClassData,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving live class:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Can Join Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="canJoin" className="text-base font-semibold">
            Students Can Join Class
          </Label>
          <Switch
            id="canJoin"
            checked={formData.canJoin}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, canJoin: checked })
            }
          />
        </div>

        <Separator />

        {/* Course Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="h-4 w-4 text-primary"
            />
            <Label className="text-base font-semibold">
              Select Course <span className="text-destructive">*</span>
            </Label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className={`cursor-pointer transition-all ${
                  formData.courseId === course.id
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  setFormData({ ...formData, courseId: course.id })
                }
              >
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{course.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Scheduled Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-primary" />
            <Label className="text-base font-semibold">
              Schedule Meeting Time <span className="text-destructive">*</span>
            </Label>
          </div>
          <DateTimePicker
            value={formData.scheduledAt}
            onChange={(date) => setFormData({ ...formData, scheduledAt: date })}
            required
          />
        </div>

        <Separator />

        {/* Thumbnail Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-primary" />
            <Label className="text-base font-semibold">Class Thumbnail</Label>
          </div>
          <div className="border-2 border-dashed rounded-lg p-8 text-center relative">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full max-w-md h-48 object-cover rounded-md mx-auto"
              />
            ) : (
              <p className="text-muted-foreground">
                Drop your thumbnail here or click to upload
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <Separator />

        {/* Teacher Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-primary" />
            <Label className="text-base font-semibold">
              Select Instructor <span className="text-destructive">*</span>
            </Label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {teachers.map((teacher) => (
              <Card
                key={teacher.id}
                className={`cursor-pointer transition-all ${
                  formData.teacherId === teacher.id
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  setFormData({ ...formData, teacherId: teacher.id })
                }
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={teacher.image || teacher.profile?.imageUploadedLink}
                      alt={teacher.name}
                    />
                    <AvatarFallback>
                      {teacher.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{teacher.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Class Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <Label>
            Class Description <span className="text-destructive">*</span>
          </Label>
          <LexicalEditor
            initialHtml={formData.description}
            onChange={(html) => setFormData({ ...formData, description: html })}
            onTextChange={() => {}}
            placeholder="Enter class description..."
          />
        </div>

        <Separator />

        {/* Meeting Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faVideo} className="h-4 w-4 text-primary" />
            <Label className="text-base font-semibold">Meeting Details</Label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., '50 Minutes', '1 Hour'"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingId">
                Meeting ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meetingId"
                value={formData.meetingId}
                onChange={(e) =>
                  setFormData({ ...formData, meetingId: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingPass">
                Meeting Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meetingPass"
                type="password"
                value={formData.meetingPass}
                onChange={(e) =>
                  setFormData({ ...formData, meetingPass: e.target.value })
                }
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordedLink">
                <FontAwesomeIcon icon={faLink} className="mr-2 h-4 w-4" />
                Recorded Meeting Link
              </Label>
              <Input
                id="recordedLink"
                value={formData.recordedMeetingLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recordedMeetingLink: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              isUploading ||
              createLiveClass.isPending ||
              updateLiveClass.isPending
            }
          >
            {isUploading ||
            createLiveClass.isPending ||
            updateLiveClass.isPending
              ? "Saving..."
              : classId
                ? "Save Changes"
                : "Create Live Class"}
          </Button>
        </div>
      </div>
    </form>
  );
}
