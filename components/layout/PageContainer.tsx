"use client";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Industry-standard page container with max-width 1440px
 * Ensures consistent layout across all pages
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
