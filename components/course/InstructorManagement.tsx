"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { teacherService } from "@/services/teacher.service";

interface TeacherOption {
  id: number;
  name: string;
}

interface InstructorManagementProps {
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
}

export function InstructorManagement({
  selectedIds,
  onSelectedIdsChange,
}: InstructorManagementProps) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService
      .getTeachersNames()
      .then((res) => {
        if (res.success && res.data) setTeachers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectedIdsChange([...selectedIds, id]);
    }
  };

  const selectedTeachers = teachers.filter((t) => selectedIds.includes(t.id));

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading teachers…</p>;
  }

  if (teachers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No teachers found. Create teachers in the Instructors section first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTeachers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTeachers.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
              {t.name}
              <button
                type="button"
                onClick={() => toggle(t.id)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {teachers
          .filter((t) => !selectedIds.includes(t.id))
          .map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggle(t.id)}
            >
              + {t.name}
            </Button>
          ))}
      </div>
    </div>
  );
}
