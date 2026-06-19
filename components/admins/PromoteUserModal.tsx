"use client";

import { useState } from "react";
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
import { useSearchUsers, usePromoteUser } from "@/hooks/useAdmins";
import type { SearchedUser } from "@/services/admin.service";

interface PromoteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromoteUserModal({ isOpen, onClose }: PromoteUserModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [promoteType, setPromoteType] = useState<1 | 2>(2);

  const { data: searchResult, isLoading: searching } = useSearchUsers(search);
  const promoteUser = usePromoteUser();

  const users: SearchedUser[] = (() => {
    if (!searchResult?.data) return [];
    const d = searchResult.data as { data?: SearchedUser[] } | SearchedUser[];
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object" && "data" in d) {
      return Array.isArray(d.data) ? d.data : [];
    }
    return [];
  })();

  const handlePromote = () => {
    if (!selectedUser) return;
    promoteUser.mutate(
      { id: selectedUser.id, type: promoteType },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSearch("");
    setSelectedUser(null);
    setPromoteType(2);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Promote Existing User</DialogTitle>
          <DialogDescription>
            Search for a registered user and promote them to Admin or Moderator
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedUser ? (
            <>
              <div className="space-y-2">
                <Label>Search by phone, name, or email</Label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g., 01712345678 or John"
                  autoFocus
                />
              </div>

              {searching && search.length >= 2 && (
                <p className="text-sm text-muted-foreground">Searching…</p>
              )}

              {users.length > 0 && (
                <div className="max-h-60 overflow-y-auto rounded-md border">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className="flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <span className="text-sm font-medium">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.phone || "No phone"}
                        {u.email ? ` · ${u.email}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {!searching && search.length >= 2 && users.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No users found matching &quot;{search}&quot;
                </p>
              )}
            </>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.phone || "No phone"}
                  {selectedUser.email ? ` · ${selectedUser.email}` : ""}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-xs"
              >
                ← Choose a different user
              </Button>

              <div className="space-y-2">
                <Label>Promote to</Label>
                <Select
                  value={promoteType.toString()}
                  onValueChange={(v) =>
                    setPromoteType(parseInt(v) as 1 | 2)
                  }
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

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handlePromote}
                  disabled={promoteUser.isPending}
                >
                  {promoteUser.isPending ? "Promoting…" : "Promote"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
