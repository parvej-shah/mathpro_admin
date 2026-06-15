"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DATE_PRESETS,
  datePresetToUnix,
  unixToDisplayDate,
} from "@/lib/analytics-v2.utils";
import type { DatePreset } from "@/types/analytics-v2.types";

export interface DateRangeValue {
  start?: number;
  end?: number;
  preset?: DatePreset;
}

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  presets?: DatePreset[];
  className?: string;
}

const DEFAULT_PRESETS: DatePreset[] = [
  "all_time",
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "last_90_days",
];

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<{
    from?: Date;
    to?: Date;
  }>(() => {
    if (value?.start && value?.end) {
      return {
        from: new Date(value.start * 1000),
        to: new Date(value.end * 1000),
      };
    }
    return {};
  });

  const handlePresetSelect = (preset: DatePreset) => {
    const range = datePresetToUnix(preset);
    // For all_time, start and end will be undefined
    onChange({
      start: range.start,
      end: range.end,
      preset,
    });
    setIsOpen(false);
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);

    if (range.from && range.to) {
      const start = Math.floor(range.from.getTime() / 1000);
      const end = Math.floor(range.to.getTime() / 1000);
      onChange({ start, end });
      setIsOpen(false);
    }
  };

  const displayText = React.useMemo(() => {
    if (value?.preset) {
      const presetLabels: Record<DatePreset, string> = {
        all_time: "All Time",
        all: "All Time",
        today: "Today",
        yesterday: "Yesterday",
        this_week: "This Week",
        last_week: "Last Week",
        this_month: "This Month",
        last_month: "Last Month",
        this_quarter: "This Quarter",
        last_quarter: "Last Quarter",
        this_year: "This Year",
        last_year: "Last Year",
        last_7_days: "Last 7 Days",
        last_30_days: "Last 30 Days",
        last_90_days: "Last 90 Days",
        last_365_days: "Last 365 Days",
      };
      return presetLabels[value.preset] || "Custom Range";
    }

    if (value?.start && value?.end) {
      const startDate = unixToDisplayDate(value.start, "MMM dd, yyyy");
      const endDate = unixToDisplayDate(value.end, "MMM dd, yyyy");
      return `${startDate} - ${endDate}`;
    }

    return "Select date range";
  }, [value]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] sm:w-[280px] justify-start text-left font-normal h-9",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg" align="start">
          <div className="flex flex-col sm:flex-row">
            {/* Presets */}
            <div className="border-b sm:border-b-0 sm:border-r p-2 sm:p-3 bg-muted/30 sm:min-w-[140px]">
              <div className="text-xs sm:text-sm font-medium mb-2 px-2 text-foreground">
                Presets
              </div>
              <div className="space-y-0.5 max-h-[200px] sm:max-h-none overflow-y-auto sm:overflow-visible">
                {presets.map((preset) => {
                  const presetLabels: Record<DatePreset, string> = {
                    all_time: "All Time",
                    all: "All Time",
                    today: "Today",
                    yesterday: "Yesterday",
                    this_week: "This Week",
                    last_week: "Last Week",
                    this_month: "This Month",
                    last_month: "Last Month",
                    this_quarter: "This Quarter",
                    last_quarter: "Last Quarter",
                    this_year: "This Year",
                    last_year: "Last Year",
                    last_7_days: "Last 7 Days",
                    last_30_days: "Last 30 Days",
                    last_90_days: "Last 90 Days",
                    last_365_days: "Last 365 Days",
                  };

                  const isSelected = value?.preset === preset;

                  return (
                    <Button
                      key={preset}
                      variant={isSelected ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left text-xs sm:text-sm h-8 px-2",
                        isSelected && "bg-primary/10 text-primary font-medium"
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {presetLabels[preset]}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-2 sm:p-3">
              <Calendar
                mode="range"
                selected={
                  dateRange.from || dateRange.to
                    ? (dateRange as never)
                    : undefined
                }
                onSelect={
                  handleDateRangeSelect as (
                    range: { from?: Date; to?: Date } | undefined
                  ) => void
                }
                numberOfMonths={1}
                initialFocus
                className="rounded-md"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
