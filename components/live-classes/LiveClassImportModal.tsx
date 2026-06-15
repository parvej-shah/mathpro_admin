"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faDownload,
  faFileCode,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  useBulkImportLiveClasses,
  useLiveClassTemplate,
} from "@/hooks/useLiveClasses";
import type {
  BulkImportEntry,
  BulkImportResult,
  BulkImportError,
} from "@/services/live-class.service";

interface LiveClassImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LiveClassImportModal({
  open,
  onOpenChange,
  onSuccess,
}: LiveClassImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<BulkImportEntry[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<BulkImportError | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const bulkImport = useBulkImportLiveClasses();
  const downloadTemplate = useLiveClassTemplate();

  const resetState = () => {
    setSelectedFile(null);
    setFileContent(null);
    setParseError(null);
    setImportResult(null);
    setImportError(null);
  };

  const handleFileSelect = useCallback(async (file: File) => {
    resetState();
    setSelectedFile(file);

    if (!file.name.endsWith(".json")) {
      setParseError("Please select a JSON file");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Check if it's the template format or just an array
      const liveClasses = json.live_classes || json;

      if (!Array.isArray(liveClasses)) {
        setParseError(
          'Invalid format. Expected "live_classes" array or an array of live class objects.'
        );
        return;
      }

      if (liveClasses.length === 0) {
        setParseError("No live classes found in the file");
        return;
      }

      if (liveClasses.length > 100) {
        setParseError("Maximum 100 entries allowed per import");
        return;
      }

      setFileContent(liveClasses);
    } catch (error) {
      setParseError("Invalid JSON file. Please check the file format.");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (!fileContent) return;

    try {
      const result = await bulkImport.mutateAsync(fileContent);

      if ("data" in result && result.success) {
        setImportResult(result as BulkImportResult);
        setImportError(null);
        onSuccess();
      } else {
        setImportError(result as BulkImportError);
        setImportResult(null);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate.mutate(true);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Live Classes</DialogTitle>
          <DialogDescription>
            Upload a JSON file to bulk import live classes. Maximum 100 entries
            per import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Download Template Section */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faFileCode}
                className="h-5 w-5 text-primary"
              />
              <div>
                <p className="font-medium text-sm">Download Template</p>
                <p className="text-xs text-muted-foreground">
                  Get a sample JSON template with field descriptions
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={downloadTemplate.isPending}
            >
              <FontAwesomeIcon
                icon={downloadTemplate.isPending ? faSpinner : faDownload}
                className={`mr-2 h-3 w-3 ${downloadTemplate.isPending ? "animate-spin" : ""}`}
              />
              Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FontAwesomeIcon
              icon={faUpload}
              className="h-10 w-10 text-muted-foreground mb-4"
            />
            <p className="text-sm font-medium mb-2">
              Drag and drop your JSON file here
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click to browse
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleInputChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          {/* File Selected */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <FontAwesomeIcon
                icon={faFileCode}
                className="h-4 w-4 text-primary"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {fileContent && (
                <Badge variant="secondary">
                  {fileContent.length} live class(es)
                </Badge>
              )}
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="flex items-start gap-3 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="h-5 w-5 text-destructive mt-0.5"
              />
              <div>
                <p className="font-medium text-sm text-destructive">
                  Invalid File
                </p>
                <p className="text-xs text-destructive/80">{parseError}</p>
              </div>
            </div>
          )}

          {/* Import Error */}
          {importError && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <div className="flex items-start gap-3 mb-3">
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="h-5 w-5 text-destructive mt-0.5"
                />
                <div>
                  <p className="font-medium text-sm text-destructive">
                    Import Failed
                  </p>
                  <p className="text-xs text-destructive/80">
                    {importError.error}
                  </p>
                </div>
              </div>
              {importError.details && importError.details.length > 0 && (
                <div className="mt-3 pt-3 border-t border-destructive/30">
                  <p className="text-xs font-medium text-destructive mb-2">
                    Validation Errors:
                  </p>
                  <ul className="text-xs text-destructive/80 space-y-1 max-h-32 overflow-y-auto">
                    {importError.details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Import Success */}
          {importResult && (
            <div className="p-4 border border-success/50 rounded-lg bg-success/10">
              <div className="flex items-start gap-3 mb-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="h-5 w-5 text-success mt-0.5"
                />
                <div>
                  <p className="font-medium text-sm text-success">
                    Import Successful
                  </p>
                  <p className="text-xs text-success/80">
                    {importResult.message}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-success/30">
                <p className="text-xs font-medium text-success mb-2">
                  Imported Live Classes:
                </p>
                <ul className="text-xs text-success/80 space-y-1 max-h-32 overflow-y-auto">
                  {importResult.data.imported.map((item) => (
                    <li key={item.id}>
                      • {item.title} (ID: {item.id})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!fileContent || bulkImport.isPending}
            >
              {bulkImport.isPending ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 h-3 w-3 animate-spin"
                  />
                  Importing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="mr-2 h-3 w-3" />
                  Import {fileContent?.length || 0} Live Class(es)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

