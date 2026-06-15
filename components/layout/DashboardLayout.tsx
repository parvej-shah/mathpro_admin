"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredUserType?: number;
  allowedUserTypes?: number[];
}

export function DashboardLayout({
  children,
  requiredUserType,
  allowedUserTypes,
}: DashboardLayoutProps) {
  // Default to true (expanded) on desktop, false (collapsed) on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // On mobile, start with sidebar closed
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <ProtectedRoute
      requiredUserType={requiredUserType}
      allowedUserTypes={allowedUserTypes}
    >
      <div className="flex min-h-screen">
        {/* Mobile Toggle Button - Only show when sidebar is closed on mobile */}
        {!sidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </Button>
        )}

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content with proper margin for fixed sidebar */}
        <main
          className={cn(
            "flex-1 min-h-screen overflow-y-auto transition-all duration-300",
            sidebarOpen ? "lg:ml-64" : "lg:ml-16"
          )}
        >
          <RequirePermission>{children}</RequirePermission>
        </main>
      </div>
    </ProtectedRoute>
  );
}
