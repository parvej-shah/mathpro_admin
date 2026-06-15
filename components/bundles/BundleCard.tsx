"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEdit,
  faTrash,
  faGraduationCap,
  faDownload,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";
import type { Bundle } from "@/services/bundle.service";

interface BundleCardProps {
  bundle: Bundle;
  onView: (bundle: Bundle) => void;
  onEdit: (bundle: Bundle) => void;
  onDelete: (bundle: Bundle) => void;
  onExport: (bundleId: number) => void;
}

const formatPrice = (price: number | undefined): string => {
  if (!price) return "Free";
  return `৳${price.toLocaleString("en-US")}`;
};

export function BundleCard({
  bundle,
  onView,
  onEdit,
  onDelete,
  onExport,
}: BundleCardProps) {
  const courseCount = (bundle as { course_count?: number }).course_count || 0;

  return (
    // Entire card is the primary "view" action — like a course card opening
    // its detail page. Management actions live in the overflow menu, which
    // stops propagation so it doesn't also trigger a view.
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(bundle)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(bundle);
        }
      }}
      aria-label={`View ${bundle.title}`}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col rounded-2xl border bg-card overflow-hidden",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Media — bundles have no thumbnail, use a branded gradient */}
      <div className="relative flex aspect-16/10 w-full items-center justify-center overflow-hidden bg-linear-to-br from-primary/80 to-primary">
        <FontAwesomeIcon
          icon={faBoxesStacked}
          className="w-10 h-10 text-primary-foreground/70 transition-transform duration-300 group-hover:scale-110"
        />

        {/* Status badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {bundle.is_live && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm shadow-sm">
              Live
            </span>
          )}
          {bundle.is_active && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm shadow-sm">
              Active
            </span>
          )}
        </div>

        {/* Overflow menu — management actions only */}
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Combo actions"
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => onEdit(bundle)}>
                <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
                Edit Combo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(bundle.id)}>
                <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
                Export Purchases
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(bundle)}
                className="text-destructive"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                Delete Combo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 h-11 font-semibold leading-snug transition-colors group-hover:text-primary">
          {bundle.title}
        </h3>

        {/* Description — reserves 2 lines for symmetry */}
        <p className="mt-1.5 line-clamp-2 h-10 text-sm text-muted-foreground">
          {bundle.short_description || ""}
        </p>

        {/* Stats */}
        <div className="mt-3 flex h-5 items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5" />
            {courseCount} course{courseCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* Footer — pinned */}
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="text-base font-semibold">
            {formatPrice(bundle.price)}
          </span>
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
