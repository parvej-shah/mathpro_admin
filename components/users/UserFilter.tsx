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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import type { UserListParams } from "@/services/user.service";

interface UserFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: UserListParams;
  onFilterChange: (filters: Partial<UserListParams>) => void;
}

export function UserFilter({
  isOpen,
  onClose,
  filters,
  onFilterChange,
}: UserFilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with props when filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [filters, isOpen]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: UserListParams = {
      status: "all",
      search: "",
      sortBy: "created_at",
      sortOrder: "DESC",
      page: 1,
      limit: 20,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Users</DialogTitle>
          <DialogDescription>Refine your search results</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Users</Label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-muted-foreground"
              />
              <Input
                type="text"
                value={localFilters.search || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, search: e.target.value })
                }
                placeholder="Name, email, or phone..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={localFilters.status || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  status: value as "active" | "inactive" | "all",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={localFilters.sortBy || "created_at"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  sortBy: value as UserListParams["sortBy"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="updated_at">Updated Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={localFilters.sortOrder || "DESC"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  sortOrder: value as "ASC" | "DESC",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASC">Ascending</SelectItem>
                <SelectItem value="DESC">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
