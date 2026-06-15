"use client";

import { BookOpen, Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Course {
  id: number;
  title: string;
}

interface CourseFilterPopoverProps {
  courses: Course[];
  value: number | null;
  onChange: (id: number | null) => void;
}

export function CourseFilterPopover({
  courses,
  value,
  onChange,
}: CourseFilterPopoverProps) {
  const [query, setQuery] = useState("");
  const selected = courses.find((c) => c.id === value);

  const filtered = query
    ? courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : courses;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 rounded-full border-dashed px-4 gap-2",
            value && "border-solid bg-foreground/5"
          )}
        >
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-40 truncate">
            {selected ? selected.title : "All courses"}
          </span>
          {value ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-foreground/10"
              aria-label="Clear course filter"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2 rounded-2xl">
        <div className="px-2 pb-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a course…"
            className="h-9 rounded-lg"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          <button
            onClick={() => onChange(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left",
              value === null && "bg-muted/60"
            )}
          >
            <span className="h-5 w-5 rounded-md border bg-background flex items-center justify-center">
              {value === null && <Check className="h-3 w-3" />}
            </span>
            <span className="text-muted-foreground">All courses</span>
          </button>
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No courses match.
            </div>
          )}
          {filtered.map((course) => (
            <button
              key={course.id}
              onClick={() => onChange(course.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors text-left",
                value === course.id && "bg-muted/60"
              )}
            >
              <span className="h-5 w-5 rounded-md border bg-background flex items-center justify-center shrink-0">
                {value === course.id && <Check className="h-3 w-3" />}
              </span>
              <span className="truncate">{course.title}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
