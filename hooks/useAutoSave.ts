import { useEffect, useRef } from "react";
import { useCourseStore } from "@/lib/stores/course-store";

/**
 * Auto-save hook
 * Debounces save operations to avoid excessive API calls
 */

interface UseAutoSaveOptions {
  onSave: () => Promise<void> | void;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave({
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const { setSaveStatus } = useCourseStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const triggerSave = () => {
    if (!enabled || isSavingRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set status to saving
    setSaveStatus("saving");

    // Debounce the save
    timeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        await onSave();
        setSaveStatus("saved");

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } catch (error) {
        setSaveStatus("error");
        console.error("Auto-save failed:", error);

        // Reset to idle after 5 seconds on error
        setTimeout(() => {
          setSaveStatus("idle");
        }, 5000);
      } finally {
        isSavingRef.current = false;
      }
    }, debounceMs);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerSave };
}
