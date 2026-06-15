"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricToggleOption<T extends string> {
  value: T;
  label: string;
}

interface MetricToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: MetricToggleOption<T>[];
  className?: string;
}

/**
 * Compact segmented control used to switch the metric shown in a chart
 * (e.g. Revenue / Enrollments / Users) without refetching.
 */
export function MetricToggle<T extends string>({
  value,
  onChange,
  options,
  className,
}: MetricToggleProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
