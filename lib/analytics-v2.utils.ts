/**
 * Analytics V2 Utility Functions
 * Date handling, currency formatting, and calculations
 */

import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import type { DatePreset } from "@/types/analytics-v2.types";

// ============================================================================
// Date Presets
// ============================================================================

export const DATE_PRESETS = {
  allTime: "all_time",
  all: "all",
  today: "today",
  yesterday: "yesterday",
  thisWeek: "this_week",
  lastWeek: "last_week",
  thisMonth: "this_month",
  lastMonth: "last_month",
  thisQuarter: "this_quarter",
  lastQuarter: "last_quarter",
  thisYear: "this_year",
  lastYear: "last_year",
  last7Days: "last_7_days",
  last30Days: "last_30_days",
  last90Days: "last_90_days",
  last365Days: "last_365_days",
} as const;

// ============================================================================
// Date Preset to Unix Timestamp Conversion
// ============================================================================

/**
 * Convert date preset to Unix timestamp (seconds)
 * Returns start and end timestamps for the preset
 */
export function datePresetToUnix(
  preset: DatePreset
): { start?: number; end?: number } {
  // For all-time data, return undefined dates (will be omitted from API calls)
  if (preset === "all_time" || preset === "all") {
    return {};
  }

  const now = new Date();
  let start: Date;
  let end: Date;

  switch (preset) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;

    case "yesterday":
      const yesterday = subDays(now, 1);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;

    case "this_week":
      start = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
      end = endOfWeek(now, { weekStartsOn: 0 });
      break;

    case "last_week":
      const lastWeekStart = subDays(now, 7);
      start = startOfWeek(lastWeekStart, { weekStartsOn: 0 });
      end = endOfWeek(lastWeekStart, { weekStartsOn: 0 });
      break;

    case "this_month":
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;

    case "last_month":
      const lastMonth = subDays(now, 30);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
      break;

    case "this_quarter":
      start = startOfQuarter(now);
      end = endOfQuarter(now);
      break;

    case "last_quarter":
      const lastQuarter = subDays(now, 90);
      start = startOfQuarter(lastQuarter);
      end = endOfQuarter(lastQuarter);
      break;

    case "this_year":
      start = startOfYear(now);
      end = endOfYear(now);
      break;

    case "last_year":
      const lastYear = subDays(now, 365);
      start = startOfYear(lastYear);
      end = endOfYear(lastYear);
      break;

    case "last_7_days":
      start = startOfDay(subDays(now, 7));
      end = endOfDay(now);
      break;

    case "last_30_days":
      start = startOfDay(subDays(now, 30));
      end = endOfDay(now);
      break;

    case "last_90_days":
      start = startOfDay(subDays(now, 90));
      end = endOfDay(now);
      break;

    case "last_365_days":
      start = startOfDay(subDays(now, 365));
      end = endOfDay(now);
      break;

    default:
      // Default to last 30 days
      start = startOfDay(subDays(now, 30));
      end = endOfDay(now);
  }

  return {
    start: Math.floor(start.getTime() / 1000), // Convert to seconds
    end: Math.floor(end.getTime() / 1000),
  };
}

/**
 * Get date range for a preset
 * Alias for datePresetToUnix
 */
export function getDateRange(
  preset: DatePreset
): { start?: number; end?: number } {
  return datePresetToUnix(preset);
}

// ============================================================================
// Unix Timestamp to Display Date
// ============================================================================

/**
 * Convert Unix timestamp (seconds) to display date string
 * Converts UTC to Dhaka timezone (UTC+6) for display
 */
export function unixToDisplayDate(timestamp: number, formatStr: string = "MMM dd, yyyy"): string {
  // Unix timestamp is in seconds, convert to milliseconds
  const date = new Date(timestamp * 1000);
  
  // Convert to Dhaka timezone (UTC+6)
  const dhakaOffset = 6 * 60; // 6 hours in minutes
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const dhakaTime = new Date(utcTime + dhakaOffset * 60000);
  
  return format(dhakaTime, formatStr);
}

/**
 * Format date for display (short format)
 */
export function formatDateShort(timestamp: number): string {
  return unixToDisplayDate(timestamp, "MMM dd, yyyy");
}

/**
 * Format date for display (long format)
 */
export function formatDateLong(timestamp: number): string {
  return unixToDisplayDate(timestamp, "MMMM dd, yyyy");
}

/**
 * Format date for display (with time)
 */
export function formatDateTime(timestamp: number): string {
  return unixToDisplayDate(timestamp, "MMM dd, yyyy HH:mm");
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format amount as Taka (৳) currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format amount as Taka (৳) currency with decimals
 */
export function formatCurrencyWithDecimals(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount || 0);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

// ============================================================================
// Percentage Calculations
// ============================================================================

/**
 * Calculate growth percentage
 * Returns formatted string with + or - sign
 */
export function calculateGrowthPercentage(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "100.00" : "0.00";
  }
  
  const growth = ((current - previous) / previous) * 100;
  return growth.toFixed(2);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get growth indicator (positive/negative/neutral)
 */
export function getGrowthIndicator(current: number, previous: number): "positive" | "negative" | "neutral" {
  if (current > previous) return "positive";
  if (current < previous) return "negative";
  return "neutral";
}

// ============================================================================
// Date Range Validation
// ============================================================================

/**
 * Validate date range
 * Returns true if start_date < end_date and both are valid
 */
export function validateDateRange(start: number, end: number): boolean {
  if (!start || !end) return false;
  if (start < 0 || end < 0) return false;
  if (start >= end) return false;
  
  // Check if dates are reasonable (not too far in the future)
  const maxDate = Math.floor(Date.now() / 1000) + 86400; // 1 day in future
  if (start > maxDate || end > maxDate) return false;
  
  return true;
}

/**
 * Convert JavaScript Date to Unix timestamp (seconds)
 */
export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Unix timestamp (seconds) to JavaScript Date
 */
export function unixToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

/**
 * Format number with compact notation
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value || 0);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default date range (last 30 days)
 */
export function getDefaultDateRange(): { start?: number; end?: number } {
  return datePresetToUnix("last_30_days");
}

/**
 * Get current Unix timestamp (seconds)
 */
export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Check if date is in range
 */
export function isDateInRange(date: number, start: number, end: number): boolean {
  return date >= start && date <= end;
}
