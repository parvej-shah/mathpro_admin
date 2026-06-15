/**
 * Permission helpers and tab mapping for admin dashboard.
 * Aligned with ADMIN_DASHBOARD_TABS_BY_PERMISSIONS.md and FRONTEND_PERMISSION_UPDATE_2026.md.
 * Backend uses explicit permissions per area (no hierarchy from course.manage.all).
 */

/** Required permission: single string, any-of array, or require-all object */
export type RequiredPermission =
  | string
  | string[]
  | { all: string[] };

/**
 * Check if user has the required permission(s).
 * - string: user must have this permission
 * - string[]: user must have at least one of these (any-of)
 * - { all: string[] }: user must have every permission in the array
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  required: RequiredPermission
): boolean {
  if (!Array.isArray(userPermissions)) return false;

  if (typeof required === "string") {
    return userPermissions.includes(required);
  }

  if (Array.isArray(required)) {
    return required.some((p) => userPermissions.includes(p));
  }

  if (required && typeof required === "object" && "all" in required && Array.isArray(required.all)) {
    return required.all.every((p) => userPermissions.includes(p));
  }

  return false;
}

/**
 * Route → required permission mapping for sidebar and route protection.
 * Overview uses the same analytics APIs as the analytics dashboard.
 * Per FRONTEND_PERMISSION_UPDATE_2026.md: each area has its own explicit permission (no inheritance).
 *
 * Only .manage.all (global) permissions grant access; .own scoped permissions
 * are no longer checked.
 */
export const ROUTE_PERMISSIONS: Record<string, RequiredPermission> = {
  "/": "analytics.manage.all",
  "/new-course": "course.manage.all",
  "/courses": "course.manage.all",
  "/courses/new": "course.manage.all",
  "/combos": "bundle.manage.all",
  // Books: primary book.manage.all; course.manage.all is a temporary rollout
  // fallback for UI gating only (backend still requires book.manage.all).
  "/books": ["book.manage.all", "course.manage.all"],
  "/live-classes": "live.manage.all",
  "/student-profile": "user.manage.all",
  "/users": "user.manage.all",
  "/taken": "course.manage.all",
  "/prebooked": "course.manage.all",
  "/admins": "admin.manage.all",
  "/roles": "role.manage.all",
  "/instructors": "teacher.manage.all",
  "/course-access": "role.manage.all",
  "/teacher-dashboard": "teacher.manage.all",
  "/announcements": "announcement.manage.all",
  "/faq-management": "course.manage.all",
  "/testimonial-management": "feedback.manage.all",
  "/coupon-management": "coupon.manage.all",
  "/after-purchase-messages": "message.manage.all",
  "/payment-audit-log": "payment.manage.all",
  "/routines": "routine.manage.all",
  "/feedback-management": "feedback.manage.all",
};

/** Sidebar route order (first = default after login). */
const ROUTE_ORDER: string[] = [
  "/",
  "/courses",
  "/combos",
  "/books",
  "/live-classes",
  "/users",
  "/taken",
  "/prebooked",
  "/admins",
  "/roles",
  "/instructors",
  "/course-access",
  "/teacher-dashboard",
  "/announcements",
  "/faq-management",
  "/testimonial-management",
  "/coupon-management",
  "/after-purchase-messages",
  "/payment-audit-log",
  "/routines",
  "/feedback-management",
];

/**
 * Get the first route the user has permission to access (for redirect after login or when denied).
 * Returns null if no permissions array or no allowed route (caller should show 403).
 */
export function getFirstAllowedRoute(permissions: string[] | undefined): string | null {
  if (!Array.isArray(permissions)) return null;
  for (const path of ROUTE_ORDER) {
    const required = ROUTE_PERMISSIONS[path];
    if (required !== undefined && hasPermission(permissions, required)) {
      return path;
    }
  }
  return null;
}

/**
 * Get required permission for a route path (exact match or base path).
 */
export function getPermissionForRoute(pathname: string): RequiredPermission | undefined {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname] !== undefined) {
    return ROUTE_PERMISSIONS[pathname];
  }
  // Special nested routes that require stricter rules than base-segment fallback
  if (pathname === "/new-course" || pathname.startsWith("/new-course/")) {
    return ROUTE_PERMISSIONS["/new-course"];
  }
  if (pathname === "/courses/new" || pathname.startsWith("/courses/new/")) {
    return ROUTE_PERMISSIONS["/courses/new"];
  }
  if (pathname.startsWith("/student-profile/")) {
    return ROUTE_PERMISSIONS["/student-profile"];
  }
  // For nested routes (e.g. /courses/123/edit), use the base path
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const basePath = "/" + segments[0];
    return ROUTE_PERMISSIONS[basePath];
  }
  return undefined;
}
