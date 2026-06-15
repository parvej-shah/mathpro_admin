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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

interface SetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string) => void;
  isSubmitting?: boolean;
  targetAdminName?: string;
  targetAdminEmail?: string;
}

export function SetPasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  targetAdminName,
  targetAdminEmail,
}: SetPasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      return;
    }
    onSubmit(currentPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for {targetAdminName ? `"${targetAdminName}"` : "this admin"}
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-info/10 border-info/30">
          <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-info" />
          <AlertDescription className="text-info">
            A new password will be auto-generated and sent to{" "}
            <strong>{targetAdminEmail || "the admin's email"}</strong>.
            You need to enter YOUR password to authorize this action.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Your Password *</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter YOUR current password"
              autoComplete="current-password"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your own password to confirm this action
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !currentPassword}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
