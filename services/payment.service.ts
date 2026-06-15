import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface PaymentAuditLog {
  id: number;
  sslcommerz_tran_id?: string;
  internal_transaction_id?: string;
  amount?: number;
  status?: "VALID" | "FAILED" | "CANCELLED" | "PENDING" | "ERROR";
  processing_status?: "SUCCESS" | "FAILED" | "ERROR" | "PENDING";
  item_type?: "COURSE" | "BUNDLE";
  item_id?: number;
  user_id?: number;
  timestamp?: number;
  processed_at?: number;
  retry_count?: number;
  is_manually_reconciled?: boolean;
  reconciled_by?: number;
  reconciled_at?: number;
  notes?: string;
  error_message?: string;
  ipn_payload?: Record<string, unknown>;
  processing_result?: Record<string, unknown>;
  // New fields - Item Information
  item_name?: string | null;
  // New fields - User Information
  user_name?: string | null;
  user_phone?: string | null;
  user_email?: string | null;
  [key: string]: unknown;
}

export interface PaymentAuditLogFilters {
  status?: string;
  processing_status?: string;
  item_type?: string;
  user_id?: string;
  sslcommerz_tran_id?: string;
  internal_transaction_id?: string;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export interface ReconcilePaymentData {
  sslcommerz_tran_id: string;
  notes?: string;
}

export const paymentService = {
  /**
   * Get payment audit logs with filters
   */
  getPaymentAuditLogs: async (
    filters?: PaymentAuditLogFilters
  ): Promise<ApiResponse<PaymentAuditLog[]>> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `${API_ENDPOINTS.PAYMENTS.AUDIT_LOGS}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Manual payment reconciliation
   */
  reconcilePayment: async (
    data: ReconcilePaymentData
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.RECONCILE, {
      sslcommerz_tran_id: data.sslcommerz_tran_id,
      notes: data.notes || null,
    });
    return response.data;
  },

  /**
   * Export payment audit logs (returns all matching records without pagination)
   */
  exportPaymentAuditLogs: async (
    filters?: PaymentAuditLogFilters
  ): Promise<ApiResponse<PaymentAuditLog[]>> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        // Exclude limit and offset for export
        if (key !== "limit" && key !== "offset" && value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `${API_ENDPOINTS.PAYMENTS.AUDIT_LOGS}/export?${queryParams.toString()}`
    );
    return response.data;
  },
};
