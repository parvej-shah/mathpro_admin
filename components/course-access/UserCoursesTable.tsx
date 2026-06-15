"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { UserCourseAccess } from "@/types/course-access.types";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
  }).format(price);
}

export type UserCoursesTableEmptyState = "no-courses" | "no-results";

interface UserCoursesTableProps {
  courses: UserCourseAccess[];
  isLoading: boolean;
  emptyState?: UserCoursesTableEmptyState;
  onRemove: (course: UserCourseAccess) => void;
}

export function UserCoursesTable({
  courses,
  isLoading,
  emptyState = "no-courses",
  onRemove,
}: UserCoursesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="text-6xl mb-4 text-muted-foreground" aria-hidden>
          📚
        </div>
        <p className="text-muted-foreground font-medium text-lg">
          {emptyState === "no-results"
            ? "No courses match your search"
            : "No courses assigned yet"}
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          {emptyState === "no-results"
            ? "Try adjusting your search"
            : "This user has no course access assigned"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Assigned At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.access_id}>
              <TableCell>
                <div className="font-medium">{course.course_title}</div>
                <div className="text-sm text-muted-foreground">
                  ID: {course.course_id}
                </div>
              </TableCell>
              <TableCell className="max-w-[300px]">
                <div className="text-sm text-muted-foreground truncate">
                  {course.course_description || "—"}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {formatPrice(course.course_price)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(course.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(course)}
                  aria-label={`Remove access to ${course.course_title}`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
