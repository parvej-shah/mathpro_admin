"use client";

import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCourseStore } from "@/lib/stores/course-store";
import type { ModuleCategory, Module } from "@/types";

const moduleTypes: { value: ModuleCategory; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "QUIZ", label: "Quiz" },
  { value: "PDF", label: "PDF" },
  { value: "TEXT", label: "Text" },
];

interface ModuleTypeSelectorProps {
  module?: Module | null;
}

/**
 * Module Type Selector
 * Allows user to select/change module type (for both new and existing modules)
 */
export function ModuleTypeSelector({ module }: ModuleTypeSelectorProps) {
  // Use selector to subscribe to draftChanges.moduleType changes
  const draftModuleType = useCourseStore(
    (state) => state.draftChanges.moduleType as ModuleCategory | undefined
  );
  const setDraft = useCourseStore((state) => state.setDraft);

  // Get current category from module or draft - memoized for reactivity
  const selectedType = useMemo((): ModuleCategory => {
    // If there's a draft type, use it (user has changed it)
    if (draftModuleType) {
      return draftModuleType;
    }

    // Otherwise, get from module if editing
    if (module) {
      if (module.category) return module.category;
      if (module.type) return module.type as ModuleCategory;
      if (module.data && typeof module.data === "object") {
        const data = module.data as Record<string, unknown>;
        if (data.category) return data.category as ModuleCategory;
      }
    }

    return "TEXT";
  }, [module, draftModuleType]);

  // Note: Draft initialization is handled in ModuleEditor component
  // This component only reads and updates the draft, not initializes it

  const handleTypeChange = (value: string) => {
    setDraft("moduleType", value as ModuleCategory);
  };

  return (
    <div className="space-y-3 mb-6">
      <Label className="text-base font-semibold">Module Type</Label>
      <RadioGroup
        value={selectedType}
        onValueChange={handleTypeChange}
        className="grid grid-cols-2 gap-4"
      >
        {moduleTypes.map((type) => (
          <div key={type.value} className="flex items-center space-x-2">
            <RadioGroupItem value={type.value} id={type.value} />
            <Label htmlFor={type.value} className="cursor-pointer font-normal">
              {type.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
