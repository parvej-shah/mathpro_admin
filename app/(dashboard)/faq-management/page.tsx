"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faFilter,
  faGlobe,
  faListOl,
} from "@fortawesome/free-solid-svg-icons";
import { Plus, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaqFormDialog } from "@/components/faqs/FaqFormDialog";
import { FaqDeleteDialog } from "@/components/faqs/FaqDeleteDialog";
import { FaqTable } from "@/components/faqs/FaqTable";
import {
  FAQ_CATEGORIES,
  type CreateFaqData,
  type PublicFaq,
} from "@/services/faq.service";
import {
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
  useReorderFaqs,
  useUpdateFaq,
} from "@/hooks/useFaqs";

type StatusFilter = "all" | "active" | "hidden";
type CategoryFilter = "all" | (typeof FAQ_CATEGORIES)[number];

function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function FaqManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<PublicFaq | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<PublicFaq | null>(null);

  const { data: faqs = [], isLoading } = useFaqs();
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();
  const deleteFaq = useDeleteFaq();
  const reorderFaqs = useReorderFaqs();

  const orderedFaqs = useMemo(
    () => [...faqs].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [faqs],
  );

  const filteredFaqs = useMemo(() => {
    return orderedFaqs.filter((faq) => {
      const matchesSearch =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && faq.is_active) ||
        (statusFilter === "hidden" && !faq.is_active);

      const matchesCategory =
        categoryFilter === "all" || faq.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [orderedFaqs, searchQuery, statusFilter, categoryFilter]);

  const canReorder =
    !searchQuery.trim() && statusFilter === "all" && categoryFilter === "all";

  const stats = useMemo(() => {
    const total = faqs.length;
    const active = faqs.filter((faq) => faq.is_active).length;
    const hidden = total - active;
    return { total, active, hidden };
  }, [faqs]);

  const handleCreate = (data: CreateFaqData) => {
    createFaq.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleUpdate = (data: CreateFaqData) => {
    if (!editingFaq) return;

    updateFaq.mutate(
      {
        id: editingFaq.id,
        ...data,
      },
      {
        onSuccess: () => {
          setEditingFaq(null);
          setIsFormOpen(false);
        },
      },
    );
  };

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Content"
          eyebrowIcon={faCircleQuestion}
          title="FAQ Management"
          description="Control the shared FAQ library used across the public homepage, courses page, and course detail page."
          action={
            <Button
              className="h-11 rounded-full px-5 font-semibold shadow-sm shadow-primary/20"
              onClick={() => {
                setEditingFaq(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New FAQ
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-border/70 bg-linear-to-br from-card to-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total FAQs</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <FontAwesomeIcon icon={faListOl} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/70 bg-linear-to-br from-card to-emerald-500/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.active}</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                  <FontAwesomeIcon icon={faGlobe} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border/70 bg-linear-to-br from-card to-amber-500/5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hidden</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.hidden}</p>
                </div>
                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                  <FontAwesomeIcon icon={faFilter} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by question or answer..."
                  className="h-11 rounded-full pl-9"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
                >
                  <SelectTrigger className="w-full rounded-full sm:w-[180px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {FAQ_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {formatCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <SelectTrigger className="w-full rounded-full sm:w-[160px]">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary">
                    Category: {formatCategoryLabel(categoryFilter)}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary">
                    Status: {formatCategoryLabel(statusFilter)}
                  </Badge>
                )}
                <button
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {!canReorder && (
          <p className="text-sm text-muted-foreground">
            Clear the search and category/status filters to drag and reorder the full FAQ list.
          </p>
        )}

        <FaqTable
          faqs={filteredFaqs}
          loading={isLoading}
          sortable={canReorder}
          isReordering={reorderFaqs.isPending}
          onEdit={(faq) => {
            setEditingFaq(faq);
            setIsFormOpen(true);
          }}
          onDelete={(faq) => setDeletingFaq(faq)}
          onReorder={(nextFaqs) => reorderFaqs.mutateAsync(nextFaqs.map((faq) => faq.id))}
        />
      </div>

      <FaqFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFaq(null);
        }}
        faq={editingFaq}
        isSubmitting={createFaq.isPending || updateFaq.isPending}
        onSubmit={editingFaq ? handleUpdate : handleCreate}
      />

      <FaqDeleteDialog
        faq={deletingFaq}
        open={!!deletingFaq}
        isDeleting={deleteFaq.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingFaq(null);
        }}
        onConfirm={() => {
          if (!deletingFaq) return;
          deleteFaq.mutate(deletingFaq.id, {
            onSuccess: () => setDeletingFaq(null),
          });
        }}
      />
    </PageContainer>
  );
}
