"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useLiveClass } from "@/hooks/useLiveClasses";
import { useCourse } from "@/hooks/useCourse";
import { useTeachersNames } from "@/hooks/useTeachers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faGraduationCap,
  faUser,
  faVideo,
  faClock,
  faCalendar,
  faKey,
  faLink,
  faCheckCircle,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import type { LiveClass } from "@/services/live-class.service";
import { isHtmlEmpty } from "@/lib/helpers";

interface LiveClassViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number | null;
  onEdit?: (classId: number) => void;
  onDelete?: (liveClass: LiveClass) => void;
}

function formatAMPM(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? "0" + minutes : String(minutes);
  return `${hours}:${minutesStr} ${ampm}`;
}

function isUpcoming(scheduledAt: number): boolean {
  return new Date(scheduledAt * 1000) > new Date();
}

export function LiveClassViewModal({
  open,
  onOpenChange,
  classId,
  onEdit,
  onDelete,
}: LiveClassViewModalProps) {
  const { data: liveClassData, isLoading } = useLiveClass(classId);
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");

  // Extract live class from response
  const liveClass: LiveClass | undefined = liveClassData?.data
    ? (Array.isArray(liveClassData.data)
        ? liveClassData.data[0]
        : liveClassData.data)
    : undefined;

  // Get course data
  const { data: courseData } = useCourse(
    liveClass?.course_id || null
  );

  // Get teacher data
  const { data: teachersData } = useTeachersNames();

  useEffect(() => {
    // Try to get course title from course data
    if (courseData) {
      // useCourse returns Course directly
      if (courseData.title) {
        setCourseTitle(courseData.title);
        return;
      }
    }
    // Fallback to course_title from live class if available
    if (liveClass && (liveClass as LiveClass & { course_title?: string }).course_title) {
      setCourseTitle((liveClass as LiveClass & { course_title?: string }).course_title || "");
    }
  }, [courseData, liveClass]);

  useEffect(() => {
    if (teachersData?.data && liveClass?.teacher_id) {
      const teachers = Array.isArray(teachersData.data)
        ? teachersData.data
        : [];
      const teacher = teachers.find((t) => t.id === liveClass.teacher_id);
      if (teacher?.name) {
        setTeacherName(teacher.name);
      }
    }
  }, [teachersData, liveClass]);

  if (!classId) return null;

  const scheduledDate = liveClass?.scheduled_at
    ? new Date(liveClass.scheduled_at * 1000)
    : null;
  const upcoming = liveClass?.scheduled_at
    ? isUpcoming(liveClass.scheduled_at)
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Live Class Details</DialogTitle>
          <DialogDescription>
            View live class information and meeting details
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !liveClass ? (
          <div className="py-8 text-center text-muted-foreground">
            Live class not found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(classId);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    onOpenChange(false);
                    onDelete(liveClass);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>

            {/* Thumbnail */}
            {liveClass.thumbnail && (
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={liveClass.thumbnail}
                  alt={liveClass.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">{liveClass.title}</h3>
                {liveClass.description && !isHtmlEmpty(liveClass.description) && (
                  <div
                    className="text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: liveClass.description }}
                  />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={upcoming ? "default" : "secondary"}
                  className={
                    upcoming
                      ? "bg-success hover:bg-success/90"
                      : "bg-gray-500"
                  }
                >
                  {upcoming ? "Upcoming" : "Past Class"}
                </Badge>
                <div className="flex items-center gap-2">
                  {liveClass.can_join ? (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="h-4 w-4 text-success"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      className="h-4 w-4 text-muted-foreground"
                    />
                  )}
                  <span className="text-sm">
                    {liveClass.can_join ? "Students Can Join" : "Students Cannot Join"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Course and Teacher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseTitle && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <span className="text-sm font-medium">Course:</span>
                    <p className="text-sm text-muted-foreground">{courseTitle}</p>
                  </div>
                </div>
              )}

              {teacherName && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <span className="text-sm font-medium">Instructor:</span>
                    <p className="text-sm text-muted-foreground">{teacherName}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Schedule Information */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="h-4 w-4 text-primary"
                />
                Schedule
              </h4>
              {scheduledDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <div>
                      <span className="text-sm font-medium">Date:</span>
                      <p className="text-sm text-muted-foreground">
                        {format(scheduledDate, "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <div>
                      <span className="text-sm font-medium">Time:</span>
                      <p className="text-sm text-muted-foreground">
                        {formatAMPM(liveClass.scheduled_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {liveClass.duration && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div>
                    <span className="text-sm font-medium">Duration:</span>
                    <p className="text-sm text-muted-foreground">
                      {liveClass.duration}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Meeting Details */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faVideo}
                  className="h-4 w-4 text-primary"
                />
                Meeting Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faVideo}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <div>
                      <span className="text-sm font-medium">Meeting ID:</span>
                      <p className="text-sm text-muted-foreground font-mono">
                        {liveClass.meeting_id}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <div>
                      <span className="text-sm font-medium">Password:</span>
                      <p className="text-sm text-muted-foreground font-mono">
                        {liveClass.meeting_pass}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {liveClass.data?.recordedMeetingLink && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLink}
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Recorded Meeting:</span>
                    <a
                      href={liveClass.data.recordedMeetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block truncate"
                    >
                      {liveClass.data.recordedMeetingLink}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

