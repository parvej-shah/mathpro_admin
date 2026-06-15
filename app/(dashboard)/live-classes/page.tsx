"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { LiveClassList } from "@/components/live-classes/LiveClassList";
import {
  ViewToggle,
  type ViewMode,
} from "@/components/live-classes/ViewToggle";
import { LiveClassModal } from "@/components/live-classes/LiveClassModal";
import { LiveClassViewModal } from "@/components/live-classes/LiveClassViewModal";
import { LiveClassImportModal } from "@/components/live-classes/LiveClassImportModal";
import { DeleteConfirmDialog } from "@/components/live-classes/DeleteConfirmDialog";
import { BulkDeleteConfirmDialog } from "@/components/live-classes/BulkDeleteConfirmDialog";
import {
  useLiveClasses,
  useDeleteLiveClass,
  useBulkDeleteLiveClasses,
  useExportLiveClasses,
} from "@/hooks/useLiveClasses";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faDownload,
  faUpload,
  faTrash,
  faFileExport,
  faFileCsv,
  faFileCode,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { LiveClass } from "@/services/live-class.service";

export default function LiveClassesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("thumbnail");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [viewingClassId, setViewingClassId] = useState<number | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLiveClass, setDeletingLiveClass] = useState<LiveClass | null>(
    null
  );

  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: liveClassesData, isLoading } = useLiveClasses();
  const deleteLiveClass = useDeleteLiveClass();
  const bulkDeleteLiveClasses = useBulkDeleteLiveClasses();
  const exportLiveClasses = useExportLiveClasses();

  const liveClasses: LiveClass[] = (() => {
    if (!liveClassesData?.data) return [];
    const responseData = liveClassesData.data as
      | LiveClass[]
      | { data?: LiveClass[] };
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const handleCreate = () => {
    setEditingClassId(null);
    setFormModalOpen(true);
  };

  const handleEdit = (classId: number) => {
    setEditingClassId(classId);
    setFormModalOpen(true);
  };

  const handleClassClick = (classId: number) => {
    setViewingClassId(classId);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (liveClass: LiveClass) => {
    setDeletingLiveClass(liveClass);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLiveClass) return;

    try {
      await deleteLiveClass.mutateAsync(deletingLiveClass.id);
      setDeleteDialogOpen(false);
      setDeletingLiveClass(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFormModalSuccess = () => {
    // Invalidate and refetch live classes
    queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
    setFormModalOpen(false);
    setEditingClassId(null);
  };

  const handleViewModalEdit = (classId: number) => {
    setViewModalOpen(false);
    setEditingClassId(classId);
    setFormModalOpen(true);
  };

  const handleViewModalDelete = (liveClass: LiveClass) => {
    setViewModalOpen(false);
    setDeletingLiveClass(liveClass);
    setDeleteDialogOpen(true);
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
  };

  // Export handlers
  const handleExportCSV = () => {
    exportLiveClasses.mutate({ format: "csv" });
  };

  const handleExportJSON = () => {
    exportLiveClasses.mutate({ format: "json" });
  };

  // Selection handlers
  const handleToggleSelectionMode = () => {
    if (selectionEnabled) {
      setSelectedIds([]);
    }
    setSelectionEnabled(!selectionEnabled);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length > 0) {
      setBulkDeleteDialogOpen(true);
    }
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await bulkDeleteLiveClasses.mutateAsync(selectedIds);
      setBulkDeleteDialogOpen(false);
      setSelectedIds([]);
      setSelectionEnabled(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Live Classes</h1>
            <p className="text-muted-foreground">
              Manage and schedule live learning sessions
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Selection Mode Toggle */}
            <Button
              variant={selectionEnabled ? "secondary" : "outline"}
              size="sm"
              onClick={handleToggleSelectionMode}
            >
              <FontAwesomeIcon
                icon={selectionEnabled ? faTimes : faCheck}
                className="mr-2 h-3 w-3"
              />
              {selectionEnabled ? "Cancel Selection" : "Select"}
            </Button>

            {/* Bulk Delete Button (when items selected) */}
            {selectionEnabled && selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2 h-3 w-3" />
                Delete ({selectedIds.length})
              </Button>
            )}

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon
                    icon={faFileExport}
                    className="mr-2 h-3 w-3"
                  />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleExportCSV}
                  disabled={exportLiveClasses.isPending}
                >
                  <FontAwesomeIcon icon={faFileCsv} className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportJSON}
                  disabled={exportLiveClasses.isPending}
                >
                  <FontAwesomeIcon icon={faFileCode} className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2 h-3 w-3" />
              Import
            </Button>

            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />

            <Button onClick={handleCreate}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Create Live Class
            </Button>
          </div>
        </div>

        {/* Selection Info Bar */}
        {selectionEnabled && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <p className="text-sm">
              {selectedIds.length === 0 ? (
                "Click on checkboxes to select live classes"
              ) : (
                <>
                  <span className="font-medium">{selectedIds.length}</span> live
                  class(es) selected
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(liveClasses.map((lc) => lc.id))}
              >
                Select All ({liveClasses.length})
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Live Classes List */}
        <LiveClassList
          liveClasses={liveClasses}
          loading={isLoading}
          onCreateClick={handleCreate}
          onClassClick={handleClassClick}
          onEditClick={handleEdit}
          onDeleteClick={handleDeleteClick}
          viewMode={viewMode}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          selectionEnabled={selectionEnabled}
        />

        {/* Create/Edit Modal */}
        <LiveClassModal
          open={formModalOpen}
          onOpenChange={(open) => {
            setFormModalOpen(open);
            if (!open) {
              setEditingClassId(null);
            }
          }}
          classId={editingClassId}
          onSuccess={handleFormModalSuccess}
        />

        {/* View Modal */}
        <LiveClassViewModal
          open={viewModalOpen}
          onOpenChange={(open) => {
            setViewModalOpen(open);
            if (!open) {
              setViewingClassId(null);
            }
          }}
          classId={viewingClassId}
          onEdit={handleViewModalEdit}
          onDelete={handleViewModalDelete}
        />

        {/* Import Modal */}
        <LiveClassImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          onSuccess={handleImportSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeletingLiveClass(null);
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteLiveClass.isPending}
          liveClassName={deletingLiveClass?.title}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <BulkDeleteConfirmDialog
          isOpen={bulkDeleteDialogOpen}
          onClose={() => setBulkDeleteDialogOpen(false)}
          onConfirm={handleConfirmBulkDelete}
          isDeleting={bulkDeleteLiveClasses.isPending}
          selectedCount={selectedIds.length}
        />
      </div>
    </PageContainer>
  );
}
