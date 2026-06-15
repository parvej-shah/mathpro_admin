"use client";

import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

interface GlobalLoaderProps {
  message?: string;
  type?: "compiling" | "building" | "fetching" | "saving";
}

export function GlobalLoader({
  message,
  type = "fetching",
}: GlobalLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string>("");

  // Check for React Query fetching/mutating
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    // Show loader if there's any fetching or mutating
    if (isFetching > 0 || isMutating > 0) {
      setIsVisible(true);
      if (isMutating > 0) {
        setDisplayMessage("Saving changes...");
      } else {
        setDisplayMessage("Fetching data...");
      }
    } else {
      setIsVisible(false);
    }
  }, [isFetching, isMutating]);

  // Show loader if message prop is provided
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setDisplayMessage(message);
    }
  }, [message]);

  if (!isVisible) return null;

  const getMessage = () => {
    if (message) return message;
    if (displayMessage) return displayMessage;
    switch (type) {
      case "compiling":
        return "Compiling...";
      case "building":
        return "Building...";
      case "saving":
        return "Saving changes...";
      case "fetching":
      default:
        return "Fetching data...";
    }
  };

  return (
    <>
      {/* Overlay to make page unclickable */}
      <div className="fixed inset-0 z-[9998] bg-transparent pointer-events-auto" />

      {/* Loader in top-right corner */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="flex items-center gap-3 bg-background border border-border rounded-lg shadow-lg px-4 py-3 pointer-events-auto">
          {/* Spinner */}
          <div className="relative flex-shrink-0">
            <div className="w-5 h-5 border-2 border-primary/20 rounded-full"></div>
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          {/* Message */}
          <p className="text-sm font-medium text-foreground whitespace-nowrap">
            {getMessage()}
          </p>
        </div>
      </div>
    </>
  );
}
