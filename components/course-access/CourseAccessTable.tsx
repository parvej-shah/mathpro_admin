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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { CourseAccessUser } from "@/types/course-access.types";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export type CourseAccessTableEmptyState = "no-access" | "no-results";

interface CourseAccessTableProps {
  accessList: CourseAccessUser[];
  isLoading: boolean;
  emptyState?: CourseAccessTableEmptyState;
  onRemove: (access: CourseAccessUser) => void;
}

export function CourseAccessTable({
  accessList,
  isLoading,
  emptyState = "no-access",
  onRemove,
}: CourseAccessTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (accessList.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="text-6xl mb-4 text-muted-foreground" aria-hidden>
          🔐
        </div>
        <p className="text-muted-foreground font-medium text-lg">
          {emptyState === "no-results"
            ? "No access records match your search"
            : "No course access assigned yet"}
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          {emptyState === "no-results"
            ? "Try adjusting your search or filters"
            : "Assign course access to managerial users to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned By</TableHead>
            <TableHead>Assigned At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessList.map((access) => (
            <TableRow key={access.access_id}>
              <TableCell>
                <div className="font-medium">{access.user_name}</div>
                <div className="text-sm text-muted-foreground">
                  ID: {access.user_id}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {access.user_email || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {access.created_by_name || `ID: ${access.created_by}`}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(access.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(access)}
                  aria-label={`Remove access for ${access.user_name}`}
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
