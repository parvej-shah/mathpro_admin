"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faCheckCircle,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { toast } from "sonner";
import { Receipt, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentAuditLog } from "@/services/payment.service";

interface PaymentListProps {
  logs: PaymentAuditLog[];
  loading: boolean;
  onViewDetails: (log: PaymentAuditLog) => void;
  onReconcile: (log: PaymentAuditLog) => void;
  pagination?: {
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
}

const formatAmount = (amount: number | undefined): string => {
  if (!amount) return "৳0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
  }).format(amount);
};

const formatTimestamp = (timestamp: number | undefined): string => {
  if (!timestamp) return "N/A";
  return format(new Date(timestamp * 1000), "MMM dd, yyyy HH:mm:ss");
};

const getStatusBadge = (status: string | undefined) => {
  const map: Record<
    string,
    { variant: "default" | "destructive" | "secondary" | "outline"; label: string; className: string }
  > = {
    VALID: {
      variant: "default",
      label: "Valid",
      className:
        "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-0",
    },
    FAILED: {
      variant: "destructive",
      label: "Failed",
      className: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border-0",
    },
    CANCELLED: {
      variant: "secondary",
      label: "Cancelled",
      className: "bg-muted text-muted-foreground hover:bg-muted border-0",
    },
    PENDING: {
      variant: "secondary",
      label: "Pending",
      className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-0",
    },
    ERROR: {
      variant: "destructive",
      label: "Error",
      className: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border-0",
    },
    EXPIRED: {
      variant: "secondary",
      label: "Expired",
      className: "bg-muted text-muted-foreground hover:bg-muted border-0",
    },
  };
  const c = map[status || ""] || {
    variant: "secondary" as const,
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant={c.variant} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", c.className)}>
      {c.label}
    </Badge>
  );
};

const getProcessingStatusBadge = (status: string | undefined) => {
  const map: Record<
    string,
    { variant: "default" | "destructive" | "secondary" | "outline"; label: string; className: string }
  > = {
    SUCCESS: {
      variant: "default",
      label: "Success",
      className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-0",
    },
    FAILED: {
      variant: "destructive",
      label: "Failed",
      className: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border-0",
    },
    ERROR: {
      variant: "destructive",
      label: "Error",
      className: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 border-0",
    },
    PENDING: {
      variant: "secondary",
      label: "Pending",
      className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-0",
    },
    UNATTEMPTED: {
      variant: "secondary",
      label: "Skipped",
      className: "bg-muted text-muted-foreground hover:bg-muted border-0",
    },
  };
  const c = map[status || ""] || {
    variant: "secondary" as const,
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant={c.variant} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", c.className)}>
      {c.label}
    </Badge>
  );
};

const canReconcile = (log: PaymentAuditLog): boolean => {
  return (
    log.status === "VALID" &&
    log.processing_status !== "SUCCESS" &&
    !log.is_manually_reconciled
  );
};

const truncateText = (text: string | undefined, maxLength = 20): string => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const copyToClipboard = (text: string | undefined) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard!");
};

export function PaymentList({
  logs,
  loading,
  onViewDetails,
  onReconcile,
  pagination,
}: PaymentListProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 p-4"
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

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Receipt className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No payment logs found</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Try adjusting your filters or quick presets to see audit records.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/60">
              <TableHead className="w-14 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                ID
              </TableHead>
              <TableHead className="w-36 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                SSLCommerz Txn
              </TableHead>
              <TableHead className="w-36 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Internal Txn
              </TableHead>
              <TableHead className="w-36 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                User
              </TableHead>
              <TableHead className="w-36 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Item
              </TableHead>
              <TableHead className="w-24 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2 text-right">
                Amount
              </TableHead>
              <TableHead className="w-24 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Payment
              </TableHead>
              <TableHead className="w-28 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Processing
              </TableHead>
              <TableHead className="w-28 text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Date / Time
              </TableHead>
              <TableHead className="w-20 text-right text-[11px] uppercase tracking-wide text-muted-foreground font-medium py-2.5 px-2">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="border-b border-border/40 hover:bg-muted/40 transition-colors"
              >
                <TableCell className="font-medium text-sm py-2.5 px-2 align-middle">#{log.id}</TableCell>
                <TableCell className="py-2.5 px-2 align-middle">
                  <div className="flex items-center gap-1 min-w-0">
                    <code
                      className="text-[11px] font-mono text-muted-foreground truncate"
                      title={log.sslcommerz_tran_id}
                    >
                      {log.sslcommerz_tran_id || "-"}
                    </code>
                    {log.sslcommerz_tran_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => copyToClipboard(log.sslcommerz_tran_id)}
                      >
                        <FontAwesomeIcon icon={faCopy} className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-2 align-middle">
                  <div className="flex items-center gap-1 min-w-0">
                    <code
                      className="text-[11px] font-mono text-muted-foreground truncate"
                      title={log.internal_transaction_id}
                    >
                      {log.internal_transaction_id || "-"}
                    </code>
                    {log.internal_transaction_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          copyToClipboard(log.internal_transaction_id)
                        }
                      >
                        <FontAwesomeIcon icon={faCopy} className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-2 align-middle">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate" title={log.user_name ?? undefined}>
                      {log.user_name || `User #${log.user_id || "Unknown"}`}
                    </div>
                    {log.user_email && (
                      <div className="text-[11px] text-muted-foreground truncate" title={log.user_email}>
                        {log.user_email}
                      </div>
                    )}
                    {!log.user_name && !log.user_email && log.user_phone && (
                      <div className="text-[11px] text-muted-foreground truncate">
                        {log.user_phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-2 align-middle">
                  <div className="min-w-0">
                    <div
                      className="font-medium text-sm truncate"
                      title={log.item_name ?? undefined}
                    >
                      {log.item_name ||
                        `${log.item_type === "BUNDLE" ? "Bundle" : "Course"} #${log.item_id || "Unknown"}`}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {log.item_type} #{log.item_id}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 px-2 text-right align-middle">
                  <span className="font-semibold tabular-nums text-sm">
                    {formatAmount(log.amount)}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 px-2 align-middle"><div className="inline-block max-w-full overflow-hidden">{getStatusBadge(log.status)}</div></TableCell>
                <TableCell className="py-2.5 px-2 align-middle"><div className="inline-block max-w-full overflow-hidden">{getProcessingStatusBadge(log.processing_status)}</div></TableCell>
                <TableCell className="py-2.5 px-2 align-middle">
                  {log.timestamp ? (
                    <div className="text-[11px] leading-tight">
                      <div className="tabular-nums text-foreground">
                        {format(new Date(log.timestamp * 1000), "MMM dd, yyyy")}
                      </div>
                      <div className="text-muted-foreground tabular-nums">
                        {format(new Date(log.timestamp * 1000), "HH:mm:ss")}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2.5 px-2 align-middle">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => onViewDetails(log)}
                    >
                      <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5" />
                    </Button>
                    {canReconcile(log) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReconcile(log)}
                        className="h-7 w-7 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-3.5 w-3.5"
                        />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {pagination.page * pagination.rowsPerPage + 1}
            </span>{" "}
            –{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                (pagination.page + 1) * pagination.rowsPerPage,
                pagination.totalCount
              )}
            </span>{" "}
            of <span className="font-medium text-foreground">{pagination.totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
            >
              Previous
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">
              Page {pagination.page + 1} /{" "}
              {Math.max(
                1,
                Math.ceil(pagination.totalCount / pagination.rowsPerPage)
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={
                (pagination.page + 1) * pagination.rowsPerPage >=
                pagination.totalCount
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
