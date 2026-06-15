"use client";

import {
  Banknote,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentAuditLog } from "@/services/payment.service";

interface PaymentStatsProps {
  logs: PaymentAuditLog[];
}

type Tone = "neutral" | "danger" | "success" | "warning";

const TONE: Record<Tone, { iconWrap: string; icon: string; value: string }> = {
  neutral: {
    iconWrap: "bg-muted text-foreground",
    icon: "text-foreground",
    value: "text-foreground",
  },
  danger: {
    iconWrap: "bg-destructive/10 text-destructive",
    icon: "text-destructive",
    value: "text-destructive",
  },
  success: {
    iconWrap: "bg-emerald-500/10 text-emerald-600",
    icon: "text-emerald-600",
    value: "text-emerald-600",
  },
  warning: {
    iconWrap: "bg-amber-500/10 text-amber-600",
    icon: "text-amber-600",
    value: "text-amber-600",
  },
};

export function PaymentStats({ logs }: PaymentStatsProps) {
  const stats = {
    total: logs.length,
    needsReconciliation: logs.filter(
      (log) =>
        log.status === "VALID" &&
        log.processing_status !== "SUCCESS" &&
        !log.is_manually_reconciled
    ).length,
    failed: logs.filter((log) => log.processing_status === "FAILED").length,
    success: logs.filter((log) => log.processing_status === "SUCCESS").length,
  };

  const items: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: Tone;
  }[] = [
    { label: "Total payments", value: stats.total, icon: Banknote, tone: "neutral" },
    {
      label: "Needs reconciliation",
      value: stats.needsReconciliation,
      icon: AlertTriangle,
      tone: "danger",
    },
    {
      label: "Failed processing",
      value: stats.failed,
      icon: XCircle,
      tone: "warning",
    },
    {
      label: "Successful",
      value: stats.success,
      icon: CheckCircle2,
      tone: "success",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => {
        const tone = TONE[it.tone];
        return (
          <div
            key={it.label}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-4 flex items-center gap-3"
          >
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                tone.iconWrap
              )}
            >
              <it.icon className={cn("h-5 w-5", tone.icon)} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
                {it.label}
              </p>
              <p className={cn("text-2xl font-semibold leading-none mt-1.5", tone.value)}>
                {it.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
