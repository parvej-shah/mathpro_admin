"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Library, Loader2, Plus, Tag, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { useCreateBook, useUpdateBook } from "@/hooks/useBooks";
import type { Book, BookFormData } from "@/services/book.service";

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const initialState: BookFormData = {
  title: "",
  image_url: "",
  description: "",
  class_levels: [],
  tags: [],
  price: 0,
  is_active: true,
};

export function BookForm({ isOpen, onClose, book }: BookFormProps) {
  const [form, setForm] = useState<BookFormData>(initialState);
  const [classLevelInput, setClassLevelInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(book?.id);
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const submitting = createBook.isPending || updateBook.isPending || uploading;

  useEffect(() => {
    if (isOpen) {
      if (book) {
        setForm({
          title: book.title ?? "",
          image_url: book.image_url ?? "",
          description: book.description ?? "",
          class_levels: book.class_levels ?? [],
          tags: book.tags ?? [],
          price: book.price ?? 0,
          is_active: book.is_active ?? true,
        });
        setCoverPreview(book.image_url ?? "");
      } else {
        setForm(initialState);
        setCoverPreview("");
      }
      setCoverFile(null);
      setClassLevelInput("");
      setTagInput("");
      setError(null);
    }
  }, [isOpen, book]);

  const update = <K extends keyof BookFormData>(
    key: K,
    value: BookFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCoverChange = (file: File | null) => {
    setCoverFile(file);
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addClassLevel = () => {
    const value = classLevelInput.trim();
    if (!value) return;
    if (!form.class_levels?.includes(value)) {
      update("class_levels", [...(form.class_levels ?? []), value]);
    }
    setClassLevelInput("");
  };

  const removeClassLevel = (value: string) => {
    update(
      "class_levels",
      (form.class_levels ?? []).filter((v) => v !== value)
    );
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (!form.tags?.includes(value)) {
      update("tags", [...(form.tags ?? []), value]);
    }
    setTagInput("");
  };

  const removeTag = (value: string) => {
    update("tags", (form.tags ?? []).filter((v) => v !== value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let imageUrl = form.image_url ?? "";
    if (coverFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImageToS3(coverFile, { purpose: "book-cover" });
      } catch (err) {
        setUploading(false);
        setError(
          err instanceof Error ? err.message : "Failed to upload cover image"
        );
        return;
      }
      setUploading(false);
    }

    const payload: BookFormData = {
      ...form,
      image_url: imageUrl,
    };

    try {
      if (isEdit && book) {
        await updateBook.mutateAsync({ id: book.id, data: payload });
      } else {
        await createBook.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Library className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isEdit ? "Edit book" : "Add a new book"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isEdit
                    ? "Update this book's catalogue details."
                    : "Add a book to the catalogue so it can be attached to courses."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <Field label="Cover image" hint="2:3 portrait, converted to webp, max 200KB.">
                <label
                  className={cn(
                    "relative flex aspect-[2/3] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-border/70 bg-background/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {coverPreview ? (
                    <Image
                      src={coverPreview}
                      alt="Book cover preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-xs">Upload cover</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleCoverChange(e.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </Field>

              <div className="space-y-4">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Higher Math 1st Paper"
                    required
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
                <Field label="Price (৳)">
                  <Input
                    type="number"
                    min={0}
                    value={form.price || ""}
                    onChange={(e) =>
                      update("price", Number(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
              </div>
            </div>

            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="A short description of this book."
                rows={3}
                className="rounded-xl border-border/70 bg-background/60"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class levels" hint="Press Enter to add">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={classLevelInput}
                      onChange={(e) => setClassLevelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addClassLevel();
                        }
                      }}
                      placeholder="e.g. Class 9-10"
                      className="h-10 rounded-xl border-border/70 bg-background/60"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addClassLevel}
                      className="h-10 w-10 shrink-0 rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.class_levels ?? []).map((level) => (
                      <Chip key={level} onRemove={() => removeClassLevel(level)}>
                        {level}
                      </Chip>
                    ))}
                  </div>
                </div>
              </Field>

              <Field label="Tags" hint="Press Enter to add">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="e.g. Algebra"
                      className="h-10 rounded-xl border-border/70 bg-background/60"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                      className="h-10 w-10 shrink-0 rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(form.tags ?? []).map((tag) => (
                      <Chip key={tag} onRemove={() => removeTag(tag)}>
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive books are hidden from students and courses.
                </p>
              </div>
              <Switch
                checked={form.is_active ?? true}
                onCheckedChange={(v) => update("is_active", v)}
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-6 font-semibold shadow-sm shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add book"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-muted hover:text-foreground"
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}
