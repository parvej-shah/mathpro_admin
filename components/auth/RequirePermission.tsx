"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  hasPermission,
  getPermissionForRoute,
  getFirstAllowedRoute,
} from "@/lib/permissions";
import { PageContainer } from "@/components/layout/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

interface RequirePermissionProps {
  children: React.ReactNode;
}

/**
 * Wraps dashboard content. When the user lacks permission for the current route:
 * redirects to the first route they can access. Shows 403 only if they have no
 * allowed routes.
 */
export function RequirePermission({ children }: RequirePermissionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions;
  const required = getPermissionForRoute(pathname ?? "");

  const hasPermissionsArray = Array.isArray(permissions);
  // Deny by default in dashboard when permission array is missing or route is unmapped.
  const denied =
    !hasPermissionsArray ||
    required === undefined ||
    !hasPermission(permissions, required);

  useEffect(() => {
    if (!denied || !hasPermissionsArray) return;
    const firstAllowed = getFirstAllowedRoute(permissions);
    if (firstAllowed !== null && firstAllowed !== pathname) {
      router.replace(firstAllowed);
    }
  }, [denied, hasPermissionsArray, permissions, pathname, router]);

  if (!denied) return <>{children}</>;

  const firstAllowed = getFirstAllowedRoute(permissions);
  if (firstAllowed !== null) {
    return null;
  }

  return (
    <PageContainer className="py-6">
      <Alert variant="destructive" className="max-w-md">
        <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
        <AlertTitle>Permission denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access any dashboard page. Contact your
          administrator to get access.
        </AlertDescription>
      </Alert>
    </PageContainer>
  );
}
