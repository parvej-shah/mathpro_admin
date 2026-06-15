"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetUserPassword,
} from "@/hooks/useUsers";
import { UserTable } from "@/components/users/UserTable";
import { UserModal } from "@/components/users/UserModal";
import { DeleteConfirmDialog } from "@/components/users/DeleteConfirmDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faSliders,
  faUsers,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";
import type { UserListParams } from "@/services/user.service";

const SEARCH_DEBOUNCE_MS = 350;

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserListParams>({
    status: "all",
    search: "",
    sortBy: "created_at",
    sortOrder: "DESC",
    page: 1,
    limit: 20,
  });

  const [moreFiltersExpanded, setMoreFiltersExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [inlineSearch, setInlineSearch] = useState(filters.search ?? "");

  const { data, isLoading } = useUsers(filters);

  // Sync inline search when filters.search changes (e.g. from Reset filters)
  useEffect(() => {
    setInlineSearch(filters.search ?? "");
  }, [filters.search]);

  // Debounce inline search to avoid API call on every keystroke; guard against updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    const t = setTimeout(() => {
      if (!isMountedRef.current) return;
      setFilters((prev) => {
        const nextSearch = inlineSearch.trim();
        if ((prev.search ?? "").trim() === nextSearch) return prev;
        return { ...prev, search: nextSearch, page: 1 };
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isMountedRef.current = false;
      clearTimeout(t);
    };
  }, [inlineSearch]);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();

  // Parse the API response correctly
  // The API can return either:
  // 1. { success: true, data: { data: User[], pagination: {...} } } (PaginatedResponse format)
  // 2. { success: true, data: { users: User[], pagination: {...} } } (Old format)
  const responseData = data?.data as
    | { data?: User[]; users?: User[]; pagination?: unknown }
    | undefined;

  // Handle both formats: check for 'data' first (new format), then 'users' (old format)
  const users = responseData?.data || responseData?.users || [];

  const paginationData = (responseData?.pagination || {}) as {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
  };

  const pagination = {
    page: paginationData.page || filters.page || 1,
    limit: paginationData.limit || filters.limit || 20,
    total: paginationData.total || 0,
    totalPages:
      paginationData.totalPages ||
      Math.ceil((paginationData.total || 0) / (paginationData.limit || 20)) ||
      1,
    hasMore: paginationData.hasMore || false,
  };

  const handleFilterChange = (newFilters: Partial<UserListParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async (userData: unknown) => {
    if (selectedUser) {
      updateUser.mutate(
        {
          id: selectedUser.id,
          data: userData as Parameters<typeof updateUser.mutate>[0]["data"],
        },
        { onSuccess: () => closeModal() }
      );
    } else {
      createUser.mutate(userData as Parameters<typeof createUser.mutate>[0], {
        onSuccess: () => closeModal(),
      });
    }
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsPermanentDelete(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUser.mutate(
      { id: selectedUser.id, permanent: isPermanentDelete },
      { onSuccess: () => closeDeleteModal() }
    );
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const confirmResetPassword = () => {
    if (!selectedUser) return;
    resetPassword.mutate(selectedUser.id, {
      onSuccess: () => closeResetPasswordModal(),
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      search: "",
      sortBy: "created_at",
      sortOrder: "DESC",
      page: 1,
      limit: filters.limit ?? 20,
    });
    setInlineSearch("");
  };

  const handleRowClick = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    (filters.search ?? "").trim() !== "" ||
    filters.sortBy !== "created_at" ||
    filters.sortOrder !== "DESC";
  const activeFilterCount = [
    filters.status !== "all",
    (filters.search ?? "").trim() !== "",
    filters.sortBy !== "created_at",
    filters.sortOrder !== "DESC",
  ].filter(Boolean).length;

  return (
    <PageContainer className="py-6">
      <PageHeader
        eyebrow="Users"
        eyebrowIcon={faUsers}
        title="User Management"
        description="Find people quickly, review their history, and manage account access from one calm workspace."
        action={
          <Button
            onClick={openCreateModal}
            size="default"
            className="h-11 rounded-full px-5 font-semibold shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

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
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="h-12 rounded-full border-border/80 bg-muted/30 pl-10 pr-4 text-base shadow-none transition-colors focus:bg-background"
                aria-label="Search users"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex rounded-full border border-border/80 bg-muted/30 p-1">
                {(["all", "active", "inactive"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleFilterChange({ status, page: 1 })}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      (filters.status ?? "all") === status
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {status === "all"
                      ? "All"
                      : status === "active"
                      ? "Active"
                      : "Inactive"}
                  </button>
                ))}
              </div>
              <Select
                value={`${filters.sortBy ?? "created_at"}-${filters.sortOrder ?? "DESC"}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-") as [
                    UserListParams["sortBy"],
                    "ASC" | "DESC"
                  ];
                  handleFilterChange({ sortBy, sortOrder, page: 1 });
                }}
              >
                <SelectTrigger className="h-12 w-[180px] rounded-full border-border/80 bg-muted/30">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-DESC">Newest first</SelectItem>
                  <SelectItem value="created_at-ASC">Oldest first</SelectItem>
                  <SelectItem value="updated_at-DESC">Recently updated</SelectItem>
                  <SelectItem value="name-ASC">Name A-Z</SelectItem>
                  <SelectItem value="name-DESC">Name Z-A</SelectItem>
                  <SelectItem value="email-ASC">Email A-Z</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="default"
                onClick={() => setMoreFiltersExpanded((prev) => !prev)}
                className={cn(
                  "relative h-12 shrink-0 rounded-full px-4 font-medium",
                  "border border-border/80 bg-muted/30 hover:bg-muted/50",
                  hasActiveFilters && "border-primary/50 bg-primary/5",
                  moreFiltersExpanded && "bg-muted/50"
                )}
                aria-label={
                  moreFiltersExpanded
                    ? "Hide extra options"
                    : "Show sort and reset options"
                }
                aria-expanded={moreFiltersExpanded}
              >
                <FontAwesomeIcon icon={faSliders} className="mr-2 h-4 w-4" />
                More
                {hasActiveFilters && (
                  <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1 text-xs font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {moreFiltersExpanded && (
            <div className="space-y-4 rounded-3xl border border-border/80 bg-muted/20 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sort by</Label>
                  <Select
                    value={filters.sortBy ?? "created_at"}
                    onValueChange={(value) =>
                      handleFilterChange({
                        sortBy: value as UserListParams["sortBy"],
                        page: 1,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-[180px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created date</SelectItem>
                      <SelectItem value="updated_at">Updated date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order</Label>
                  <Select
                    value={filters.sortOrder ?? "DESC"}
                    onValueChange={(value) =>
                      handleFilterChange({
                        sortOrder: value as "ASC" | "DESC",
                        page: 1,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-[140px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASC">Ascending</SelectItem>
                      <SelectItem value="DESC">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleResetFilters}
                  className="h-10 rounded-xl"
                >
                  Reset filters
                </Button>
              </div>
            </div>
          )}

          <UserTable
            users={users}
            loading={isLoading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onResetPassword={handleResetPassword}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > 0 && (
        <Card className="mt-5 border-border/70 bg-card/80 shadow-sm">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    handleFilterChange({
                      limit: parseInt(e.target.value, 10),
                      page: 1,
                    });
                  }}
                  className="rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition-all"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded-full"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>
                  <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-full"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isSubmitting={createUser.isPending || updateUser.isPending}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isPermanent={isPermanentDelete}
        onPermanentChange={setIsPermanentDelete}
        isDeleting={deleteUser.isPending}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        isOpen={isResetPasswordModalOpen}
        onClose={closeResetPasswordModal}
        onConfirm={confirmResetPassword}
        isResetting={resetPassword.isPending}
      />

    </PageContainer>
  );
}
