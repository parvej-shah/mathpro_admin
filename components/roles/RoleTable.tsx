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
import {
  faEdit,
  faTrash,
  faShieldHalved,
  faUserTag,
  faKey,
  faCircleCheck,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

const SYSTEM_ROLE_NAMES = new Set([
  "admin",
  "moderator",
  "student",
  "teacher",
  "ambassador",
]);

export type RoleTableEmptyState = "no-roles" | "no-results";

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  emptyState?: RoleTableEmptyState;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

function isSystemRole(role: Role): boolean {
  return SYSTEM_ROLE_NAMES.has(role.name?.toLowerCase());
}

function getInitials(displayName: string, name: string) {
  const source = (displayName || name || "").trim();
  if (!source) return "R";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAvatarGradient(system: boolean) {
  return system
    ? "from-primary/20 to-accent/20"
    : "from-info/20 to-primary/10";
}

function getRoleBadge(system: boolean) {
  if (system) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
        <FontAwesomeIcon icon={faShieldHalved} className="h-3 w-3" />
        System
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-info/20 bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info">
      <FontAwesomeIcon icon={faUserTag} className="h-3 w-3" />
      Custom
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
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

function truncate(str: string | null | undefined, max: number) {
  if (!str) return "—";
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

export function RoleTable({
  roles,
  isLoading,
  emptyState = "no-roles",
  onEdit,
  onDelete,
}: RoleTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border/60 p-4"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="hidden h-11 w-28 rounded-xl md:block" />
            <Skeleton className="hidden h-11 w-24 rounded-xl md:block" />
            <Skeleton className="hidden h-11 w-32 rounded-xl lg:block" />
            <Skeleton className="h-11 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <FontAwesomeIcon icon={faTags} className="h-7 w-7" />
        </div>
        <div className="text-lg font-semibold text-foreground">
          {emptyState === "no-results" ? "No roles match your search" : "No roles yet"}
        </div>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {emptyState === "no-results"
            ? "Try adjusting your filters or search query to find what you need."
            : "Create your first role to start grouping permissions and access."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70">
      <Table>
        <TableHeader className="bg-muted/35">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[240px]">Role</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => {
            const system = isSystemRole(role);
            const permissionCount = role.permissions?.length ?? 0;
            return (
              <TableRow
                key={role.id}
                className="group border-border/60 transition-colors hover:bg-primary/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-sm font-bold text-foreground ring-1 ring-border/70",
                        getAvatarGradient(system)
                      )}
                    >
                      {getInitials(role.display_name, role.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">
                        {role.display_name || role.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        <span className="font-mono">{role.name}</span>
                        <span className="mx-1.5 opacity-60">·</span>
                        <span>ID #{role.id}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(system)}</TableCell>
                <TableCell className="max-w-[260px]">
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {truncate(role.description, 90)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
                      permissionCount > 0
                        ? "border-info/20 bg-info/10 text-info"
                        : "border-border/80 bg-muted/40 text-muted-foreground"
                    )}
                    title={
                      permissionCount > 0
                        ? `${permissionCount} permission${permissionCount === 1 ? "" : "s"}`
                        : "No permissions assigned"
                    }
                  >
                    <FontAwesomeIcon
                      icon={permissionCount > 0 ? faCircleCheck : faKey}
                      className="h-3 w-3 shrink-0"
                    />
                    <span className="leading-none">
                      {permissionCount} permission{permissionCount === 1 ? "" : "s"}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {formatDate(role.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(role)}
                      aria-label={`Edit role ${role.display_name || role.name}`}
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(role)}
                      aria-label={`Delete role ${role.display_name || role.name}`}
                      title={
                        system
                          ? "System role — proceed with caution"
                          : "Delete role"
                      }
                      className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
