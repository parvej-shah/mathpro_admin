"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Edit, Trash2, Undo2 } from "lucide-react";
import Image from "next/image";
import type { Feedback } from "@/types/course.types";

interface FeedbackManagementProps {
  feedbacks: Feedback[];
  onFeedbacksChange: (feedbacks: Feedback[]) => void;
}

export function FeedbackManagement({
  feedbacks,
  onFeedbacksChange,
}: FeedbackManagementProps) {
  const [newFeedback, setNewFeedback] = useState<Feedback>({
    name: "",
    bio: "",
    description: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [removedFeedbackStack, setRemovedFeedbackStack] = useState<
    Array<{ feedback: Feedback; index: number }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>(
    {}
  );

  const handleAddFeedback = () => {
    if (!newFeedback.name.trim() || !newFeedback.description.trim()) {
      return;
    }
    onFeedbacksChange([...feedbacks, newFeedback]);
    setNewFeedback({ name: "", bio: "", description: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteFeedback = (index: number) => {
    setRemovedFeedbackStack((prev) => [
      ...prev,
      { feedback: feedbacks[index], index },
    ]);
    const updated = feedbacks.filter((_, i) => i !== index);
    onFeedbacksChange(updated);
  };

  const handleUndoDeleteFeedback = () => {
    const last = removedFeedbackStack[removedFeedbackStack.length - 1];
    if (!last) return;
    const next = [...feedbacks];
    const insertAt = Math.min(last.index, next.length);
    next.splice(insertAt, 0, last.feedback);
    onFeedbacksChange(next);
    setRemovedFeedbackStack((prev) => prev.slice(0, -1));
  };

  const handleEditFeedback = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdateFeedback = (index: number) => {
    setEditingIndex(null);
  };

  const handleImageChange = (file: File) => {
    const previewLink = URL.createObjectURL(file);
    setNewFeedback({
      ...newFeedback,
      image: file,
      imagePreviewLink: previewLink,
    });
  };

  const handleEditImageChange = (index: number, file: File) => {
    const previewLink = URL.createObjectURL(file);
    const updated = feedbacks.map((feedback, i) =>
      i === index
        ? { ...feedback, image: file, imagePreviewLink: previewLink }
        : feedback
    );
    onFeedbacksChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add New Feedback Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-name">User Name</Label>
              <Input
                id="feedback-name"
                value={newFeedback.name}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, name: e.target.value })
                }
                placeholder="Enter user name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-bio">User Bio</Label>
              <Input
                id="feedback-bio"
                value={newFeedback.bio}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, bio: e.target.value })
                }
                placeholder="Enter user bio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-image">User Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageChange(file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Select Image
              </Button>
              {newFeedback.imagePreviewLink &&
                typeof newFeedback.imagePreviewLink === "string" &&
                newFeedback.imagePreviewLink.trim() && (
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                    <Image
                      src={newFeedback.imagePreviewLink}
                      alt="Feedback preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-description">Feedback Description</Label>
              <Textarea
                id="feedback-description"
                value={newFeedback.description}
                onChange={(e) =>
                  setNewFeedback({
                    ...newFeedback,
                    description: e.target.value,
                  })
                }
                placeholder="Enter feedback description"
                rows={4}
              />
            </div>

            <Button type="button" onClick={handleAddFeedback}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks List */}
      {feedbacks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Feedbacks List</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndoDeleteFeedback}
              disabled={removedFeedbackStack.length === 0}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          </div>
          {feedbacks.map((feedback, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={feedback.name}
                        onChange={(e) => {
                          const updated = feedbacks.map((fb, i) =>
                            i === index ? { ...fb, name: e.target.value } : fb
                          );
                          onFeedbacksChange(updated);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Input
                        value={feedback.bio}
                        onChange={(e) => {
                          const updated = feedbacks.map((fb, i) =>
                            i === index ? { ...fb, bio: e.target.value } : fb
                          );
                          onFeedbacksChange(updated);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Image</Label>
                      <input
                        ref={(el) => {
                          editFileInputRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditImageChange(index, file);
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          editFileInputRefs.current[index]?.click()
                        }
                      >
                        Change Image
                      </Button>
                      {(() => {
                        const getImageSrc = (
                          url: string | undefined | null
                        ) => {
                          if (!url || typeof url !== "string") return null;
                          const trimmed = url.trim();
                          return trimmed ? trimmed : null;
                        };
                        const imageSrc =
                          getImageSrc(feedback.imagePreviewLink) ||
                          getImageSrc(feedback.imageUploadedLink) ||
                          null;
                        return imageSrc ? (
                          <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                            <Image
                              src={imageSrc}
                              alt="Feedback"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={feedback.description}
                        onChange={(e) => {
                          const updated = feedbacks.map((fb, i) =>
                            i === index
                              ? { ...fb, description: e.target.value }
                              : fb
                          );
                          onFeedbacksChange(updated);
                        }}
                        rows={4}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleUpdateFeedback(index)}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Name:</h4>
                      <p className="text-muted-foreground">{feedback.name}</p>
                    </div>

                    {feedback.bio && (
                      <div>
                        <h4 className="font-semibold">Bio:</h4>
                        <p className="text-muted-foreground">{feedback.bio}</p>
                      </div>
                    )}

                    {(() => {
                      const getImageSrc = (url: string | undefined | null) => {
                        if (!url || typeof url !== "string") return null;
                        const trimmed = url.trim();
                        return trimmed ? trimmed : null;
                      };
                      const imageSrc =
                        getImageSrc(feedback.imagePreviewLink) ||
                        getImageSrc(feedback.imageUploadedLink) ||
                        null;
                      return imageSrc ? (
                        <div>
                          <h4 className="font-semibold mb-2">Image:</h4>
                          <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                            <Image
                              src={imageSrc}
                              alt={feedback.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div>
                      <h4 className="font-semibold">Description:</h4>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {feedback.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEditFeedback(index)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteFeedback(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
