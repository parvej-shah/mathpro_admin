"use client";

import { useState } from "react";
import { uploadImageToS3 } from "@/lib/s3-upload";
import { toast } from "sonner";

export function useRoutineImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): void => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file");
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file
      validateFile(file);

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `routines/${timestamp}_${file.name}`;

      // Upload to S3 - the uploadImageToS3 function will use the file name
      // We need to create a new File with the desired path
      const renamedFile = new File([file], fileName, {
        type: file.type,
        lastModified: file.lastModified,
      });

      const imageUrl = await uploadImageToS3(renamedFile, {
        purpose: "routine-image",
        onProgress: (progressPercent) => {
          setProgress(progressPercent);
        },
      });

      setProgress(100);
      return imageUrl;
    } catch (err) {
      let errorMessage = "Upload failed";

      if (err instanceof Error) {
        if (err.message.includes("valid image file")) {
          errorMessage = err.message;
        } else if (err.message.includes("10MB limit")) {
          errorMessage = err.message;
        } else if (err.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.message.includes("configuration")) {
          errorMessage = "Upload configuration error. Please contact support.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    progress,
    error,
  };
}
