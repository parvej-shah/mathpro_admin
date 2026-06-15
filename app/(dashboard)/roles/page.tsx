"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleTable } from "@/components/roles/RoleTable";
import { RoleFormDialog } from "@/components/roles/RoleFormDialog";
import { DeleteRoleDialog } from "@/components/roles/DeleteRoleDialog";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/useRoles";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/lib/constants";
import type { Role, CreateRoleData } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLock,
  faShieldHalved,
  faSearch,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const SYSTEM_ROLE_NAMES = new Set([
  "admin",
  "moderator",
  "student",
  "teacher",
  "ambassador",
]);

const SEARCH_DEBOUNCE_MS = 300;

type TypeFilter = "all" | "system" | "custom";

const TYPE_FILTERS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "system", label: "System" },
  { value: "custom", label: "Custom" },
];

function isSystemRole(role: Role): boolean {
  return SYSTEM_ROLE_NAMES.has(role.name?.toLowerCase());
}

export default function RoleManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.type === USER_TYPES.ADMIN;

  const { data: rolesData, isLoading, isError, error } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const roles: Role[] = useMemo(() => {
    const raw = rolesData?.data;
    if (Array.isArray(raw)) return raw;
    return [];
  }, [rolesData]);

  // Debounce search input
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    const t = setTimeout(() => {
      if (!isMountedRef.current) return;
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isMountedRef.current = false;
      clearTimeout(t);
    };
  }, [searchQuery]);

  const filteredRoles = useMemo(() => {
    let list = roles;

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.display_name?.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q)
      );
    }

    if (typeFilter === "system") {
      list = list.filter(isSystemRole);
    } else if (typeFilter === "custom") {
      list = list.filter((r) => !isSystemRole(r));
    }

    return list;
  }, [roles, debouncedSearch, typeFilter]);

  const emptyState: "no-roles" | "no-results" =
    roles.length === 0 ? "no-roles" : "no-results";

  const systemCount = useMemo(
    () => roles.filter((r) => isSystemRole(r)).length,
    [roles]
  );
  const customCount = useMemo(
    () => roles.filter((r) => !isSystemRole(r)).length,
    [roles]
  );

  const hasActiveFilters = typeFilter !== "all" || searchQuery.trim() !== "";
  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) + (searchQuery.trim() !== "" ? 1 : 0);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (data: CreateRoleData) => {
    if (selectedRole) {
      updateRole.mutate(
        { id: selectedRole.id, data },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createRole.mutate(data, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedRole) return;
    setDeleteError(null);
    deleteRole.mutate(selectedRole.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedRole(null);
      },
      onError: (err: Error) => {
        setDeleteError(err.message || "Failed to delete role");
      },
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setTypeFilter("all");
  };

  const isForbidden =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 403;

  if (!isAdmin) {
    return (
      <PageContainer className="py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md">
            <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              Role Management is only available to Admin users.
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  if (isForbidden) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive" className="max-w-md">
          <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
          <AlertTitle>Permission denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to manage roles. Contact your
            administrator if you need access.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <PageHeader
        eyebrow="Role Management"
        eyebrowIcon={faShieldHalved}
        title="Roles & Permissions"
        description={
          isLoading
            ? "Loading your roles…"
            : `Curate ${roles.length} role${roles.length === 1 ? "" : "s"} that bundle permissions into clean, named access levels — keep authority intentional.`
        }
        action={
          <Button
            onClick={handleCreate}
            size="default"
            className="h-11 rounded-full px-5 font-semibold shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            {createRole.isPending ? "Creating…" : "Create role"}
          </Button>
        }
      />

      {/* Quick stats */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total roles"
          value={roles.length}
          tone="default"
          loading={isLoading}
        />
        <StatCard
          label="System"
          value={systemCount}
          tone="primary"
          loading={isLoading}
        />
        <StatCard
          label="Custom"
          value={customCount}
          tone="info"
          loading={isLoading}
        />
      </div>

      <Card className="mt-5 overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-6">
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="w-fit rounded-full text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon
                  icon={faRotateLeft}
                  className="mr-2 h-3.5 w-3.5"
                />
                Reset filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1 min-w-0">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, display name, or description..."
                className="h-12 rounded-full border-border/80 bg-muted/30 pl-10 pr-4 text-base shadow-none transition-colors focus:bg-background"
                aria-label="Search roles"
              />
            </div>

            <div className="flex rounded-full border border-border/80 bg-muted/30 p-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    typeFilter === f.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <RoleTable
            roles={filteredRoles}
            isLoading={isLoading}
            emptyState={emptyState}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <RoleFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRole(null);
        }}
        onSubmit={handleFormSubmit}
        role={selectedRole}
        isSubmitting={createRole.isPending || updateRole.isPending}
      />

      <DeleteRoleDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRole(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteRole.isPending}
        roleName={selectedRole?.display_name ?? selectedRole?.name}
        errorMessage={deleteError}
      />
    </PageContainer>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  tone: "default" | "primary" | "info";
  loading?: boolean;
}

function StatCard({ label, value, tone, loading }: StatCardProps) {
  const toneStyles =
    tone === "primary"
      ? "from-primary/15 via-primary/5 to-transparent text-primary"
      : tone === "info"
      ? "from-info/15 via-info/5 to-transparent text-info"
      : "from-muted/40 via-muted/10 to-transparent text-foreground";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-br opacity-80",
          toneStyles
        )}
      />
      // changed the class name to linier
      <div className="relative flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {loading ? "—" : value}
        </span>
      </div>
    </div>
  );
}
