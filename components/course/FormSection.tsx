"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A single titled block inside a form tab. Gives every section a consistent
 * card surface, icon, and header so the create/edit pages read identically.
 */
export function FormSection({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-5 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
