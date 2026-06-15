# Admin Dashboard Tabs — Show/Hide by Permissions

This guide explains how the **frontend** can use the admin’s **permissions** (from login/JWT) to show or hide dashboard tabs/sections so each admin only sees what they are allowed to access.

---

## 1. Where permissions come from

After **managerial (admin) login**, the backend returns:

- **Login response body:** `user.permissions` — array of permission strings.
- **JWT payload:** The same token payload includes `permissions` (and `roles`). If you decode the token on the frontend, you get the same list.

**Example login response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 61,
    "name": "Admin Name",
    "type": 1,
    "loginType": "email",
    "email": "admin@example.com",
    "roles": [{ "id": 12, "name": "super_admin", "display_name": "Super Administrator" }],
    "permissions": [
      "user.manage.all",
      "admin.manage.all",
      "course.manage.all",
      "role.manage.all",
      "analytics.manage.all",
      "payment.manage.all"
    ]
  }
}
```

**Important:** Only **managerial login** (admin/moderator) returns `permissions`. Student/login paths do not. Use this list for **admin dashboard** UI only.

---

## 2. Storing permissions on the frontend

After login:

1. Store `user.permissions` in your auth state (e.g. React context, Redux, Zustand, or local state).
2. Optionally decode the JWT and use `payload.permissions` for the same list (e.g. after page refresh if you only persist the token).

**Example (conceptual):**

```javascript
// After successful admin login
const { user, token } = loginResponse.data;
setAuthState({
  user,
  token,
  permissions: user.permissions || [],  // e.g. ['user.manage.all', 'course.manage.all', ...]
  roles: user.roles || []
});
```

Keep `permissions` as an **array of strings**. Use it for both tab visibility and (optionally) disabling buttons/actions.

---

## 3. Map dashboard tabs to required permissions

Each **tab or section** of the admin dashboard should be tied to one (or more) permission strings that the backend uses for the APIs behind that tab. Use the same permission the backend requires for that area.

**Backend uses explicit permissions (no hierarchy).** See **docs/FRONTEND_PERMISSION_UPDATE_2026.md** for the full changelog.

Suggested mapping (aligns with current backend):

| Tab / Section (label)        | Required permission(s)     | Backend area / routes              |
|----------------------------|----------------------------|------------------------------------|
| Users                      | `user.manage.all`          | User CRUD, list, reset password    |
| Admins                     | `admin.manage.all`         | Admin CRUD, list                   |
| Courses                    | `course.manage.all`        | Course CRUD, certificates, enrollments, prebookings |
| Chapters                   | `chapter.manage.all`       | Chapter list, get, create, update, delete |
| Modules                    | `module.manage.all`        | Module list, get, create, update, delete |
| Teachers                   | `teacher.manage.all`       | Teacher management, V2              |
| Contests                   | `contest.manage.all`       | Contest CRUD, participants, leaderboard |
| Announcements              | `announcement.manage.all`  | Announcements CRUD, send            |
| Live sessions              | `live.manage.all`         | Live CRUD, bulk import/export      |
| Feedback                   | `feedback.manage.all`     | Feedback list, stats, delete, export |
| SMS                        | `sms.manage.all`           | SMS send, history, statistics, retry |
| Routine                    | `routine.manage.all`       | Routine CRUD, toggle active        |
| Submissions / Assignment   | `submission.manage.all`   | Pending evaluations, evaluate      |
| Discussion                 | `discussion.manage.all`    | Discussion, sub-discussion          |
| Level                      | `level.manage.all`         | Level CRUD, gift requests          |
| Module feedback            | `feedback.manage.all`     | Module feedback, reasons, export    |
| Course V2                  | `course.manage.all`       | Course import/export, reorder      |
| Module V2                  | `module.manage.all`       | Module V2 instructor, assignment, quiz, duplicate |
| Bundles                    | `bundle.manage.all`        | Bundle CRUD, analytics             |
| Coupons                    | `coupon.manage.all`        | Coupon management                  |
| Ambassadors                | `ambassador.manage.all`    | Ambassador, commissions, system ambassador config |
| Course commissions         | `ambassador.manage.all`    | Course commissions (write); GET may be public |
| Payments                   | `payment.manage.all`       | Payment admin endpoints            |
| Revenue                    | `revenue.manage.all`       | Revenue (or hybrid; see backend)   |
| Analytics                  | `analytics.manage.all`     | Analytics dashboard, V2            |
| Roles & permissions        | `role.manage.all`         | Roles CRUD, assign/remove, permissions list |
| After-purchase message     | `message.manage.all`       | After-message management           |
| Streak                     | `streak.manage.all`        | Streak management                  |
| System (e.g. ambassador config) | `ambassador.manage.all` | System ambassador-discount-config  |

**Special cases:**

- **Revenue:** Backend may allow `revenue.manage.all` or `revenue.read.all` or course-scoped access. For “show Revenue tab”, requiring `revenue.manage.all` (or `revenue.read.all` if you have it) is a safe default; align with your backend’s `requireRevenueAccess` logic if you need course-only visibility.
- **Course-scoped tabs:** Many tabs (Contest, Announcements, Live, Feedback, SMS, Routine, Submissions, Discussion, Level, Module feedback, Course/Module V2) use **one** permission in Phase 5: `course.manage.all`. So one “Courses” (or “Course management”) permission can drive many tabs if you want to keep the UI simple.

---

## 4. Helper: “can show tab” / “has permission”

Implement a small helper that checks if the current user’s `permissions` array includes the required string (or any of a list).

**Example:**

```javascript
/**
 * @param {string[]} userPermissions - e.g. from auth state (user.permissions)
 * @param {string|string[]} required - one permission string or array (any one is enough)
 * @returns {boolean}
 */
function hasPermission(userPermissions, required) {
  if (!Array.isArray(userPermissions)) return false;
  const need = Array.isArray(required) ? required : [required];
  return need.some((p) => userPermissions.includes(p));
}
```

Use it to decide whether to show a tab:

```javascript
// Single permission
if (hasPermission(permissions, 'user.manage.all')) {
  tabs.push({ key: 'users', label: 'Users', path: '/admin/users' });
}

// Multiple options (e.g. revenue: global or course-scoped)
if (hasPermission(permissions, ['revenue.manage.all', 'revenue.read.all'])) {
  tabs.push({ key: 'revenue', label: 'Revenue', path: '/admin/revenue' });
}
```

---

## 5. Example: building the tab list (React-style)

```javascript
const DASHBOARD_TABS = [
  { key: 'users', label: 'Users', permission: 'user.manage.all' },
  { key: 'admins', label: 'Admins', permission: 'admin.manage.all' },
  { key: 'courses', label: 'Courses', permission: 'course.manage.all' },
  { key: 'teachers', label: 'Teachers', permission: 'teacher.manage.all' },
  { key: 'contests', label: 'Contests', permission: 'contest.manage.all' },
  { key: 'announcements', label: 'Announcements', permission: 'announcement.manage.all' },
  { key: 'live', label: 'Live sessions', permission: 'live.manage.all' },
  { key: 'feedback', label: 'Feedback', permission: 'feedback.manage.all' },
  { key: 'sms', label: 'SMS', permission: 'sms.manage.all' },
  { key: 'routine', label: 'Routine', permission: 'routine.manage.all' },
  { key: 'submissions', label: 'Submissions', permission: 'submission.manage.all' },
  { key: 'discussion', label: 'Discussion', permission: 'discussion.manage.all' },
  { key: 'level', label: 'Level', permission: 'level.manage.all' },
  { key: 'bundles', label: 'Bundles', permission: 'bundle.manage.all' },
  { key: 'coupons', label: 'Coupons', permission: 'coupon.manage.all' },
  { key: 'ambassadors', label: 'Ambassadors', permission: 'ambassador.manage.all' },
  { key: 'payments', label: 'Payments', permission: 'payment.manage.all' },
  { key: 'revenue', label: 'Revenue', permission: 'revenue.manage.all' },
  { key: 'analytics', label: 'Analytics', permission: 'analytics.manage.all' },
  { key: 'roles', label: 'Roles & permissions', permission: 'role.manage.all' },
  { key: 'message', label: 'After-purchase message', permission: 'message.manage.all' },
  { key: 'streak', label: 'Streak', permission: 'streak.manage.all' },
];

function getVisibleTabs(permissions) {
  if (!Array.isArray(permissions)) return [];
  return DASHBOARD_TABS.filter((tab) => permissions.includes(tab.permission));
}

// Usage in component
const visibleTabs = getVisibleTabs(authState.user?.permissions ?? []);
```

Then render only `visibleTabs` in your sidebar or tab bar. Same `permissions` can be used to hide/disable specific actions (e.g. “Delete user” only if `user.manage.all`).

---

## 6. Optional: keep list in sync with backend

The backend’s **assignable** permission list (only `resource.manage.all`) is returned by:

- **GET** `/admin/roles/permissions` (requires `role.manage.all`)

Response includes `data.all` (flat array) and `data.by_resource` (grouped). You can use this to:

- Build or validate your tab–permission mapping (e.g. only show tabs whose permission is in `data.all`).
- Drive a role create/edit UI; use the same list for “which permissions exist” so the frontend never hardcodes permissions that the backend doesn’t accept.

For **tab visibility**, the list in **§3** is enough as long as it matches the backend’s required permission per route (which it does for Phase 5).

---

## 7. Summary

| Step | Action |
|------|--------|
| 1 | After admin login, store `user.permissions` (array of strings) in auth state. |
| 2 | Define a mapping: each dashboard tab → required permission (e.g. `user.manage.all`). |
| 3 | Use a `hasPermission(permissions, required)` (or filter with `permissions.includes(...)`) to decide which tabs to show. |
| 4 | Render only tabs the user has permission for; optionally use the same check for buttons/actions inside each section. |

This way, the admin dashboard only shows tabs the user is allowed to use, matching the backend’s permission checks.
