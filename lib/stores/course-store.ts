import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Course Editing Store
 * Manages client-side state for course editing UI
 */

interface CourseStore {
  // Expanded/Collapsed state
  expandedChapters: Set<number>;
  toggleChapter: (chapterId: number) => void;
  expandAllChapters: () => void;
  collapseAllChapters: () => void;

  // Selected/Active state
  activeChapterId: number | null;
  activeModuleId: number | null;
  setActiveChapter: (chapterId: number | null) => void;
  setActiveModule: (moduleId: number | null) => void;

  // Draft changes (for auto-save)
  draftChanges: Record<string, unknown>;
  setDraft: (key: string, value: unknown) => void;
  clearDraft: () => void;

  // Module editor state
  isModuleEditorOpen: boolean;
  editingModuleId: number | null;
  openModuleEditor: (moduleId: number | null) => void;
  closeModuleEditor: () => void;

  // Save status
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;

  // Reset store
  reset: () => void;
}

const initialState = {
  expandedChapters: new Set<number>(),
  activeChapterId: null,
  activeModuleId: null,
  draftChanges: {},
  isModuleEditorOpen: false,
  editingModuleId: null,
  saveStatus: "idle" as const,
};

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Chapter expansion
      toggleChapter: (chapterId: number) =>
        set((state) => {
          const newSet = new Set(state.expandedChapters);
          if (newSet.has(chapterId)) {
            newSet.delete(chapterId);
          } else {
            newSet.add(chapterId);
          }
          return { expandedChapters: newSet };
        }),

      expandAllChapters: () =>
        set((state) => {
          // This will be populated when course data is loaded
          // For now, just return current state
          return state;
        }),

      collapseAllChapters: () =>
        set({
          expandedChapters: new Set<number>(),
        }),

      // Active selection
      setActiveChapter: (chapterId: number | null) =>
        set({ activeChapterId: chapterId }),

      setActiveModule: (moduleId: number | null) =>
        set({ activeModuleId: moduleId }),

      // Draft changes
      setDraft: (key: string, value: unknown) =>
        set((state) => ({
          draftChanges: { ...state.draftChanges, [key]: value },
        })),

      clearDraft: () => set({ draftChanges: {} }),

      // Module editor
      openModuleEditor: (moduleId: number | null) =>
        set((state) => {
          // Clear draft when opening a new module (different from current)
          // This ensures clean state when switching between modules
          const shouldClearDraft = state.editingModuleId !== moduleId;
          return {
            isModuleEditorOpen: true,
            editingModuleId: moduleId,
            // Clear draft when switching to a different module
            draftChanges: shouldClearDraft ? {} : state.draftChanges,
          };
        }),

      closeModuleEditor: () =>
        set({
          isModuleEditorOpen: false,
          editingModuleId: null,
          // Always clear draft when closing to prevent state leakage
          draftChanges: {},
        }),

      // Save status
      setSaveStatus: (status: "idle" | "saving" | "saved" | "error") =>
        set({ saveStatus: status }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "course-editing-store",
      // Only persist UI state, not draft changes
      partialize: (state) => ({
        expandedChapters: Array.from(state.expandedChapters),
        activeChapterId: state.activeChapterId,
        activeModuleId: state.activeModuleId,
      }),
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            if (parsed.state?.expandedChapters && Array.isArray(parsed.state.expandedChapters)) {
              parsed.state.expandedChapters = new Set(parsed.state.expandedChapters);
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          if (typeof window === "undefined") return;
          try {
            const toStore = {
              ...value,
              state: {
                ...value.state,
                expandedChapters: Array.from(value.state.expandedChapters || []),
              },
            };
            localStorage.setItem(name, JSON.stringify(toStore));
          } catch (error) {
            console.error("Failed to save to localStorage:", error);
          }
        },
        removeItem: (name: string) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      },
    }
  )
);

