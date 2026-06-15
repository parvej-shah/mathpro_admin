"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { PageContainer } from "@/components/layout/PageContainer";
import { PurchasedUsersList } from "@/components/purchases/PurchasedUsersList";
import { useCoursePurchases, useBundlePurchases } from "@/hooks/usePurchases";
import { useCourses } from "@/hooks/useAnnouncements";
import { useBundles } from "@/hooks/useBundles";
import { purchaseService } from "@/services/purchase.service";
import { toast } from "sonner";
import type {
  CoursePurchase,
  BundlePurchase,
} from "@/services/purchase.service";

interface Course {
  id: number;
  title: string;
}

interface Bundle {
  id: number;
  title: string;
}

export default function PurchasedUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<string>("");
  const [activeBundle, setActiveBundle] = useState<string>("");

  // Check if user has bundle.manage.all permission to show bundle tab
  const canViewBundleTab = hasPermission(user?.permissions, "bundle.manage.all");

  const { data: coursesData } = useCourses();
  const { data: bundlesData } = useBundles();

  const { data: coursePurchasesData, isLoading: courseLoading } =
    useCoursePurchases(activeCourse ? parseInt(activeCourse, 10) : null);

  const { data: bundlePurchasesData, isLoading: bundleLoading } =
    useBundlePurchases(activeBundle ? parseInt(activeBundle, 10) : null);

  const courses: Course[] = (() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as Course[] | { data?: Course[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const bundles: Bundle[] = (() => {
    if (!bundlesData?.data) return [];
    const responseData = bundlesData.data as Bundle[] | { data?: Bundle[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  // Set initial course/bundle
  useEffect(() => {
    if (courses.length > 0 && !activeCourse) {
      setActiveCourse(String(courses[0].id));
    }
  }, [courses, activeCourse]);

  useEffect(() => {
    if (bundles.length > 0 && !activeBundle) {
      setActiveBundle(String(bundles[0].id));
    }
  }, [bundles, activeBundle]);

  const coursePurchases: CoursePurchase[] = (() => {
    if (!coursePurchasesData?.data) return [];
    const responseData = coursePurchasesData.data as
      | CoursePurchase[]
      | { data?: CoursePurchase[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const bundlePurchases: BundlePurchase[] = (() => {
    if (!bundlePurchasesData?.data) return [];
    const responseData = bundlePurchasesData.data as
      | BundlePurchase[]
      | { data?: BundlePurchase[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const handleExportCourseCSV = async () => {
    if (!activeCourse) return;

    try {
      // Generate CSV from coursePurchases
      const headers = [
        "Name",
        "Phone",
        "Email",
        "Amount",
        "Transaction ID",
        "Timestamp",
        "Coupon Used",
        "Coupon Code",
        "Coupon Name",
        "Amount Saved",
      ];
      const rows = coursePurchases.map((user) => [
        user.name || "",
        user.phone || "",
        user.email || "",
        user.amount?.toString() || "0",
        user.transaction_id || "",
        new Date(user.timestamp * 1000).toISOString(),
        user.coupon_used ? "Yes" : "No",
        user.coupon_code || "",
        user.coupon_name || "",
        user.amount_saved?.toString() || "0",
      ]);

      const csvContent =
        [headers, ...rows].map((row) => row.join(",")).join("\n") + "\n";

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `purchased_users_${activeCourse}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleExportBundleCSV = async () => {
    if (!activeBundle) return;

    try {
      const blob = await purchaseService.exportBundlePurchases(
        parseInt(activeBundle, 10)
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `bundle_purchases_${activeBundle}_${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  return (
    <PageContainer className="py-3">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Purchased Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search buyers, filter by course or bundle, and open profiles.
          </p>
        </div>

        <PurchasedUsersList
          coursePurchases={coursePurchases}
          bundlePurchases={bundlePurchases}
          courses={courses}
          bundles={bundles}
          courseLoading={courseLoading}
          bundleLoading={bundleLoading}
          activeCourse={activeCourse}
          activeBundle={activeBundle}
          onCourseChange={setActiveCourse}
          onBundleChange={setActiveBundle}
          onUserClick={handleUserClick}
          onExportCourseCSV={handleExportCourseCSV}
          onExportBundleCSV={handleExportBundleCSV}
          showBundleTab={canViewBundleTab}
        />
      </div>
    </PageContainer>
  );
}
