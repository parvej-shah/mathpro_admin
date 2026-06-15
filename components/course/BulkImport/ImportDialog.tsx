"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useImportStatus, useDownloadImportTemplate } from "@/hooks/useCourse";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => Promise<void>;
  importId: string | null;
  courseId: number;
}

/**
 * Import Dialog Component
 * Handles course import with progress tracking
 */
export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  importId,
  courseId,
}: ImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const downloadTemplate = useDownloadImportTemplate();
  const queryClient = useQueryClient();

  // Poll import status if importId exists
  const { data: importStatus, isLoading: isLoadingStatus } =
    useImportStatus(importId);

  useEffect(() => {
    if (importStatus?.status === "completed") {
      // Immediately refetch course data to get imported course structure
      queryClient.refetchQueries({
        queryKey: ["course", courseId, "full-enhanced"],
      });
      queryClient.refetchQueries({
        queryKey: ["course", courseId, "full"],
      });
      // Invalidate all module queries since import may have created/modified modules
      queryClient.invalidateQueries({
        queryKey: ["module"],
      });
      toast.success("Course imported successfully!");
      onOpenChange(false);
      setSelectedFile(null);
    } else if (importStatus?.status === "failed") {
      toast.error("Import failed. Check errors below.");
    }
  }, [importStatus, onOpenChange, courseId, queryClient]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isValidType =
        file.name.endsWith(".json") || file.name.endsWith(".csv");
      if (!isValidType) {
        toast.error("Please select a JSON or CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      await onImport(selectedFile);
    } catch (error) {
      toast.error("Failed to import course");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async (format: "json" | "csv") => {
    try {
      await downloadTemplate.mutateAsync({ format, exampleData: true });
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Course</DialogTitle>
          <DialogDescription>
            Upload a JSON or CSV file to import course data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          {!importId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select File</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      JSON or CSV files only
                    </span>
                  </label>
                  {selectedFile && (
                    <p className="mt-4 text-sm font-medium">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>

              {/* Download Template */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate("json")}
                  disabled={downloadTemplate.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate("csv")}
                  disabled={downloadTemplate.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Import Course"}
              </Button>
            </div>
          )}

          {/* Import Status */}
          {importId && importStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Import Status</Label>
                  <span className="text-sm font-medium">
                    {importStatus.status}
                  </span>
                </div>
                {importStatus.progress && (
                  <div className="space-y-2">
                    <Progress
                      value={importStatus.progress.percentage}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {importStatus.progress.processed_items} /{" "}
                      {importStatus.progress.total_items} items processed
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              {importStatus.summary && (
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Course: </span>
                      <span className="font-medium">
                        {importStatus.summary.course_created ? (
                          <CheckCircle2 className="h-4 w-4 text-success inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive inline" />
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Chapters: </span>
                      <span className="font-medium">
                        {importStatus.summary.chapters_created}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Modules: </span>
                      <span className="font-medium">
                        {importStatus.summary.modules_created}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {importStatus.errors && importStatus.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Errors:</p>
                      {importStatus.errors.map((error, index) => (
                        <p key={index} className="text-xs">
                          {error.line && `Line ${error.line}: `}
                          {error.field && `${error.field}: `}
                          {error.message}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {importStatus.warnings && importStatus.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Warnings:</p>
                      {importStatus.warnings.map((warning, index) => (
                        <p key={index} className="text-xs">
                          {warning.line && `Line ${warning.line}: `}
                          {warning.field && `${warning.field}: `}
                          {warning.message}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Close Button */}
              {importStatus.status !== "processing" && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    setSelectedFile(null);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
