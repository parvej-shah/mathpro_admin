import { useEffect } from "react";

/**
 * Keyboard Shortcuts Hook
 * Handles keyboard shortcuts for course editing
 */

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Ctrl+S even in inputs
        if (!(e.key === "s" && (e.ctrlKey || e.metaKey))) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined ? true : e.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined ? true : e.altKey === shortcut.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Common keyboard shortcuts for course editing
 */
export const COURSE_SHORTCUTS = {
  SAVE: {
    key: "s",
    ctrlKey: true,
    description: "Save changes",
  },
  CANCEL: {
    key: "Escape",
    description: "Cancel/Close",
  },
  ADD_CHAPTER: {
    key: "n",
    ctrlKey: true,
    shiftKey: true,
    description: "Add new chapter",
  },
  ADD_MODULE: {
    key: "m",
    ctrlKey: true,
    shiftKey: true,
    description: "Add new module",
  },
} as const;
