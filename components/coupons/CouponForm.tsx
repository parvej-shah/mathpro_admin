"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CircleDollarSign,
  Hash,
  Loader2,
  Percent,
  Tag,
  TicketPercent,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  couponService,
  type Coupon,
  type CouponFormData,
  type DiscountType,
} from "@/services/coupon.service";

interface CouponFormProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
}

const initialState: CouponFormData = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  min_purchase_amount: 0,
  max_discount_amount: 0,
  usage_limit: 0,
  per_user_limit: 0,
  start_time: 0,
  end_time: 0,
  status: "active",
  is_public: true,
};

export function CouponForm({ isOpen, onClose, coupon }: CouponFormProps) {
  const [form, setForm] = useState<CouponFormData>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(coupon?.id);

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setForm({
          code: coupon.code ?? "",
          name: coupon.name ?? "",
          description: coupon.description ?? "",
          discount_type: (coupon.discount_type as DiscountType) ?? "percentage",
          discount_value: coupon.discount_value ?? 0,
          min_purchase_amount: coupon.min_purchase_amount ?? 0,
          max_discount_amount: coupon.max_discount_amount ?? 0,
          usage_limit: coupon.usage_limit ?? 0,
          per_user_limit: coupon.per_user_limit ?? 0,
          start_time: coupon.start_time ?? 0,
          end_time: coupon.end_time ?? 0,
          status: (coupon.status as "active" | "inactive") ?? "active",
          is_public: coupon.is_public ?? true,
        });
      } else {
        setForm(initialState);
      }
      setError(null);
    }
  }, [isOpen, coupon]);

  const update = <K extends keyof CouponFormData>(
    key: K,
    value: CouponFormData[K]
  ) => setForm((prev: CouponFormData) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && coupon) {
        await couponService.updateCoupon(coupon.id, form);
      } else {
        await couponService.createCoupon(form);
      }
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <DialogHeader className="border-b border-border/70 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TicketPercent className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {isEdit ? "Edit coupon" : "Create a new coupon"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isEdit
                    ? "Update the details for this discount code."
                    : "Design a discount code your learners will love."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <Section
              icon={<Tag className="h-4 w-4" />}
              title="Basics"
              description="Tell people what this coupon is called."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Code" hint="Uppercase letters and numbers work best.">
                  <Input
                    value={form.code}
                    onChange={(e) =>
                      update("code", e.target.value.toUpperCase().trim())
                    }
                    placeholder="e.g. WELCOME20"
                    required
                    className="h-10 rounded-xl border-border/70 bg-background/60 font-mono tracking-wide"
                  />
                </Field>
                <Field label="Name">
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Welcome discount"
                    required
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="A short note shown to customers."
                    rows={3}
                    className="rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
              </div>
            </Section>

            <Section
              icon={<Percent className="h-4 w-4" />}
              title="Discount"
              description="How much customers will save."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <Select
                    value={form.discount_type}
                    onValueChange={(v) =>
                      update("discount_type", v as DiscountType)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl border-border/70 bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Value"
                  hint={
                    form.discount_type === "percentage"
                      ? "0 – 100"
                      : "in ৳"
                  }
                >
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={form.discount_type === "percentage" ? 1 : 0.01}
                      value={form.discount_value || ""}
                      onChange={(e) =>
                        update(
                          "discount_value",
                          Number(e.target.value) || 0
                        )
                      }
                      className="h-10 rounded-xl border-border/70 bg-background/60 pl-9"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {form.discount_type === "percentage" ? (
                        <Percent className="h-4 w-4" />
                      ) : (
                        <CircleDollarSign className="h-4 w-4" />
                      )}
                    </span>
                  </div>
                </Field>
                <Field label="Minimum purchase (৳)">
                  <Input
                    type="number"
                    min={0}
                    value={form.min_purchase_amount || ""}
                    onChange={(e) =>
                      update(
                        "min_purchase_amount",
                        Number(e.target.value) || 0
                      )
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
                <Field
                  label="Maximum discount (৳)"
                  hint="Cap the savings on percentage coupons."
                >
                  <Input
                    type="number"
                    min={0}
                    value={form.max_discount_amount || ""}
                    onChange={(e) =>
                      update(
                        "max_discount_amount",
                        Number(e.target.value) || 0
                      )
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
              </div>
            </Section>

            <Section
              icon={<Calendar className="h-4 w-4" />}
              title="Schedule"
              description="When the coupon is valid."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Starts">
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocal(form.start_time)}
                    onChange={(e) =>
                      update("start_time", fromDateTimeLocal(e.target.value))
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
                <Field label="Ends">
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocal(form.end_time)}
                    onChange={(e) =>
                      update("end_time", fromDateTimeLocal(e.target.value))
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
              </div>
            </Section>

            <Section
              icon={<Hash className="h-4 w-4" />}
              title="Limits"
              description="Control how often the code can be used."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Total redemptions" hint="0 = unlimited">
                  <Input
                    type="number"
                    min={0}
                    value={form.usage_limit || ""}
                    onChange={(e) =>
                      update("usage_limit", Number(e.target.value) || 0)
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
                <Field label="Per user" hint="0 = unlimited">
                  <Input
                    type="number"
                    min={0}
                    value={form.per_user_limit || ""}
                    onChange={(e) =>
                      update("per_user_limit", Number(e.target.value) || 0)
                    }
                    className="h-10 rounded-xl border-border/70 bg-background/60"
                  />
                </Field>
              </div>
            </Section>

            <Section
              icon={<Tag className="h-4 w-4" />}
              title="Visibility"
              description="Whether customers can see and apply this coupon."
            >
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-4">
                <div>
                  <p className="text-sm font-medium">Public coupon</p>
                  <p className="text-xs text-muted-foreground">
                    Show on checkout and marketing pages.
                  </p>
                </div>
                <Switch
                  checked={form.is_public ?? false}
                  onCheckedChange={(v) => update("is_public", v)}
                />
              </div>
            </Section>

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-border/70 bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full px-6 font-semibold shadow-sm shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create coupon"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function toDateTimeLocal(ts?: number) {
  if (!ts) return "";
  return new Date(ts * 1000).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return 0;
  return Math.floor(new Date(value).getTime() / 1000);
}
