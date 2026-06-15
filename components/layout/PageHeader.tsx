"use client";

import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface PageHeaderProps {
  /** Small uppercase label shown in the pill above the title. */
  eyebrow: string;
  /** Optional icon rendered inside the eyebrow pill. */
  eyebrowIcon?: IconDefinition;
  /** Main heading. */
  title: string;
  /** Supporting line under the title. */
  description?: string;
  /** Optional action area (e.g. a button) shown on the right. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable dashboard page header — gradient panel with an eyebrow pill,
 * title, description, and an optional action slot. Used across list pages
 * (Users, Courses, …) for a consistent look.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br from-card via-card to-primary/10 p-5 shadow-sm sm:p-7",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrowIcon && (
              <FontAwesomeIcon icon={eyebrowIcon} className="h-3.5 w-3.5" />
            )}
            {eyebrow}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
