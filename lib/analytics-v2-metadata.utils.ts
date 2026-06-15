/**
 * Analytics V2 Metadata Utilities
 * Helper functions for working with metadata API
 */

import type {
  AllMetadata,
  CategoryMetadata,
  DataPointMetadata,
} from "@/types/analytics-v2.types";

/**
 * Get metadata for a nested data point path
 * Example: getMetadata(metadata, "dashboard", "summary.total_revenue")
 */
export function getMetadata(
  metadata: AllMetadata | CategoryMetadata | undefined,
  category: string,
  keyPath: string
): DataPointMetadata | undefined {
  if (!metadata) return undefined;

  // If metadata is already a CategoryMetadata (from category endpoint), use it directly
  let categoryData: CategoryMetadata | undefined;
  if ("label" in metadata || !(category in metadata)) {
    // It's already a category metadata or data point metadata
    categoryData = metadata as CategoryMetadata;
  } else {
    // It's AllMetadata, extract category
    categoryData = (metadata as AllMetadata)[category as keyof AllMetadata] as
      | CategoryMetadata
      | undefined;
  }

  if (!categoryData) return undefined;

  const keys = keyPath.split(".");
  let current: CategoryMetadata | DataPointMetadata | undefined = categoryData;

  for (const key of keys) {
    if (!current || typeof current !== "object") return undefined;
    if ("label" in current && "helpText" in current) {
      // Already a DataPointMetadata, can't go deeper
      return undefined;
    }
    current = (current as CategoryMetadata)[key] as
      | CategoryMetadata
      | DataPointMetadata
      | undefined;
  }

  // Check if it's a DataPointMetadata (has label, helpText, unit, category)
  if (
    current &&
    typeof current === "object" &&
    "label" in current &&
    "helpText" in current
  ) {
    return current as DataPointMetadata;
  }

  return undefined;
}

/**
 * Format value based on unit type
 */
export function formatValueByUnit(
  value: number | string,
  unit?: string
): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return String(value);

  switch (unit) {
    case "currency":
      return `৳${numValue.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
    case "percentage":
      return `${numValue.toFixed(2)}%`;
    case "users":
    case "courses":
    case "enrollments":
    case "bundles":
    case "discussions":
    case "submissions":
    case "payments":
      return numValue.toLocaleString("en-IN");
    case "days":
      return `${numValue} ${numValue === 1 ? "day" : "days"}`;
    default:
      return numValue.toLocaleString("en-IN");
  }
}

/**
 * Get label from metadata or fallback to provided title
 */
export function getLabel(
  metadata: DataPointMetadata | undefined,
  fallback: string
): string {
  return metadata?.label || fallback;
}
