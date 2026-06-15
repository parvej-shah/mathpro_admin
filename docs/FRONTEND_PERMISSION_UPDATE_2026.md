# Backend Permission Update — Frontend Action Required

**Date:** February 2026  
**Summary:** The backend no longer uses **parent-child (hierarchical) permissions**. Each admin area now requires its **own explicit permission**. Frontend tab visibility and permission checks must be updated to match.

---

## What Changed

### Before (old behavior)
- **`course.manage.all`** granted access to **many** areas: courses, chapters, modules, contests, announcements, live sessions, feedback, SMS, routine, submissions, discussion, level, and Course V2 / Module V2.
- One permission could drive many dashboard tabs.

### After (current behavior)
- **`course.manage.all`** grants access **only** to:
  - Course CRUD (list, get, create, update, delete, getFull, updateFull)
  - Course certificates, enrollments, prebookings, user progress
  - **Course V2** endpoints (import/export, reorder modules, getFull-enhanced)
- **All other areas** require their **own** permission. There is **no inheritance** from `course.manage.all`.

---

## New Permission per Area (use for tabs & API calls)

Use this mapping for **showing/hiding tabs** and for understanding which APIs will return **403** without the right permission.

| Dashboard tab / area        | Required permission       | Notes |
|----------------------------|---------------------------|--------|
| **Courses**                | `course.manage.all`       | Course list, CRUD, certificates, enrollments, prebookings, progress |
| **Chapters**               | `chapter.manage.all`      | Chapter list, get, create, update, delete |
| **Modules**                | `module.manage.all`       | Module list, get, create, update, delete |
| **Course V2**              | `course.manage.all`       | Import/export, reorder, getFull-enhanced |
| **Module V2**              | `module.manage.all`       | Instructor, assignment doc, quiz import/export, duplicate, batch update |
| **Contests**               | `contest.manage.all`      | Contest list, CRUD, participants, leaderboard |
| **Announcements**          | `announcement.manage.all` | Announcement list, CRUD, send |
| **Live sessions**          | `live.manage.all`         | Live list, CRUD, bulk import/delete, export |
| **Feedback**                | `feedback.manage.all`    | Feedback list, stats, delete, export |
| **Module feedback**        | `feedback.manage.all`    | Module feedback, reasons CRUD, export |
| **SMS**                    | `sms.manage.all`         | Send SMS, history, statistics, retry |
| **Routine**               | `routine.manage.all`     | Routine list, CRUD, toggle active |
| **Submissions / Assignment**| `submission.manage.all`  | Pending evaluations, evaluate |
| **Discussion**             | `discussion.manage.all`   | Discussion list, create, delete |
| **Sub-discussion**         | `discussion.manage.all`   | Sub-discussion list, create, delete |
| **Level**                  | `level.manage.all`        | Level CRUD, gift requests, approve |
| **Users**                  | `user.manage.all`         | (unchanged) |
| **Admins**                 | `admin.manage.all`        | (unchanged) |
| **Teachers**               | `teacher.manage.all`      | (unchanged) |
| **Bundles**                | `bundle.manage.all`       | (unchanged) |
| **Coupons**                | `coupon.manage.all`       | (unchanged) |
| **Ambassadors**            | `ambassador.manage.all`   | (unchanged) |
| **Payments**               | `payment.manage.all`      | (unchanged) |
| **Revenue**                | `revenue.manage.all` or `revenue.read.all` | (unchanged; backend may allow either) |
| **Analytics**              | `analytics.manage.all`    | (unchanged) |
| **Roles & permissions**    | `role.manage.all`         | (unchanged) |
| **After-purchase message**| `message.manage.all`      | (unchanged) |
| **Streak**                 | `streak.manage.all`       | (unchanged) |

---

## What You Need to Do

1. **Tab visibility**  
   Stop using **only** `course.manage.all` for: Contests, Announcements, Live, Feedback, SMS, Routine, Submissions, Discussion, Level, Module feedback, and Module V2.  
   Use the **explicit permission** from the table above for each tab (e.g. `contest.manage.all` for Contests, `announcement.manage.all` for Announcements).

2. **Courses tab**  
   For “Courses” (course list, CRUD, certificates, enrollments, etc.) and **Course V2**, keep using **`course.manage.all`**.

3. **Chapters & Modules**  
   If you have separate tabs or sections for Chapters and Modules, require **`chapter.manage.all`** and **`module.manage.all`** respectively. Users with only `course.manage.all` will **not** have access to chapter/module APIs anymore.

4. **Role assignment in admin panel**  
   When you assign permissions to a role (if your UI supports it), ensure you can assign these as separate permissions:  
   `chapter.manage.all`, `module.manage.all`, `contest.manage.all`, `announcement.manage.all`, `live.manage.all`, `feedback.manage.all`, `sms.manage.all`, `routine.manage.all`, `submission.manage.all`, `discussion.manage.all`, `level.manage.all`.  
   Backend role/permission APIs already expose the full list.

5. **403 on previously working calls**  
   If an admin had only `course.manage.all` and could previously open Contests, Live, Feedback, etc., they will now get **403** on those APIs until their role is updated with the corresponding **explicit** permission(s).

---

## Example: updated tab list (JavaScript)

```javascript
const DASHBOARD_TABS = [
  { key: 'users', label: 'Users', permission: 'user.manage.all' },
  { key: 'admins', label: 'Admins', permission: 'admin.manage.all' },
  { key: 'courses', label: 'Courses', permission: 'course.manage.all' },
  { key: 'teachers', label: 'Teachers', permission: 'teacher.manage.all' },
  // Explicit permissions (no longer course.manage.all):
  { key: 'contests', label: 'Contests', permission: 'contest.manage.all' },
  { key: 'announcements', label: 'Announcements', permission: 'announcement.manage.all' },
  { key: 'live', label: 'Live sessions', permission: 'live.manage.all' },
  { key: 'feedback', label: 'Feedback', permission: 'feedback.manage.all' },
  { key: 'sms', label: 'SMS', permission: 'sms.manage.all' },
  { key: 'routine', label: 'Routine', permission: 'routine.manage.all' },
  { key: 'submissions', label: 'Submissions', permission: 'submission.manage.all' },
  { key: 'discussion', label: 'Discussion', permission: 'discussion.manage.all' },
  { key: 'level', label: 'Level', permission: 'level.manage.all' },
  { key: 'module-feedback', label: 'Module feedback', permission: 'feedback.manage.all' },
  // Course V2 / Module V2
  { key: 'course-v2', label: 'Course V2', permission: 'course.manage.all' },
  { key: 'module-v2', label: 'Module V2', permission: 'module.manage.all' },
  // Rest unchanged
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

function hasPermission(userPermissions, required) {
  if (!Array.isArray(userPermissions)) return false;
  const need = Array.isArray(required) ? required : [required];
  return need.some((p) => userPermissions.includes(p));
}

function getVisibleTabs(permissions) {
  return DASHBOARD_TABS.filter((tab) => hasPermission(permissions, tab.permission));
}
```

---

## Quick reference: permissions that changed

| Area           | Old (single perm for many) | New (explicit)        |
|----------------|----------------------------|------------------------|
| Chapters       | `course.manage.all`         | `chapter.manage.all`   |
| Modules        | `course.manage.all`         | `module.manage.all`   |
| Contests       | `course.manage.all`         | `contest.manage.all`  |
| Announcements  | `course.manage.all`         | `announcement.manage.all` |
| Live           | `course.manage.all`         | `live.manage.all`     |
| Feedback       | `course.manage.all`         | `feedback.manage.all` |
| SMS            | `course.manage.all`         | `sms.manage.all`      |
| Routine        | `course.manage.all`         | `routine.manage.all`  |
| Submissions    | `course.manage.all`         | `submission.manage.all` |
| Discussion     | `course.manage.all`         | `discussion.manage.all` |
| Level          | `course.manage.all`         | `level.manage.all`    |
| Module V2      | `course.manage.all`         | `module.manage.all`   |

**Courses** and **Course V2** still use **`course.manage.all`**.

If you have questions or need the full backend API–permission list, see `admin_api_permission_mapping.md` in the backend repo.
