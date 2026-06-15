import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paymentService,
  type PaymentAuditLogFilters,
  type ReconcilePaymentData,
} from "@/services/payment.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["payments"] as const,
  auditLogs: (filters?: PaymentAuditLogFilters) =>
    [...QUERY_KEYS.all, "audit-logs", filters] as const,
};

export function usePaymentAuditLogs(filters?: PaymentAuditLogFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs(filters),
    queryFn: () => paymentService.getPaymentAuditLogs(filters),
  });
}

export function useReconcilePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReconcilePaymentData) =>
      paymentService.reconcilePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success("Payment reconciled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reconcile payment");
    },
  });
}
