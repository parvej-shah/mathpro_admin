"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Package, Phone, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FULFILLMENT_STATUSES,
  type FulfillmentStatus,
} from "@/services/book.service";
import { useBookOrders, useUpdateOrderStatus } from "@/hooks/useBooks";

const STATUS_FILTERS: { id: "all" | FulfillmentStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<FulfillmentStatus, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400",
  shipped:
    "bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-400",
  delivered:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400",
  cancelled:
    "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400",
};

export function BookOrders() {
  const [statusFilter, setStatusFilter] = useState<"all" | FulfillmentStatus>(
    "all"
  );

  const { data: orders, isLoading } = useBookOrders(
    statusFilter === "all" ? undefined : statusFilter
  );
  const updateStatus = useUpdateOrderStatus();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "rounded-full px-4 h-9 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border border-border/70 bg-background/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              No orders yet
            </p>
            <p className="text-sm text-muted-foreground">
              Book orders from students will appear here for fulfillment.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders ?? []).map((order) => (
            <Card
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted/40">
                {order.book_image_url ? (
                  <Image
                    src={order.book_image_url}
                    alt={order.book_title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {order.book_title}
                  </h3>
                  {order.amount_paid != null ? (
                    <span className="text-xs text-muted-foreground">
                      · ৳{Number(order.amount_paid).toLocaleString("en-US")}
                    </span>
                  ) : null}
                  {order.bundle_id ? (
                    <span className="inline-flex items-center rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Bundle #{order.bundle_id}
                    </span>
                  ) : order.course_id ? (
                    <span className="inline-flex items-center rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Course #{order.course_id}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Standalone
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {order.user_name || order.user_login ? (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.user_name ?? order.user_login}
                    </span>
                  ) : null}
                  {order.ship_phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.ship_phone}
                    </span>
                  ) : null}
                </div>

                {order.ship_address ? (
                  <p className="text-xs text-muted-foreground">
                    {order.ship_name ? `${order.ship_name} — ` : ""}
                    {order.ship_address}
                    {order.ship_city ? `, ${order.ship_city}` : ""}
                    {order.ship_postcode ? ` ${order.ship_postcode}` : ""}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                    STATUS_STYLES[order.fulfillment_status]
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      order.fulfillment_status === "pending" && "bg-amber-500",
                      order.fulfillment_status === "shipped" && "bg-sky-500",
                      order.fulfillment_status === "delivered" &&
                        "bg-emerald-500",
                      order.fulfillment_status === "cancelled" && "bg-rose-500"
                    )}
                  />
                  {order.fulfillment_status}
                </span>
                <Select
                  value={order.fulfillment_status}
                  onValueChange={(value) =>
                    updateStatus.mutate({
                      id: order.id,
                      status: value as FulfillmentStatus,
                    })
                  }
                >
                  <SelectTrigger className="h-9 w-35 rounded-full border-border/70 bg-background/60 text-xs capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FULFILLMENT_STATUSES.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="capitalize"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
