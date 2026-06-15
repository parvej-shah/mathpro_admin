"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Download,
  SlidersHorizontal,
  RefreshCw,
  Search,
  ChevronDown,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateLatestPaymentTimestamp } from "@/lib/paymentBadge";

import { PaymentStats } from "@/components/payments/PaymentStats";
import { PaymentList } from "@/components/payments/PaymentList";
import { PaymentDetailsDialog } from "@/components/payments/PaymentDetailsDialog";
import { ReconcileDialog } from "@/components/payments/ReconcileDialog";

import { usePaymentAuditLogs, useReconcilePayment } from "@/hooks/usePayments";
import { paymentService } from "@/services/payment.service";
import { toast } from "sonner";
import type {
  PaymentAuditLog,
  PaymentAuditLogFilters,
} from "@/services/payment.service";

type QuickFilter = "all" | "needsReconciliation" | "failed" | "pending" | "bundles";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needsReconciliation", label: "Needs reconciliation" },
  { id: "failed", label: "Failed" },
  { id: "pending", label: "Pending" },
  { id: "bundles", label: "Bundles" },
];

export default function PaymentAuditLogPage() {
  const pathname = usePathname();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PaymentAuditLogFilters>({
    status: "",
    processing_status: "",
    item_type: "",
    user_id: "",
    sslcommerz_tran_id: "",
    internal_transaction_id: "",
    limit: 50,
    offset: 0,
  });
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selectedLog, setSelectedLog] = useState<PaymentAuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
    }),
    [filters, page, rowsPerPage]
  );

  const { data, isLoading, refetch } = usePaymentAuditLogs(queryFilters);
  const reconcilePayment = useReconcilePayment();

  const logs: PaymentAuditLog[] = useMemo(() => {
    if (!data?.data) return [];
    const responseData = data.data as
      | PaymentAuditLog[]
      | { data?: PaymentAuditLog[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  }, [data]);

  // Client-side search over the currently loaded page
  const visibleLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => {
      const haystack = [
        log.sslcommerz_tran_id,
        log.internal_transaction_id,
        log.user_name,
        log.user_phone,
        log.user_email,
        log.item_name,
        log.user_id ? String(log.user_id) : "",
        log.item_id ? String(log.item_id) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, search]);

  const totalCount = logs.length;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const applyQuickFilter = (qf: QuickFilter) => {
    setQuickFilter(qf);
    const map: Record<QuickFilter, PaymentAuditLogFilters> = {
      all: {
        status: "",
        processing_status: "",
        item_type: "",
        user_id: "",
        sslcommerz_tran_id: "",
        internal_transaction_id: "",
        limit: 50,
        offset: 0,
      },
      needsReconciliation: {
        status: "VALID",
        processing_status: "FAILED",
        item_type: "",
        user_id: "",
        sslcommerz_tran_id: "",
        internal_transaction_id: "",
        limit: 50,
        offset: 0,
      },
      failed: {
        status: "",
        processing_status: "FAILED",
        item_type: "",
        user_id: "",
        sslcommerz_tran_id: "",
        internal_transaction_id: "",
        limit: 50,
        offset: 0,
      },
      pending: {
        status: "",
        processing_status: "PENDING",
        item_type: "",
        user_id: "",
        sslcommerz_tran_id: "",
        internal_transaction_id: "",
        limit: 50,
        offset: 0,
      },
      bundles: {
        status: "",
        processing_status: "",
        item_type: "BUNDLE",
        user_id: "",
        sslcommerz_tran_id: "",
        internal_transaction_id: "",
        limit: 50,
        offset: 0,
      },
    };
    setFilters((prev) => ({ ...prev, ...map[qf] }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      processing_status: "",
      item_type: "",
      user_id: "",
      sslcommerz_tran_id: "",
      internal_transaction_id: "",
      limit: 50,
      offset: 0,
    });
    setSearch("");
    setQuickFilter("all");
    setPage(0);
  };

  const handleViewDetails = (log: PaymentAuditLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleReconcile = (log: PaymentAuditLog) => {
    setSelectedLog(log);
    setReconcileDialogOpen(true);
  };

  const handleReconcileSubmit = async (
    sslcommerzTranId: string,
    notes: string
  ) => {
    try {
      await reconcilePayment.mutateAsync({
        sslcommerz_tran_id: sslcommerzTranId,
        notes,
      });
      setReconcileDialogOpen(false);
      setSelectedLog(null);
      refetch();
    } catch {
      /* error handled by mutation */
    }
  };

  // Update latest payment timestamp when visiting the page
  useEffect(() => {
    if (pathname === "/payment-audit-log" && logs.length > 0) {
      updateLatestPaymentTimestamp(logs);
    }
  }, [pathname, logs]);

  // ---- CSV export helpers ----
  const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toISOString();
  };

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCSV = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      const exportFilters: PaymentAuditLogFilters = {
        status: filters.status || undefined,
        processing_status: filters.processing_status || undefined,
        item_type: filters.item_type || undefined,
        user_id: filters.user_id || undefined,
        sslcommerz_tran_id: filters.sslcommerz_tran_id || undefined,
        internal_transaction_id: filters.internal_transaction_id || undefined,
      };

      Object.keys(exportFilters).forEach((key) => {
        const value = exportFilters[key as keyof PaymentAuditLogFilters];
        if (value === "" || value === null || value === undefined) {
          delete exportFilters[key as keyof PaymentAuditLogFilters];
        }
      });

      const response =
        await paymentService.exportPaymentAuditLogs(exportFilters);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch audit logs");
      }

      const auditLogs = Array.isArray(response.data) ? response.data : [];

      if (auditLogs.length === 0) {
        toast.info("No records found matching the filters.");
        return;
      }

      if (auditLogs.length > 10000) {
        const confirmed = window.confirm(
          `This export contains ${auditLogs.length} records and may take a while. Continue?`
        );
        if (!confirmed) return;
      }

      const headers = [
        "ID",
        "SSLCommerz Transaction ID",
        "Internal Transaction ID",
        "User ID",
        "User Name",
        "User Phone",
        "User Email",
        "Item ID",
        "Item Type",
        "Item Name",
        "Amount",
        "Status",
        "Processing Status",
        "Error Message",
        "Timestamp",
        "Processed At",
        "Retry Count",
        "Manually Reconciled",
        "Reconciled By",
        "Reconciled At",
        "Notes",
        "IPN Payload",
        "Processing Result",
      ];

      const rows = auditLogs.map((record) => [
        record.id || "",
        record.sslcommerz_tran_id || "",
        record.internal_transaction_id || "",
        record.user_id || "",
        record.user_name || "",
        record.user_phone || "",
        record.user_email || "",
        record.item_id || "",
        record.item_type || "",
        record.item_name || "",
        record.amount || "",
        record.status || "",
        record.processing_status || "",
        record.error_message || "",
        formatTimestamp(record.timestamp),
        formatTimestamp(record.processed_at),
        record.retry_count || 0,
        record.is_manually_reconciled ? "Yes" : "No",
        record.reconciled_by || "",
        formatTimestamp(record.reconciled_at),
        record.notes || "",
        record.ipn_payload ? JSON.stringify(record.ipn_payload) : "",
        record.processing_result
          ? JSON.stringify(record.processing_result)
          : "",
      ]);

      const csvContent =
        [
          headers.map(escapeCSV).join(","),
          ...rows.map((row) => row.map(escapeCSV).join(",")),
        ].join("\n") + "\n";

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      link.setAttribute("download", `payment-audit-logs-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${auditLogs.length} records.`);
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to export audit logs";

      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        toast.error("Session expired. Please log in again.");
      } else if (
        errorMessage.includes("403") ||
        errorMessage.includes("Forbidden")
      ) {
        toast.error("You do not have permission to export audit logs.");
      } else if (errorMessage.includes("timeout")) {
        toast.error(
          "Export request timed out. Please try again with more specific filters."
        );
      } else {
        toast.error(`Export failed: ${errorMessage}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Active-filter chips (for advanced filter popover state)
  const activeAdvancedChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.status) chips.push({ key: "status", label: `Status: ${filters.status}` });
    if (filters.processing_status)
      chips.push({ key: "processing_status", label: `Processing: ${filters.processing_status}` });
    if (filters.item_type)
      chips.push({ key: "item_type", label: `Item: ${filters.item_type}` });
    if (filters.user_id)
      chips.push({ key: "user_id", label: `User ID: ${filters.user_id}` });
    if (filters.sslcommerz_tran_id)
      chips.push({
        key: "sslcommerz_tran_id",
        label: `SSL: ${filters.sslcommerz_tran_id}`,
      });
    if (filters.internal_transaction_id)
      chips.push({
        key: "internal_transaction_id",
        label: `Internal: ${filters.internal_transaction_id}`,
      });
    return chips;
  }, [filters]);

  const removeChip = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setPage(0);
  };

  const hasActiveFilters =
    quickFilter !== "all" || activeAdvancedChips.length > 0 || search.length > 0;

  return (
    <PageContainer className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <PageHeader
          eyebrow="Payments"
          eyebrowIcon={faShieldHalved}
          title="Payment Audit Log"
          description="Track, reconcile and audit every SSLCommerz transaction in one place."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-11 rounded-full px-5 font-semibold"
              >
                <RefreshCw
                  className={cn(
                    "mr-2 h-4 w-4",
                    isLoading && "animate-spin"
                  )}
                />
                Refresh
              </Button>
              <Button
                onClick={handleExportCSV}
                disabled={isExporting || isLoading}
                className="h-11 rounded-full px-5 font-semibold shadow-sm shadow-primary/20"
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting…" : "Export CSV"}
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <PaymentStats logs={logs} />

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented quick filter */}
          <div className="inline-flex w-fit rounded-full border border-border/70 bg-muted/30 p-1 text-sm">
            {QUICK_FILTERS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => applyQuickFilter(q.id)}
                className={cn(
                  "relative px-4 h-9 rounded-full transition-colors capitalize whitespace-nowrap",
                  quickFilter === q.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {quickFilter === q.id && (
                  <span className="absolute inset-0 rounded-full bg-background shadow-sm" />
                )}
                <span className="relative z-10 font-medium">{q.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-1 items-center gap-2 lg:justify-end">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by txn, user, item…"
                className="pl-10 h-10 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
              />
            </div>

            {/* Advanced filters popover */}
            <AdvancedFiltersPopover
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 -mt-4">
            {quickFilter !== "all" && (
              <FilterChip
                label={
                  QUICK_FILTERS.find((q) => q.id === quickFilter)?.label ||
                  quickFilter
                }
                onRemove={() => applyQuickFilter("all")}
              />
            )}
            {search && (
              <FilterChip
                label={`"${search}"`}
                onRemove={() => setSearch("")}
              />
            )}
            {activeAdvancedChips.map((c) => (
              <FilterChip
                key={c.key}
                label={c.label}
                onRemove={() => removeChip(c.key)}
              />
            ))}
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <PaymentListSkeleton />
        ) : (
          <PaymentList
            logs={visibleLogs}
            loading={isLoading}
            onViewDetails={handleViewDetails}
            onReconcile={handleReconcile}
            pagination={{
              page,
              rowsPerPage,
              totalCount,
              onPageChange: setPage,
              onRowsPerPageChange: (newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              },
            }}
          />
        )}

        {/* Empty state for filtered result */}
        {!isLoading &&
          logs.length > 0 &&
          visibleLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium">No matches for the current search</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different keyword or clear the search.
              </p>
            </div>
          )}

        {/* Dialogs */}
        <PaymentDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          log={selectedLog}
          onReconcile={handleReconcile}
        />

        <ReconcileDialog
          open={reconcileDialogOpen}
          onOpenChange={setReconcileDialogOpen}
          log={selectedLog}
          onSubmit={handleReconcileSubmit}
          loading={reconcilePayment.isPending}
        />
      </div>
    </PageContainer>
  );
}

/* ---------------- Local atoms ---------------- */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="rounded-full px-3 py-1 gap-1.5 font-normal bg-muted/60 hover:bg-muted"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground leading-none"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </Badge>
  );
}

function AdvancedFiltersPopover({
  filters,
  onChange,
}: {
  filters: PaymentAuditLogFilters;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    filters.status,
    filters.processing_status,
    filters.item_type,
    filters.user_id,
    filters.sslcommerz_tran_id,
    filters.internal_transaction_id,
  ].filter(Boolean).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-full px-4 font-semibold gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-xs px-1.5">
              {activeCount}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-105 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Advanced filters</h4>
            <span className="text-xs text-muted-foreground">
              {activeCount} active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-1">
              <Label className="text-xs text-muted-foreground">
                Payment status
              </Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) => onChange("status", v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="VALID">Valid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label className="text-xs text-muted-foreground">
                Processing status
              </Label>
              <Select
                value={filters.processing_status || "all"}
                onValueChange={(v) =>
                  onChange("processing_status", v === "all" ? "" : v)
                }
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label className="text-xs text-muted-foreground">Item type</Label>
              <Select
                value={filters.item_type || "all"}
                onValueChange={(v) =>
                  onChange("item_type", v === "all" ? "" : v)
                }
              >
                <SelectTrigger className="h-9 rounded-lg">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="COURSE">Course</SelectItem>
                  <SelectItem value="BUNDLE">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-1">
              <Label className="text-xs text-muted-foreground">User ID</Label>
              <Input
                type="number"
                value={filters.user_id || ""}
                onChange={(e) => onChange("user_id", e.target.value)}
                placeholder="e.g. 12345"
                className="h-9 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">
                SSLCommerz txn ID
              </Label>
              <Input
                value={filters.sslcommerz_tran_id || ""}
                onChange={(e) => onChange("sslcommerz_tran_id", e.target.value)}
                placeholder="Transaction ID"
                className="h-9 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">
                Internal txn ID
              </Label>
              <Input
                value={filters.internal_transaction_id || ""}
                onChange={(e) =>
                  onChange("internal_transaction_id", e.target.value)
                }
                placeholder="Internal ID"
                className="h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => {
                onChange("status", "");
                onChange("processing_status", "");
                onChange("item_type", "");
                onChange("user_id", "");
                onChange("sslcommerz_tran_id", "");
                onChange("internal_transaction_id", "");
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PaymentListSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/50 p-4"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
