"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [timeValue, setTimeValue] = useState<string>(
    value
      ? `${String(value.getHours()).padStart(2, "0")}:${String(
          value.getMinutes()
        ).padStart(2, "0")}`
      : "12:00"
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(null);
      onChange(null);
      return;
    }

    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDateTime = new Date(date);
    newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
    setSelectedDate(newDateTime);
    onChange(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours || 0, minutes || 0, 0, 0);
      setSelectedDate(newDateTime);
      onChange(newDateTime);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="pl-10"
            disabled={disabled || !selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
