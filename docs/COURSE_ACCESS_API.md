# Course Access Management API Documentation

## Overview

The Course Access Management API enables administrators to assign and manage course-specific access for managerial users (shareholders). This system implements fine-grained access control, allowing users with `.own` permissions to manage only their assigned courses.

**Base URL**: `/admin/course-access`

**Version**: 1.0.0

**Last Updated**: March 11, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [Assign Course Access](#1-assign-course-access)
   - [Remove Course Access](#2-remove-course-access)
   - [Get Course Access List](#3-get-course-access-list)
   - [Get User Course Access](#4-get-user-course-access)
3. [Error Codes](#error-codes)
4. [Usage Examples](#usage-examples)
5. [Related Endpoints](#related-endpoints)

---

## Authentication

All endpoints require JWT authentication with the `role.manage.all` permission.

**Header Format**:
```
Authorization: Bearer <jwt_token>
```

**Required Permission**: `role.manage.all`

---

## Endpoints

### 1. Assign Course Access

Assign a managerial user (type 1) access to a specific course.

**Endpoint**: `POST /admin/course-access`

**Permission**: `role.manage.all`

#### Request Body

```json
{
  "userId": 123,
  "courseId": 456
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | integer | Yes | ID of the managerial user (must be type 1) |
| `courseId` | integer | Yes | ID of the course |

#### Success Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "message": "Course access assigned successfully",
  "data": {
    "id": 1,
    "course_id": 456,
    "user_id": 123,
    "created_at": "2026-03-11T14:00:00.000Z",
    "updated_at": "2026-03-11T14:00:00.000Z",
    "created_by": 1,
    "course": {
      "id": 456,
      "title": "Advanced JavaScript"
    },
    "user": {
      "id": 123,
      "name": "John Doe"
    }
  }
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid parameters
```json
{
  "success": false,
  "error": "Course ID and User ID are required"
}
```

**400 Bad Request** - Non-managerial user
```json
{
  "success": false,
  "error": "Only managerial users (admin/type 1) can be assigned course access"
}
```

**404 Not Found** - User or course doesn't exist
```json
{
  "success": false,
  "error": "User not found"
}
```

**409 Conflict** - Duplicate assignment
```json
{
  "success": false,
  "error": "User already has access to this course"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:4000/admin/course-access \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "courseId": 456
  }'
```

---

### 2. Remove Course Access

Remove a user's access to a specific course.

**Endpoint**: `DELETE /admin/course-access/:courseId/:userId`

**Permission**: `role.manage.all`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | integer | Yes | ID of the course |
| `userId` | integer | Yes | ID of the user |

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Course access removed successfully"
}
```

#### Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "success": false,
  "error": "Invalid course ID or user ID"
}
```

**404 Not Found** - Access record doesn't exist
```json
{
  "success": false,
  "error": "Course access not found"
}
```

#### cURL Example

```bash
curl -X DELETE http://localhost:4000/admin/course-access/456/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Course Access List

Get all users who have access to a specific course.

**Endpoint**: `GET /admin/course-access/courses/:courseId/users`

**Permission**: `role.manage.all`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `courseId` | integer | Yes | ID of the course |

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "access_id": 1,
      "course_id": 456,
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "created_at": "2026-03-11T14:00:00.000Z",
      "updated_at": "2026-03-11T14:00:00.000Z",
      "created_by": 1,
      "created_by_name": "Admin User"
    },
    {
      "access_id": 2,
      "course_id": 456,
      "user_id": 124,
      "user_name": "Jane Smith",
      "user_email": "jane@example.com",
      "created_at": "2026-03-11T15:00:00.000Z",
      "updated_at": "2026-03-11T15:00:00.000Z",
      "created_by": 1,
      "created_by_name": "Admin User"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `access_id` | integer | Course access record ID |
| `course_id` | integer | Course ID |
| `user_id` | integer | User ID |
| `user_name` | string | User's full name |
| `user_email` | string | User's email address |
| `created_at` | timestamp | When access was granted |
| `updated_at` | timestamp | Last update timestamp |
| `created_by` | integer | Admin who granted access |
| `created_by_name` | string | Admin's name |

#### Error Responses

**400 Bad Request** - Invalid course ID
```json
{
  "success": false,
  "error": "Invalid course ID"
}
```

**200 OK** - Course exists but no users have access
```json
{
  "success": true,
  "data": []
}
```

#### cURL Example

```bash
curl -X GET http://localhost:4000/admin/course-access/courses/456/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get User Course Access

Get all courses a specific user has access to.

**Endpoint**: `GET /admin/course-access/users/:userId/courses`

**Permission**: `role.manage.all`

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | integer | Yes | ID of the user |

#### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "access_id": 1,
      "course_id": 456,
      "user_id": 123,
      "course_title": "Advanced JavaScript",
      "course_description": "Learn advanced JS concepts",
      "course_price": 5000,
      "created_at": "2026-03-11T14:00:00.000Z",
      "updated_at": "2026-03-11T14:00:00.000Z",
      "created_by": 1,
      "created_by_name": "Admin User"
    },
    {
      "access_id": 2,
      "course_id": 789,
      "user_id": 123,
      "course_title": "React Masterclass",
      "course_description": "Master React development",
      "course_price": 7000,
      "created_at": "2026-03-11T15:00:00.000Z",
      "updated_at": "2026-03-11T15:00:00.000Z",
      "created_by": 1,
      "created_by_name": "Admin User"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `access_id` | integer | Course access record ID |
| `course_id` | integer | Course ID |
| `user_id` | integer | User ID |
| `course_title` | string | Course title |
| `course_description` | string | Course description |
| `course_price` | integer | Course price |
| `created_at` | timestamp | When access was granted |
| `updated_at` | timestamp | Last update timestamp |
| `created_by` | integer | Admin who granted access |
| `created_by_name` | string | Admin's name |

#### Error Responses

**400 Bad Request** - Invalid user ID
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

**200 OK** - User exists but has no course access
```json
{
  "success": true,
  "data": []
}
```

#### cURL Example

```bash
curl -X GET http://localhost:4000/admin/course-access/users/123/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing or invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate record |
| `500` | Internal Server Error |

### Application Error Codes

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `NO_TOKEN` | Authentication token missing | 401 |
| `INVALID_TOKEN` | Token is invalid or expired | 403 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permission | 403 |
| `MISSING_FIELDS` | Required fields not provided | 400 |
| `INVALID_ID` | ID is not a valid number | 400 |
| `NOT_FOUND` | User or course not found | 404 |
| `DUPLICATE_ACCESS` | User already has access | 409 |
| `INVALID_USER_TYPE` | User is not type 1 (managerial) | 400 |
| `ASSIGN_FAILED` | Failed to assign access | 500 |
| `DATABASE_ERROR` | Database operation failed | 500 |

---

## Usage Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:4000';
const token = 'YOUR_JWT_TOKEN';

// Assign course access
async function assignCourseAccess(userId, courseId) {
  try {
    const response = await axios.post(
      `${API_BASE}/admin/course-access`,
      { userId, courseId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Access assigned:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Get users with access to a course
async function getCourseUsers(courseId) {
  try {
    const response = await axios.get(
      `${API_BASE}/admin/course-access/courses/${courseId}/users`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log(`${response.data.data.length} users have access`);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Remove course access
async function removeCourseAccess(courseId, userId) {
  try {
    const response = await axios.delete(
      `${API_BASE}/admin/course-access/${courseId}/${userId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('Access removed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
(async () => {
  await assignCourseAccess(123, 456);
  await getCourseUsers(456);
  await removeCourseAccess(456, 123);
})();
```

### Python

```python
import requests

API_BASE = 'http://localhost:4000'
TOKEN = 'YOUR_JWT_TOKEN'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Assign course access
def assign_course_access(user_id, course_id):
    response = requests.post(
        f'{API_BASE}/admin/course-access',
        json={'userId': user_id, 'courseId': course_id},
        headers=headers
    )
    return response.json()

# Get users with access to a course
def get_course_users(course_id):
    response = requests.get(
        f'{API_BASE}/admin/course-access/courses/{course_id}/users',
        headers=headers
    )
    return response.json()

# Remove course access
def remove_course_access(course_id, user_id):
    response = requests.delete(
        f'{API_BASE}/admin/course-access/{course_id}/{user_id}',
        headers=headers
    )
    return response.json()

# Usage
result = assign_course_access(123, 456)
print(f"Access assigned: {result}")

users = get_course_users(456)
print(f"{len(users['data'])} users have access")

remove_course_access(456, 123)
print("Access removed")
```

---

## Related Endpoints

The following endpoints now support course access filtering for users with `.own` permissions:

### Revenue Endpoints

| Endpoint | Method | Description | Permission |
|----------|--------|-------------|------------|
| `/admin/revenue/detailed` | GET | Overall revenue (filtered) | `revenue.manage.all` or `revenue.manage.own` |
| `/admin/revenue/detailed/:id` | GET | Course revenue (requires access) | `revenue.manage.all` or `revenue.manage.own` |
| `/admin/revenue/timeframe` | GET | Revenue by timeframe (filtered) | `revenue.manage.all` or `revenue.manage.own` |
| `/admin/revenue/top` | GET | Top revenue courses (filtered) | `revenue.manage.all` or `revenue.manage.own` |

### Analytics Endpoints

| Endpoint | Method | Description | Permission |
|----------|--------|-------------|------------|
| `/admin/analytics/course-engagement` | GET | Course engagement (filtered) | `analytics.manage.all` or `analytics.manage.own` |
| `/admin/analytics/module-completion` | GET | Module completion (filtered) | `analytics.manage.all` or `analytics.manage.own` |
| `/admin/analytics/module-completion/:courseId` | GET | Course-specific (requires access) | `analytics.manage.all` or `analytics.manage.own` |

### Course Management Endpoints

| Endpoint | Method | Description | Permission |
|----------|--------|-------------|------------|
| `/admin/courses/update/:id` | PUT | Update course (requires access) | `course.manage.all` or `course.manage.own` |
| `/admin/courses/updateFull/:id` | PUT | Full update (requires access) | `course.manage.all` or `course.manage.own` |
| `/admin/courses/delete/:id` | DELETE | Delete course (requires access) | `course.manage.all` or `course.manage.own` |

### Content Management Endpoints

All chapter, module, announcement, discussion, routine, contest, live session, and level endpoints now check course access for users with `.own` permissions.

---

## Frontend Integration Guide

### Tab Visibility Rules

**IMPORTANT**: The following admin dashboard tabs should be visible to users with EITHER `.all` OR `.own` permissions. The difference is in the data they see (all data vs filtered data).

#### Tabs Visible with `.all` OR `.own` Permission

| Tab/Section | `.all` Permission | `.own` Permission | Data Shown |
|-------------|-------------------|-------------------|------------|
| **Courses** | ✅ Visible | ✅ Visible | `.all` = All courses<br>`.own` = Assigned courses only |
| **Analytics** | ✅ Visible | ✅ Visible | `.all` = All course data<br>`.own` = Assigned courses only |
| **Revenue** | ✅ Visible | ✅ Visible | `.all` = All course revenue<br>`.own` = Assigned courses only |
| **Announcements** | ✅ Visible | ✅ Visible | `.all` = All courses<br>`.own` = Assigned courses only |
| **Discussions** | ✅ Visible | ✅ Visible | `.all` = All courses<br>`.own` = Assigned courses only |
| **Routines** | ✅ Visible | ✅ Visible | `.all` = All courses<br>`.own` = Assigned courses only |
| **Feedback** | ✅ Visible | ✅ Visible | `.all` = All courses<br>`.own` = Assigned courses only |

#### Tabs Requiring ONLY `.all` Permission (Admin-Only)

| Tab/Section | Required Permission | Reason |
|-------------|-------------------|---------|
| **Course Access Management** | `role.manage.all` ONLY | Only admins can assign/remove course access |
| **User Management** | `user.manage.all` ONLY | Only admins can manage users |
| **Role Management** | `role.manage.all` ONLY | Only admins can manage roles |

#### Tab Visibility Logic (Frontend)

```javascript
// Example: Check if user should see Courses tab
function shouldShowCoursesTab(userPermissions) {
  // Show if user has EITHER .all OR .own permission
  return userPermissions.includes('course.manage.all') || 
         userPermissions.includes('course.manage.own');
}

// Example: Check if user should see Analytics tab
function shouldShowAnalyticsTab(userPermissions) {
  // Show if user has EITHER .all OR .own permission
  return userPermissions.includes('analytics.manage.all') || 
         userPermissions.includes('analytics.manage.own');
}

// Example: Check if user should see Course Access Management tab
function shouldShowCourseAccessTab(userPermissions) {
  // Show ONLY if user has .all permission
  return userPermissions.includes('role.manage.all');
}

// Example: Determine which courses to show in the tab
function getVisibleCourses(userPermissions, allCourses, assignedCourses) {
  if (userPermissions.includes('course.manage.all')) {
    return allCourses; // Show all courses
  } else if (userPermissions.includes('course.manage.own')) {
    return assignedCourses; // Show only assigned courses
  }
  return []; // No access
}
```

#### Permission-Based UI Rendering

**Admin with `.all` permissions** sees:
- ✅ Courses tab → ALL courses
- ✅ Analytics tab → ALL course data
- ✅ Revenue tab → ALL course revenue
- ✅ Course Access Management tab
- ✅ User Management tab
- ✅ Role Management tab

**Shareholder with `.own` permissions** sees:
- ✅ Courses tab → ASSIGNED courses only (FILTERED)
- ✅ Analytics tab → ASSIGNED course data only (FILTERED)
- ✅ Revenue tab → ASSIGNED course revenue only (FILTERED)
- ❌ Course Access Management tab (HIDDEN)
- ❌ User Management tab (HIDDEN)
- ❌ Role Management tab (HIDDEN)

#### Implementation Checklist for Frontend

- [ ] Show Courses/Analytics/Revenue tabs if user has `.all` OR `.own` permission
- [ ] Filter course list based on user permissions (all vs assigned)
- [ ] Show only accessible courses in dropdowns/selectors
- [ ] Display appropriate analytics based on course access (all vs filtered)
- [ ] Show appropriate revenue data (all vs filtered)
- [ ] Hide "Course Access Management" tab if user lacks `role.manage.all`
- [ ] Hide "User Management" tab if user lacks `user.manage.all`
- [ ] Hide "Role Management" tab if user lacks `role.manage.all`

#### Visual Permission Matrix example(all tabs not included it is just example)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD TABS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tab/Feature              │  .all Permission  │  .own Permission│
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Course Access Mgmt       │       ✅ SHOW     │     ❌ HIDE     │
│  User Management          │       ✅ SHOW     │     ❌ HIDE     │
│  Role Management          │       ✅ SHOW     │     ❌ HIDE     │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Courses Tab              │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL COURSES   │   ASSIGNED ONLY │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Analytics Tab            │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL DATA      │   FILTERED DATA │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Revenue Tab              │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL REVENUE   │   FILTERED REV  │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Announcements Tab        │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL COURSES   │   ASSIGNED ONLY │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Discussions Tab          │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL COURSES   │   ASSIGNED ONLY │
│  ─────────────────────────┼──────────────────┼─────────────────│
│  Feedback Tab             │       ✅ SHOW     │     ✅ SHOW     │
│    └─ Data Shown          │    ALL COURSES   │   ASSIGNED ONLY │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

KEY:
✅ SHOW = Tab is visible in the UI
❌ HIDE = Tab is not visible in the UI
ALL = User sees data for all courses
ASSIGNED ONLY / FILTERED = User sees data only for their assigned courses
```

#### API Endpoint Permission Check

Before calling any endpoint, the frontend should verify the user has the required permission:

```javascript
// Example permission check before API call
async function updateCourse(courseId, data, userPermissions) {
  // Check if user has permission (.all OR .own)
  const hasGlobalAccess = userPermissions.includes('course.manage.all');
  const hasCourseAccess = userPermissions.includes('course.manage.own');
  
  if (!hasGlobalAccess && !hasCourseAccess) {
    throw new Error('Insufficient permissions');
  }
  
  // If user has .own permission, verify they have access to this course
  if (!hasGlobalAccess && hasCourseAccess) {
    const userCourses = await getUserAssignedCourses();
    if (!userCourses.some(c => c.course_id === courseId)) {
      throw new Error('No access to this course');
    }
  }
  
  // Proceed with API call
  return await api.put(`/admin/courses/update/${courseId}`, data);
}
```

---

## Business Rules

### User Type Restrictions

- Only **managerial users (type 1)** can be assigned course access
- Regular users (type 3) and other types are rejected with error
- Validation occurs at both application and database levels

### Access Control

- Users with `.all` permissions can access all courses
- Users with `.own` permissions can only access assigned courses
- Course access is checked automatically by middleware

### Data Integrity

- **Unique Constraint**: One user can only have one access record per course
- **Cascade Delete**: Deleting a course or user removes all related access records
- **Audit Trail**: All access assignments record who created them (`created_by`)

### Permission Hierarchy

```
role.manage.all (Admin)
  ↓
  Can assign/remove course access
  Can view all course access records
  
revenue.manage.all / analytics.manage.all
  ↓
  Can view all course data
  
revenue.manage.own / analytics.manage.own
  ↓
  Can only view assigned course data
  Requires course_access record
```

---

## Testing

### Test Coverage

- ✅ 36+ automated test cases
- ✅ Integration tests for all endpoints
- ✅ Component tests for helpers and middleware
- ✅ Scope tests for permission resolution
- ✅ User type validation tests
- ✅ Cascade delete tests
- ✅ Audit trail tests

### Running Tests

```bash
# Run all course access tests
node testing/test-course-access-api.js
node testing/test-course-access-scope.js
node testing/test-course-access-middleware.js

# Run revenue API tests (includes course access)
node testing/test-revenue-api.js
```

---

## Changelog

### Version 1.0.0 (March 11, 2026)

- Initial release of Course Access Management API
- Support for assigning/removing course access
- Support for listing users and courses
- Integration with revenue and analytics endpoints
- User type validation (type 1 only)
- Comprehensive test coverage

---

## Support

For issues or questions:
- Check the test files for usage examples
- Review the design document: `.kiro/specs/course-access-control/design.md`
- Review the requirements: `.kiro/specs/course-access-control/requirements.md`

---

**Last Updated**: March 11, 2026  
**API Version**: 1.0.0  
**Status**: Production Ready ✅
