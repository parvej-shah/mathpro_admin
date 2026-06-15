import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface PendingCertificate {
  id: number;
  name: string;
  title: string;
  totalscore: number;
  [key: string]: unknown;
}

export interface IssueCertificateData {
  feedback: string;
}

export const certificateService = {
  /**
   * Get all pending certificates
   */
  getPendingCertificates: async (): Promise<
    ApiResponse<PendingCertificate[]>
  > => {
    const response = await apiClient.get(
      "/admin/course/getAllPendingCertificates"
    );
    return response.data;
  },

  /**
   * Issue certificate
   */
  issueCertificate: async (
    certificateId: number,
    data: IssueCertificateData
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(
      `/admin/course/issueCertificate/${certificateId}`,
      data
    );
    return response.data;
  },
};
