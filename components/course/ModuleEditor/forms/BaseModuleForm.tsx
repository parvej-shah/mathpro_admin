"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { LexicalEditor } from "@/components/announcements/LexicalEditor";
import { sanitizeHtmlContent } from "@/lib/helpers";
import type { Module } from "@/types";

interface BaseModuleFormProps {
  module?: Module | null;
  children?: React.ReactNode;
  onSubmit: (data: Partial<Module>) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Base Module Form
 * Common fields shared across all module types
 */
export function BaseModuleForm({
  module,
  children,
  onSubmit,
  onCancel,
}: BaseModuleFormProps) {
  // Form state - initialize from module
  const [title, setTitle] = useState(module?.title || "");
  const [description, setDescription] = useState(module?.description || "");
  const [descriptionText, setDescriptionText] = useState("");
  const [score, setScore] = useState(module?.score || 0);
  const [isLive, setIsLive] = useState(module?.is_live ?? false);
  const [isFree, setIsFree] = useState(module?.is_free ?? false);

  // Track module ID to detect when we're editing a different module
  const moduleIdRef = useRef<number | null>(module?.id || null);

  // Update form state when module changes (including when switching between modules)
  useEffect(() => {
    const currentModuleId = module?.id || null;

    // If module ID changed, reset all form state
    if (currentModuleId !== moduleIdRef.current) {
      moduleIdRef.current = currentModuleId;

      // Reset all fields from new module (or empty if creating new)
      setTitle(module?.title || "");
      setDescription(module?.description || "");
      setDescriptionText("");
      setScore(module?.score || 0);
      setIsLive(module?.is_live ?? false);
      setIsFree(module?.is_free ?? false);
    } else if (module) {
      // Same module, but data might have updated - sync state
      setTitle(module.title || "");
      setDescription(module.description || "");
      setScore(module.score || 0);
      setIsLive(module.is_live ?? false);
      setIsFree(module.is_free ?? false);
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description: sanitizeHtmlContent(description), // Sanitize empty HTML from Lexical editor
      score,
      is_live: isLive,
      is_free: isFree,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="module-title">Module Title *</Label>
        <Input
          id="module-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter module title"
          required
        />
      </div>

      {/* Description - Rich Text Editor */}
      <div className="space-y-2">
        <Label htmlFor="module-description">Description</Label>
        <LexicalEditor
          initialHtml={description}
          onChange={(html) => setDescription(html)}
          onTextChange={(text) => setDescriptionText(text)}
          placeholder="Enter module description..."
        />
      </div>

      {/* Score */}
      <div className="space-y-2">
        <Label htmlFor="module-score">Score</Label>
        <Input
          id="module-score"
          type="number"
          min="0"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>

      {/* Flags */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="module-live"
            checked={isLive}
            onCheckedChange={(checked) => setIsLive(checked === true)}
          />
          <Label htmlFor="module-live" className="cursor-pointer">
            Published
          </Label>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-xs">
                <p className="text-sm">
                  When checked, this module is visible to enrolled students.
                  Uncheck to hide it (e.g. while you&apos;re still working on
                  it).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="module-free"
            checked={isFree}
            onCheckedChange={(checked) => setIsFree(checked === true)}
          />
          <Label htmlFor="module-free" className="cursor-pointer">
            Free Module
          </Label>
        </div>
      </div>

      {/* Module-specific content */}
      {children}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save Module</Button>
      </div>
    </form>
  );
}
