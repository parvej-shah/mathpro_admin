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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Admin } from "@/types";
import type { CreateAdminData } from "@/services/admin.service";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminData) => void;
  admin?: Admin | null;
  isSubmitting?: boolean;
}

export function AdminModal({
  isOpen,
  onClose,
  onSubmit,
  admin,
  isSubmitting = false,
}: AdminModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    type: 1 | 2;
  }>({
    name: "",
    email: "",
    phone: "",
    type: 2, // Default to Moderator
  });

  // Initialize form data when modal opens or admin changes
  useEffect(() => {
    if (!isOpen) return;

    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        type: (admin.type === 1 ? 1 : 2) as 1 | 2,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        type: 2,
      });
    }
  }, [admin, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      return;
    }

    const payload: CreateAdminData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      type: formData.type,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{admin ? "Edit Admin" : "Create New Admin"}</DialogTitle>
          <DialogDescription>
            {admin
              ? "Update admin information"
              : "Add a new admin to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter admin's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., 01712345678"
              required
            />
            {!admin && (
              <p className="text-xs text-muted-foreground">
                Password will be auto-generated and sent via SMS to this number
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              For Google login. Not required if using phone + password only.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type.toString()}
              onValueChange={(value) => {
                const numValue = parseInt(value);
                setFormData({
                  ...formData,
                  type: (numValue === 1 ? 1 : 2) as 1 | 2,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : admin ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
