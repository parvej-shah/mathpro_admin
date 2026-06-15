"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCcw, CheckCircle2 } from "lucide-react";
import type { PaymentAuditLog } from "@/services/payment.service";

interface ReconcileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: PaymentAuditLog | null;
  onSubmit: (sslcommerzTranId: string, notes: string) => void;
  loading?: boolean;
}

const formatAmount = (amount: number | undefined): string => {
  if (!amount) return "৳0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
  }).format(amount);
};

export function ReconcileDialog({
  open,
  onOpenChange,
  log,
  onSubmit,
  loading = false,
}: ReconcileDialogProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setNotes("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!log?.sslcommerz_tran_id) return;
    onSubmit(log.sslcommerz_tran_id, notes);
  };

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <RefreshCcw className="h-3.5 w-3.5" />
            Reconciliation
          </div>
          <DialogTitle className="text-xl">Reconcile payment</DialogTitle>
          <DialogDescription>
            This payment was successful on the gateway but failed during server
            processing. Reconciling will attempt to reprocess it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Alert className="rounded-xl border-amber-500/30 bg-amber-500/5 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Verify the transaction with the user before reconciling — this
              cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                SSLCommerz Txn ID
              </Label>
              <Input
                value={log.sslcommerz_tran_id || ""}
                disabled
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input
                value={formatAmount(log.amount)}
                disabled
                className="bg-muted/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any context that helped you confirm this transaction…"
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-end">
              <p className="text-xs text-muted-foreground">
                {notes.length}/500
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full"
          >
            {loading ? (
              <>Reconciling…</>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reconcile payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
