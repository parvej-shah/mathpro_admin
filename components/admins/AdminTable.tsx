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
  faEdit,
  faTrash,
  faKey,
  faUserShield,
  faUserTie,
  faUserTag,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import type { Admin } from "@/types";
import { cn } from "@/lib/utils";

interface AdminTableProps {
  admins: Admin[];
  loading: boolean;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  onSetPassword: (admin: Admin) => void;
  onManageRoles: (admin: Admin) => void;
  canDelete: boolean;
}

function getRoleBadge(type: number) {
  if (type === 1) {
    return (
      <Badge
        variant="outline"
        className="w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary"
      >
        <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="w-fit gap-1.5 border-info/20 bg-info/10 text-info"
    >
      <FontAwesomeIcon icon={faUserTie} className="h-3 w-3" />
      Moderator
    </Badge>
  );
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase() || "A";
}

function getAvatarGradient(type: number) {
  return type === 1
    ? "from-primary/20 to-accent/20"
    : "from-info/20 to-primary/10";
}

function getLoginTypeLabel(loginType?: string) {
  if (!loginType) return "Email";
  const normalized = loginType.toLowerCase();
  if (normalized === "google") return "Google";
  if (normalized === "facebook") return "Facebook";
  if (normalized === "email") return "Email";
  return loginType.charAt(0).toUpperCase() + loginType.slice(1);
}

export function AdminTable({
  admins,
  loading,
  onEdit,
  onDelete,
  onSetPassword,
  onManageRoles,
  canDelete,
}: AdminTableProps) {
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
            <Skeleton className="hidden h-11 w-24 rounded-xl md:block" />
            <Skeleton className="hidden h-11 w-32 rounded-xl lg:block" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (admins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 py-16 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <FontAwesomeIcon icon={faUserGear} className="h-7 w-7" />
        </div>
        <div className="text-lg font-semibold text-foreground">No admins found</div>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or create a new admin to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/70">
      <Table>
        <TableHeader className="bg-muted/35">
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[240px]">Admin</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow
              key={admin.id}
              className="group border-border/60 transition-colors hover:bg-primary/5"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-sm font-bold text-foreground ring-1 ring-border/70",
                      getAvatarGradient(admin.type)
                    )}
                  >
                    {getInitials(admin.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">
                      {admin.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID #{admin.id}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex min-w-[210px] flex-col">
                  <span className="truncate text-sm font-medium">
                    {admin.email || admin.login || "-"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {admin.phone || "No phone"}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(admin.type)}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {getLoginTypeLabel(admin.login_type)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(admin)}
                    aria-label="Edit admin"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onManageRoles(admin)}
                    aria-label="Manage roles"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faUserTag} className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSetPassword(admin)}
                    aria-label="Set password"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(admin)}
                    disabled={!canDelete}
                    aria-label="Delete admin"
                    title={canDelete ? "Delete" : "Cannot delete last admin"}
                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
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
