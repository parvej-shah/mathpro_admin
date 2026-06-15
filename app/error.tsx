"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isChunkLoadError =
    error?.name === "ChunkLoadError" ||
    (error?.message && String(error.message).includes("Loading chunk"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">
          {isChunkLoadError ? "Failed to load the application" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground">
          {isChunkLoadError
            ? "A required script failed to load. This can happen due to a slow connection or a new deployment. Try refreshing the page."
            : "An unexpected error occurred. You can try again."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => (isChunkLoadError ? window.location.reload() : reset())}
            className="min-w-[140px]"
          >
            {isChunkLoadError ? "Reload page" : "Try again"}
          </Button>
          {!isChunkLoadError && (
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
