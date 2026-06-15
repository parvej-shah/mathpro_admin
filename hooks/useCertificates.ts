import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { certificateService, type IssueCertificateData } from "@/services/certificate.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["certificates"] as const,
  pending: () => [...QUERY_KEYS.all, "pending"] as const,
};

export function usePendingCertificates() {
  return useQuery({
    queryKey: QUERY_KEYS.pending(),
    queryFn: () => certificateService.getPendingCertificates(),
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      certificateId,
      data,
    }: {
      certificateId: number;
      data: IssueCertificateData;
    }) => certificateService.issueCertificate(certificateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pending() });
      toast.success("Certificate issued successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to issue certificate");
    },
  });
}
