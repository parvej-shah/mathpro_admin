"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataPointMetadata } from "@/types/analytics-v2.types";
import { formatValueByUnit, getLabel } from "@/lib/analytics-v2-metadata.utils";

/**
 * Accent palette used by the corner gradient blob and the inline icon color.
 * Keep names aligned with Tailwind theme tokens defined in `app/globals.css`.
 */
export type StatStripAccent =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "secondary"
  | "muted";

const ACCENT_GRADIENT: Record<StatStripAccent, string> = {
  primary: "from-primary/20",
  success: "from-success/20",
  warning: "from-warning/20",
  info: "from-info/20",
  destructive: "from-destructive/20",
  secondary: "from-secondary/20",
  muted: "from-muted-foreground/20",
};

const ACCENT_TEXT: Record<StatStripAccent, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
  secondary: "text-secondary",
  muted: "text-muted-foreground",
};

export interface StatStripCardProps {
  /** Card title (small label above the big value). */
  title: string;
  /** Big value rendered as the primary metric. */
  value?: string | number;
  /** Optional small description under the value. */
  subtitle?: string;
  /** Inline icon — accepts FontAwesome, Lucide, or any ReactNode. */
  icon?: React.ReactNode;
  /** Accent color token (defaults to "primary"). */
  accent?: StatStripAccent;
  /** Optional extras rendered after the subtitle (e.g. Progress bar, stars). */
  children?: React.ReactNode;
  /** Renders a skeleton state when true. */
  loading?: boolean;
  /** Optional className passthrough for grid-level spacing. */
  className?: string;
  /** Optional analytics metadata for tooltip + label override + value formatting. */
  metadata?: DataPointMetadata;
  /** Force a custom className for the icon wrapper (overrides accent). */
  iconClassName?: string;
  /** Override the value typography (defaults to `text-4xl font-bold`). */
  valueClassName?: string;
}

/**
 * Strip-style stat card used in feedback-management and analytics pages.
 *
 * Design signature:
 *  - Rounded `Card` with a coloured 80×80 corner blob (top-right).
 *  - Header carries a small icon + muted-foreground title.
 *  - Body has a big value, optional subtitle, plus arbitrary children
 *    (Progress bars, star rows, breakdowns, etc.).
 */
export function StatStripCard({
  title,
  value,
  subtitle,
  icon,
  accent,
  children,
  loading = false,
  className,
  metadata,
  iconClassName,
  valueClassName,
}: StatStripCardProps) {
  const resolvedAccent: StatStripAccent = accent ?? getStatAccent(title);
  const displayTitle = getLabel(metadata, title);
  const displayValue = metadata?.unit && value !== undefined
    ? formatValueByUnit(value, metadata.unit)
    : value;

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "pointer-events-none absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-linear-to-br to-transparent",
          ACCENT_GRADIENT[resolvedAccent]
        )}
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span className={cn(iconClassName ?? ACCENT_TEXT[resolvedAccent])}>
            {icon}
          </span>
          <span>{displayTitle}</span>
          {metadata?.helpText && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{metadata.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-4xl font-bold", valueClassName)}>
          {displayValue}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export default StatStripCard;

/**
 * Pick a sensible accent color from a card title.
 * Used as a default when consumers don't pass `accent` explicitly.
 * Falls back to `"primary"`.
 */
export function getStatAccent(title: string): StatStripAccent {
  const t = title.toLowerCase();
  if (/(revenue|earnings|paid|income|sales|amount|transaction|price|order)/.test(t))
    return "success";
  if (/(discount|coupon|decline|loss|expire|refund|churn|cancel)/.test(t))
    return "warning";
  if (/(error|fail|invalid|reject|denied|deleted|destructive)/.test(t))
    return "destructive";
  if (/(user|student|teacher|member|signup|active|enrollment|enrolled)/.test(t))
    return "info";
  if (/(course|book|class|module|chapter|lesson|content)/.test(t))
    return "primary";
  if (/(bundle|package|kit|set)/.test(t)) return "secondary";
  if (/(contest|quiz|exam|test|score|grade|pass)/.test(t)) return "primary";
  return "primary";
}
