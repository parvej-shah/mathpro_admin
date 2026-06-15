"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { MultiSelect } from "@/components/ui/multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { AssignCourseAccessData } from "@/types/course-access.types";
import type { User, Course } from "@/types";

interface AssignAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignCourseAccessData) => void;
  isSubmitting: boolean;
  adminUsers: User[];
  courses: Course[];
  isLoadingUsers?: boolean;
  isLoadingCourses?: boolean;
}

export function AssignAccessDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  adminUsers,
  courses,
  isLoadingUsers = false,
  isLoadingCourses = false,
}: AssignAccessDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const { handleSubmit, reset } = useForm<AssignCourseAccessData>();

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedUserIds([]);
      setSelectedCourseId("");
      setValidationError("");
    }
  }, [isOpen, reset]);

  const userOptions = useMemo(() => {
    return adminUsers.map((user) => ({
      label: `${user.name} (${user.email || user.phone || user.login})`,
      value: String(user.id),
    }));
  }, [adminUsers]);

  const courseOptions = useMemo(() => {
    return courses.map((course) => ({
      label: course.title,
      value: String(course.id),
    }));
  }, [courses]);

  const handleFormSubmit = handleSubmit(() => {
    setValidationError("");

    if (selectedUserIds.length === 0) {
      setValidationError("Please select at least one admin user");
      return;
    }

    if (!selectedCourseId) {
      setValidationError("Please select a course");
      return;
    }

    const courseId = parseInt(selectedCourseId, 10);

    if (isNaN(courseId)) {
      setValidationError("Invalid course selection");
      return;
    }

    // Submit for the first user - the parent will handle multiple assignments
    const userId = parseInt(selectedUserIds[0], 10);
    if (isNaN(userId)) {
      setValidationError("Invalid user selection");
      return;
    }

    // Pass all selected user IDs to parent for batch processing
    onSubmit({ 
      userId, 
      courseId,
      additionalUserIds: selectedUserIds.slice(1).map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Course Access</DialogTitle>
          <DialogDescription>
            Grant admin users access to manage a specific course
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Admin Users</Label>
            <MultiSelect
              options={userOptions}
              selected={selectedUserIds}
              onChange={setSelectedUserIds}
              placeholder="Select admin users..."
              searchPlaceholder="Search by name or email..."
              emptyText={
                isLoadingUsers
                  ? "Loading users..."
                  : "No admin users found."
              }
              disabled={isSubmitting || isLoadingUsers}
            />
            <p className="text-xs text-muted-foreground">
              Only admin users (type 1) can be assigned course access
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-select">Course</Label>
            <SearchableSelect
              options={courseOptions}
              value={selectedCourseId}
              onChange={setSelectedCourseId}
              placeholder="Select a course..."
              searchPlaceholder="Search courses..."
              emptyText={
                isLoadingCourses ? "Loading courses..." : "No courses found."
              }
              disabled={isSubmitting || isLoadingCourses}
            />
          </div>

          {validationError && (
            <Alert variant="destructive">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="h-4 w-4"
              />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
