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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faEdit,
  faTrash,
  faKey,
  faUserShield,
  faUserGraduate,
  faUserTie,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  onRowClick?: (user: User) => void;
}

function getUserTypeLabel(type: number) {
  switch (type) {
    case 1:
      return (
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-destructive/20 bg-destructive/10 text-destructive"
        >
          <FontAwesomeIcon icon={faUserShield} />
          Admin
        </Badge>
      );
    case 2:
      return (
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-info/20 bg-info/10 text-info"
        >
          <FontAwesomeIcon icon={faUserTie} />
          Teacher
        </Badge>
      );
    case 3:
      return (
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-secondary bg-secondary/70 text-secondary-foreground"
        >
          <FontAwesomeIcon icon={faUserGraduate} />
          Student
        </Badge>
      );
    default:
      return <Badge>Unknown</Badge>;
  }
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase() || "U";
}

function formatJoinedDate(date?: string | null) {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  onResetPassword,
  onRowClick,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border/60 p-4"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="hidden h-11 w-32 rounded-xl md:block" />
            <Skeleton className="hidden h-11 w-24 rounded-xl lg:block" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <FontAwesomeIcon icon={faUsers} className="h-7 w-7" />
        </div>
        <div className="text-lg font-semibold text-foreground">
          No users found
        </div>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or create a new user
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70">
      <Table>
        <TableHeader className="bg-muted/35">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[240px]">User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className={cn(
                "group border-border/60",
                onRowClick && "cursor-pointer hover:bg-primary/5"
              )}
              onClick={() => onRowClick?.(user)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-sm font-bold text-foreground ring-1 ring-border/70">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID #{user.id}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex min-w-[210px] flex-col">
                  <span className="truncate text-sm font-medium">
                    {user.email || user.login || "-"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.phone || "-"}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getUserTypeLabel(user.type)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-success/20 bg-success/10 text-success"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatJoinedDate(user.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(user);
                    }}
                    aria-label="View student profile"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(user);
                    }}
                    aria-label="Edit user"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetPassword(user);
                    }}
                    aria-label="Reset password"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faKey} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(user);
                    }}
                    aria-label="Delete user"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
