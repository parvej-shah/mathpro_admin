"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterOptions } from "@/hooks/useAnalyticsV2";
import type { FilterType } from "@/types/analytics-v2.types";

interface FilterDropdownProps {
  type: FilterType;
  value?: number | number[];
  onChange: (value: number | number[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

const FILTER_LABELS: Record<FilterType, string> = {
  courses: "Course",
  bundles: "Bundle",
  coupons: "Coupon",
  users: "User",
  teachers: "Teacher",
};

export function FilterDropdown({
  type,
  value,
  onChange,
  multiple = false,
  placeholder,
  className,
}: FilterDropdownProps) {
  const { data, isLoading, error } = useFilterOptions(type);

  const options = React.useMemo(() => {
    if (!data?.success || !data.data?.options) return [];
    return data.data.options;
  }, [data]);

  const handleChange = (selectedValue: string) => {
    const numValue = parseInt(selectedValue, 10);
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      if (currentValues.includes(numValue)) {
        onChange(currentValues.filter((v) => v !== numValue));
      } else {
        onChange([...currentValues, numValue]);
      }
    } else {
      onChange(numValue);
    }
  };

  const displayValue = React.useMemo(() => {
    if (!value) return undefined;

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return undefined;
      if (value.length === 1) {
        const option = options.find((opt) => opt.id === value[0]);
        return option?.name || String(value[0]);
      }
      return `${value.length} selected`;
    }

    if (!multiple && typeof value === "number") {
      const option = options.find((opt) => opt.id === value);
      return option?.name || String(value);
    }

    return undefined;
  }, [value, options, multiple]);

  if (isLoading) {
    return <Skeleton className={className || "h-10 w-full"} />;
  }

  if (error || !data?.success || !options.length) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue
            placeholder={placeholder || `No ${FILTER_LABELS[type]}s available`}
          />
        </SelectTrigger>
      </Select>
    );
  }

  if (multiple) {
    // For multiple selection, we'll use a simple select for now
    // In a production app, you might want to use a multi-select component
    return (
      <Select
        value={
          Array.isArray(value) && value.length > 0
            ? String(value[0])
            : undefined
        }
        onValueChange={handleChange}
      >
        <SelectTrigger className={className}>
          <SelectValue
            placeholder={
              placeholder ||
              `Select ${FILTER_LABELS[type]}${multiple ? "s" : ""}`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={
            placeholder || `Select ${FILTER_LABELS[type]}${multiple ? "s" : ""}`
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {FILTER_LABELS[type]}s</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
