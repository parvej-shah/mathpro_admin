"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherList } from "@/components/teachers/TeacherList";
import { TeacherForm } from "@/components/teachers/TeacherForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTeachers, useDeleteTeacher } from "@/hooks/useTeachers";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faChalkboardUser,
  faMagnifyingGlass,
  faRotateLeft,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { Teacher } from "@/services/teacher.service";

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

type StatusFilter = "all" | "active" | "inactive";
type CategoryFilter = "all" | "instructor" | "teacher";
type SortOption = "name-asc" | "name-desc" | "created-desc" | "created-asc";

export default function TeacherDashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const queryClient = useQueryClient();

  // Filters
  const [inlineSearch, setInlineSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("created-desc");
  const [page, setPage] = useState(1);

  const { data: teachersData, isLoading } = useTeachers();
  const deleteTeacher = useDeleteTeacher();

  // Debounce search
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    const t = setTimeout(() => {
      if (!isMountedRef.current) return;
      const next = inlineSearch.trim();
      if (appliedSearch === next) return;
      setAppliedSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      isMountedRef.current = false;
      clearTimeout(t);
    };
  }, [inlineSearch, appliedSearch]);

  // Parse raw teachers
  const rawTeachers: Teacher[] = useMemo(() => {
    if (!teachersData?.data) return [];
    const responseData = teachersData.data as Teacher[] | { data?: Teacher[] };
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === "object" && "data" in responseData) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [teachersData]);

  // Apply client-side filters & sort
  const filteredTeachers = useMemo(() => {
    let result = [...rawTeachers];

    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.login?.toLowerCase().includes(q) ||
          t.role?.toLowerCase().includes(q) ||
          t.university?.toLowerCase().includes(q) ||
          t.bio?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "active") result = result.filter((t) => t.isActive !== false);
    if (statusFilter === "inactive") result = result.filter((t) => t.isActive === false);
    if (categoryFilter !== "all") result = result.filter((t) => t.category === categoryFilter);

    const [field, dir] = sortOption.split("-") as [string, string];
    result.sort((a, b) => {
      let cmp = 0;
      if (field === "name") cmp = (a.name || "").localeCompare(b.name || "");
      if (field === "created") {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        cmp = da - db;
      }
      return dir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [rawTeachers, appliedSearch, statusFilter, categoryFilter, sortOption]);

  // Pagination
  const total = filteredTeachers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginatedTeachers = filteredTeachers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Handlers
  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTeacher) {
      deleteTeacher.mutate(selectedTeacher.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedTeacher(null);
        },
      });
    }
  };

  const handleCreate = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  const handleResetFilters = () => {
    setInlineSearch("");
    setAppliedSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortOption("created-desc");
    setPage(1);
  };

  const hasActiveFilters =
    appliedSearch !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    sortOption !== "created-desc";

  const activeFilterCount = [
    appliedSearch !== "",
    statusFilter !== "all",
    categoryFilter !== "all",
    sortOption !== "created-desc",
  ].filter(Boolean).length;

  return (
    <PageContainer className="py-8">
      <PageHeader
        eyebrow="Teachers"
        eyebrowIcon={faChalkboardUser}
        title="Teacher Management"
        description={
          isLoading
            ? "Loading your team…"
            : `${rawTeachers.length} teacher${rawTeachers.length === 1 ? "" : "s"} in your team — manage profiles, courses, and access from one place.`
        }
        action={
          <Button
            onClick={handleCreate}
            className="h-11 rounded-full px-5 font-semibold shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        }
        className="mb-8"
      />

      {/* Search + filters row */}
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* Search */}
        <div className="relative w-full xl:max-w-md xl:flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          />
          <Input
            type="search"
            value={inlineSearch}
            onChange={(e) => setInlineSearch(e.target.value)}
            placeholder="Search by name, phone, email, or university…"
            className="h-11 rounded-full border-transparent bg-muted/40 pl-10 pr-4 transition-colors focus-visible:bg-background"
            aria-label="Search teachers"
          />
        </div>

        {/* Filter pills + sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status toggle */}
          <div className="flex rounded-full border border-border/80 bg-muted/30 p-1">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === status
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "all" ? "All" : status === "active" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {/* Category toggle */}
          <div className="flex rounded-full border border-border/80 bg-muted/30 p-1">
            {(["all", "instructor", "teacher"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors capitalize",
                  categoryFilter === cat
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <Select
            value={sortOption}
            onValueChange={(v) => {
              setSortOption(v as SortOption);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-180px rounded-full border-border/80 bg-muted/30">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created-desc">Newest first</SelectItem>
              <SelectItem value="created-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/15 px-2 text-xs font-bold text-primary">
                {activeFilterCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 rounded-full px-3 text-muted-foreground hover:text-foreground"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="mr-2 h-3.5 w-3.5" />
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Teacher grid */}
      <TeacherList
        teachers={paginatedTeachers}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 px-5 py-4 sm:flex-row">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
            <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Teacher Form */}
      <TeacherForm
        teacher={selectedTeacher}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTeacher(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["teachers"] });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedTeacher?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteTeacher.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTeacher.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
