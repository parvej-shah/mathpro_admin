import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  liveClassService,
  type CreateLiveClassData,
  type UpdateLiveClassData,
  type BulkImportEntry,
  type BulkImportResult,
  type BulkImportError,
} from "@/services/live-class.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["live-classes"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  list: () => [...QUERY_KEYS.lists()] as const,
  details: () => [...QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
};

export function useLiveClasses() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: () => liveClassService.getAllLiveClasses(),
  });
}

export function useLiveClass(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => liveClassService.getLiveClass(id!),
    enabled: !!id,
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: number;
      data: CreateLiveClassData;
    }) => liveClassService.createLiveClass(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Live class created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create live class");
    },
  });
}

export function useUpdateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLiveClassData }) =>
      liveClassService.updateLiveClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.id),
      });
      toast.success("Live class updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update live class");
    },
  });
}

export function useDeleteLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => liveClassService.deleteLiveClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Live class deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete live class");
    },
  });
}

export function useBulkImportLiveClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveClasses: BulkImportEntry[]) =>
      liveClassService.bulkImport(liveClasses),
    onSuccess: (result) => {
      if ("data" in result && result.success) {
        const importResult = result as BulkImportResult;
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
        toast.success(
          `Successfully imported ${importResult.data.imported_count} live class(es)`
        );
      } else {
        const errorResult = result as BulkImportError;
        toast.error(errorResult.error || "Import failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import live classes");
    },
  });
}

export function useBulkDeleteLiveClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => liveClassService.bulkDelete(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success(
        `Successfully deleted ${result.data.deleted_count} live class(es)`
      );
      if (result.data.not_found && result.data.not_found.length > 0) {
        toast.warning(
          `${result.data.not_found.length} ID(s) were not found`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete live classes");
    },
  });
}

export function useExportLiveClasses() {
  return useMutation({
    mutationFn: ({
      format,
      courseId,
    }: {
      format: "csv" | "json";
      courseId?: number;
    }) => liveClassService.exportLiveClasses(format, courseId),
    onSuccess: (result, { format }) => {
      if (format === "csv" && typeof result === "string") {
        // Download CSV file
        const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `live_classes_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Live classes exported as CSV");
      } else if (format === "json") {
        // Download JSON file
        const jsonString = JSON.stringify(result, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `live_classes_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Live classes exported as JSON");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export live classes");
    },
  });
}

export function useLiveClassTemplate() {
  return useMutation({
    mutationFn: (withExample: boolean = true) =>
      liveClassService.getTemplate(withExample),
    onSuccess: (result) => {
      // Download template as JSON
      const jsonString = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "live_class_import_template.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download template");
    },
  });
}
