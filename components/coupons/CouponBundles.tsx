"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Package,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type Coupon } from "@/services/coupon.service";
import {
  useAddBundlesToCoupon,
  useAvailableBundles,
  useCouponBundles,
  useRemoveBundlesFromCoupon,
} from "@/hooks/useCoupons";

interface CouponBundlesProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BundleOption {
  id: number;
  title?: string;
  code?: string;
  name?: string;
}

function readBundles(payload: unknown): BundleOption[] {
  if (!payload) return [];
  const raw =
    (payload as { data?: unknown }).data ?? (payload as unknown);
  if (Array.isArray(raw)) return raw as BundleOption[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: BundleOption[] }).data;
  }
  return [];
}

export function CouponBundles({ coupon, isOpen, onClose }: CouponBundlesProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const couponId = coupon?.id ?? null;

  const { data: bundlesData, isLoading: bundlesLoading } = useAvailableBundles(
    couponId ?? undefined
  );
  const { data: assignedData, isLoading: assignedLoading } =
    useCouponBundles(couponId);
  const addMutation = useAddBundlesToCoupon();
  const removeMutation = useRemoveBundlesFromCoupon();

  const bundles = useMemo<BundleOption[]>(
    () => readBundles(bundlesData),
    [bundlesData]
  );
  const assignedIds = useMemo<Set<number>>(() => {
    const list = readBundles(assignedData);
    return new Set(list.map((b) => Number(b.id)));
  }, [assignedData]);

  useEffect(() => {
    if (!coupon) return;
    setSelectedIds(new Set(assignedIds));
    setInitialIds(new Set(assignedIds));
  }, [coupon, assignedIds]);

  const filtered = useMemo(() => {
    if (!search) return bundles;
    const term = search.toLowerCase();
    return bundles.filter(
      (b) =>
        b.title?.toLowerCase().includes(term) ||
        b.name?.toLowerCase().includes(term) ||
        b.code?.toLowerCase().includes(term)
    );
  }, [bundles, search]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dirty = useMemo(() => {
    if (selectedIds.size !== initialIds.size) return true;
    for (const id of selectedIds) if (!initialIds.has(id)) return true;
    return false;
  }, [selectedIds, initialIds]);

  const handleSave = async () => {
    if (!coupon) return;
    setSaving(true);
    try {
      const toAdd: number[] = [];
      const toRemove: number[] = [];
      for (const id of selectedIds) if (!initialIds.has(id)) toAdd.push(id);
      for (const id of initialIds) if (!selectedIds.has(id)) toRemove.push(id);
      if (toAdd.length) {
        await addMutation.mutateAsync({ id: coupon.id, bundleIds: toAdd });
      }
      if (toRemove.length) {
        await removeMutation.mutateAsync({
          id: coupon.id,
          bundleIds: toRemove,
        });
      }
      onClose();
    } catch {
      // toast already shown by hook
    } finally {
      setSaving(false);
    }
  };

  const loading = bundlesLoading || assignedLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border/70 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Manage bundles
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {coupon
                  ? `Choose which bundles "${coupon.code}" applies to.`
                  : "Choose which bundles this coupon applies to."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-b border-border/70 bg-muted/20 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bundles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-full border-border/70 bg-background/60 pl-9 pr-4"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedIds.size} selected
            {dirty ? " · unsaved changes" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
              No bundles match your search.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((bundle) => {
                const id = Number(bundle.id);
                const selected = selectedIds.has(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        selected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/70 hover:border-primary/30 hover:bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 bg-background"
                        )}
                      >
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {bundle.title ?? bundle.name ?? "Untitled bundle"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {bundle.code ?? "—"}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="rounded-full px-6 font-semibold shadow-sm shadow-primary/20"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
