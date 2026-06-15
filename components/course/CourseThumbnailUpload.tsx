"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface CourseThumbnailUploadProps {
  thumbnail: {
    image?: File;
    imagePreviewLink?: string;
    imageUploadedLink?: string;
  };
  onThumbnailChange: (thumbnail: {
    image?: File;
    imagePreviewLink?: string;
    imageUploadedLink?: string;
  }) => void;
}

export function CourseThumbnailUpload({
  thumbnail,
  onThumbnailChange,
}: CourseThumbnailUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewLink = URL.createObjectURL(file);
      onThumbnailChange({
        image: file,
        imagePreviewLink: previewLink,
        imageUploadedLink: undefined,
      });
    }
  };

  const handleRemove = () => {
    if (thumbnail.imagePreviewLink) {
      URL.revokeObjectURL(thumbnail.imagePreviewLink);
    }
    onThumbnailChange({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Thumbnail
        </Button>
        {thumbnail.imagePreviewLink &&
          typeof thumbnail.imagePreviewLink === "string" &&
          thumbnail.imagePreviewLink.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {thumbnail.imagePreviewLink &&
        typeof thumbnail.imagePreviewLink === "string" &&
        thumbnail.imagePreviewLink.trim() && (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <Image
                src={thumbnail.imagePreviewLink}
                alt="Course thumbnail preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

      {!thumbnail.imagePreviewLink && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No thumbnail uploaded</p>
        </div>
      )}
    </div>
  );
}
