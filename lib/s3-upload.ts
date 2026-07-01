import apiClient from "@/lib/api";
import { convertImageToWebp } from "@/lib/image-conversion";

export type UploadPurpose =
  | "teacher-image"
  | "routine-image"
  | "live-class-thumbnail"
  | "course-thumbnail"
  | "course-thumbnail-card"
  | "course-thumbnail-banner"
  | "bundle-thumbnail-card"
  | "bundle-thumbnail-banner"
  | "course-instructor-image"
  | "course-feedback-image"
  | "contest-thumbnail"
  | "announcement-attachment"
  | "announcement-image"
  | "quiz-image"
  | "assignment-document"
  | "module-pdf"
  | "course-outline"
  | "module-video-attachment"
  | "module-code-file"
  | "course-import"
  | "book-cover";

// Mirrors the maxBytes side of Math_Pro_backend/util/uploadPolicies.js for the
// webp-only image purposes, so conversion can compress to fit before upload.
const WEBP_IMAGE_POLICIES: Partial<Record<UploadPurpose, { maxBytes: number; maxWidth: number }>> = {
  "teacher-image": { maxBytes: 200 * 1024, maxWidth: 800 },
  "routine-image": { maxBytes: 200 * 1024, maxWidth: 1600 },
  "live-class-thumbnail": { maxBytes: 200 * 1024, maxWidth: 1280 },
  "course-thumbnail-card": { maxBytes: 300 * 1024, maxWidth: 900 },
  "course-thumbnail-banner": { maxBytes: 250 * 1024, maxWidth: 1600 },
  "bundle-thumbnail-card": { maxBytes: 300 * 1024, maxWidth: 900 },
  "bundle-thumbnail-banner": { maxBytes: 250 * 1024, maxWidth: 1600 },
  "course-instructor-image": { maxBytes: 200 * 1024, maxWidth: 800 },
  "course-feedback-image": { maxBytes: 200 * 1024, maxWidth: 800 },
  "contest-thumbnail": { maxBytes: 200 * 1024, maxWidth: 1280 },
  "announcement-image": { maxBytes: 200 * 1024, maxWidth: 1280 },
  "quiz-image": { maxBytes: 200 * 1024, maxWidth: 1280 },
  "book-cover": { maxBytes: 200 * 1024, maxWidth: 800 },
};

interface UploadOptions {
  purpose: UploadPurpose;
  onProgress?: (progress: number) => void;
}

interface PresignedUploadResponse {
  success: boolean;
  data?: {
    upload_url: string;
    key: string;
    public_url: string;
    content_type: string;
  };
  error?: string;
}

interface DeleteUploadResponse {
  success: boolean;
  data?: {
    key: string;
  };
  error?: string;
}

async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const progressPercent = Math.round((event.loaded / event.total) * 100);
      onProgress(progressPercent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading file"));
    xhr.send(file);
  });
}

/**
 * Upload file with backend-issued presigned URL
 * @param file - File to upload
 * @param options - Upload options with required purpose
 * @returns Promise<string> - Public URL of uploaded file
 */
export async function uploadImageToS3(
  file: File,
  options: UploadOptions
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File upload can only be done on client side");
  }

  try {
    const webpPolicy = WEBP_IMAGE_POLICIES[options.purpose];
    const uploadFile = webpPolicy
      ? await convertImageToWebp(file, {
          maxWidth: webpPolicy.maxWidth,
          maxBytes: webpPolicy.maxBytes,
        })
      : file;

    const presignedResponse = await apiClient.post<PresignedUploadResponse>(
      "/v2/admin/upload/presigned-url",
      {
        purpose: options.purpose,
        file_name: uploadFile.name,
        content_type: uploadFile.type,
        content_length: uploadFile.size,
      }
    );

    if (!presignedResponse.data.data) {
      throw new Error(presignedResponse.data.error || "Failed to prepare upload");
    }

    await putFileToPresignedUrl(
      presignedResponse.data.data.upload_url,
      uploadFile,
      options.onProgress
    );

    return presignedResponse.data.data.public_url;
  } catch (error) {
    console.error("Presigned upload error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload file"
    );
  }
}

interface DeleteOptions {
  key?: string;
  publicUrl?: string;
}

export async function deleteStorageObject(options: DeleteOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("File deletion can only be done on client side");
  }

  try {
    const response = await apiClient.post<DeleteUploadResponse>(
      "/v2/admin/upload/delete",
      {
        key: options.key,
        public_url: options.publicUrl,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to delete file");
    }
  } catch (error) {
    console.error("Storage delete error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete file"
    );
  }
}
