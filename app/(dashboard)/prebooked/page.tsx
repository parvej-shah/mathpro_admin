"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PrebookedUsersList } from "@/components/purchases/PrebookedUsersList";
import {
  useCoursePrebookings,
  useBundlePrebookings,
} from "@/hooks/usePurchases";
import { useCourses } from "@/hooks/useAnnouncements";
import { useBundles } from "@/hooks/useBundles";
import { toast } from "sonner";
import type { PrebookedUser } from "@/services/purchase.service";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";

interface Course {
  id: number;
  title: string;
}

interface Bundle {
  id: number;
  title: string;
}

export default function PrebookedUsersPage() {
  const router = useRouter();
  const [activeCourse, setActiveCourse] = useState<string>("");
  const [activeBundle, setActiveBundle] = useState<string>("");
  const { user } = useAuth();

  // Check if user has bundle.manage.all permission to show bundle tab
  const canViewBundleTab = hasPermission(user?.permissions, {
    all: ["course.manage.all", "bundle.manage.all"],
  });

  const { data: coursesData } = useCourses();
  const { data: bundlesData } = useBundles();

  const { data: coursePrebookingsData, isLoading: courseLoading } =
    useCoursePrebookings(activeCourse ? parseInt(activeCourse, 10) : null);

  const { data: bundlePrebookingsData, isLoading: bundleLoading } =
    useBundlePrebookings(activeBundle ? parseInt(activeBundle, 10) : null);

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

  const coursePrebookings: PrebookedUser[] = (() => {
    if (!coursePrebookingsData?.data) return [];
    const responseData = coursePrebookingsData.data as
      | PrebookedUser[]
      | { data?: PrebookedUser[] };
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

  const bundlePrebookings: PrebookedUser[] = (() => {
    if (!bundlePrebookingsData?.data) return [];
    const responseData = bundlePrebookingsData.data as
      | PrebookedUser[]
      | { data?: PrebookedUser[] };
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
      const headers = ["Name", "Phone", "Email", "UTM", "Timestamp"];
      const rows = coursePrebookings.map((user) => [
        user.name || "",
        user.phone || "",
        user.email || "",
        user.utm || "",
        new Date(user.timestamp * 1000).toISOString(),
      ]);

      const csvContent =
        [headers, ...rows].map((row) => row.join(",")).join("\n") + "\n";

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prebooked_users_${activeCourse}.csv`);
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
      // Generate CSV on frontend like course export for consistency
      const headers = ["Name", "Phone", "Email", "UTM", "Timestamp"];
      const rows = bundlePrebookings.map((user) => [
        user.name || "",
        user.phone || "",
        user.email || "",
        user.utm || "",
        new Date(user.timestamp * 1000).toISOString(),
      ]);

      const csvContent =
        [headers, ...rows].map((row) => row.join(",")).join("\n") + "\n";

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prebooked_bundles_${activeBundle}.csv`);
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
            Prebooked Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search prebookings, filter by course or bundle, and open profiles.
          </p>
        </div>

        <PrebookedUsersList
          coursePrebookings={coursePrebookings}
          bundlePrebookings={bundlePrebookings}
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
          canViewBundleTab={canViewBundleTab}
        />
      </div>
    </PageContainer>
  );
}
