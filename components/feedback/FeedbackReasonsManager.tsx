"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useFeedbackReasons,
  useCreateFeedbackReason,
  useUpdateFeedbackReason,
  useDeleteFeedbackReason,
  useReorderFeedbackReasons,
} from "@/hooks/useFeedback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faGripVertical,
  faCheck,
  faX,
  faArrowUp,
  faArrowDown,
  faSearch,
  faFilter,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import type {
  ModuleFeedbackReasonItem,
  CreateFeedbackReasonData,
  UpdateFeedbackReasonData,
} from "@/types/feedback.types";
import { cn } from "@/lib/utils";

export function FeedbackReasonsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<ModuleFeedbackReasonItem | null>(null);
  const [deletingReason, setDeletingReason] = useState<ModuleFeedbackReasonItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [newReason, setNewReason] = useState<CreateFeedbackReasonData>({
    reason_key: "",
    reason_label: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const { data: reasons, isLoading, refetch } = useFeedbackReasons();
  const createReason = useCreateFeedbackReason();
  const updateReason = useUpdateFeedbackReason();
  const deleteReason = useDeleteFeedbackReason();
  const reorderReasons = useReorderFeedbackReasons();

  // Filter and search reasons
  const filteredReasons = (reasons || [])
    .filter((reason) => {
      const matchesSearch =
        reason.reason_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reason.reason_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reason.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterActive === null || reason.is_active === filterActive;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.display_order - b.display_order);

  const handleCreate = () => {
    createReason.mutate(newReason, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setNewReason({
          reason_key: "",
          reason_label: "",
          description: "",
          display_order: 0,
          is_active: true,
        });
      },
    });
  };

  const handleUpdate = (id: number, data: UpdateFeedbackReasonData) => {
    updateReason.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditingReason(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (deletingReason) {
      deleteReason.mutate(deletingReason.id, {
        onSuccess: () => {
          setDeletingReason(null);
        },
      });
    }
  };

  const handleToggleActive = (reason: ModuleFeedbackReasonItem) => {
    handleUpdate(reason.id, { is_active: !reason.is_active });
  };

  const handleMoveUp = (reason: ModuleFeedbackReasonItem) => {
    const currentIndex = filteredReasons.findIndex((r) => r.id === reason.id);
    if (currentIndex > 0) {
      const prevReason = filteredReasons[currentIndex - 1];
      const orders = [
        { id: reason.id, display_order: prevReason.display_order },
        { id: prevReason.id, display_order: reason.display_order },
      ];
      reorderReasons.mutate({ orders });
    }
  };

  const handleMoveDown = (reason: ModuleFeedbackReasonItem) => {
    const currentIndex = filteredReasons.findIndex((r) => r.id === reason.id);
    if (currentIndex < filteredReasons.length - 1) {
      const nextReason = filteredReasons[currentIndex + 1];
      const orders = [
        { id: reason.id, display_order: nextReason.display_order },
        { id: nextReason.id, display_order: reason.display_order },
      ];
      reorderReasons.mutate({ orders });
    }
  };

  const validateReasonKey = (key: string): boolean => {
    return /^[a-z0-9_]+$/.test(key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Feedback Reasons Management</h2>
          <p className="text-muted-foreground">
            Manage the reasons students can select when providing module feedback
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add New Reason
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search by label, key, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
              <Button
                variant={filterActive === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterActive(null)}
              >
                All
              </Button>
              <Button
                variant={filterActive === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterActive(true)}
              >
                Active
              </Button>
              <Button
                variant={filterActive === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterActive(false)}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasons Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReasons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="h-12 w-12 text-muted-foreground mb-4"
              />
              <p className="text-lg font-medium">No feedback reasons found</p>
              <p className="text-muted-foreground">
                {searchTerm || filterActive !== null
                  ? "Try adjusting your filters"
                  : "Create your first feedback reason to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReasons.map((reason, index) => (
                    <TableRow
                      key={reason.id}
                      className={cn(
                        !reason.is_active && "opacity-60",
                        "hover:bg-muted/50"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveUp(reason)}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-mono text-muted-foreground w-8 text-center">
                            {reason.display_order}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveDown(reason)}
                            disabled={index === filteredReasons.length - 1}
                            title="Move down"
                          >
                            <FontAwesomeIcon icon={faArrowDown} className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reason.reason_label}</p>
                          {reason.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {reason.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {reason.reason_key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {reason.description || (
                            <span className="italic">No description</span>
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={reason.is_active}
                            onCheckedChange={() => handleToggleActive(reason)}
                            disabled={updateReason.isPending}
                          />
                          <Badge variant={reason.is_active ? "default" : "secondary"}>
                            {reason.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingReason(reason)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingReason(reason)}
                            title="Delete"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-destructive"
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Feedback Reason</DialogTitle>
            <DialogDescription>
              Add a new reason that students can select when providing module feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason_key">
                Reason Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason_key"
                placeholder="e.g., technical_issue"
                value={newReason.reason_key}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                  setNewReason({ ...newReason, reason_key: value });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and underscores only. This is the unique identifier.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason_label">
                Reason Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reason_label"
                placeholder="e.g., Technical Issue"
                value={newReason.reason_label}
                onChange={(e) =>
                  setNewReason({ ...newReason, reason_label: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                This is what students will see when selecting a reason.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description to help students understand when to use this reason"
                value={newReason.description}
                onChange={(e) =>
                  setNewReason({ ...newReason, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newReason.display_order}
                onChange={(e) =>
                  setNewReason({
                    ...newReason,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. You can reorder later.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={newReason.is_active}
                onCheckedChange={(checked) =>
                  setNewReason({ ...newReason, is_active: checked })
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (visible to students)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newReason.reason_key ||
                !newReason.reason_label ||
                !validateReasonKey(newReason.reason_key) ||
                createReason.isPending
              }
            >
              {createReason.isPending ? "Creating..." : "Create Reason"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingReason && (
        <EditReasonDialog
          reason={editingReason}
          onClose={() => setEditingReason(null)}
          onSave={handleUpdate}
          isLoading={updateReason.isPending}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deletingReason}
        onOpenChange={(open) => !open && setDeletingReason(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback Reason</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingReason?.reason_label}"? This action
              cannot be undone.
              <br />
              <br />
              <strong>Note:</strong> If this reason is being used in existing feedback, you
              cannot delete it. Consider deactivating it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteReason.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReason.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EditReasonDialogProps {
  reason: ModuleFeedbackReasonItem;
  onClose: () => void;
  onSave: (id: number, data: UpdateFeedbackReasonData) => void;
  isLoading: boolean;
}

function EditReasonDialog({
  reason,
  onClose,
  onSave,
  isLoading,
}: EditReasonDialogProps) {
  const [formData, setFormData] = useState<UpdateFeedbackReasonData>({
    reason_label: reason.reason_label,
    description: reason.description || "",
    display_order: reason.display_order,
    is_active: reason.is_active,
  });

  const handleSave = () => {
    onSave(reason.id, formData);
  };

  return (
    <Dialog open={!!reason} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Feedback Reason</DialogTitle>
          <DialogDescription>
            Update the feedback reason details. The reason key cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason Key (Read-only)</Label>
            <Input value={reason.reason_key} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              The reason key is the unique identifier and cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_reason_label">
              Reason Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_reason_label"
              value={formData.reason_label}
              onChange={(e) =>
                setFormData({ ...formData, reason_label: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_display_order">Display Order</Label>
            <Input
              id="edit_display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  display_order: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit_is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="edit_is_active" className="cursor-pointer">
              Active (visible to students)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.reason_label || isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

