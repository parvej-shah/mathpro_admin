import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { hasNewPayments } from "@/lib/paymentBadge";

/**
 * Hook to check if there are new payment audit logs
 * This is used to show the red badge on the sidebar
 * Badge should not show when user is on the payment audit log page
 */
export function usePaymentBadge() {
  const pathname = usePathname();
  const isOnPaymentPage = pathname === "/payment-audit-log";

  const { data } = useQuery({
    queryKey: ["payments", "audit-logs", "badge-check"],
    queryFn: () => paymentService.getPaymentAuditLogs({ limit: 10, offset: 0 }),
    // Only refetch when window is focused, not continuously
    refetchOnWindowFocus: false,
    // Don't refetch if user is on the payment audit log page
    enabled: !isOnPaymentPage,
  });

  const logs = (() => {
    if (!data?.data) return [];
    const responseData = data.data as
      | Array<{ timestamp?: number; created_at?: string }>
      | { data?: Array<{ timestamp?: number; created_at?: string }> };
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

  // Don't show badge if user is on payment audit log page
  const hasNew = !isOnPaymentPage && hasNewPayments(logs);

  return { hasNew, isLoading: !data };
}
