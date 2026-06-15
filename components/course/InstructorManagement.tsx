"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Edit, Trash2, Undo2 } from "lucide-react";
import Image from "next/image";
import type { Instructor } from "@/types/course.types";

interface InstructorManagementProps {
  instructors: Instructor[];
  onInstructorsChange: (instructors: Instructor[]) => void;
}

export function InstructorManagement({
  instructors,
  onInstructorsChange,
}: InstructorManagementProps) {
  const [newInstructor, setNewInstructor] = useState<Instructor>({
    name: "",
    credibility: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [removedInstructorStack, setRemovedInstructorStack] = useState<
    Array<{ instructor: Instructor; index: number }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>(
    {}
  );

  const handleAddInstructor = () => {
    if (!newInstructor.name.trim()) {
      return;
    }
    onInstructorsChange([...instructors, newInstructor]);
    setNewInstructor({ name: "", credibility: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteInstructor = (index: number) => {
    setRemovedInstructorStack((prev) => [
      ...prev,
      { instructor: instructors[index], index },
    ]);
    const updated = instructors.filter((_, i) => i !== index);
    onInstructorsChange(updated);
  };

  const handleUndoDeleteInstructor = () => {
    const last = removedInstructorStack[removedInstructorStack.length - 1];
    if (!last) return;
    const next = [...instructors];
    const insertAt = Math.min(last.index, next.length);
    next.splice(insertAt, 0, last.instructor);
    onInstructorsChange(next);
    setRemovedInstructorStack((prev) => prev.slice(0, -1));
  };

  const handleEditInstructor = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdateInstructor = (index: number) => {
    setEditingIndex(null);
  };

  const handleImageChange = (file: File) => {
    const previewLink = URL.createObjectURL(file);
    setNewInstructor({
      ...newInstructor,
      image: file,
      imagePreviewLink: previewLink,
    });
  };

  const handleEditImageChange = (index: number, file: File) => {
    const previewLink = URL.createObjectURL(file);
    const updated = instructors.map((instructor, i) =>
      i === index
        ? { ...instructor, image: file, imagePreviewLink: previewLink }
        : instructor
    );
    onInstructorsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add New Instructor Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructor-name">Instructor Name</Label>
              <Input
                id="instructor-name"
                value={newInstructor.name}
                onChange={(e) =>
                  setNewInstructor({ ...newInstructor, name: e.target.value })
                }
                placeholder="Enter instructor name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor-image">Instructor Image</Label>
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
              {newInstructor.imagePreviewLink &&
                typeof newInstructor.imagePreviewLink === "string" &&
                newInstructor.imagePreviewLink.trim() && (
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                    <Image
                      src={newInstructor.imagePreviewLink}
                      alt="Instructor preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor-credibility">Credibility</Label>
              <Textarea
                id="instructor-credibility"
                value={newInstructor.credibility}
                onChange={(e) =>
                  setNewInstructor({
                    ...newInstructor,
                    credibility: e.target.value,
                  })
                }
                placeholder="Enter instructor credibility"
                rows={3}
              />
            </div>

            <Button type="button" onClick={handleAddInstructor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Instructor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructors List */}
      {instructors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Instructors List</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndoDeleteInstructor}
              disabled={removedInstructorStack.length === 0}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          </div>
          {instructors.map((instructor, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                {editingIndex === index ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={instructor.name}
                        onChange={(e) => {
                          const updated = instructors.map((inst, i) =>
                            i === index
                              ? { ...inst, name: e.target.value }
                              : inst
                          );
                          onInstructorsChange(updated);
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
                          getImageSrc(instructor.imagePreviewLink) ||
                          getImageSrc(instructor.imageUploadedLink) ||
                          null;
                        return imageSrc ? (
                          <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                            <Image
                              src={imageSrc}
                              alt="Instructor"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="space-y-2">
                      <Label>Credibility</Label>
                      <Textarea
                        value={instructor.credibility}
                        onChange={(e) => {
                          const updated = instructors.map((inst, i) =>
                            i === index
                              ? { ...inst, credibility: e.target.value }
                              : inst
                          );
                          onInstructorsChange(updated);
                        }}
                        rows={3}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleUpdateInstructor(index)}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Name:</h4>
                      <p className="text-muted-foreground">{instructor.name}</p>
                    </div>

                    {(() => {
                      const getImageSrc = (url: string | undefined | null) => {
                        if (!url || typeof url !== "string") return null;
                        const trimmed = url.trim();
                        return trimmed ? trimmed : null;
                      };
                      const imageSrc =
                        getImageSrc(instructor.imagePreviewLink) ||
                        getImageSrc(instructor.imageUploadedLink) ||
                        null;
                      return imageSrc ? (
                        <div>
                          <h4 className="font-semibold mb-2">Image:</h4>
                          <div className="relative w-32 h-40 rounded-lg overflow-hidden border">
                            <Image
                              src={imageSrc}
                              alt={instructor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div>
                      <h4 className="font-semibold">Credibility:</h4>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {instructor.credibility}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEditInstructor(index)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDeleteInstructor(index)}
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
