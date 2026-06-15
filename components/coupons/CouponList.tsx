"use client";

import { useState } from "react";
import {
  Copy,
  Edit3,
  GraduationCap,
  LayoutGrid,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCheck,
  faPercent,
  faTag,
  faTicket,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { useCoupons, useDeleteCoupon } from "@/hooks/useCoupons";
import type { Coupon, CouponListParams } from "@/services/coupon.service";

interface CouponListProps {
  onEdit: (coupon: Coupon) => void;
  onManageCourses: (coupon: Coupon) => void;
  onManageBundles: (coupon: Coupon) => void;
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "expired", label: "Expired" },
] as const;

const TYPE_FILTERS = [
  { id: "all", label: "Any type" },
  { id: "percentage", label: "Percentage" },
  { id: "fixed", label: "Fixed" },
] as const;

export function CouponList({
  onEdit,
  onManageCourses,
  onManageBundles,
}: CouponListProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filters: CouponListParams = {
    page: page + 1,
    limit: rowsPerPage,
    search: searchTerm || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "active" | "inactive")
        : undefined,
    discountType:
      discountTypeFilter !== "all"
        ? (discountTypeFilter as "percentage" | "fixed")
        : undefined,
  };

  const { data, isLoading, refetch } = useCoupons(filters);
  const deleteCoupon = useDeleteCoupon();

  const coupons: Coupon[] = (() => {
    if (!data?.data) return [];
    const responseData = data.data as Coupon[] | { data?: Coupon[] };
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

  const pagination = (data?.data as { pagination?: unknown })?.pagination as
    | {
        total?: number;
        totalPages?: number;
        page?: number;
        limit?: number;
      }
    | undefined;

  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? coupons.length;

  const handleDelete = () => {
    if (selectedCoupon) {
      deleteCoupon.mutate(selectedCoupon.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedCoupon(null);
        },
      });
    }
  };

  const copyCode = async (code: string, id: number) => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // noop
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-full border-border/70 bg-background/60 pl-9 pr-4"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={discountTypeFilter}
            onValueChange={(v) => {
              setDiscountTypeFilter(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="h-10 w-37.5 rounded-full border-border/70 bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatusFilter(f.id);
                setPage(0);
              }}
              className={cn(
                "rounded-full px-4 h-9 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isLoading ? (
        <CouponGridSkeleton count={rowsPerPage} />
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Tag className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              No coupons yet
            </p>
            <p className="text-sm text-muted-foreground">
              Create your first coupon to start offering discounts on courses
              and bundles.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              copied={copiedId === coupon.id}
              onCopy={() => copyCode(coupon.code, coupon.id)}
              onEdit={() => onEdit(coupon)}
              onManageCourses={() => onManageCourses(coupon)}
              onManageBundles={() => onManageBundles(coupon)}
              onDelete={() => {
                setSelectedCoupon(coupon);
                setShowDeleteDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col gap-3 border-t border-border/70 pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing <span className="font-medium text-foreground">{page * rowsPerPage + 1}</span> –{" "}
            <span className="font-medium text-foreground">
              {Math.min((page + 1) * rowsPerPage, total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                setRowsPerPage(Number(v));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-9 w-27.5 rounded-full border-border/70 bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 24, 48].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page + 1 >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {selectedCoupon?.code}
              </span>
              . Existing redemptions will keep their history, but the code can
              no longer be used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete coupon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CouponCard({
  coupon,
  copied,
  onCopy,
  onEdit,
  onManageCourses,
  onManageBundles,
  onDelete,
}: {
  coupon: Coupon;
  copied: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onManageCourses: () => void;
  onManageBundles: () => void;
  onDelete: () => void;
}) {
  const status = getCouponStatus(coupon);
  const valueLabel = formatValue(coupon);
  const datesLabel = formatDates(coupon);
  const usageProgress = getUsageProgress(coupon);

  return (
    <Card className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      {/* Top: status + menu */}
      <div className="flex items-center justify-between">
        <StatusPill variant={status.variant} label={status.label} />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {coupon.type === "percentage" ? "Percent" : "Fixed"}
        </span>
      </div>

      {/* Code */}
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "group/code relative flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-left transition-colors",
          "hover:border-primary hover:bg-primary/10"
        )}
      >
        <FontAwesomeIcon
          icon={faTicket}
          className="h-4 w-4 text-primary"
        />
        <span className="font-mono text-sm font-semibold tracking-wide text-foreground">
          {coupon.code}
        </span>
        <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition-colors group-hover/code:text-primary">
          {copied ? (
            <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      {/* Name + description */}
      <div className="space-y-1">
        <h3 className="line-clamp-1 text-base font-semibold text-foreground">
          {coupon.name}
        </h3>
        {coupon.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {coupon.description}
          </p>
        ) : null}
      </div>

      {/* Discount value + dates */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Discount
          </p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {valueLabel}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1">
            <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
            {datesLabel}
          </p>
        </div>
      </div>

      {/* Usage progress */}
      {coupon.usage_limit ? (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Redemptions</span>
            <span className="font-medium text-foreground">
              {coupon.usage_count ?? 0} / {coupon.usage_limit}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usageProgress >= 100
                  ? "bg-destructive"
                  : "bg-linear-to-r from-primary to-primary/70"
              )}
              style={{ width: `${Math.min(100, usageProgress)}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faPercent} className="mr-1 h-3 w-3" />
          No usage cap
        </p>
      )}

      {/* Scope pills */}
      <div className="flex flex-wrap gap-1.5">
        {coupon.applicable_to === "courses" && (
          <ScopePill icon={<GraduationCap className="h-3 w-3" />} label="Courses" />
        )}
        {coupon.applicable_to === "bundles" && (
          <ScopePill icon={<Package className="h-3 w-3" />} label="Bundles" />
        )}
        {(!coupon.applicable_to || coupon.applicable_to === "all") && (
          <ScopePill icon={<LayoutGrid className="h-3 w-3" />} label="All items" />
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-1 border-t border-border/70 pt-3">
        <div className="flex items-center gap-0.5">
          <IconAction onClick={onManageCourses} label="Manage courses">
            <GraduationCap className="h-4 w-4" />
          </IconAction>
          <IconAction onClick={onManageBundles} label="Manage bundles">
            <Package className="h-4 w-4" />
          </IconAction>
        </div>
        <div className="flex items-center gap-0.5">
          <IconAction onClick={onEdit} label="Edit">
            <Pencil className="h-4 w-4" />
          </IconAction>
          <IconAction
            onClick={onDelete}
            label="Delete"
            className="hover:text-destructive!"
          >
            <Trash2 className="h-4 w-4" />
          </IconAction>
        </div>
      </div>
    </Card>
  );
}

function StatusPill({
  variant,
  label,
}: {
  variant: "default" | "secondary" | "destructive" | "success";
  label: string;
}) {
  const styles: Record<typeof variant, string> = {
    default:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    secondary:
      "bg-muted text-muted-foreground ring-1 ring-border/70",
    destructive:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20",
  };
  const dot: Record<typeof variant, string> = {
    default: "bg-emerald-500",
    success: "bg-emerald-500",
    secondary: "bg-muted-foreground/60",
    destructive: "bg-rose-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        styles[variant]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[variant])} />
      {label}
    </span>
  );
}

function ScopePill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function IconAction({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function CouponGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-2 w-full rounded-full" />
        </Card>
      ))}
    </div>
  );
}

// --- helpers ---
function getCouponStatus(coupon: Coupon) {
  const now = Date.now() / 1000;
  const startTime = coupon.start_time || 0;
  const endTime = coupon.end_time || 0;

  if (coupon.status === "inactive") {
    return { label: "Inactive", variant: "secondary" as const };
  }
  if (startTime && now < startTime) {
    return { label: "Scheduled", variant: "secondary" as const };
  }
  if (endTime && now > endTime) {
    return { label: "Expired", variant: "destructive" as const };
  }
  if (
    coupon.usage_limit &&
    coupon.usage_count &&
    coupon.usage_count >= coupon.usage_limit
  ) {
    return { label: "Fully used", variant: "destructive" as const };
  }
  return { label: "Active", variant: "success" as const };
}

function formatValue(coupon: Coupon) {
  if (coupon.discount_type === "percentage") {
    return `${coupon.discount_value ?? 0}%`;
  }
  return `৳${Number(coupon.discount_value ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDates(coupon: Coupon) {
  const fmt = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };
  return `${fmt(coupon.start_time)} → ${fmt(coupon.end_time)}`;
}

function getUsageProgress(coupon: Coupon) {
  if (!coupon.usage_limit || !coupon.usage_count) return 0;
  return Math.round((coupon.usage_count / coupon.usage_limit) * 100);
}
