"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/useUsers";
import {
  useRoles,
  useUserRoles,
  useUserPermissions,
  useAssignRole,
  useRemoveRole,
} from "@/hooks/useRoles";
import type { User, Role, RoleAssignment } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

function parseUsersResponse(res: unknown): User[] {
  const response = res as
    | { data?: { data?: User[]; users?: User[] } | User[] }
    | undefined;
  const raw = response?.data;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const obj = raw as { data?: User[]; users?: User[] };
  return obj?.data ?? obj?.users ?? [];
}

export function UserRoleAssignment() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<string>("");

  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: searchQuery,
    limit: 30,
    page: 1,
  });
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: userRolesData, isLoading: userRolesLoading } = useUserRoles(
    selectedUser?.id ?? null
  );
  const { data: userPermsData, isLoading: userPermsLoading } = useUserPermissions(
    selectedUser?.id ?? null
  );

  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const users = useMemo(
    () => parseUsersResponse(usersData?.data),
    [usersData]
  );
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
        userRoles.map((ur) =>
          (ur as { role_id?: number }).role_id ?? ur.id
        )
      ),
    [userRoles]
  );
  const availableRoles = useMemo(
    () => roles.filter((r) => !assignedRoleIds.has(r.id)),
    [roles, assignedRoleIds]
  );

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setAssignRoleId("");
    setOpen(false);
    setSearchQuery("");
  };

  const handleAssign = () => {
    if (!selectedUser || !assignRoleId) return;
    const roleId = parseInt(assignRoleId, 10);
    if (Number.isNaN(roleId)) return;
    assignRole.mutate(
      { userId: selectedUser.id, roleId },
      { onSuccess: () => setAssignRoleId("") }
    );
  };

  const handleRemove = (userId: number, roleId: number) => {
    removeRole.mutate({ userId, roleId });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select user</CardTitle>
          <CardDescription>
            Search by name or email to manage roles and view permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {selectedUser ? (
                  <span>
                    {selectedUser.name} ({selectedUser.email ?? selectedUser.login})
                  </span>
                ) : (
                  "Select user…"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search users…"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {usersLoading ? "Loading…" : "No users found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={`${user.id}-${user.name}-${user.email ?? user.login}`}
                        onSelect={() => handleSelectUser(user)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email ?? user.login} · ID {user.id}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {!selectedUser && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FontAwesomeIcon
              icon={faUser}
              className="h-12 w-12 text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground font-medium">
              Select a user to manage their roles
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Use the search above to find a user by name or email
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Current roles</CardTitle>
              <CardDescription>
                Roles assigned to {selectedUser.name}. Remove or add roles below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRolesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : userRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This user has no roles assigned.
                </p>
              ) : (
                <ul className="space-y-2">
                  {userRoles.map((assignment) => {
                    const roleId = (assignment as { role_id?: number }).role_id ?? assignment.id;
                    const name = assignment.display_name || assignment.name || `Role ${roleId}`;
                    return (
                      <li
                        key={assignment.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <span className="font-medium">{name}</span>
                          {assignment.name && (
                            <span className="text-muted-foreground text-sm ml-2">
                              ({assignment.name})
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(selectedUser.id, roleId)}
                          disabled={removeRole.isPending}
                          aria-label={`Remove role ${name}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {availableRoles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                  <Select
                    value={assignRoleId}
                    onValueChange={setAssignRoleId}
                    disabled={rolesLoading}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select role to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.display_name} ({r.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssign}
                    disabled={!assignRoleId || assignRole.isPending}
                    aria-label={assignRole.isPending ? "Assigning role" : "Assign selected role"}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    {assignRole.isPending ? "Assigning…" : "Assign"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aggregated permissions</CardTitle>
              <CardDescription>
                Permissions this user has from all assigned roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPermsLoading ? (
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ) : userPermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No permissions (no roles or roles have no permissions).
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userPermissions.map((perm) => (
                    <Badge
                      key={perm}
                      variant="secondary"
                      className="font-mono text-xs"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
