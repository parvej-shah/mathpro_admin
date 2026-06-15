"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  GraduationCap,
  Boxes,
  BookOpen,
  Gift,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DateRangePicker } from "@/components/analytics-v2/DateRangePicker";
import { OverviewDashboard } from "@/components/analytics-v3/OverviewDashboard";
import { RevenueSummary } from "@/components/analytics-v2/RevenueSummary";
import { RevenueTrends } from "@/components/analytics-v2/RevenueTrends";
import { UserOverview } from "@/components/analytics-v2/UserOverview";
import { UserGrowth } from "@/components/analytics-v2/UserGrowth";
import { CourseOverview } from "@/components/analytics-v2/CourseOverview";
import { BundleOverview } from "@/components/analytics-v2/BundleOverview";
import { LearningProgress } from "@/components/analytics-v2/LearningProgress";
import { CouponOverview } from "@/components/analytics-v2/CouponOverview";
import { PaymentOverview } from "@/components/analytics-v2/PaymentOverview";
import { datePresetToUnix } from "@/lib/analytics-v2.utils";
import type { DatePreset } from "@/types/analytics-v2.types";

// ─── Section heading ─────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="ml-2 h-px flex-1 bg-border/60" />
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{
    start?: number;
    end?: number;
    preset?: DatePreset;
  }>(() => {
    const { start, end } = datePresetToUnix("this_month");
    return { start, end, preset: "this_month" };
  });

  const rangeParams = {
    start_date: dateRange.start,
    end_date: dateRange.end,
  };

  return (
    <PageContainer className="py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Platform performance & analytics at a glance
            </p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="space-y-8">
        {/* ── Overview ── */}
        <OverviewDashboard
          params={{ ...rangeParams, period: dateRange.preset }}
        />

        {/* ── Revenue ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={TrendingUp}
            title="Revenue"
            subtitle="Income breakdown and trends"
          />
          <RevenueSummary params={rangeParams} />
          <RevenueTrends startDate={dateRange.start} endDate={dateRange.end} />
        </section>

        {/* ── Users ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={Users}
            title="Users"
            subtitle="Audience size, growth and conversion"
          />
          <UserOverview params={rangeParams} />
          <UserGrowth startDate={dateRange.start} endDate={dateRange.end} />
        </section>

        {/* ── Courses ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={GraduationCap}
            title="Courses"
            subtitle="Course-level performance"
          />
          <CourseOverview params={rangeParams} />
        </section>

        {/* ── Bundles ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={Boxes}
            title="Bundles"
            subtitle="Bundle sales and revenue"
          />
          <BundleOverview params={rangeParams} />
        </section>

        {/* ── Learning ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={BookOpen}
            title="Learning"
            subtitle="Progress and completion"
          />
          <LearningProgress params={rangeParams} />
        </section>

        {/* ── Coupons ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={Gift}
            title="Coupons"
            subtitle="Discount usage and impact"
          />
          <CouponOverview params={rangeParams} />
        </section>

        {/* ── Payments ── */}
        <section className="space-y-5">
          <SectionHeading
            icon={CreditCard}
            title="Payments"
            subtitle="Transaction health"
          />
          <PaymentOverview params={rangeParams} />
        </section>
      </div>

      {/* Footer */}
      <div className="mt-10 border-t pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Copyright © {new Date().getFullYear()}{" "}
          <a href="https://mathpro.org" className="text-primary hover:underline">
            mathpro.org
          </a>
          . All rights reserved.
        </p>
      </div>
    </PageContainer>
  );
}
