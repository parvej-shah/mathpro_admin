"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, Undo2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CourseChipsCanonical, LabeledValue } from "@/types/course.types";
import { dateToUnixSeconds, unixSecondsToDate } from "@/lib/course-form-mapper";

interface CourseMetadataFormProps {
  chips: CourseChipsCanonical;
  onChipsChange: (chips: CourseChipsCanonical) => void;
}

const ENROLLED_ONLY_SOCIAL_KEYS = new Set(["facebook_private_group", "telegram_group"]);

function ObjectEditor({
  title,
  description,
  data,
  onChange,
  valuePlaceholder,
}: {
  title: string;
  description?: string;
  data: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  valuePlaceholder: string;
}) {
  const entries = Object.entries(data);

  const updateValue = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              {key}
              {ENROLLED_ONLY_SOCIAL_KEYS.has(key) && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  Enrolled only
                </span>
              )}
            </Label>
            <Input
              value={value}
              placeholder={valuePlaceholder}
              onChange={(e) => updateValue(key, e.target.value)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DynamicObjectEditor({
  title,
  description,
  data,
  onChange,
}: {
  title: string;
  description?: string;
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const entries = Object.entries(data);
  const [removedStack, setRemovedStack] = useState<
    Array<{ key: string; value: unknown }>
  >([]);

  const makeUniqueKey = (baseKey: string, source: Record<string, unknown>) => {
    if (!(baseKey in source)) return baseKey;
    let i = 1;
    let candidate = `${baseKey}_${i}`;
    while (candidate in source) {
      i += 1;
      candidate = `${baseKey}_${i}`;
    }
    return candidate;
  };

  const renameKey = (oldKey: string, newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === oldKey) return;
    const next: Record<string, unknown> = {};
    entries.forEach(([k, v]) => {
      next[k === oldKey ? trimmed : k] = v;
    });
    onChange(next);
  };

  const updateValue = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const removeKey = (key: string) => {
    setRemovedStack((prev) => [...prev, { key, value: data[key] }]);
    const next = { ...data };
    delete next[key];
    onChange(next);
  };

  const undoRemove = () => {
    const lastRemoved = removedStack[removedStack.length - 1];
    if (!lastRemoved) return;
    const nextKey = makeUniqueKey(lastRemoved.key, data);
    onChange({ ...data, [nextKey]: lastRemoved.value });
    setRemovedStack((prev) => prev.slice(0, -1));
  };

  const addRow = () => {
    const key = makeUniqueKey("new_key", data);
    onChange({ ...data, [key]: "" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undoRemove}
            disabled={removedStack.length === 0}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              value={key}
              placeholder="Key"
              onChange={(e) => renameKey(key, e.target.value)}
            />
            <Input
              value={String(value ?? "")}
              placeholder="Value"
              onChange={(e) => updateValue(key, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeKey(key)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No entries yet. Add a row to start.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SectionsEditor({
  data,
  onChange,
}: {
  data: LabeledValue[];
  onChange: (next: LabeledValue[]) => void;
}) {
  const [removedStack, setRemovedStack] = useState<LabeledValue[]>([]);

  const updateField = (index: number, field: "label" | "value", value: string) => {
    const next = data.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange(next);
  };

  const removeRow = (index: number) => {
    setRemovedStack((prev) => [...prev, data[index]]);
    onChange(data.filter((_, i) => i !== index));
  };

  const undoRemove = () => {
    const lastRemoved = removedStack[removedStack.length - 1];
    if (!lastRemoved) return;
    onChange([...data, lastRemoved]);
    setRemovedStack((prev) => prev.slice(0, -1));
  };

  const addRow = () => {
    onChange([...data, { label: "", value: "" }]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Sections</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undoRemove}
            disabled={removedStack.length === 0}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((row, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              value={row.label}
              placeholder="Label (e.g. চ্যাপ্টার সংখ্যা)"
              onChange={(e) => updateField(index, "label", e.target.value)}
            />
            <Input
              value={row.value}
              placeholder="Value (e.g. 17 টি)"
              onChange={(e) => updateField(index, "value", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No sections yet. Add a row to start.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EnrollmentDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
  const date = unixSecondsToDate(value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "Not set"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(d) => onChange(dateToUnixSeconds(d || null))}
            initialFocus
          />
          {date && (
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange(null)}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function CourseMetadataForm({
  chips,
  onChipsChange,
}: CourseMetadataFormProps) {
  return (
    <div className="space-y-6">
      <SectionsEditor
        data={chips.sections}
        onChange={(sections) => onChipsChange({ ...chips, sections })}
      />

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Optional dates shown on the course page.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnrollmentDateField
            label="Prebooking End Date"
            value={chips.enrollment_details.prebooking_end_date}
            onChange={(prebooking_end_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  prebooking_end_date,
                },
              })
            }
          />
          <EnrollmentDateField
            label="Enrollment End Date"
            value={chips.enrollment_details.enrollment_end_date}
            onChange={(enrollment_end_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  enrollment_end_date,
                },
              })
            }
          />
          <EnrollmentDateField
            label="Course Start Date"
            value={chips.enrollment_details.course_start_date}
            onChange={(course_start_date) =>
              onChipsChange({
                ...chips,
                enrollment_details: {
                  ...chips.enrollment_details,
                  course_start_date,
                },
              })
            }
          />
        </CardContent>
      </Card>

      <ObjectEditor
        title="Social Links"
        description="Telegram group and the private Facebook group are only shown to enrolled students."
        data={chips.socials}
        valuePlaceholder="Value"
        onChange={(socials) => onChipsChange({ ...chips, socials })}
      />

      <ObjectEditor
        title="Thumbnails"
        data={chips.thumbnails}
        valuePlaceholder="URL"
        onChange={(thumbnails) => onChipsChange({ ...chips, thumbnails })}
      />

      <Card>
        <CardHeader>
          <CardTitle>Combo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="bundle_id">Combo ID</Label>
          <Input
            id="bundle_id"
            type="number"
            value={chips.bundle_id}
            placeholder="Leave empty if not part of a combo"
            onChange={(e) => onChipsChange({ ...chips, bundle_id: e.target.value })}
          />
        </CardContent>
      </Card>

      {/*
      <DynamicObjectEditor
        title="Additional Metadata"
        description="Extra chip keys not covered by the fields above."
        data={chips.extra}
        onChange={(extra) => onChipsChange({ ...chips, extra })}
      />
      */}
    </div>
  );
}
