# Admin Dashboard Tabs & Permissions Guide

**Date:** March 6, 2026  
**Purpose:** Comprehensive guide to admin dashboard tabs, their required permissions, and associated API groups.

---

## Overview

The admin dashboard consists of 20+ tabs, each requiring specific permissions and using distinct API groups. This follows a **micro-permission model** where each functional area has its own `*.manage.all` permission with no inheritance between areas.

### Key Principles
- **Explicit Permissions**: Each area requires its own `*.manage.all` permission
- **No Inheritance**: Having `course.manage.all` doesn't grant access to other areas
- **API Isolation**: Each permission corresponds to a specific set of API endpoints
- **Granular Control**: Admins only see tabs they have permission for

---

## Tab Permissions & API Groups

### 1. Overview/Dashboard (`/`)
- **Required Permission**: `"analytics.manage.all"`
- **API Group**: Analytics APIs
  - `GET /v2/admin/analytics/dashboard/overview` - Dashboard overview data
  - `GET /v2/admin/analytics/metadata` - Metadata for formatting

### 2. Analytics Dashboard (`/analytics-dashboard`)
- **Required Permission**: `"analytics.manage.all"`
- **API Group**: Analytics-v2 APIs (9 tabs)
  - Dashboard: `GET /v2/admin/analytics/dashboard/overview`
  - Revenue: `GET /v2/admin/analytics/revenue/summary`, `GET /v2/admin/analytics/revenue/trends`
  - Users: `GET /v2/admin/analytics/users/overview`, `GET /v2/admin/analytics/users/growth`
  - Courses: `GET /v2/admin/analytics/courses/overview`
  - Bundles: `GET /v2/admin/analytics/bundles/overview`
  - Learning: `GET /v2/admin/analytics/learning/progress`
  - Engagement: `GET /v2/admin/analytics/engagement/discussions`, `GET /v2/admin/analytics/engagement/submissions`
  - Coupons: `GET /v2/admin/analytics/coupons/overview`
  - Payments: `GET /v2/admin/analytics/payments/overview`

### 3. Courses Management (`/courses`)
- **Required Permission**: `"course.manage.all"`
- **API Group**: Course management APIs
  - `GET/POST/PUT/DELETE /admin/courses` - CRUD operations for courses
  - `GET /admin/courses/:id/enrollments` - Course enrollments
  - `POST /admin/courses/:id/publish` - Publish/unpublish courses
  - `GET /admin/courses/analytics` - Course analytics

### 4. Bundle Management (`/bundle-management`)
- **Required Permission**: `"bundle.manage.all"`
- **API Group**: Bundle management APIs
  - `GET/POST/PUT/DELETE /admin/bundles` - CRUD for course bundles
  - `GET /admin/bundles/:id/courses` - Bundle contents
  - `POST /admin/bundles/:id/publish` - Bundle publishing

### 5. Live Classes (`/live-classes`)
- **Required Permission**: `"live.manage.all"`
- **API Group**: Live class management APIs
  - `GET/POST/PUT/DELETE /admin/live-classes` - Live class CRUD
  - `GET /admin/live-classes/:id/attendees` - Class attendees
  - `POST /admin/live-classes/:id/start` - Start/end live sessions

### 6. Users Management (`/users`)
- **Required Permission**: `"user.manage.all"`
- **API Group**: User management APIs
  - `GET/POST/PUT/DELETE /admin/users` - User CRUD
  - `GET /admin/users/:id/details` - User details
  - `POST /admin/users/:id/block` - Block/unblock users
  - `GET /admin/users/export` - User data export

### 7. Purchased Users (`/purchased-users`)
- **Required Permission**: `"course.manage.all"`
- **API Group**: Purchase/enrollment APIs
  - `GET /admin/purchases` - Purchase records
  - `GET /admin/enrollments` - User enrollments
  - `POST /admin/enrollments/manual` - Manual enrollments

### 8. Prebooked Users (`/prebooked-users`)
- **Required Permission**: `"course.manage.all"`
- **API Group**: Prebooking APIs
  - `GET /admin/prebookings` - Prebooking records
  - `POST /admin/prebookings/confirm` - Confirm prebookings

### 9. Admin Management (`/admin-management`)
- **Required Permission**: `"admin.manage.all"`
- **API Group**: Admin user management APIs
  - `GET/POST/PUT/DELETE /admin/admins` - Admin CRUD
  - `GET /admin/admins/:id/permissions` - Admin permissions
  - `POST /admin/admins/:id/roles` - Assign roles

### 10. Role Management (`/role-management`)
- **Required Permission**: `"role.manage.all"`
- **API Group**: Role and permission APIs
  - `GET/POST/PUT/DELETE /admin/roles` - Role CRUD
  - `GET /admin/roles/:id/permissions` - Role permissions
  - `POST /admin/roles/:id/users` - Assign roles to users

### 11. Teacher Dashboard (`/teacher-dashboard`)
- **Required Permission**: `"teacher.manage.all"`
- **API Group**: Teacher management APIs
  - `GET/POST/PUT/DELETE /admin/teachers` - Teacher CRUD
  - `GET /admin/teachers/:id/classes` - Teacher's classes
  - `GET /admin/teachers/analytics` - Teacher performance

### 12. Announcements (`/announcements`)
- **Required Permission**: `"announcement.manage.all"`
- **API Group**: Announcement APIs
  - `GET/POST/PUT/DELETE /admin/announcements` - Announcement CRUD
  - `POST /admin/announcements/:id/publish` - Publish announcements

### 13. Forum Management (`/forum` & `/threads`)
- **Required Permission**: `"discussion.manage.all"`
- **API Group**: Discussion/forum APIs
  - `GET/POST/PUT/DELETE /admin/forum/categories` - Forum categories
  - `GET/POST/PUT/DELETE /admin/forum/threads` - Thread management
  - `GET/POST /admin/forum/posts` - Post management

### 14. Contests (`/contests`)
- **Required Permission**: `"contest.manage.all"`
- **API Group**: Contest management APIs
  - `GET/POST/PUT/DELETE /admin/contests` - Contest CRUD
  - `GET /admin/contests/:id/submissions` - Contest submissions
  - `POST /admin/contests/:id/evaluate` - Evaluate submissions

### 15. Rewards/Streaks (`/rewards`)
- **Required Permission**: `"streak.manage.all"`
- **API Group**: Reward and streak APIs
  - `GET/POST/PUT/DELETE /admin/rewards` - Reward CRUD
  - `GET /admin/streaks` - User streaks
  - `POST /admin/rewards/award` - Award rewards

### 16. Coupon Management (`/coupon-management`)
- **Required Permission**: `"coupon.manage.all"`
- **API Group**: Coupon management APIs
  - `GET/POST/PUT/DELETE /admin/coupons` - Coupon CRUD
  - `GET /admin/coupons/:id/usage` - Coupon usage stats
  - `POST /admin/coupons/:id/deactivate` - Deactivate coupons

### 17. SMS Management (`/sms-management`)
- **Required Permission**: `"sms.manage.all"`
- **API Group**: SMS/communication APIs
  - `GET/POST /admin/sms/send` - Send SMS
  - `GET /admin/sms/logs` - SMS delivery logs
  - `GET /admin/sms/templates` - SMS templates

### 18. After Purchase Messages (`/after-purchase-messages`)
- **Required Permission**: `"message.manage.all"`
- **API Group**: Automated message APIs
  - `GET/POST/PUT/DELETE /admin/messages` - Message template CRUD
  - `GET /admin/messages/:id/triggers` - Message triggers

### 19. Payment Audit Log (`/payment-audit-log`)
- **Required Permission**: `"payment.manage.all"`
- **API Group**: Payment audit APIs
  - `GET /admin/payments/audit` - Payment audit logs
  - `GET /admin/payments/:id/details` - Payment details
  - `POST /admin/payments/refund` - Process refunds

### 20. Routine Management (`/routine-management`)
- **Required Permission**: `"routine.manage.all"`
- **API Group**: Routine/schedule APIs
  - `GET/POST/PUT/DELETE /admin/routines` - Routine CRUD
  - `GET /admin/routines/:id/schedule` - Routine schedules

### 21. Feedback Management (`/feedback-management`)
- **Required Permission**: `"feedback.manage.all"`
- **API Group**: Feedback APIs
  - `GET /admin/feedback` - User feedback
  - `GET /admin/feedback/:id/responses` - Feedback responses
  - `POST /admin/feedback/:id/respond` - Respond to feedback

### 22. Certificate Issue (`/certificate-issue`)
- **Required Permission**: `"course.manage.all"`
- **API Group**: Certificate APIs
  - `GET /admin/certificates` - Certificate records
  - `POST /admin/certificates/issue` - Issue certificates
  - `GET /admin/certificates/:id/download` - Download certificates

---

## Permission Implementation

### Route Protection
Each route is mapped to its required permission in `lib/permissions.ts`:

```typescript
export const ROUTE_PERMISSIONS: Record<string, RequiredPermission> = {
  "/": "analytics.manage.all",
  "/courses": "course.manage.all",
  "/bundle-management": "bundle.manage.all",
  "/analytics-dashboard": "analytics.manage.all",
  "/live-classes": "live.manage.all",
  // ... etc
};
```

### Sidebar Filtering
The sidebar only shows tabs for which the user has the required permission:

```typescript
function hasPermission(userPermissions, required) {
  return userPermissions.includes(required);
}
```

### API Authorization
Each API endpoint checks for the corresponding permission on the backend.

---

## Summary

- **Total Tabs**: 22 admin tabs
- **Unique Permissions**: 20+ distinct `*.manage.all` permissions
- **API Groups**: Each permission corresponds to 5-15+ specific API endpoints
- **Access Control**: Users only see tabs and can only call APIs for areas they have permission for

This granular permission system ensures admins have access only to the areas they need to manage, with complete API-level isolation between functional areas.