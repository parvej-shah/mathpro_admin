"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BundleCard } from "./BundleCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faMagnifyingGlass,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import type { Bundle } from "@/services/bundle.service";

interface BundleListProps {
  bundles: Bundle[];
  loading: boolean;
  searching?: boolean;
  canCreate?: boolean;
  onView: (bundle: Bundle) => void;
  onEdit: (bundle: Bundle) => void;
  onDelete: (bundle: Bundle) => void;
  onExport: (bundleId: number) => void;
}

export function BundleList({
  bundles,
  loading,
  searching = false,
  canCreate = false,
  onView,
  onEdit,
  onDelete,
  onExport,
}: BundleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card overflow-hidden">
            <Skeleton className="aspect-16/10 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FontAwesomeIcon
            icon={searching ? faMagnifyingGlass : faBoxesStacked}
            className="w-7 h-7 text-muted-foreground"
          />
        </div>
        <h3 className="text-lg font-semibold">
          {searching ? "No matches found" : "No combos yet"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {searching
            ? "Try a different search term to find what you’re looking for."
            : "Get started by creating your first combo."}
        </p>
        {!searching && canCreate && (
          <Button asChild className="mt-6 rounded-full">
            <Link href="/combos/new">
              <FontAwesomeIcon icon={faPlus} className="mr-2 w-4 h-4" />
              Create Combo
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {bundles.map((bundle) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
}
