"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  useSetAdminPassword,
} from "@/hooks/useAdmins";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/lib/constants";
import { AdminModal } from "@/components/admins/AdminModal";
import { PromoteUserModal } from "@/components/admins/PromoteUserModal";
import { SetPasswordDialog } from "@/components/admins/SetPasswordDialog";
import { DeleteConfirmDialog } from "@/components/admins/DeleteConfirmDialog";
import { UserRoleModal } from "@/components/roles/UserRoleModal";
import { AdminTable } from "@/components/admins/AdminTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUserShield,
  faLock,
  faSearch,
  faRotateLeft,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Admin } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

type RoleFilter = "all" | "1";

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "1", label: "Admins" },
];

export default function AdminManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoleFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminForRoles, setAdminForRoles] = useState<Admin | null>(null);

  const { user } = useAuth();
  const { data, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const setAdminPassword = useSetAdminPassword();

  // Check if logged-in user is an Admin (type: 1)
  const isAdmin = user?.type === USER_TYPES.ADMIN;

  const admins: Admin[] = (() => {
    if (!data?.data) return [];
    const responseData = data.data as { data?: Admin[] } | Admin[];
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

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

  const filteredAdmins = useMemo(() => {
    let filtered: Admin[] = admins;

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (admin: Admin) =>
          admin.name?.toLowerCase().includes(query) ||
          admin.email?.toLowerCase().includes(query) ||
          admin.login?.toLowerCase().includes(query) ||
          admin.phone?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (admin: Admin) => admin.type === parseInt(typeFilter, 10)
      );
    }

    return filtered;
  }, [admins, debouncedSearch, typeFilter]);

  const adminCount = useMemo(
    () => admins.filter((a) => a.type === 1).length,
    [admins]
  );

  const hasActiveFilters = typeFilter !== "all" || searchQuery.trim() !== "";
  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) + (searchQuery.trim() !== "" ? 1 : 0);

  const canDelete = admins.length > 1;

  const handleCreate = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleSetPassword = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsPasswordModalOpen(true);
  };

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const openRoleModal = (admin: Admin) => {
    setAdminForRoles(admin);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setAdminForRoles(null);
  };

  const handleFormSubmit = (adminData: unknown) => {
    if (selectedAdmin) {
      updateAdmin.mutate(
        {
          id: selectedAdmin.id,
          data: adminData as Parameters<typeof updateAdmin.mutate>[0]["data"],
        },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createAdmin.mutate(
        adminData as Parameters<typeof createAdmin.mutate>[0],
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    }
  };

  const handlePasswordSubmit = (currentPassword: string) => {
    if (!selectedAdmin) return;
    setAdminPassword.mutate(
      {
        id: selectedAdmin.id,
        data: { currentPassword },
      },
      {
        onSuccess: () => setIsPasswordModalOpen(false),
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedAdmin) return;
    deleteAdmin.mutate(selectedAdmin.id, {
      onSuccess: () => setIsDeleteModalOpen(false),
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setTypeFilter("all");
  };

  // Show access denied for non-admin users (Moderators)
  if (!isAdmin) {
    return (
      <PageContainer className="py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md">
            <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              Admin Management is only available to Admin users (type: 1).
              Moderators do not have access to this feature.
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <PageHeader
        eyebrow="Admin Management"
        eyebrowIcon={faUserShield}
        title="Team & Permissions"
        description={
          isLoading
            ? "Loading your team…"
            : `Manage ${admins.length} account${admins.length === 1 ? "" : "s"} with privileged access — keep roles tidy and access calm.`
        }
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPromoteModalOpen(true)}
              size="default"
              variant="outline"
              className="h-11 rounded-full px-5 font-semibold shadow-sm"
            >
              <FontAwesomeIcon icon={faArrowUp} className="mr-2 h-4 w-4" />
              Promote User
            </Button>
            <Button
              onClick={handleCreate}
              size="default"
              className="h-11 rounded-full px-5 font-semibold shadow-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
              {createAdmin.isPending ? "Creating..." : "Add Admin"}
            </Button>
          </div>
        }
      />

      {/* Quick stats */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Total members"
          value={admins.length}
          tone="default"
          loading={isLoading}
        />
        <StatCard
          label="Admins"
          value={adminCount}
          tone="primary"
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
                placeholder="Search by name, email, phone, or login..."
                className="h-12 rounded-full border-border/80 bg-muted/30 pl-10 pr-4 text-base shadow-none transition-colors focus:bg-background"
                aria-label="Search admins"
              />
            </div>

            <div className="flex rounded-full border border-border/80 bg-muted/30 p-1">
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setTypeFilter(role.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    typeFilter === role.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <AdminTable
            admins={filteredAdmins}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetPassword={handleSetPassword}
            onManageRoles={openRoleModal}
            canDelete={canDelete}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleFormSubmit}
        admin={selectedAdmin}
        isSubmitting={createAdmin.isPending || updateAdmin.isPending}
      />

      <SetPasswordDialog
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handlePasswordSubmit}
        isSubmitting={setAdminPassword.isPending}
        targetAdminName={selectedAdmin?.name}
        targetAdminPhone={selectedAdmin?.phone || selectedAdmin?.login}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteAdmin.isPending}
        canDelete={canDelete}
        adminName={selectedAdmin?.name}
      />

      <PromoteUserModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
      />

      <UserRoleModal
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        user={adminForRoles}
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
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          toneStyles
        )}
      />
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
