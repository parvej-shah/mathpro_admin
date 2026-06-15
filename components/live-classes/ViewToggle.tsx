"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTh, faList } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export type ViewMode = "thumbnail" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({
  viewMode,
  onViewChange,
  className,
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/50",
        className
      )}
      role="group"
      aria-label="View mode toggle"
    >
      <Button
        type="button"
        variant={viewMode === "thumbnail" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("thumbnail")}
        className={cn(
          "h-8 px-3",
          viewMode === "thumbnail"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Thumbnail view"
        aria-pressed={viewMode === "thumbnail"}
      >
        <FontAwesomeIcon icon={faTh} className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "h-8 px-3",
          viewMode === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <FontAwesomeIcon icon={faList} className="h-4 w-4" />
      </Button>
    </div>
  );
}
