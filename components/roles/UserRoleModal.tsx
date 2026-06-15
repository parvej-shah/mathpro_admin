"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useRoles,
  useUserRoles,
  useUserPermissions,
  useAssignRole,
  useRemoveRole,
} from "@/hooks/useRoles";
import type { User, Role, RoleAssignment } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Shield, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserRoleModal({ isOpen, onClose, user }: UserRoleModalProps) {
  const [assignRoleId, setAssignRoleId] = useState<string>("");

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles(
    user?.id ?? null
  );
  const { data: userPermsData, isLoading: userPermsLoading } =
    useUserPermissions(user?.id ?? null);

  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const roles: Role[] = useMemo(() => {
    const raw = rolesData?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const wrapped = raw as { data?: Role[] };
    return Array.isArray(wrapped?.data) ? wrapped.data : [];
  }, [rolesData]);
  const userRoles: RoleAssignment[] = useMemo(() => {
    const raw = userRolesData?.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [userRolesData]);
  const userPermissions: string[] = useMemo(() => {
    const raw = userPermsData?.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [userPermsData]);

  const assignedRoleIds = useMemo(
    () =>
      new Set(
        userRoles.map((ur) => (ur as { role_id?: number }).role_id ?? ur.id)
      ),
    [userRoles]
  );
  const availableRoles = useMemo(
    () => roles.filter((r) => !assignedRoleIds.has(r.id)),
    [roles, assignedRoleIds]
  );

  const handleAssign = () => {
    if (!user || !assignRoleId) return;
    const roleId = parseInt(assignRoleId, 10);
    if (Number.isNaN(roleId)) return;
    assignRole.mutate(
      { userId: user.id, roleId },
      { onSuccess: () => setAssignRoleId("") }
    );
  };

  const handleRemove = (roleId: number) => {
    if (!user) return;
    removeRole.mutate({ userId: user.id, roleId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-w-md p-0 gap-0 overflow-hidden",
          "rounded-2xl border border-border/60 shadow-2xl shadow-black/20",
          "max-h-[88vh] flex flex-col"
        )}
      >
        {/* Header with user identity */}
        <DialogHeader className="px-6 pt-6 pr-12 pb-4 text-left space-y-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl bg-muted/80 border border-border/50">
              <AvatarFallback className="rounded-xl text-sm font-medium text-muted-foreground">
                {user ? getInitials(user.name) : "—"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight truncate">
                {user ? user.name : "Manage roles"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {user
                  ? user.email || user.login || user.phone || "No contact"
                  : "Select a user to manage their roles."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-0" />

        {!user ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-2xl bg-muted/40 p-4 mb-4">
              <UserCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No user selected.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 py-5 space-y-6">
              {/* Current roles */}
              <section className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Current roles
                </p>
                {userRolesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center">
                    <Shield className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No roles assigned yet
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {userRoles.map((assignment) => {
                      const roleId =
                        (assignment as { role_id?: number }).role_id ??
                        assignment.id;
                      const name =
                        assignment.display_name ||
                        assignment.name ||
                        `Role ${roleId}`;
                      return (
                        <li
                          key={assignment.id}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-4 py-3",
                            "bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50",
                            "transition-colors duration-150"
                          )}
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-sm">{name}</span>
                            {assignment.name && name !== assignment.name && (
                              <span className="text-muted-foreground text-xs ml-2">
                                {assignment.name}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                            onClick={() => handleRemove(roleId)}
                            disabled={removeRole.isPending}
                            aria-label={`Remove ${name}`}
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {availableRoles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Select
                      value={assignRoleId}
                      onValueChange={setAssignRoleId}
                      disabled={rolesLoading}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/60 bg-muted/20 w-[200px] focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Add a role…" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {availableRoles.map((r) => (
                          <SelectItem
                            key={r.id}
                            value={String(r.id)}
                            className="rounded-lg"
                          >
                            {r.display_name} ({r.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-10 rounded-xl px-4 font-medium"
                      onClick={handleAssign}
                      disabled={!assignRoleId || assignRole.isPending}
                      aria-label={
                        assignRole.isPending ? "Assigning…" : "Assign role"
                      }
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2 text-xs" />
                      {assignRole.isPending ? "Assigning…" : "Assign"}
                    </Button>
                  </div>
                )}
              </section>

              <Separator className="bg-border/50" />

              {/* Aggregated permissions */}
              <section className="space-y-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Aggregated permissions
                </p>
                {userPermsLoading ? (
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ) : userPermissions.length === 0 ? (
                  <div className="rounded-xl bg-muted/15 px-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      No permissions from current roles
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userPermissions.map((perm) => (
                      <span
                        key={perm}
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1",
                          "text-[11px] font-mono font-medium",
                          "bg-primary/10 text-primary border border-primary/20"
                        )}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
