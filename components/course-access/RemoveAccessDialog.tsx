"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface RemoveAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  userName?: string;
  courseName?: string;
  errorMessage?: string | null;
}

export function RemoveAccessDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  userName,
  courseName,
  errorMessage,
}: RemoveAccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Remove Course Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this course access?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            <span className="font-medium">User:</span> {userName || "Unknown"}
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium">Course:</span>{" "}
            {courseName || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This user will no longer be able to manage this course. This action
            cannot be undone.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-4 w-4"
            />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Removing..." : "Remove Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
