"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BundleList } from "@/components/bundles/BundleList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useBundles, useDeleteBundle } from "@/hooks/useBundles";
import { purchaseService } from "@/services/purchase.service";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faDownload,
  faTrash,
  faMagnifyingGlass,
  faBoxesStacked,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import type { Bundle } from "@/services/bundle.service";

export default function BundleManagementPage() {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const { data: bundlesData, isLoading } = useBundles();
  const deleteBundle = useDeleteBundle();

  const bundles: Bundle[] = (() => {
    if (!bundlesData?.data) return [];
    const responseData = bundlesData.data as Bundle[] | { data?: Bundle[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();
  const canCreateBundle = hasPermission(user?.permissions, "bundle.manage.all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bundles;
    return bundles.filter((b) =>
      [b.title, b.short_description, b.url]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [bundles, search]);

  const handleView = (bundle: Bundle) => {
    router.push(`/combos/${bundle.id}`);
  };

  const handleEdit = (bundle: Bundle) => {
    router.push(`/combos/${bundle.id}/edit`);
  };

  const handleDelete = (bundle: Bundle) => {
    setSelectedBundle(bundle);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBundle) return;

    try {
      await deleteBundle.mutateAsync(selectedBundle.id);
      setDeleteDialogOpen(false);
      setSelectedBundle(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleExport = async (bundleId: number) => {
    try {
      const blob = await purchaseService.exportBundlePurchases(bundleId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bundle_${bundleId}_purchases_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export completed successfully!");
    } catch {
      toast.error("Failed to export purchases");
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = await purchaseService.exportBundlePurchases();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `all_bundle_purchases_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Export completed successfully!");
    } catch {
      toast.error("Failed to export purchases");
    }
  };

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <PageHeader
        eyebrow="Combos"
        eyebrowIcon={faBoxesStacked}
        title="Combo Management"
        description={
          isLoading
            ? "Loading your combos…"
            : `${bundles.length} combo${bundles.length === 1 ? "" : "s"} — package courses together and track their performance.`
        }
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportAll}
              className="h-11 rounded-full px-5 font-semibold"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
              Export All
            </Button>
            {canCreateBundle && (
              <Button
                asChild
                className="h-11 rounded-full px-5 font-semibold shadow-sm"
              >
                <Link href="/combos/new">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  Create Combo
                </Link>
              </Button>
            )}
          </div>
        }
        className="mb-8"
      />

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search combos…"
          className="pl-10 h-11 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>

      {/* Bundle List */}
      <BundleList
        bundles={filtered}
        loading={isLoading}
        searching={search.trim().length > 0}
        canCreate={canCreateBundle}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Combo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBundle?.title}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
