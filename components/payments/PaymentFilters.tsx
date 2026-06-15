"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { faX } from "@fortawesome/free-solid-svg-icons";
import type { PaymentAuditLogFilters } from "@/services/payment.service";

interface PaymentFiltersProps {
  filters: PaymentAuditLogFilters;
  onFilterChange: (key: string, value: string) => void;
  onQuickFilter: (type: string) => void;
  onClearFilters: () => void;
}

export function PaymentFilters({
  filters,
  onFilterChange,
  onQuickFilter,
  onClearFilters,
}: PaymentFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter("all")}
          >
            All Payments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter("needsReconciliation")}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Needs Reconciliation
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter("failed")}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Failed Payments
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter("pending")}
            className="border-warning text-warning hover:bg-warning/10"
          >
            Pending Processing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFilter("bundles")}
          >
            Bundle Payments
          </Button>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <FontAwesomeIcon icon={faX} className="mr-2 h-3 w-3" />
            Clear Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onFilterChange("status", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="VALID">Valid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Processing Status</Label>
            <Select
              value={filters.processing_status || "all"}
              onValueChange={(value) =>
                onFilterChange(
                  "processing_status",
                  value === "all" ? "" : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Item Type</Label>
            <Select
              value={filters.item_type || "all"}
              onValueChange={(value) =>
                onFilterChange("item_type", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="COURSE">Course</SelectItem>
                <SelectItem value="BUNDLE">Bundle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              type="number"
              value={filters.user_id || ""}
              onChange={(e) => onFilterChange("user_id", e.target.value)}
              placeholder="User ID"
            />
          </div>

          <div className="space-y-2">
            <Label>SSLCommerz Txn ID</Label>
            <Input
              value={filters.sslcommerz_tran_id || ""}
              onChange={(e) =>
                onFilterChange("sslcommerz_tran_id", e.target.value)
              }
              placeholder="Transaction ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Internal Txn ID</Label>
            <Input
              value={filters.internal_transaction_id || ""}
              onChange={(e) =>
                onFilterChange("internal_transaction_id", e.target.value)
              }
              placeholder="Internal ID"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
