"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateManualReviewData } from "@/services/testimonial.service";

interface Course {
  id: number | string;
  title: string;
}

interface ManualReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateManualReviewData) => void;
  courses: Course[];
  isSubmitting?: boolean;
}

const EMPTY_FORM = {
  course_id: "",
  display_name: "",
  rating: "5",
  comment: "",
  avatar_url: "",
};

export function ManualReviewDialog({
  isOpen,
  onClose,
  onSubmit,
  courses,
  isSubmitting = false,
}: ManualReviewDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(EMPTY_FORM);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.course_id || !formData.display_name.trim() || !formData.comment.trim()) {
      return;
    }

    onSubmit({
      course_id: formData.course_id,
      display_name: formData.display_name.trim(),
      rating: Number(formData.rating),
      comment: formData.comment.trim(),
      avatar_url: formData.avatar_url.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
          <DialogDescription>
            Create a review on behalf of a student. It will appear in the review library
            below, where you can feature it on the public site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Course *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, course_id: value }))}
            >
              <SelectTrigger id="course_id">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Student name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, display_name: e.target.value }))
              }
              placeholder="e.g., Rafiul Islam"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <Select
              value={formData.rating}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: value }))}
            >
              <SelectTrigger id="rating">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={String(rating)}>
                    {rating} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Review text *</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="What did the student say about this course?"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
