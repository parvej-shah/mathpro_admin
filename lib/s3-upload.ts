import apiClient from "@/lib/api";

export type UploadPurpose =
  | "teacher-image"
  | "routine-image"
  | "live-class-thumbnail"
  | "course-thumbnail"
  | "course-instructor-image"
  | "course-feedback-image"
  | "contest-thumbnail"
  | "announcement-attachment"
  | "assignment-document"
  | "module-pdf"
  | "module-video-attachment"
  | "module-code-file"
  | "course-import"
  | "book-cover";

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
    const presignedResponse = await apiClient.post<PresignedUploadResponse>(
      "/v2/admin/upload/presigned-url",
      {
        purpose: options.purpose,
        file_name: file.name,
        content_type: file.type,
        content_length: file.size,
      }
    );

    if (!presignedResponse.data.data) {
      throw new Error(presignedResponse.data.error || "Failed to prepare upload");
    }

    await putFileToPresignedUrl(
      presignedResponse.data.data.upload_url,
      file,
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
