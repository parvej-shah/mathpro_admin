"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserType, logout } from "@/lib/auth";
import { USER_TYPES } from "@/lib/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: number;
  allowedUserTypes?: number[];
}

export function ProtectedRoute({
  children,
  requiredUserType,
  allowedUserTypes,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return;

    // Check authentication
    if (!isAuthenticated) {
      logout();
      return;
    }

    const userType = getUserType();
    const hasPermissions = Array.isArray(user?.permissions) && user.permissions.length > 0;

    // Students (type 3) are never allowed in the admin dashboard, even with roles/permissions
    if (userType === USER_TYPES.USER) {
      logout();
      return;
    }

    // Check required user type (skip if user has permissions — backend has granted access)
    if (requiredUserType && userType !== requiredUserType && !hasPermissions) {
      window.location.href = "/";
      return;
    }

    // Check allowed user types (skip if user has permissions)
    if (
      allowedUserTypes &&
      userType &&
      !allowedUserTypes.includes(userType) &&
      !hasPermissions
    ) {
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, loading, user?.permissions, requiredUserType, allowedUserTypes]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
