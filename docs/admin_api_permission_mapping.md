# Admin API Permission Mapping & Migration Plan

**Document Purpose:** Complete inventory of admin APIs and their required RBAC permissions  
**Target:** Phase 5 - Gradual API Migration to Permission-Based Authorization  
**Date:** February 2, 2026  
**Branch:** feat/rbac-p1

---

## Table of Contents

1. [Overview](#overview)
2. [Permission Naming Convention](#permission-naming-convention)
3. [API Inventory by Resource](#api-inventory-by-resource)
4. [Migration Priority](#migration-priority)
5. [Implementation Phases](#implementation-phases)

---

## Overview

### Current State
- **Total Admin Routes Files:** 34
- **Authentication Method:** `authenticateAdmin` (type-based: checks type === 1 or 2)
- **Problem:** No granular permission control, all admins have full access

### Target State
- **Authentication Method:** Permission-based middleware
- **Permission Model:** `resource.action.scope` (e.g., `user.read.all`)
- **Benefit:** Granular control, role-based access, audit trail

---

## Permission Naming Convention

```
Format: resource.action.scope

Resources: user, admin, course, module, chapter, teacher, student, coupon, 
          bundle, contest, announcement, payment, ambassador, feedback, live, etc.

Actions: create, read, update, delete, manage

Scopes: all (full access), own (user's own resources)

Examples:
- user.read.all - Read all users
- user.update.own - Update own user profile
- course.create.all - Create courses
- payment.view.all - View all payments
```

### Explicit Permissions (No Parent-Child Cascade)

**Important:** We use **explicit permissions only**. No permission grants access to other resources.

- `course.manage.all` grants **only** course CRUD and course-scoped endpoints explicitly listed (e.g. course list/get/create/update/delete, certificates, enrollments, prebookings, progress). It does **not** grant chapter, module, contest, announcement, live, feedback, SMS, routine, submission, discussion, or level.
- Each resource has its own permission; assign `chapter.manage.all`, `module.manage.all`, `contest.manage.all`, `announcement.manage.all`, `live.manage.all`, `feedback.manage.all`, `sms.manage.all`, `routine.manage.all`, `submission.manage.all`, `discussion.manage.all`, `level.manage.all` explicitly as needed.

**Permission Resolution:** Direct check only. User must have the exact permission required by the endpoint (e.g. `contest.manage.all` for contest routes). No inheritance from parent resources.

---

### Explicit Permission Migration Checklist

| # | Route File | Permission | Status |
|---|------------|------------|--------|
| 1 | `course.js` | `course.manage.all` (course CRUD only; revenue uses requireRevenueAccess) | ✅ Keep |
| 2 | `chapter.js` | `chapter.manage.all` | ✅ Done |
| 3 | `module.js` | `module.manage.all` | ✅ Done |
| 4 | `contest.js` | `contest.manage.all` | ✅ Done |
| 5 | `announcement.js` | `announcement.manage.all` | ✅ Done |
| 6 | `live.js` | `live.manage.all` | ✅ Done |
| 7 | `feedback.js` | `feedback.manage.all` | ✅ Done |
| 8 | `sms.js` | `sms.manage.all` | ✅ Done |
| 9 | `routine.js` | `routine.manage.all` | ✅ Done |
| 10 | `submission.js` | `submission.manage.all` | ✅ Done |
| 11 | `discussion.js` | `discussion.manage.all` | ✅ Done |
| 12 | `level.js` | `level.manage.all` | ✅ Done |
| 13 | `courseV2.js` | `course.manage.all` (course resource) | ✅ Keep |
| 14 | `moduleV2.js` | `module.manage.all` | ✅ Done |
| 15 | `moduleFeedback.js` | `feedback.manage.all` | ✅ Already explicit |
| 16 | `subDiscussion.js` | `discussion.manage.all` | ✅ Already explicit |

---

### Hybrid Access Model: Global + Course-Specific Permissions (Phase 2)

**⚠️ IMPORTANT:** Some resources support **HYBRID ACCESS** - both global and course-specific permissions.

#### What is Hybrid Access?

Certain sensitive resources (Revenue, Analytics, Enrollments) can be accessed in TWO ways:

**1. Global Access (via Roles)**
- Stored in: `roles` table → `user_roles` table
- Permission format: `resource.manage.all` (e.g., `revenue.manage.all`)
- Grants: Access to **ALL** courses system-wide
- Who: Super admins, finance managers, data analysts

**2. Course-Specific Access (via Course Access Table)**
- Stored in: `course_access` table
- Permission format: `resource.view` (e.g., `revenue.view`)
- Grants: Access to **SPECIFIC** courses only
- Who: Course shareholders, course owners, course managers

#### The `course_access` Table (Phase 2)

```sql
CREATE TABLE course_access (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES course(id),
  user_id INTEGER REFERENCES managerial_auth(id),
  access_type VARCHAR(20) CHECK (access_type IN ('owner', 'shareholder')),
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES managerial_auth(id),
  UNIQUE(course_id, user_id)
);
```

#### Course-Specific Permissions

These permissions are stored in the `course_access.permissions` JSONB field:

| Permission | Description | Scope |
|------------|-------------|-------|
| `course.view` | View basic course info | Course-specific |
| `course.view.own` | View own courses only | Own courses |
| `enrollment.view` | View enrollments | Course-specific |
| `enrollment.view.own` | View own enrollments | Own enrollments |
| `module.view` | View modules/chapters | Course-specific |
| `module.view.own` | View own progress | Own progress |
| `revenue.view` | View revenue data | Course-specific |
| `revenue.view.own` | View revenue for own courses | Own courses |
| `analytics.view` | View analytics | Course-specific |
| `analytics.view.own` | View analytics for own courses | Own courses |
| `course.manage` | Full course management | Course-specific |

#### Permission Resolution Algorithm

When checking access to course-related resources:

```javascript
async function checkHybridAccess(userId, courseId, permission) {
  // Step 1: Check global permission (from roles)
  const globalPermission = `${resource}.manage.all`;
  if (await hasGlobalPermission(userId, globalPermission)) {
    return true; // Global access granted
  }
  
  // Step 2: Check course-specific permission (from course_access)
  const coursePermission = `${resource}.view`;
  if (await hasCourseAccess(userId, courseId, coursePermission)) {
    return true; // Course-specific access granted
  }
  
  // Step 3: Check .own scope (from roles)
  const ownPermission = `${resource}.read.own`;
  if (await hasPermission(userId, ownPermission) && await isOwner(userId, courseId)) {
    return true; // Own resource access granted
  }
  
  return false; // Access denied
}
```

#### Use Case Example: CP Course with 3 Shareholders

**Scenario:** CP Course has 3 shareholders who should only see enrollment, module, and revenue data for CP Course.

**Database Setup:**
```sql
-- Assign 3 shareholders to CP Course (course_id = 1)
INSERT INTO course_access (course_id, user_id, access_type, permissions, created_by)
VALUES 
  (1, 101, 'shareholder', '["course.view", "enrollment.view", "module.view", "revenue.view", "analytics.view"]', 1),
  (1, 102, 'shareholder', '["course.view", "enrollment.view", "module.view", "revenue.view", "analytics.view"]', 1),
  (1, 103, 'shareholder', '["course.view", "enrollment.view", "module.view", "revenue.view", "analytics.view"]', 1);
```

**Result:**
- User 101, 102, 103 can view revenue/analytics for CP Course ONLY
- They CANNOT see other courses' data
- Super admin with `revenue.manage.all` can see ALL courses including CP Course

#### Resources with Hybrid Access

The following resources support hybrid access (marked with ⚠️ in API sections):

1. **Revenue Analytics** - `revenue.manage.all` (global) + `revenue.view` (course-specific)
2. **Analytics** - `analytics.manage.all` (global) + `analytics.view` (course-specific)
3. **Course Management** - `course.manage.all` (global) + `course.manage` (course-specific)
4. **Enrollments** - `course.manage.all` (global) + `enrollment.view` (course-specific)
5. **Modules/Chapters** - Inherit from parent course access

---

### Simplified Permission Strategy: `resource.manage.all`

**Current Implementation Approach:**

For **Phase 5 initial rollout**, we use a **simplified permission model** where each resource has ONE primary permission:

```
resource.manage.all
```

This single permission grants **full CRUD access** (Create, Read, Update, Delete) to the resource.

**Why This Approach?**

1. **Simplicity** - Easy to understand and assign
2. **Quick Migration** - Faster to implement across all APIs
3. **Backward Compatible** - Similar to current `authenticateAdmin` behavior
4. **Future-Ready** - Granular permissions documented for future use

**Permission Assignment Examples:**

```javascript
// User Manager Role
permissions: ['user.manage.all']
→ Can create, read, update, delete users
→ Can reset passwords
→ Can promote to ambassador

// Content Manager Role  
permissions: ['course.manage.all']
→ Can manage courses
→ Can manage chapters (inherited)
→ Can manage modules (inherited)
→ Can manage quizzes (inherited)

// Finance Manager Role
permissions: ['payment.manage.all', 'coupon.manage.all', 'bundle.manage.all']
→ Can manage all financial operations

// Super Admin Role
permissions: [
  'user.manage.all',
  'admin.manage.all', 
  'course.manage.all',
  'ambassador.manage.all',
  'payment.manage.all',
  'role.manage.all'
]
→ Full system access
```

**Granular Permissions (Documented for Future)**

While we use `manage.all` for now, the following granular permissions are **defined and documented** for future fine-grained control:

- `resource.create.all` - Create only
- `resource.read.all` - Read only (view/list)
- `resource.update.all` - Update only
- `resource.delete.all` - Delete only
- `resource.specific.action` - Special actions (e.g., `user.password.reset`)

**Future Migration Path:**

When granular control is needed:
1. Granular permissions are already defined in `util/permissions.js`
2. Update role assignments in database
3. Update middleware to check specific permissions
4. No code changes needed - just configuration

**Example Future Scenario:**

```javascript
// Current (Phase 5)
moderator.permissions = ['user.manage.all']  // Full user access

// Future (Phase 6+)
moderator.permissions = [
  'user.read.all',      // Can view users
  'user.update.all'     // Can edit users
  // NO user.delete.all - Cannot delete users
]
```

---

## Phase 5 Permission Summary

### Primary Permissions (manage.all)

For Phase 5 implementation, we use **30 primary permissions** that grant full access to each resource:

| # | Permission | Grants Access To | Endpoints | Notes |
|---|------------|------------------|-----------|-------|
| 1 | `user.manage.all` | All user operations | 6 | |
| 2 | `admin.manage.all` | All admin operations | 6 | |
| 3 | `course.manage.all` | All course operations + chapters, modules + contest, announcement, live, feedback, sms, routine, submission, discussion, level | 19 + 6 (V2) + children + course-scoped APIs above | Hierarchical; Phase 5 uses this for contest, announcement, live, feedback, sms, routine, submission, discussion, level |
| 4 | `teacher.manage.all` | All teacher operations | 6 + 20 (V2) | |
| 5 | `coupon.manage.all` | All coupon operations + analytics | 21 | |
| 6 | `bundle.manage.all` | All bundle operations + analytics | 18 | |
| 7 | `contest.manage.all` | All contest operations | 14 | Phase 5: use `course.manage.all` |
| 8 | `ambassador.manage.all` | All ambassador operations | 32 | Includes promote-to-ambassador |
| 9 | `announcement.manage.all` | All announcement operations | 7 | Phase 5: use `course.manage.all` |
| 10 | `payment.manage.all` | Payment audit + reconciliation | 5 | |
| 11 | `live.manage.all` | All live session operations | 10 | Phase 5: use `course.manage.all` |
| 12 | `feedback.manage.all` | All feedback operations | 4 + 8 (module) | Phase 5: use `course.manage.all`; includes module feedback |
| 13 | `sms.manage.all` | SMS sending + history + analytics | 6 | Phase 5: use `course.manage.all` |
| 14 | `revenue.manage.all` | Revenue analytics | 4 | |
| 15 | `analytics.manage.all` | System analytics dashboard | 8 | |
| 16 | `routine.manage.all` | Course routine/schedule management | 7 | Phase 5: use `course.manage.all` |
| 17 | `submission.manage.all` | Submission evaluation | 2 | Phase 5: use `course.manage.all` |
| 18 | `discussion.manage.all` | Discussion forum management | 4 + 3 (sub) | Phase 5: use `course.manage.all`; includes sub-discussions |
| 19 | `level.manage.all` | Gamification/level management | 5 | Phase 5: use `course.manage.all` |
| 20 | `system.manage.all` | System-wide configuration | 2 | |
| 21 | `role.manage.all` | Role management | 9 | Already implemented |
| 22 | `chapter.manage.all` | Chapter operations | 5 | Inherits from course |
| 23 | `module.manage.all` | Module operations | 5 + 9 (V2) | Inherits from course |
| 24 | `message.manage.all` | After-purchase message management | 4 | NEW |
| 25 | `streak.manage.all` | Learning streak management | 6 | NEW |

**Total:** 25 primary permissions covering 252 endpoints

**Note:** Some permissions cover multiple endpoint groups:
- `course.manage.all` covers Course + Course V2 APIs and (in Phase 5) Contest, Announcement, Live Session, Feedback, SMS, Routine, Submission, Discussion, and Level management APIs (all course-scoped)
- `teacher.manage.all` covers Teacher + Teacher V2 APIs
- `module.manage.all` covers Module + Module V2 APIs
- `feedback.manage.all` covers Feedback + Module Feedback APIs (granular/future; Phase 5 uses `course.manage.all`)
- `discussion.manage.all` covers Discussion + Sub-Discussion APIs (granular/future; Phase 5 uses `course.manage.all`)

### Role Examples with Simplified Permissions

```javascript
// Super Admin - Full system access
{
  name: 'admin',
  permissions: [
    'user.manage.all',
    'admin.manage.all',
    'course.manage.all',
    'teacher.manage.all',
    'coupon.manage.all',
    'bundle.manage.all',
    'contest.manage.all',
    'ambassador.manage.all',
    'announcement.manage.all',
    'payment.manage.all',
    'live.manage.all',
    'feedback.manage.all',
    'role.manage.all'
  ]
}

// Content Manager - Course content only
{
  name: 'content_manager',
  permissions: [
    'course.manage.all',      // Includes chapters, modules, quizzes (hierarchical)
    'teacher.manage.all',
    'announcement.manage.all',
    'live.manage.all'
  ]
}

// Finance Manager - Financial operations only
{
  name: 'finance_manager',
  permissions: [
    'payment.manage.all',
    'coupon.manage.all',
    'bundle.manage.all',
    'ambassador.manage.all'   // For commission management
  ]
}

// Support Manager - User support operations
{
  name: 'support_manager',
  permissions: [
    'user.manage.all',
    'feedback.manage.all'
  ]
}

// Moderator - Read-only access (Future: use granular permissions)
{
  name: 'moderator',
  permissions: [
    'course.manage.all',  // Phase 5: Full access
    'user.manage.all'     // Phase 5: Full access
    // Phase 6+: Replace with .read.all for read-only
  ]
}
```

---

## API Inventory by Resource

### 1. USER MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/user.js`  
**Controller:** `controllers/managerial/user.js`  
**Auth:** `requirePermission(PERMISSIONS.USER.MANAGE.ALL)` (Phase 5)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/users` | List all users | `user.manage.all` | `user.read.all` | HIGH |
| POST | `/admin/users` | Create new user | `user.manage.all` | `user.create.all` | HIGH |
| GET | `/admin/users/:id` | Get user by ID | `user.manage.all` | `user.read.all` | HIGH |
| PUT | `/admin/users/:id` | Update user | `user.manage.all` | `user.update.all` | HIGH |
| DELETE | `/admin/users/:id` | Delete user | `user.manage.all` | `user.delete.all` | HIGH |
| POST | `/admin/users/:id/reset-password` | Reset user password | `user.manage.all` | `user.password.reset` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5 Permissions:** 1 (`user.manage.all`)  
**Granular Permissions (Future):** 5

**Implementation Note:** All 6 endpoints use `requirePermission(PERMISSIONS.USER.MANAGE.ALL)`. Controller type checks removed; authorization is middleware-only. Granular permissions are documented for future fine-grained control.

**Note:** The `promote-to-ambassador` endpoint remains on this route file with `authenticateAdmin`; it will use `ambassador.manage.all` when Ambassador Management (Part 2) is implemented.

---

### 2. ADMIN MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/admin.js`  
**Controller:** `controllers/managerial/admin.js`  
**Auth:** `requirePermission(PERMISSIONS.ADMIN.MANAGE.ALL)` (Phase 5)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/admins` | List all admins | `admin.manage.all` | `admin.read.all` | HIGH |
| POST | `/admin/admins` | Create new admin | `admin.manage.all` | `admin.create.all` | HIGH |
| GET | `/admin/admins/:id` | Get admin by ID | `admin.manage.all` | `admin.read.all` | HIGH |
| PUT | `/admin/admins/:id` | Update admin | `admin.manage.all` | `admin.update.all` | HIGH |
| DELETE | `/admin/admins/:id` | Delete admin | `admin.manage.all` | `admin.delete.all` | HIGH |
| POST | `/admin/admins/:id/set-password` | Set admin password | `admin.manage.all` | `admin.password.set` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5 Permissions:** 1 (`admin.manage.all`)  
**Granular Permissions (Future):** 5

**Implementation Note:** All 6 endpoints use `requirePermission(PERMISSIONS.ADMIN.MANAGE.ALL)`. Controller type checks removed. Tests: `node testing/test-admin-management-api.js` (strict: auth, list/get/create/update/set-password/delete, response shape, 404, 400 for invalid input).

---

### 3. COURSE MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/course.js`  
**Controller:** `controllers/managerial/course.js`  
**Auth:** `requirePermission(PERMISSIONS.COURSE.MANAGE.ALL)` (Phase 5 — one permission for all 19 endpoints)

| Method | Endpoint | Description | Required Permission | Priority |
|--------|----------|-------------|---------------------|----------|
| GET | `/admin/course/list` | List all courses | `course.read.all` | HIGH |
| GET | `/admin/course/get/:id` | Get course by ID | `course.read.all` | HIGH |
| GET | `/admin/course/getfull/:id` | Get full course details | `course.read.all` | MEDIUM |
| POST | `/admin/course/create` | Create new course | `course.create.all` | HIGH |
| PUT | `/admin/course/update/:id` | Update course | `course.update.all` | HIGH |
| PUT | `/admin/course/updateFull/:id` | Update full course | `course.update.all` | MEDIUM |
| DELETE | `/admin/course/delete/:id` | Delete course | `course.delete.all` | HIGH |
| GET | `/admin/course/getRevenue/:id` | Get course revenue | `revenue.read.all` OR `revenue.manage.all` OR `course.manage.all` | MEDIUM |
| GET | `/admin/course/getAllRevenue` | Get all course revenue | `revenue.read.all` OR `revenue.manage.all` OR `course.manage.all` | MEDIUM |
| POST | `/admin/course/generateCertificate` | Generate certificate | `certificate.create.all` | LOW |
| POST | `/admin/course/issueCertificate/:id` | Issue certificate | `certificate.issue.all` | LOW |
| GET | `/admin/course/getAllPendingCertificates` | List pending certificates | `certificate.read.all` | LOW |
| GET | `/admin/course/getAllCoursePerchases` | List course purchases | `enrollment.read.all` | MEDIUM |
| GET | `/admin/course/getAllCoursePerchasesApi` | Course purchases API | `enrollment.read.all` | MEDIUM |
| GET | `/admin/course/getAllPrebookings` | List prebookings | `prebooking.read.all` | LOW |
| GET | `/admin/course/getAllPrebookingsApi` | Prebookings API | `prebooking.read.all` | LOW |
| PUT | `/admin/course/prebooking/:prebookingId/utm` | Update prebooking UTM | `prebooking.update.all` | LOW |
| DELETE | `/admin/course/prebooking/:prebookingId/utm` | Delete prebooking UTM | `prebooking.delete.all` | LOW |
| GET | `/admin/course/getUserProgress/:id/:user_id` | Get user progress | `progress.read.all` | MEDIUM |

**Total Endpoints:** 19  
**Phase 5:** Most use `course.manage.all`. **Revenue endpoints** (`getRevenue/:id`, `getAllRevenue`) use `requireAnyPermission([course.manage.all, revenue.read.all, revenue.manage.all])` so course managers OR revenue-only roles (revenue.read.all / revenue.manage.all) can access. Phase 2 (course_access) will add course-specific `revenue.view` filtering.  
**Tests:** `node testing/test-course-chapter-module-api.js`

---

### 4. CHAPTER MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/chapter.js`  
**Controller:** `controllers/managerial/chapter.js`  
**Auth:** `requirePermission(PERMISSIONS.COURSE.MANAGE.ALL)` (Phase 5 — hierarchical; course.manage.all covers all chapter ops)

| Method | Endpoint | Description | Required Permission | Priority |
|--------|----------|-------------|---------------------|----------|
| GET | `/admin/chapter/list/:id` | List chapters by course | `course.read.all` OR `chapter.read.all` | HIGH |
| GET | `/admin/chapter/get/:id` | Get chapter by ID | `course.read.all` OR `chapter.read.all` | HIGH |
| POST | `/admin/chapter/create/:id` | Create chapter | `course.manage.all` OR `chapter.create.all` | HIGH |
| PUT | `/admin/chapter/update/:id` | Update chapter | `course.manage.all` OR `chapter.update.all` | HIGH |
| DELETE | `/admin/chapter/delete/:id` | Delete chapter | `course.manage.all` OR `chapter.delete.all` | HIGH |

**Total Endpoints:** 5  
**Note:** All chapter operations use `course.manage.all` (hierarchical inheritance).  
**Tests:** `node testing/test-course-chapter-module-api.js`

---

### 5. MODULE MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/module.js`  
**Controller:** `controllers/managerial/module.js`  
**Auth:** `requirePermission(PERMISSIONS.COURSE.MANAGE.ALL)` (Phase 5 — hierarchical; course.manage.all covers all module ops)

| Method | Endpoint | Description | Required Permission | Priority |
|--------|----------|-------------|---------------------|----------|
| GET | `/admin/module/list/:id` | List modules by chapter | `course.read.all` OR `module.read.all` | HIGH |
| GET | `/admin/module/get/:id` | Get module by ID | `course.read.all` OR `module.read.all` | HIGH |
| POST | `/admin/module/create/:id` | Create module | `course.manage.all` OR `module.create.all` | HIGH |
| PUT | `/admin/module/update/:id` | Update module | `course.manage.all` OR `module.update.all` | HIGH |
| DELETE | `/admin/module/delete/:id` | Delete module | `course.manage.all` OR `module.delete.all` | HIGH |

**Total Endpoints:** 5  
**Note:** All module operations use `course.manage.all` (hierarchical inheritance).  
**Tests:** `node testing/test-course-chapter-module-api.js`

---

### 6. TEACHER MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/teacher.js`  
**Controller:** `controllers/managerial/teacher.js`  
**Auth:** `requirePermission(PERMISSIONS.TEACHER.MANAGE.ALL)` (Phase 5 — one permission for all 6 endpoints)

| Method | Endpoint | Description | Phase 5 Permission | Granular (Future) | Priority |
|--------|----------|-------------|--------------------|------------------|----------|
| GET | `/admin/teacher/list` | List all teachers | `teacher.manage.all` | `teacher.read.all` | HIGH |
| POST | `/admin/teacher/create` | Create new teacher | `teacher.manage.all` | `teacher.create.all` | HIGH |
| PUT | `/admin/teacher/update/:id` | Update teacher | `teacher.manage.all` | `teacher.update.all` | HIGH |
| DELETE | `/admin/teacher/delete/:id` | Delete teacher | `teacher.manage.all` | `teacher.delete.all` | HIGH |
| PUT | `/admin/teacher/reset-password/:id` | Reset teacher password | `teacher.manage.all` | `teacher.password.reset` | MEDIUM |
| GET | `/admin/teacher/profile/:id` | Get teacher profile | `teacher.manage.all` | `teacher.read.all` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5:** All use `teacher.manage.all`. Profile endpoint now requires auth (was optAuthenticateUser).

---

### 7. COUPON MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/coupon.js`  
**Controller:** `controllers/managerial/coupon.js`  
**Current Auth:** `authenticateAdmin`

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/coupon` | List all coupons | `coupon.manage.all` | `coupon.read.all` | HIGH |
| POST | `/admin/coupon` | Create new coupon | `coupon.manage.all` | `coupon.create.all` | HIGH |
| GET | `/admin/coupon/:id` | Get coupon by ID | `coupon.manage.all` | `coupon.read.all` | HIGH |
| PUT | `/admin/coupon/:id` | Update coupon | `coupon.manage.all` | `coupon.update.all` | HIGH |
| DELETE | `/admin/coupon/:id` | Delete coupon | `coupon.manage.all` | `coupon.delete.all` | HIGH |
| GET | `/admin/coupon/available-courses` | Get available courses | `coupon.manage.all` | `coupon.read.all` | MEDIUM |
| GET | `/admin/coupon/available-bundles` | Get available bundles | `coupon.manage.all` | `coupon.read.all` | MEDIUM |
| GET | `/admin/coupon/coupon-clicks` | Get all coupon clicks | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |
| GET | `/admin/coupon/:id/courses` | Get coupon courses | `coupon.manage.all` | `coupon.read.all` | MEDIUM |
| POST | `/admin/coupon/:id/courses` | Add courses to coupon | `coupon.manage.all` | `coupon.update.all` | MEDIUM |
| DELETE | `/admin/coupon/:id/courses` | Remove courses from coupon | `coupon.manage.all` | `coupon.update.all` | MEDIUM |
| GET | `/admin/coupon/:id/bundles` | Get coupon bundles | `coupon.manage.all` | `coupon.read.all` | MEDIUM |
| POST | `/admin/coupon/:id/bundles` | Add bundles to coupon | `coupon.manage.all` | `coupon.update.all` | MEDIUM |
| DELETE | `/admin/coupon/:id/bundles` | Remove bundles from coupon | `coupon.manage.all` | `coupon.update.all` | MEDIUM |
| GET | `/admin/coupon/:id/clicks` | Get coupon clicks | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | LOW |
| GET | `/admin/coupon/:id/click-stats` | Get coupon click stats | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | LOW |
| GET | `/admin/coupon/analytics/statistics` | Coupon statistics | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |
| GET | `/admin/coupon/analytics/revenue-impact` | Revenue impact analytics | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |
| GET | `/admin/coupon/analytics/top-performing` | Top performing coupons | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |
| GET | `/admin/coupon/analytics/usage-report` | Usage report | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |
| GET | `/admin/coupon/analytics/dashboard` | Analytics dashboard | `coupon.manage.all` OR `analytics.*` OR `revenue.*` | `coupon.analytics.all` | MEDIUM |

**Total Endpoints:** 21  
**Phase 5 Permissions:** 1 primary (`coupon.manage.all`); analytics/revenue endpoints also allow `revenue.read.all`, `revenue.manage.all`, `analytics.read.all`, `analytics.manage.all`

**Implementation Note:** Most endpoints require `coupon.manage.all`. Analytics and revenue-impact endpoints use `requireAnyPermission([coupon.manage.all, revenue.read.all, revenue.manage.all, analytics.read.all, analytics.manage.all])` so coupon managers or revenue/analytics roles can access.

---

### 8. BUNDLE MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/bundle.js`  
**Controller:** `controllers/managerial/bundle.js`  
**Current Auth:** `requirePermission(bundle.manage.all)` / `requireAnyPermission([bundle.manage.all, analytics.read.all, analytics.manage.all])` for stats/purchases

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/bundle` | List all bundles | `bundle.manage.all` | `bundle.read.all` | HIGH |
| POST | `/admin/bundle` | Create new bundle | `bundle.manage.all` | `bundle.create.all` | HIGH |
| GET | `/admin/bundle/:id` | Get bundle by ID | `bundle.manage.all` | `bundle.read.all` | HIGH |
| GET | `/admin/bundle/slug/:slug` | Get bundle by slug | `bundle.manage.all` | `bundle.read.all` | HIGH |
| PUT | `/admin/bundle/:id` | Update bundle | `bundle.manage.all` | `bundle.update.all` | HIGH |
| DELETE | `/admin/bundle/:id` | Delete bundle | `bundle.manage.all` | `bundle.delete.all` | HIGH |
| POST | `/admin/bundle/enhanced` | Create enhanced bundle | `bundle.manage.all` | `bundle.create.all` | MEDIUM |
| PUT | `/admin/bundle/enhanced/:id` | Update enhanced bundle | `bundle.manage.all` | `bundle.update.all` | MEDIUM |
| POST | `/admin/bundle/:id/courses` | Add courses to bundle | `bundle.manage.all` | `bundle.update.all` | MEDIUM |
| GET | `/admin/bundle/:id/stats` | Get bundle stats | `bundle.manage.all` OR `analytics.*` | `bundle.analytics.all` | MEDIUM |
| GET | `/admin/bundle/:id/purchases` | Get bundle purchases | `bundle.manage.all` OR `analytics.*` | `bundle.analytics.all` | MEDIUM |
| GET | `/admin/bundle/purchases/api` | Bundle purchases API | `bundle.manage.all` OR `analytics.*` | `bundle.analytics.all` | MEDIUM |
| GET | `/admin/bundle/purchases` | All bundle purchases | `bundle.manage.all` OR `analytics.*` | `bundle.analytics.all` | MEDIUM |
| GET | `/admin/bundle/:id/purchases/export` | Export bundle purchases | `bundle.manage.all` | `bundle.export.all` | LOW |
| GET | `/admin/bundle/purchases/export` | Export all purchases | `bundle.manage.all` | `bundle.export.all` | LOW |
| GET | `/admin/bundle/prebookings` | List prebookings | `bundle.manage.all` | `bundle.prebooking.all` | LOW |
| GET | `/admin/bundle/prebookings/api` | Prebookings API | `bundle.manage.all` | `bundle.prebooking.all` | LOW |
| PUT | `/admin/bundle/prebooking/:prebookingId/utm` | Update prebooking UTM | `bundle.manage.all` | `bundle.prebooking.all` | LOW |
| DELETE | `/admin/bundle/prebooking/:prebookingId/utm` | Delete prebooking UTM | `bundle.manage.all` | `bundle.prebooking.all` | LOW |

**Total Endpoints:** 18  
**Phase 5 Permissions:** 1 primary (`bundle.manage.all`); stats/purchases endpoints also allow `analytics.read.all`, `analytics.manage.all`

**Implementation Note:** CRUD, enhanced, courses, export, and prebooking endpoints use `requirePermission(PERMISSIONS.BUNDLE.MANAGE.ALL)`. Stats and purchases (`/:id/stats`, `/:id/purchases`, `/purchases/api`, `/purchases`) use `requireAnyPermission([bundle.manage.all, analytics.read.all, analytics.manage.all])` so analytics roles can access without full bundle management.

---

### 9. CONTEST MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/contest.js`  
**Controller:** `controllers/managerial/contest.js`  
**Current Auth:** `requirePermission(course.manage.all)`

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/contest/list/:id` | List contests by course | `course.manage.all` | `course.read.all` OR `contest.read.all` | MEDIUM |
| GET | `/admin/contest/get/:id` | Get contest by ID | `course.manage.all` | `course.read.all` OR `contest.read.all` | MEDIUM |
| POST | `/admin/contest/create/:id` | Create contest | `course.manage.all` | `contest.create.all` | MEDIUM |
| PUT | `/admin/contest/update/:id` | Update contest | `course.manage.all` | `contest.update.all` | MEDIUM |
| DELETE | `/admin/contest/delete/:id` | Delete contest | `course.manage.all` | `contest.delete.all` | MEDIUM |
| GET | `/admin/contest/all` | Get all contests | `course.manage.all` | `contest.read.all` | MEDIUM |
| GET | `/admin/contest/courses` | Get courses dropdown | `course.manage.all` | `contest.read.all` | LOW |
| GET | `/admin/contest/users` | Get users | `course.manage.all` | `contest.manage.all` | LOW |
| POST | `/admin/contest/init-participants-table` | Init participants table | `course.manage.all` | `contest.manage.all` | LOW |
| GET | `/admin/contest/participants/:id` | Get participants | `course.manage.all` | `contest.manage.all` | MEDIUM |
| POST | `/admin/contest/participant/add/:id` | Add participant | `course.manage.all` | `contest.manage.all` | MEDIUM |
| POST | `/admin/contest/participant/remove/:id` | Remove participant | `course.manage.all` | `contest.manage.all` | MEDIUM |
| PUT | `/admin/contest/participant/score/:id` | Update participant score | `course.manage.all` | `contest.manage.all` | MEDIUM |
| GET | `/admin/contest/leaderboard/:id` | Get leaderboard | `course.manage.all` | `contest.read.all` | MEDIUM |

**Total Endpoints:** 14  
**Phase 5 Permissions:** 1 (`course.manage.all`)

**Implementation Note:** Contest management is course-scoped. Phase 5 uses `course.manage.all` so all contest operations (list, create, update, delete, participants, leaderboard) are available to course managers.

---

### 10. AMBASSADOR MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/ambassador.js` + `routes/managerial/user.js` (promote endpoint)  
**Controller:** `controllers/managerial/ambassador.js` + `controllers/managerial/user.js`  
**Current Auth:** `requirePermission(ambassador.manage.all)`

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/ambassador` | List ambassadors | `ambassador.manage.all` | `ambassador.read.all` | HIGH |
| POST | `/admin/ambassador` | Create ambassador | `ambassador.manage.all` | `ambassador.create.all` | HIGH |
| GET | `/admin/ambassador/:id` | Get ambassador | `ambassador.manage.all` | `ambassador.read.all` | HIGH |
| PUT | `/admin/ambassador/:id` | Update ambassador | `ambassador.manage.all` | `ambassador.update.all` | HIGH |
| POST | `/admin/ambassador/:id/approve` | Approve ambassador | `ambassador.manage.all` | `ambassador.approve.all` | HIGH |
| POST | `/admin/ambassador/:id/reject` | Reject ambassador | `ambassador.manage.all` | `ambassador.reject.all` | HIGH |
| POST | `/admin/ambassador/:id/pause` | Pause ambassador | `ambassador.manage.all` | `ambassador.status.manage` | MEDIUM |
| POST | `/admin/ambassador/:id/activate` | Activate ambassador | `ambassador.manage.all` | `ambassador.status.manage` | MEDIUM |
| GET | `/admin/ambassador/tiers` | Get tiers | `ambassador.manage.all` | `ambassador.tier.read` | MEDIUM |
| POST | `/admin/ambassador/tiers` | Upsert tier | `ambassador.manage.all` | `ambassador.tier.manage` | MEDIUM |
| GET | `/admin/ambassador/:id/tier` | Get ambassador tier | `ambassador.manage.all` | `ambassador.tier.read` | MEDIUM |
| POST | `/admin/ambassador/:id/tier-override` | Override tier | `ambassador.manage.all` | `ambassador.tier.manage` | MEDIUM |
| GET | `/admin/ambassador/milestones` | Get milestones | `ambassador.manage.all` | `ambassador.milestone.read` | MEDIUM |
| POST | `/admin/ambassador/milestones` | Create milestone | `ambassador.manage.all` | `ambassador.milestone.manage` | MEDIUM |
| PUT | `/admin/ambassador/milestones/:id` | Update milestone | `ambassador.manage.all` | `ambassador.milestone.manage` | MEDIUM |
| DELETE | `/admin/ambassador/milestones/:id` | Delete milestone | `ambassador.manage.all` | `ambassador.milestone.manage` | MEDIUM |
| GET | `/admin/ambassador/leaderboard` | Get leaderboard | `ambassador.manage.all` | `ambassador.read.all` | LOW |
| GET | `/admin/ambassador/:id/coupons` | Get ambassador coupons | `ambassador.manage.all` | `ambassador.coupon.read` | MEDIUM |
| GET | `/admin/ambassador/:id/coupons/:coupon_id/usage` | Coupon usage | `ambassador.manage.all` | `ambassador.coupon.read` | MEDIUM |
| POST | `/admin/ambassador/:id/assign-coupon` | Assign coupon | `ambassador.manage.all` | `ambassador.coupon.manage` | MEDIUM |
| DELETE | `/admin/ambassador/:id/unassign-coupon/:coupon_id` | Unassign coupon | `ambassador.manage.all` | `ambassador.coupon.manage` | MEDIUM |
| GET | `/admin/ambassador/:id/commissions` | Get commissions | `ambassador.manage.all` | `ambassador.commission.read` | MEDIUM |
| POST | `/admin/ambassador/commission/:commission_id/mark-paid` | Mark commission paid | `ambassador.manage.all` | `ambassador.commission.manage` | HIGH |
| GET | `/admin/ambassador/payments` | Get payments | `ambassador.manage.all` | `ambassador.payment.read` | MEDIUM |
| POST | `/admin/ambassador/payments` | Create payment | `ambassador.manage.all` | `ambassador.payment.manage` | MEDIUM |
| PUT | `/admin/ambassador/payments/:id` | Update payment | `ambassador.manage.all` | `ambassador.payment.manage` | MEDIUM |
| GET | `/admin/ambassador/:id/analytics` | Get analytics | `ambassador.manage.all` | `ambassador.analytics.all` | MEDIUM |
| GET | `/admin/ambassador/:id/clicks` | Get clicks | `ambassador.manage.all` | `ambassador.analytics.all` | LOW |
| GET | `/admin/ambassador/:id/click-stats` | Get click stats | `ambassador.manage.all` | `ambassador.analytics.all` | LOW |
| GET | `/admin/ambassador/stats/overview` | Overview stats | `ambassador.manage.all` | `ambassador.analytics.all` | MEDIUM |
| GET | `/admin/ambassador/export` | Export data | `ambassador.manage.all` | `ambassador.export.all` | LOW |
| POST | `/admin/users/:id/promote-to-ambassador` | Promote user to ambassador | `ambassador.manage.all` | `ambassador.create.all` | MEDIUM |

**Total Endpoints:** 32 (31 from ambassador routes + 1 from user routes)  
**Phase 5 Permissions:** 1 (`ambassador.manage.all`)  
**Granular Permissions (Future):** 16

**Implementation Note:** All ambassador-related endpoints (including user promotion) will check for `ambassador.manage.all`. This endpoint is logically part of ambassador management even though it's in the user routes file.

---

### 11. ANNOUNCEMENT MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/announcement.js`  
**Controller:** `controllers/managerial/announcement.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/announcement/list` | List all announcements | `course.manage.all` | `announcement.read.all` | MEDIUM |
| GET | `/admin/announcement/list/:courseId` | List course announcements | `course.manage.all` | `announcement.read.all` | MEDIUM |
| GET | `/admin/announcement/get/:id` | Get announcement | `course.manage.all` | `announcement.read.all` | MEDIUM |
| POST | `/admin/announcement/create/:courseId` | Create announcement | `course.manage.all` | `announcement.create.all` | MEDIUM |
| PUT | `/admin/announcement/update/:id` | Update announcement | `course.manage.all` | `announcement.update.all` | MEDIUM |
| DELETE | `/admin/announcement/delete/:id` | Delete announcement | `course.manage.all` | `announcement.delete.all` | MEDIUM |
| POST | `/admin/announcement/send/:id` | Send announcement | `course.manage.all` | `announcement.send.all` | MEDIUM |

**Total Endpoints:** 7  
**Phase 5 Permissions:** 1 (`course.manage.all`)

**Implementation Note:** Announcements are course-scoped. Phase 5 uses `course.manage.all` so course managers can list, create, update, delete, and send announcements for their courses.

**Test:** `node testing/test-announcement-api.js` (requires server running on API_BASE_URL / localhost:4000).

---

### 12. PAYMENT MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/payment.js`  
**Controller:** `controllers/user/payment.js`  
**Current Auth:** `requirePaymentManage` (Phase 5: `payment.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|------------------------|-------------------|----------|
| GET | `/admin/payment/audit-logs` | Get payment audit logs | `payment.manage.all` | `payment.audit.read` | HIGH |
| POST | `/admin/payment/audit-logs` | Get payment audit logs (POST) | `payment.manage.all` | `payment.audit.read` | HIGH |
| GET | `/admin/payment/audit-logs/export` | Export audit logs | `payment.manage.all` | `payment.audit.export` | MEDIUM |
| POST | `/admin/payment/reconcile` | Reconcile payment | `payment.manage.all` | `payment.reconcile.all` | HIGH |
| POST | `/admin/payment/reconcile/:sslcommerz_tran_id` | Reconcile specific payment | `payment.manage.all` | `payment.reconcile.all` | HIGH |

**Total Endpoints:** 5  
**Phase 5 Permissions:** 1 (`payment.manage.all`)

**Implementation Note:** Phase 5 uses a single permission `payment.manage.all` for all payment admin operations (audit logs, export, reconcile). Granular permissions (audit.read, audit.export, reconcile.all) can be used in a future phase.

**Test:** `node testing/test-payment-api.js` (requires server running on API_BASE_URL / localhost:4000).

---

### 13. LIVE SESSION MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/live.js`  
**Controller:** `controllers/managerial/live.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/live/list` | List live sessions | `course.manage.all` | `live.read.all` | MEDIUM |
| GET | `/admin/live/get/:id` | Get live session | `course.manage.all` | `live.read.all` | MEDIUM |
| POST | `/admin/live/create/:id` | Create live session | `course.manage.all` | `live.create.all` | MEDIUM |
| PUT | `/admin/live/update/:id` | Update live session | `course.manage.all` | `live.update.all` | MEDIUM |
| DELETE | `/admin/live/delete/:id` | Delete live session | `course.manage.all` | `live.delete.all` | MEDIUM |
| GET | `/admin/live/interestCount/:id` | Get interest count | `course.manage.all` | `live.read.all` | LOW |
| POST | `/admin/live/bulk-import` | Bulk import sessions | `course.manage.all` | `live.import.all` | LOW |
| GET | `/admin/live/export` | Export sessions CSV | `course.manage.all` | `live.export.all` | LOW |
| GET | `/admin/live/template` | Get import template | `course.manage.all` | `live.read.all` | LOW |
| DELETE | `/admin/live/bulk-delete` | Bulk delete sessions | `course.manage.all` | `live.delete.all` | LOW |

**Total Endpoints:** 10  
**Phase 5 Permissions:** 1 (`course.manage.all`)

**Implementation Note:** Live session management is course-scoped. Phase 5 uses `course.manage.all` so course managers can list, create, update, delete, bulk-import, and export live sessions for their courses.

**Test:** `node testing/test-live-api.js` (requires server running on API_BASE_URL / localhost:4000).

---

### 14. FEEDBACK MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/feedback.js`  
**Controller:** `controllers/managerial/feedback.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/feedback` | Get all feedbacks | `course.manage.all` | `feedback.read.all` | MEDIUM |
| GET | `/admin/feedback/stats` | Get feedback statistics | `course.manage.all` | `feedback.analytics.all` | MEDIUM |
| DELETE | `/admin/feedback/:feedbackId` | Delete feedback | `course.manage.all` | `feedback.delete.all` | MEDIUM |
| GET | `/admin/feedback/export` | Export feedbacks | `course.manage.all` | `feedback.export.all` | LOW |

**Total Endpoints:** 4  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 4

**Implementation Note:** Feedback is course/module-scoped. Phase 5 uses `course.manage.all` so course managers can view, delete, and export feedback for their courses.

**Test:** `node testing/test-feedback-api.js` (requires server running on API_BASE_URL / localhost:4000).

---

### 15. SMS MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/sms.js`  
**Controller:** `controllers/managerial/smsController.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| POST | `/admin/sms/send` | Send SMS reminders to students | `course.manage.all` | `sms.send.all` | HIGH |
| GET | `/admin/sms/history` | Get SMS sending history | `course.manage.all` | `sms.read.all` | MEDIUM |
| GET | `/admin/sms/statistics` | Get SMS statistics | `course.manage.all` | `sms.analytics.all` | MEDIUM |
| GET | `/admin/sms/status/:smsId` | Get SMS campaign status | `course.manage.all` | `sms.read.all` | MEDIUM |
| GET | `/admin/sms/history/:id/recipients` | Get SMS campaign recipients | `course.manage.all` | `sms.read.all` | MEDIUM |
| POST | `/admin/sms/retry/:smsId` | Retry failed SMS campaign | `course.manage.all` | `sms.send.all` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 3

**Implementation Note:** SMS is used for course-related reminders (e.g. live classes). Phase 5 uses `course.manage.all` so course managers can send and manage SMS for their courses.

**Test:** `node testing/test-sms-api.js` (requires server running on API_BASE_URL / localhost:4000).

---

### 16. REVENUE ANALYTICS APIs ✅ Phase 5 Complete (⚠️ HYBRID later)
**Route File:** `routes/managerial/revenue.js`  
**Controller:** `controllers/managerial/revenueController.js`  
**Current Auth:** `requireRevenueManage` (Phase 5: `revenue.manage.all`)  
**Access Model:** Phase 5 = global only; HYBRID (course_access / revenue.view.own) when `course_access` table exists

| Method | Endpoint | Description | **Global Permission** | **Course-Specific** | Priority |
|--------|----------|-------------|----------------------|---------------------|----------|
| GET | `/admin/revenue/detailed` | Get overall revenue statistics | `revenue.manage.all` | Filtered by `course_access` (later) | HIGH |
| GET | `/admin/revenue/detailed/:id` | Get course revenue statistics | `revenue.manage.all` | `revenue.view` (in `course_access`) (later) | HIGH |
| GET | `/admin/revenue/timeframe` | Get revenue by timeframe | `revenue.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/revenue/top` | Get top revenue-generating courses | `revenue.manage.all` | Filtered by `course_access` (later) | MEDIUM |

**Total Endpoints:** 4  
**Phase 5:** Route gate = `revenue.manage.all` only. `revenue.view.own` / course_access to be tested when table is present.

**Test:** `node testing/test-revenue-api.js` (requires server running). Tests 401/403 and access with `revenue.manage.all`; course_access tests deferred.

**⚠️ HYBRID ACCESS (Phase 2 – when course_access exists):**

**Pattern 1: Global Access (Phase 5 – implemented)**
- Permission: `revenue.manage.all` (global role permission)
- Grants: Access to ALL courses' revenue data

**Pattern 2: Course-Specific Access (when course_access table present)**
- Permission: `revenue.view` (in `course_access` table)
- Grants: Access ONLY to specific courses user is assigned to
- `revenue.view.own` tests to be added when course_access is available

**Implementation Requirements:**
- ✅ Phase 5: All revenue endpoints require `revenue.manage.all` at route level
- 🔲 When course_access exists: controller/service to filter by course_access for users without revenue.manage.all
- 🔲 Aggregate endpoints to filter data based on course_access for course-only users

---

### 17. ANALYTICS APIs ✅ Phase 5 Complete (⚠️ HYBRID later)
**Route File:** `routes/managerial/analytics.js`  
**Controller:** `controllers/managerial/analyticsController.js`  
**Current Auth:** `requireAnalyticsManage` (Phase 5: `analytics.manage.all`)  
**Access Model:** Phase 5 = global only; HYBRID (course_access / analytics.view) when `course_access` table exists

| Method | Endpoint | Description | **Global Permission** | **Course-Specific** | Priority |
|--------|----------|-------------|----------------------|---------------------|----------|
| GET | `/admin/analytics/user-engagement` | Get user engagement metrics | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/analytics/user-growth` | Get user growth metrics | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/analytics/course-engagement` | Get course engagement metrics | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/analytics/module-completion` | Get module completion rates (all) | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/analytics/module-completion/:courseId` | Get module completion (course) | `analytics.manage.all` | `analytics.view.own` (in `course_access`) (later) | MEDIUM |
| GET | `/admin/analytics/discussion-activity` | Get discussion activity (all) | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |
| GET | `/admin/analytics/discussion-activity/:courseId` | Get discussion activity (course) | `analytics.manage.all` | `analytics.view.own` (in `course_access`) (later) | MEDIUM |
| GET | `/admin/analytics/certificate-stats` | Get certificate statistics | `analytics.manage.all` | Filtered by `course_access` (later) | MEDIUM |

**Total Endpoints:** 8  
**Phase 5:** Route gate = `analytics.manage.all` only. `analytics.view.own` / course_access to be tested when table is present.

**Test:** `node testing/test-analytics-api.js` (requires server running). Tests 401/403 and access with `analytics.manage.all`; course_access tests deferred.

**⚠️ HYBRID ACCESS (Phase 2 – when course_access exists):**

**Pattern 1: Global Access (Phase 5 – implemented)**  
- Permission: `analytics.manage.all` (global role permission)  
- Grants: Access to ALL courses' analytics data  

**Pattern 2: Course-Specific Access (when course_access table present)**  
- Permission: `analytics.view.own` (in `course_access` table)  
- Grants: Access ONLY to specific courses user is assigned to  

**Implementation Requirements:**
- ✅ Phase 5: All analytics endpoints require `analytics.manage.all` at route level
- 🔲 When course_access exists: controller/service to filter by course_access for users without analytics.manage.all
- 🔲 Aggregate endpoints to filter data based on course_access for course-only users

---

### 18. ROUTINE MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/routine.js`  
**Controller:** `controllers/managerial/routine.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/routine/list` | List all routines | `course.manage.all` | `routine.read.all` | MEDIUM |
| GET | `/admin/routine/course/:courseId` | List routines by course | `course.manage.all` | `routine.read.all` | MEDIUM |
| GET | `/admin/routine/get/:id` | Get single routine | `course.manage.all` | `routine.read.all` | MEDIUM |
| POST | `/admin/routine/create/:courseId` | Create routine for course | `course.manage.all` | `routine.create.all` | MEDIUM |
| PUT | `/admin/routine/update/:id` | Update routine | `course.manage.all` | `routine.update.all` | MEDIUM |
| DELETE | `/admin/routine/delete/:id` | Delete routine | `course.manage.all` | `routine.delete.all` | MEDIUM |
| PATCH | `/admin/routine/toggle-active/:id` | Toggle routine active status | `course.manage.all` | `routine.update.all` | MEDIUM |

**Total Endpoints:** 7  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 4

**Implementation Note:** Routine is course-scoped (schedules/timetables per course). Phase 5 uses `course.manage.all` so course managers can manage routines for their courses.

**Test:** `node testing/test-rbac-sections-18-28.js` (covers 18–21, 23–28).

---

### 19. SUBMISSION EVALUATION APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/submission.js` (mounted at `/admin/assignment`)  
**Controller:** `controllers/user/submission.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/submission/pendingEvaluations/:id` | View pending evaluations | `course.manage.all` | `submission.read.all` | HIGH |
| PUT | `/admin/submission/evaluate/:moduleId/:userId` | Evaluate submission | `course.manage.all` | `submission.evaluate.all` | HIGH |

**Total Endpoints:** 2  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 2

**Implementation Note:** Submission is course-scoped (module → course). Phase 5 uses `course.manage.all` so course managers can view and evaluate submissions for their courses. Routes are mounted at `/admin/assignment`.

---

### 20. DISCUSSION MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/discussion.js`  
**Controller:** `controllers/managerial/discussion.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/discussion/list` | List all discussions | `course.manage.all` | `discussion.read.all` | MEDIUM |
| POST | `/admin/discussion/create/:moduleId` | Create discussion for module | `course.manage.all` | `discussion.create.all` | MEDIUM |
| GET | `/admin/discussion/list/:moduleId` | Get module discussions | `course.manage.all` | `discussion.read.all` | MEDIUM |
| DELETE | `/admin/discussion/delete/:discussionId` | Delete discussion | `course.manage.all` | `discussion.delete.all` | MEDIUM |

**Total Endpoints:** 4  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 3

**Implementation Note:** Discussion is course-scoped (module → course). Phase 5 uses `course.manage.all` so course managers can manage discussions for their courses.

---

### 21. LEVEL/GAMIFICATION MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/level.js`  
**Controller:** `controllers/managerial/level.js`  
**Current Auth:** `requireCourseManage` for admin ops; `authenticateInv`/`authenticateUser` for list/get/requestGift/getGiftPage

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| POST | `/admin/level/create/:id` | Create level for course | `course.manage.all` | `level.create.all` | LOW |
| PUT | `/admin/level/update/:id` | Update level | `course.manage.all` | `level.update.all` | LOW |
| DELETE | `/admin/level/delete/:id` | Delete level | `course.manage.all` | `level.delete.all` | LOW |
| GET | `/admin/level/getGiftRequests` | Get gift requests | `course.manage.all` | `level.read.all` | MEDIUM |
| PUT | `/admin/level/approveGiftRequest` | Approve gift request | `course.manage.all` | `level.approve.all` | MEDIUM |

**Total Endpoints:** 5 (admin only)  
**Phase 5 Permissions:** 1 (`course.manage.all`)  
**Granular Permissions (Future):** 4

**Implementation Note:** Level is course-scoped (gamification per course). Phase 5 uses `course.manage.all` for create, update, delete, getGiftRequests, approveGiftRequest; list/get/requestGift/getGiftPage keep invite/user auth.

---

### 22. SYSTEM CONFIGURATION APIs (Ambassador discount) ✅ Phase 5 Complete
**Route File:** `routes/managerial/system.js`  
**Controller:** `controllers/managerial/ambassador.js`  
**Current Auth:** `requireAmbassadorManage` (Phase 5: `ambassador.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/system/ambassador-discount-config` | Get ambassador discount config | `ambassador.manage.all` | `system.config.read` | LOW |
| PUT | `/admin/system/ambassador-discount-config` | Update ambassador discount config | `ambassador.manage.all` | `system.config.update` | LOW |

**Total Endpoints:** 2  
**Phase 5 Permissions:** 1 (`ambassador.manage.all` — under ambassador management)

**Implementation Note:** These endpoints are part of ambassador management (discount config for ambassadors). Phase 5 uses `ambassador.manage.all` so the same role that manages ambassadors can read/update this config. No separate system.manage.all required.

---

### 23. AFTER MESSAGE MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/aftermessage.js`  
**Controller:** `controllers/managerial/aftermessage.js`  
**Current Auth:** `requireMessageManage` (Phase 5: `message.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/aftermessage` | Get all after-purchase messages | `message.manage.all` | `message.read.all` | MEDIUM |
| POST | `/admin/aftermessage` | Create new after-purchase message | `message.manage.all` | `message.create.all` | MEDIUM |
| PUT | `/admin/aftermessage/:id` | Update after-purchase message | `message.manage.all` | `message.update.all` | MEDIUM |
| DELETE | `/admin/aftermessage/:id` | Delete after-purchase message | `message.manage.all` | `message.delete.all` | MEDIUM |

**Total Endpoints:** 4  
**Phase 5 Permissions:** 1 (`message.manage.all`)  
**Granular Permissions (Future):** 4

**Implementation Note:** Manages automated messages sent to users after course/bundle purchases. These messages can include welcome notes, getting started guides, etc.

---

### 24. STREAK MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/streak.js`  
**Controller:** `controllers/managerial/streakController.js`  
**Current Auth:** `requireStreakManage` (Phase 5: `streak.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/streak/analytics` | Get streak analytics for dashboard | `streak.manage.all` | `streak.analytics.read` | MEDIUM |
| GET | `/admin/streak/user/:userId` | Get user streak details | `streak.manage.all` | `streak.read.all` | MEDIUM |
| GET | `/admin/streak/leaderboard/:courseId` | Get course streak leaderboard | `streak.manage.all` | `streak.leaderboard.read` | MEDIUM |
| POST | `/admin/streak/manual-update` | Manually update user streak | `streak.manage.all` | `streak.update.all` | MEDIUM |
| POST | `/admin/streak/bulk-update` | Bulk update streaks | `streak.manage.all` | `streak.bulk_update.all` | MEDIUM |
| GET | `/admin/streak/trends` | Get streak trends over time | `streak.manage.all` | `streak.trends.read` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5 Permissions:** 1 (`streak.manage.all`)  
**Granular Permissions (Future):** 6

**Implementation Note:** Gamification feature tracking user learning streaks. Admins can view analytics, manually correct streaks, and perform bulk updates for data migration.

---

### 25. SUB-DISCUSSION MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/subDiscussion.js`  
**Controller:** `controllers/managerial/subDiscussion.js`  
**Current Auth:** `requireDiscussionManage` (Phase 5: `discussion.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| POST | `/admin/subDiscussion/create/:discussionId` | Create sub-discussion (reply) | `discussion.manage.all` | `discussion.reply.create` | MEDIUM |
| GET | `/admin/subDiscussion/list/:discussionId` | List sub-discussions | `discussion.manage.all` | `discussion.reply.read` | MEDIUM |
| DELETE | `/admin/subDiscussion/delete/:subDiscussionId` | Delete sub-discussion | `discussion.manage.all` | `discussion.reply.delete` | MEDIUM |

**Total Endpoints:** 3  
**Phase 5 Permissions:** 1 (`discussion.manage.all` - inherited from parent)  
**Granular Permissions (Future):** 3

**Implementation Note:** Manages replies/sub-discussions within main discussion threads. Uses hierarchical permissions from parent discussion resource.

---

### 26. MODULE FEEDBACK MANAGEMENT APIs ✅ Phase 5 Complete
**Route File:** `routes/managerial/moduleFeedback.js`  
**Controller:** `controllers/managerial/moduleFeedback.js`  
**Current Auth:** `requireFeedbackManage` (Phase 5: `feedback.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/admin/module-feedback` | Get all module feedback | `feedback.manage.all` | `feedback.read.all` | MEDIUM |
| GET | `/admin/module-feedback/export` | Export feedback as CSV | `feedback.manage.all` | `feedback.export.all` | MEDIUM |
| GET | `/admin/module-feedback/reasons` | Get all feedback reasons | `feedback.manage.all` | `feedback.reasons.read` | MEDIUM |
| POST | `/admin/module-feedback/reasons` | Create feedback reason | `feedback.manage.all` | `feedback.reasons.create` | MEDIUM |
| PATCH | `/admin/module-feedback/reasons/reorder` | Reorder feedback reasons | `feedback.manage.all` | `feedback.reasons.update` | MEDIUM |
| GET | `/admin/module-feedback/reasons/:id` | Get feedback reason by ID | `feedback.manage.all` | `feedback.reasons.read` | MEDIUM |
| PUT | `/admin/module-feedback/reasons/:id` | Update feedback reason | `feedback.manage.all` | `feedback.reasons.update` | MEDIUM |
| DELETE | `/admin/module-feedback/reasons/:id` | Delete feedback reason | `feedback.manage.all` | `feedback.reasons.delete` | MEDIUM |

**Total Endpoints:** 8  
**Phase 5 Permissions:** 1 (`feedback.manage.all`)  
**Granular Permissions (Future):** 5

**Implementation Note:** Separate from general feedback, this manages module-specific feedback with predefined reasons. Includes CRUD for feedback reasons and export functionality.

---

### 27. COURSE V2 APIs (Enhanced) ✅ Phase 5 Complete
**Route File:** `routes/managerial/courseV2.js`  
**Controller:** `controllers/managerial/courseV2.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| PUT | `/v2/admin/course/:courseId/modules/reorder` | Reorder course modules | `course.manage.all` | `course.modules.reorder` | MEDIUM |
| GET | `/v2/admin/course/:courseId/getFull-enhanced` | Get full course with enhanced data | `course.manage.all` | `course.read.all` | MEDIUM |
| GET | `/v2/admin/course/import/:importId/status` | Get course import status | `course.manage.all` | `course.import.read` | MEDIUM |
| POST | `/v2/admin/course/import` | Import course from file | `course.manage.all` | `course.import.create` | MEDIUM |
| GET | `/v2/admin/course/:courseId/export` | Export course to file | `course.manage.all` | `course.export.read` | MEDIUM |
| GET | `/v2/admin/course/import/template` | Get import template | `course.manage.all` | `course.import.template` | MEDIUM |

**Total Endpoints:** 6  
**Phase 5 Permissions:** 1 (`course.manage.all` - inherited from main course)  
**Granular Permissions (Future):** 6

**Implementation Note:** Enhanced V2 endpoints for advanced course operations including import/export, module reordering, and enhanced data retrieval. Inherits from main course permissions.

---

### 28. MODULE V2 APIs (Enhanced) ✅ Phase 5 Complete
**Route File:** `routes/managerial/moduleV2.js`  
**Controller:** `controllers/managerial/moduleV2.js`  
**Current Auth:** `requireCourseManage` (Phase 5: `course.manage.all`)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/v2/admin/module/:moduleId/instructor` | Get module instructor | `course.manage.all` | `module.instructor.read` | MEDIUM |
| PUT | `/v2/admin/module/:moduleId/instructor` | Assign module instructor | `course.manage.all` | `module.instructor.assign` | MEDIUM |
| POST | `/v2/admin/module/:moduleId/assignment/document` | Upload assignment document | `course.manage.all` | `module.assignment.upload` | MEDIUM |
| DELETE | `/v2/admin/module/:moduleId/assignment/document` | Delete assignment document | `course.manage.all` | `module.assignment.delete` | MEDIUM |
| POST | `/v2/admin/module/:moduleId/quiz/import` | Import quiz | `course.manage.all` | `module.quiz.import` | MEDIUM |
| GET | `/v2/admin/module/:moduleId/quiz/export` | Export quiz | `course.manage.all` | `module.quiz.export` | MEDIUM |
| PUT | `/v2/admin/module/:moduleId/update-enhanced` | Enhanced module update | `course.manage.all` | `module.update.all` | MEDIUM |
| POST | `/v2/admin/module/:moduleId/duplicate` | Duplicate module | `course.manage.all` | `module.duplicate.all` | MEDIUM |
| POST | `/v2/admin/module/batch-update` | Batch update modules | `course.manage.all` | `module.batch_update.all` | MEDIUM |

**Total Endpoints:** 9  
**Phase 5 Permissions:** 1 (`course.manage.all` - inherited from parent)  
**Granular Permissions (Future):** 9

**Implementation Note:** Enhanced V2 endpoints for advanced module operations. Uses hierarchical permissions - inherits from course.manage.all.

---

### 29. TEACHER V2 APIs (Enhanced) ✅ Phase 5 Complete
**Route File:** `routes/managerial/teacherV2.js`  
**Controller:** `controllers/managerial/teacherV2.js`  
**Auth:** `requirePermission(PERMISSIONS.TEACHER.MANAGE.ALL)` (Phase 5 — one permission for all 20 endpoints)

| Method | Endpoint | Description | **Phase 5 Permission** | Granular (Future) | Priority |
|--------|----------|-------------|----------------------|-------------------|----------|
| GET | `/v2/admin/teacher/search` | Search teachers | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| POST | `/v2/admin/teacher/bulk-assign-course` | Bulk assign teachers to course | `teacher.manage.all` | `teacher.bulk_assign.course` | MEDIUM |
| POST | `/v2/admin/teacher/bulk-assign-bundle` | Bulk assign teachers to bundle | `teacher.manage.all` | `teacher.bulk_assign.bundle` | MEDIUM |
| GET | `/v2/admin/teacher/list-names` | List teacher names only | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| GET | `/v2/admin/teacher/list-full` | List teachers with full info | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| GET | `/v2/admin/teacher/by-course/:courseId` | Get teachers by course | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| GET | `/v2/admin/teacher/by-bundle/:bundleId` | Get teachers by bundle | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| POST | `/v2/admin/teacher/create-enhanced` | Create teacher (enhanced) | `teacher.manage.all` | `teacher.create.all` | MEDIUM |
| GET | `/v2/admin/teacher/:teacherId/full` | Get teacher full details | `teacher.manage.all` | `teacher.read.all` | MEDIUM |
| PUT | `/v2/admin/teacher/:teacherId/update-enhanced` | Update teacher (enhanced) | `teacher.manage.all` | `teacher.update.all` | MEDIUM |
| GET | `/v2/admin/teacher/:teacherId/stats` | Get teacher statistics | `teacher.manage.all` | `teacher.stats.read` | MEDIUM |
| PUT | `/v2/admin/teacher/:teacherId/toggle-active` | Toggle teacher active status | `teacher.manage.all` | `teacher.status.update` | MEDIUM |
| POST | `/v2/admin/teacher/:teacherId/image` | Upload teacher image | `teacher.manage.all` | `teacher.image.upload` | MEDIUM |
| DELETE | `/v2/admin/teacher/:teacherId/image` | Delete teacher image | `teacher.manage.all` | `teacher.image.delete` | MEDIUM |
| POST | `/v2/admin/teacher/:teacherId/assign-course` | Assign teacher to course | `teacher.manage.all` | `teacher.assign.course` | MEDIUM |
| GET | `/v2/admin/teacher/:teacherId/courses` | Get teacher courses | `teacher.manage.all` | `teacher.courses.read` | MEDIUM |
| DELETE | `/v2/admin/teacher/:teacherId/course/:courseId` | Remove teacher from course | `teacher.manage.all` | `teacher.assign.delete` | MEDIUM |
| POST | `/v2/admin/teacher/:teacherId/assign-bundle` | Assign teacher to bundle | `teacher.manage.all` | `teacher.assign.bundle` | MEDIUM |
| GET | `/v2/admin/teacher/:teacherId/bundles` | Get teacher bundles | `teacher.manage.all` | `teacher.bundles.read` | MEDIUM |
| DELETE | `/v2/admin/teacher/:teacherId/bundle/:bundleId` | Remove teacher from bundle | `teacher.manage.all` | `teacher.assign.delete` | MEDIUM |

**Total Endpoints:** 20  
**Phase 5 Permissions:** 1 (`teacher.manage.all` - inherited from main teacher)  
**Granular Permissions (Future):** 15

**Implementation Note:** All 20 V2 endpoints use `teacher.manage.all`. Enhanced teacher management: bulk operations, image uploads, course/bundle associations, statistics.

---

## Summary Statistics

### By Resource

| Resource | Endpoints | Permissions | Priority Distribution |
|----------|-----------|-------------|----------------------|
| User | 6 | 5 | High: 5, Med: 1 |
| Admin | 6 | 5 | High: 5, Med: 1 |
| Course | 19 | 11 | High: 7, Med: 8, Low: 4 |
| Chapter | 5 | 4 | High: 5 |
| Module | 5 | 4 | High: 5 |
| Teacher | 6 | 5 | High: 4, Med: 2 |
| Coupon | 21 | 4 | High: 5, Med: 15, Low: 1 |
| Bundle | 18 | 7 | High: 5, Med: 9, Low: 4 |
| Contest | 14 | 4 | Med: 14 |
| Ambassador | 32 | 16 | High: 9, Med: 20, Low: 3 |
| Announcement | 7 | 5 | Med: 7 |
| Payment | 5 | 3 | High: 4, Med: 1 |
| Live | 10 | 6 | Med: 5, Low: 5 |
| Feedback | 4 | 4 | Med: 3, Low: 1 |
| **SMS** | **6** | **3** | **High: 1, Med: 5** |
| **Revenue** | **4** | **2** | **High: 2, Med: 2** |
| **Analytics** | **8** | **1** | **Med: 8** |
| **Routine** | **7** | **4** | **Med: 7** |
| **Submission** | **2** | **2** | **High: 2** |
| **Discussion** | **4** | **3** | **Med: 4** |
| **Level** | **5** | **4** | **Med: 3, Low: 2** |
| **System** | **2** | **2** | **Low: 2** |
| **After Message** | **4** | **2** | **Med: 4** |
| **Streak** | **6** | **3** | **Med: 6** |
| **Sub-Discussion** | **3** | **2** | **Med: 3** |
| **Module Feedback** | **8** | **5** | **Med: 8** |
| **Course V2** | **6** | **6** | **Med: 6** |
| **Module V2** | **9** | **9** | **Med: 9** |
| **Teacher V2** | **20** | **15** | **Med: 20** |
| **TOTAL** | **252** | **149** | **High: 64, Med: 176, Low: 20** |

**Notes:** 
- The `promote-to-ambassador` endpoint (from user routes) is counted under Ambassador Management
- NEW resources added: SMS, Revenue, Analytics, Routine, Submission, Discussion, Level, System

---

## Migration Priority

### Phase 1: Critical High-Priority APIs (Week 1)
**Focus:** User, Admin, Core CRUD operations

- User Management (7 endpoints)
- Admin Management (6 endpoints)
- Course CRUD (7 endpoints - basic operations only)
- Chapter CRUD (5 endpoints)
- Module CRUD (5 endpoints)

**Total:** 30 endpoints  
**Estimated Time:** 3-5 days

---

### Phase 2: Medium-Priority Content Management (Week 2)
**Focus:** Teachers, Content Management

- Teacher Management (6 endpoints)
- Course Advanced (12 remaining endpoints)
- Announcement Management (7 endpoints)

**Total:** 25 endpoints  
**Estimated Time:** 3-4 days

---

### Phase 3: Financial & Analytics (Week 3)
**Focus:** Revenue-critical features

- Payment Management (5 endpoints)
- Coupon Management (21 endpoints)
- Bundle Management (18 endpoints)
- Ambassador Commissions (10 endpoints from ambassador)

**Total:** 54 endpoints  
**Estimated Time:** 5-7 days

---

### Phase 4: Engagement Features (Week 4)
**Focus:** User engagement and interaction

- Contest Management (14 endpoints)
- Live Session Management (10 endpoints)
- Feedback Management (4 endpoints)
- Ambassador Social (21 remaining endpoints)

**Total:** 49 endpoints  
**Estimated Time:** 4-6 days

---

## Implementation Phases

### Phase 5.1: Prepare Permission Updates
**Duration:** 1 day

1. Review and update `util/permissions.js` with all 84 permissions
2. Update database with new permissions for default roles
3. Run permission validation script
4. Update documentation

### Phase 5.2: Create Permission Middleware Helpers
**Duration:** 2 days

1. Create helper functions for common permission patterns
2. **Implement hierarchical permission checking logic**
3. Create resource-specific middleware generators
4. Add logging and monitoring
5. Write comprehensive tests for hierarchical permissions

### Phase 5.3: Migrate APIs Phase by Phase
**Duration:** 4-6 weeks (following priority order)

**For Each API Group:**
1. Update route file with new middleware
2. Update controller if needed (remove type checks)
3. Update tests
4. Test manually
5. Code review
6. Deploy to staging
7. Monitor for issues
8. Deploy to production

### Phase 5.4: Remove Legacy Middleware
**Duration:** 1 day

1. Verify all routes migrated
2. Remove `authenticateAdmin` type-based checks
3. Keep JWT verification only
4. Update documentation

---

## Hierarchical Permission Implementation

### Resource Hierarchy Map

```javascript
const RESOURCE_HIERARCHY = {
  // Course hierarchy - most important
  'course': {
    children: ['chapter', 'module', 'quiz', 'submission', 'contest', 'announcement', 'live'],
    permissions: ['create', 'read', 'update', 'delete', 'manage']
  },
  
  // Bundle hierarchy
  'bundle': {
    children: ['course'], // Inherits course and all its children
    permissions: ['create', 'read', 'update', 'delete', 'manage']
  },
  
  // Ambassador hierarchy
  'ambassador': {
    children: ['coupon', 'commission', 'payment', 'tier', 'milestone'],
    permissions: ['create', 'read', 'update', 'approve', 'reject', 'manage']
  }
};
```

### Permission Resolution Algorithm

```javascript
/**
 * Check if user has permission with hierarchical support
 * @param {Array} userPermissions - User's permissions from JWT
 * @param {String} requiredPermission - Required permission (e.g., 'chapter.read.all')
 * @param {Object} context - Additional context (courseId, chapterId, etc.)
 * @returns {Boolean}
 */
function hasHierarchicalPermission(userPermissions, requiredPermission, context = {}) {
  // 1. Direct permission check
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // 2. Parse required permission
  const [resource, action, scope] = requiredPermission.split('.');
  
  // 3. Check parent permissions
  const parentResource = getParentResource(resource);
  if (parentResource) {
    // Check if user has parent's manage permission
    const parentManagePermission = `${parentResource}.manage.${scope}`;
    if (userPermissions.includes(parentManagePermission)) {
      return true;
    }
    
    // Check if user has parent's specific action permission
    const parentActionPermission = `${parentResource}.${action}.${scope}`;
    if (userPermissions.includes(parentActionPermission)) {
      return true;
    }
    
    // Recursively check grandparent (e.g., module -> chapter -> course)
    return hasHierarchicalPermission(userPermissions, parentActionPermission, context);
  }
  
  return false;
}

/**
 * Get parent resource in hierarchy
 */
function getParentResource(resource) {
  const hierarchy = {
    'module': 'chapter',
    'chapter': 'course',
    'quiz': 'course',
    'submission': 'course',
    'contest': 'course',
    'announcement': 'course',
    'live': 'course',
    'commission': 'ambassador',
    'payment': 'ambassador',
    'tier': 'ambassador',
    'milestone': 'ambassador'
  };
  
  return hierarchy[resource] || null;
}
```

### Middleware Implementation

```javascript
/**
 * Enhanced permission middleware with hierarchical support
 */
const requirePermissionWithHierarchy = (permission) => (req, res, next) => {
  try {
    const user = req.user; // From JWT
    
    if (!user || !user.permissions) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Extract context from request
    const context = {
      courseId: req.params.courseId || req.params.id,
      chapterId: req.params.chapterId,
      moduleId: req.params.moduleId,
      userId: user.id
    };
    
    // Check permission with hierarchy
    const hasPermission = hasHierarchicalPermission(
      user.permissions,
      permission,
      context
    );
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Required permission: ${permission}`,
        hint: 'You may need parent resource permission (e.g., course.manage.all)'
      });
    }
    
    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Usage Examples

```javascript
// Chapter routes - can be accessed with chapter.* OR course.* permissions
router.get('/admin/chapter/list/:id', 
  requirePermissionWithHierarchy('chapter.read.all'),
  chapterController.list
);

// Module routes - can be accessed with module.* OR chapter.* OR course.* permissions
router.post('/admin/module/create/:id',
  requirePermissionWithHierarchy('module.create.all'),
  moduleController.create
);

// Contest routes - can be accessed with contest.* OR course.* permissions
router.put('/admin/contest/update/:id',
  requirePermissionWithHierarchy('contest.update.all'),
  contestController.update
);
```

### Benefits of Hierarchical Permissions

1. **Simplified Management**: Assign `course.manage.all` instead of 7+ separate permissions
2. **Logical Access Control**: Course managers naturally have access to all course content
3. **Fewer Role Definitions**: Roles need fewer permissions
4. **Easier Onboarding**: New admins understand "course access = full course access"
5. **Maintainable**: Adding new child resources doesn't require permission updates
6. **Flexible**: Can still assign granular permissions when needed

### Permission Reduction Example

**Before (Without Hierarchy):**
```javascript
// Content Manager Role needs 20+ permissions:
[
  'course.read.all', 'course.update.all', 'course.delete.all',
  'chapter.read.all', 'chapter.create.all', 'chapter.update.all', 'chapter.delete.all',
  'module.read.all', 'module.create.all', 'module.update.all', 'module.delete.all',
  'quiz.read.all', 'quiz.create.all', 'quiz.update.all', 'quiz.delete.all',
  'contest.read.all', 'contest.create.all', 'contest.update.all', 'contest.delete.all',
  'announcement.read.all', 'announcement.create.all', 'announcement.update.all',
  'live.read.all', 'live.create.all', 'live.update.all'
]
```

**After (With Hierarchy):**
```javascript
// Content Manager Role needs just 1 permission:
[
  'course.manage.all'  // Automatically grants all child resource permissions
]
```

---

## Testing Strategy

### Unit Tests
- Test each middleware function
- Test permission checking logic
- Test scope resolution
- **Test hierarchical permission resolution**
- **Test parent permission inheritance**
- **Test multi-level hierarchy (module -> chapter -> course)**

### Integration Tests
- Test each API endpoint with various roles
- Test permission denial scenarios
- Test edge cases
- **Test chapter access with course.manage.all permission**
- **Test module access with course.manage.all permission**
- **Test contest access with course.manage.all permission**
- **Test that specific permissions still work (chapter.read.all)**
- **Test permission precedence (specific vs inherited)**

### Hierarchical Permission Test Cases

```javascript
// Test Case 1: Direct permission
User has: ['chapter.read.all']
Accessing: GET /admin/chapter/list/:id
Expected: ✅ PASS

// Test Case 2: Parent permission (course -> chapter)
User has: ['course.manage.all']
Accessing: POST /admin/chapter/create/:id
Expected: ✅ PASS (inherited from course.manage.all)

// Test Case 3: Grandparent permission (course -> chapter -> module)
User has: ['course.manage.all']
Accessing: PUT /admin/module/update/:id
Expected: ✅ PASS (inherited through chapter from course)

// Test Case 4: No permission
User has: ['user.read.all']
Accessing: DELETE /admin/chapter/delete/:id
Expected: ❌ FAIL (403 Forbidden)

// Test Case 5: Read-only parent permission
User has: ['course.read.all']
Accessing: GET /admin/chapter/list/:id
Expected: ✅ PASS (read inherited)

// Test Case 6: Read-only parent, write attempt
User has: ['course.read.all']
Accessing: POST /admin/chapter/create/:id
Expected: ❌ FAIL (needs course.manage.all or chapter.create.all)

// Test Case 7: Bundle hierarchy
User has: ['bundle.manage.all']
Accessing: GET /admin/course/get/:id (course in bundle)
Expected: ✅ PASS (inherited from bundle)

// Test Case 8: Contest through course
User has: ['course.manage.all']
Accessing: POST /admin/contest/participant/add/:id
Expected: ✅ PASS (contest is child of course)
```

### Manual Testing
- **Admin role**: Should have full access (has all *.all permissions)
- **Content Manager role**: Should access all course-related content with just `course.manage.all`
- **Moderator role**: Limited to specific resources
- **Custom roles**: Test specific permission combinations
- **Hierarchy edge cases**: Test 3-level deep inheritance (course -> chapter -> module)

---

## Risk Mitigation

### Risks
1. Breaking existing functionality
2. Security holes during migration
3. Performance degradation
4. Incomplete permission mapping

### Mitigation Strategies
1. Migrate gradually (phase by phase)
2. Comprehensive testing at each phase
3. Feature flags for gradual rollout
4. Monitor error rates closely
5. Keep rollback plan ready
6. Staging environment testing
7. Code review for each phase

---

## Next Steps

1. **Review this document** with the team
2. **Update `util/permissions.js`** with all 84 permissions
3. **Create database migration** to add new permissions to roles
4. **Start with Phase 5.1** (Prepare Permission Updates)
5. **Begin Phase 5.2** (Critical High-Priority APIs)

---

**Document Status:** Draft v1.0  
**Last Updated:** February 2, 2026  
**Next Review:** Before Phase 5 implementation

---

*This document will be updated as migration progresses.*
