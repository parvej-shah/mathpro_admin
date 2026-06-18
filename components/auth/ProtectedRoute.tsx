"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserType,
  logout,
  redirectToFrontendLogin,
  isLoginRedirectLooping,
  clearLoginRedirectGuard,
} from "@/lib/auth";
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
  // Set when we've returned from the Frontend login still unauthenticated —
  // means the hand-off failed; we stop redirecting and show an error rather
  // than ping-ponging between the two origins forever.
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading) return;

    // Authenticated: clear the loop guard so future logouts work normally.
    if (isAuthenticated) {
      clearLoginRedirectGuard();
    }

    // Not authenticated: bounce to the centralized Frontend login — unless we
    // just came back from it still unauthenticated (loop), in which case stop.
    if (!isAuthenticated) {
      if (isLoginRedirectLooping()) {
        setStuck(true);
        return;
      }
      redirectToFrontendLogin();
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

  if (stuck) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold">Couldn&apos;t sign you in</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t establish your admin session. Please sign in again.
          </p>
          <button
            onClick={() => {
              clearLoginRedirectGuard();
              logout();
            }}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

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
