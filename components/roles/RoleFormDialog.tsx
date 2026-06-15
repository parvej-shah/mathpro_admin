"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/hooks/useRoles";
import type { Role } from "@/types";
import type { CreateRoleData } from "@/types";

interface RoleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleData) => void;
  role?: Role | null;
  isSubmitting?: boolean;
}

const SYSTEM_ROLE_NAMES = new Set([
  "admin",
  "moderator",
  "student",
  "teacher",
  "ambassador",
]);

function formatResourceLabel(key: string): string {
  return key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RoleFormDialog({
  isOpen,
  onClose,
  onSubmit,
  role,
  isSubmitting = false,
}: RoleFormDialogProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions(
    isOpen
  );
  
  // Deduplicate permissions in each resource group
  const byResource = useMemo(() => {
    const raw = permissionsData?.data?.by_resource ?? {};
    const deduplicated: Record<string, string[]> = {};
    for (const [resource, perms] of Object.entries(raw)) {
      deduplicated[resource] = Array.from(new Set(perms));
    }
    return deduplicated;
  }, [permissionsData?.data?.by_resource]);
  
  const allPermissions = permissionsData?.data?.all ?? [];
  const totalCount = permissionsData?.count ?? allPermissions.length;

  const selectedCount = selectedPermissions.size;
  const summary = useMemo(() => {
    if (totalCount === 0) return "";
    return `${selectedCount} of ${totalCount} selected`;
  }, [selectedCount, totalCount]);

  useEffect(() => {
    if (!isOpen) return;

    if (role) {
      setName(role.name ?? "");
      setDisplayName(role.display_name ?? "");
      setDescription(role.description ?? "");
      setSelectedPermissions(new Set(role.permissions ?? []));
    } else {
      setName("");
      setDisplayName("");
      setDescription("");
      setSelectedPermissions(new Set());
    }
  }, [role, isOpen]);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleResource = (resourcePerms: string[], checked: boolean) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      resourcePerms.forEach((p) => (checked ? next.add(p) : next.delete(p)));
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toLowerCase();
    const trimmedDisplay = displayName.trim();
    if (!trimmedName || !trimmedDisplay) return;

    onSubmit({
      name: trimmedName,
      display_name: trimmedDisplay,
      description: description.trim() || null,
      permissions: Array.from(selectedPermissions),
    });
  };

  const resourceEntries = Object.entries(byResource);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        aria-describedby="role-form-description"
      >
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription id="role-form-description">
            {role
              ? "Update role name, display name, description, and permissions."
              : "Add a new role. Name is stored in lowercase and must be unique."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 flex-1 min-h-0"
          aria-label={role ? "Edit role form" : "Create role form"}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name *</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. course_editor"
                required
                disabled={!!role && SYSTEM_ROLE_NAMES.has(role.name?.toLowerCase())}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier; stored in lowercase.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-display-name">Display name *</Label>
              <Input
                id="role-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Course Editor"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Description (optional)</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this role"
            />
          </div>

          <div className="space-y-2 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between">
              <Label>Permissions</Label>
              {summary && (
                <span className="text-sm text-muted-foreground">{summary}</span>
              )}
            </div>

            {permissionsLoading ? (
              <div className="border rounded-md p-4 text-sm text-muted-foreground">
                Loading permissions…
              </div>
            ) : resourceEntries.length === 0 ? (
              <div className="border rounded-md p-4 text-sm text-muted-foreground">
                No permissions available from the server.
              </div>
            ) : (
              <div
                className="border rounded-md p-3 overflow-y-auto max-h-[280px] space-y-4"
                role="group"
                aria-label="Permissions by resource"
              >
                {resourceEntries.map(([resource, perms]) => {
                  const checkedCount = perms.filter((p) =>
                    selectedPermissions.has(p)
                  ).length;
                  const allChecked = perms.length > 0 && checkedCount === perms.length;
                  return (
                    <div key={resource} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`resource-${resource}`}
                          checked={allChecked}
                          onCheckedChange={(checked) =>
                            toggleResource(perms, checked === true)
                          }
                          aria-label={`Select all ${formatResourceLabel(resource)} permissions`}
                        />
                        <label
                          htmlFor={`resource-${resource}`}
                          className="text-sm font-medium capitalize"
                        >
                          {formatResourceLabel(resource)} ({checkedCount}/{perms.length})
                        </label>
                      </div>
                      <div className="pl-6 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {perms.map((perm) => (
                          <div
                            key={perm}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={`perm-${perm}`}
                              checked={selectedPermissions.has(perm)}
                              onCheckedChange={() => togglePermission(perm)}
                            />
                            <label
                              htmlFor={`perm-${perm}`}
                              className="text-xs text-muted-foreground font-mono truncate"
                            >
                              {perm}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !name.trim() ||
                !displayName.trim() ||
                permissionsLoading
              }
            >
              {isSubmitting ? "Saving…" : role ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
