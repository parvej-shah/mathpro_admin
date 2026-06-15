"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, AlertTriangle, Receipt, Copy as CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentAuditLog } from "@/services/payment.service";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: PaymentAuditLog | null;
  onReconcile?: (log: PaymentAuditLog) => void;
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
    { variant: "default" | "destructive" | "secondary"; label: string; className: string }
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
  };
  const c = map[status || ""] || {
    variant: "secondary" as const,
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant={c.variant} className={cn("rounded-full px-2.5", c.className)}>
      {c.label}
    </Badge>
  );
};

const getProcessingStatusBadge = (status: string | undefined) => {
  const map: Record<
    string,
    { variant: "default" | "destructive" | "secondary"; label: string; className: string }
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
  };
  const c = map[status || ""] || {
    variant: "secondary" as const,
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant={c.variant} className={cn("rounded-full px-2.5", c.className)}>
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

const copyToClipboard = (text: string | undefined) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard!");
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function CopyableCode({ value }: { value: string | undefined }) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex items-center gap-1.5">
      <code className="text-xs break-all">{value}</code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={() => copyToClipboard(value)}
      >
        <FontAwesomeIcon icon={faCopy} className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function PaymentDetailsDialog({
  open,
  onOpenChange,
  log,
  onReconcile,
}: PaymentDetailsDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" />
            Payment
          </div>
          <DialogTitle className="text-xl">
            Transaction #{log.id}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(log.status)}
            {getProcessingStatusBadge(log.processing_status)}
            <span className="text-sm text-muted-foreground tabular-nums">
              {formatAmount(log.amount)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Row label="SSLCommerz Transaction ID">
              <CopyableCode value={log.sslcommerz_tran_id} />
            </Row>
            <Row label="Internal Transaction ID">
              <CopyableCode value={log.internal_transaction_id} />
            </Row>
          </div>

          {/* User */}
          <div>
            <h4 className="text-sm font-semibold mb-2">User</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Row label="User ID">{log.user_id || "-"}</Row>
              {log.user_name && (
                <Row label="Name">{log.user_name}</Row>
              )}
              {log.user_phone && (
                <Row label="Phone">{log.user_phone}</Row>
              )}
              {log.user_email && (
                <Row label="Email">
                  <span className="break-all">{log.user_email}</span>
                </Row>
              )}
            </div>
          </div>

          {/* Item */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Row label="Item Name">
                {log.item_name ||
                  `${log.item_type === "BUNDLE" ? "Bundle" : "Course"} #${log.item_id}`}
              </Row>
              <Row label="Type / ID">
                <span className="inline-flex items-center gap-1.5">
                  <Badge variant="outline" className="rounded-full">
                    {log.item_type}
                  </Badge>
                  <span className="text-muted-foreground">#{log.item_id}</span>
                </span>
              </Row>
            </div>
          </div>

          {/* Timing */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Timing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Row label="Created">
                {formatTimestamp(log.timestamp)}
              </Row>
              {log.processed_at && (
                <Row label="Processed">
                  {formatTimestamp(log.processed_at)}
                </Row>
              )}
              <Row label="Retry count">
                {log.retry_count || 0}
              </Row>
            </div>
          </div>

          {/* Reconciliation */}
          {log.is_manually_reconciled && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Reconciliation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Row label="Reconciled by">
                  User ID: {log.reconciled_by}
                </Row>
                <Row label="Reconciled at">
                  {formatTimestamp(log.reconciled_at)}
                </Row>
                {log.notes && (
                  <div className="md:col-span-2">
                    <Row label="Notes">{log.notes}</Row>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {log.error_message && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">Error Message</p>
                <p className="text-sm">{log.error_message}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Payloads */}
          {log.ipn_payload && (
            <Accordion type="single" collapsible>
              <AccordionItem value="ipn" className="border-border/60">
                <AccordionTrigger>IPN Payload</AccordionTrigger>
                <AccordionContent>
                  <div className="relative bg-muted p-4 rounded-xl border border-border/40">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(log.ipn_payload, null, 2)
                        )
                      }
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                    <pre className="text-xs overflow-auto max-h-75">
                      {JSON.stringify(log.ipn_payload, null, 2)}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {log.processing_result && (
            <Accordion type="single" collapsible>
              <AccordionItem value="result" className="border-border/60">
                <AccordionTrigger>Processing Result</AccordionTrigger>
                <AccordionContent>
                  <div className="relative bg-muted p-4 rounded-xl border border-border/40">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(log.processing_result, null, 2)
                        )
                      }
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                    <pre className="text-xs overflow-auto max-h-75">
                      {JSON.stringify(log.processing_result, null, 2)}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Close
          </Button>
          {canReconcile(log) && onReconcile && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onReconcile(log);
              }}
              className="rounded-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Reconcile payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
