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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";
import type { CreateUserData } from "@/services/user.service";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
  user?: User | null;
  isSubmitting?: boolean;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isSubmitting = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    login: "",
    cf_handle: "",
    profile: "{}",
  });

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        login: user.login || user.email || user.phone || "",
        cf_handle: user.cf_handle || "",
        profile: user.profile ? JSON.stringify(user.profile, null, 2) : "{}",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        login: "",
        cf_handle: "",
        profile: "{}",
      });
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      return;
    }
    if (!formData.login) {
      return;
    }

    let parsedProfile = {};
    try {
      parsedProfile = JSON.parse(formData.profile);
    } catch {
      return;
    }

    // Determine login_type
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const login_type = emailRegex.test(formData.login) ? "email" : "phone";

    const payload: CreateUserData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      login: formData.login,
      login_type: login_type,
      cf_handle: formData.cf_handle || undefined,
      profile: parsedProfile as Record<string, unknown>,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information" : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Login (Email/Phone) *</Label>
              <Input
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf_handle">Codeforces Handle</Label>
            <Input
              id="cf_handle"
              name="cf_handle"
              value={formData.cf_handle}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Profile (JSON)</Label>
            <Textarea
              id="profile"
              name="profile"
              value={formData.profile}
              onChange={handleChange}
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
