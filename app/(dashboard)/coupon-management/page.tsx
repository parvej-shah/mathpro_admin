"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

import { CouponList } from "@/components/coupons/CouponList";
import { CouponForm } from "@/components/coupons/CouponForm";
import { CouponAnalytics } from "@/components/coupons/CouponAnalytics";
import { CouponCourses } from "@/components/coupons/CouponCourses";
import { CouponBundles } from "@/components/coupons/CouponBundles";
import { useCouponStatistics } from "@/hooks/useCoupons";
import type { Coupon } from "@/services/coupon.service";

type View = "overview" | "analytics";

export default function CouponManagementPage() {
  const [view, setView] = useState<View>("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isBundlesOpen, setIsBundlesOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data: statsData, isLoading: statsLoading } = useCouponStatistics();

  const overview = (() => {
    if (!statsData?.data) return null;
    const responseData = statsData.data as { overview?: unknown } | {
      [key: string]: unknown;
    };
    if (
      responseData &&
      typeof responseData === "object" &&
      "overview" in responseData
    ) {
      return responseData.overview as {
        total_coupons?: number;
        active_coupons?: number;
        total_usage?: number;
        total_discount_given?: number;
      };
    }
    return responseData as {
      total_coupons?: number;
      active_coupons?: number;
      total_usage?: number;
      total_discount_given?: number;
    };
  })();

  const handleCreate = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleManageCourses = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsCoursesOpen(true);
  };

  const handleManageBundles = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsBundlesOpen(true);
  };

  return (
    <PageContainer className="py-8">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Coupons"
          eyebrowIcon={faLayerGroup}
          title="Coupon management"
          description={
            overview && !statsLoading
              ? `${overview.total_coupons ?? 0} coupon${
                  (overview.total_coupons ?? 0) === 1 ? "" : "s"
                } in your store — ${overview.active_coupons ?? 0} active right now.`
              : "Compose, schedule and share discount codes for courses and bundles."
          }
          action={
            <Button
              size="default"
              onClick={handleCreate}
              className="h-11 rounded-full px-5 font-semibold shadow-sm shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              New coupon
            </Button>
          }
        />

        {/* Segmented control */}
        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-5 inline-flex rounded-full border border-border/80 bg-muted/30 p-1 text-sm">
              {(["overview", "analytics"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "relative px-4 h-9 rounded-full transition-colors capitalize",
                    view === v
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {view === v && (
                    <span className="absolute inset-0 rounded-full bg-background shadow-sm" />
                  )}
                  <span className="relative z-10 font-medium">{v}</span>
                </button>
              ))}
            </div>

            {view === "overview" ? (
              <CouponList
                onEdit={handleEdit}
                onManageCourses={handleManageCourses}
                onManageBundles={handleManageBundles}
              />
            ) : (
              <CouponAnalytics />
            )}
          </CardContent>
        </Card>
      </div>

      <CouponForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
      />

      <CouponCourses
        coupon={selectedCoupon}
        isOpen={isCoursesOpen}
        onClose={() => {
          setIsCoursesOpen(false);
          setSelectedCoupon(null);
        }}
      />

      <CouponBundles
        coupon={selectedCoupon}
        isOpen={isBundlesOpen}
        onClose={() => {
          setIsBundlesOpen(false);
          setSelectedCoupon(null);
        }}
      />
    </PageContainer>
  );
}
