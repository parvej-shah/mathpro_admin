# Analytics V2 API - Frontend Integration Guide

**Version:** 1.0  
**Date:** December 2025  
**Purpose:** Complete guide for frontend developers to integrate Analytics V2 API endpoints

---

## **📋 TABLE OF CONTENTS**

1. [Overview & Context](#overview--context)
2. [Architecture & Design Decisions](#architecture--design-decisions)
3. [Authentication](#authentication)
4. [Common Patterns](#common-patterns)
5. [Metadata & Help Text API](#-metadata--help-text-api)
6. [Endpoint Documentation](#endpoint-documentation)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Integration Examples](#integration-examples)
10. [Data Visualization Recommendations](#data-visualization-recommendations)

---

## **📖 OVERVIEW & CONTEXT**

### **What is Analytics V2?**

Analytics V2 is a comprehensive analytics and dashboard API system built for the Math Pro course selling platform. It provides detailed insights into:

- **Revenue Analytics** - Track revenue from courses, bundles, and coupons
- **User Analytics** - Monitor user growth, engagement, and activity
- **Course Analytics** - Analyze course performance, enrollments, and completion rates
- **Learning Analytics** - Track learning progress, streaks, and module completion
- **Engagement Analytics** - Monitor discussions, submissions, and user participation
- **Payment Analytics** - Track payment success rates and transaction details

### **Why Analytics V2?**

The original analytics system had limitations. Analytics V2 was built to:

1. **Provide Comprehensive Insights** - Track all aspects of the platform in one unified system
2. **Improve Performance** - Optimized queries with pagination and efficient data fetching
3. **Better Organization** - RESTful API structure with clear endpoint naming
4. **Future-Proof** - Built with extensibility in mind for future features
5. **Developer-Friendly** - Consistent response formats, clear error messages, comprehensive documentation

### **Key Constraints & Principles**

The Analytics V2 API was built with these critical constraints in mind:

1. **✅ PostgreSQL Only** - No Redis, no external caching systems. All data comes directly from PostgreSQL.
2. **✅ Database-Friendly** - Data is fetched in smaller chunks using pagination to avoid overwhelming the database.
3. **✅ Read-Only Analytics** - These APIs are **ONLY** for reading analytics data. They do NOT modify existing APIs or data.
4. **✅ Existing Data Only** - Only built analytics for data we currently track. No new tracking was added.
5. **✅ Simple & Practical** - No over-engineering, no fancy features, just what's needed.
6. **✅ No Background Jobs** - No cron jobs, no auto-refresh, no materialized views.
7. **✅ Client-Side Caching** - Caching is handled on the client-side (localStorage) if needed.

### **What Data Sources Are Used?**

The Analytics V2 API consumes data from these existing database tables:

- **User Data:** `managerial_auth` (users, admins, moderators)
- **Enrollment Data:** `takes` (course enrollments), `bundle_purchase` (bundle purchases)
- **Payment Data:** `payment_audit_log` (payment attempts and status)
- **Learning Data:** `progress` (module completion), `user_course_streaks` (learning streaks)
- **Engagement Data:** `discussion`, `sub_discussion`, `submission`
- **Course/Bundle Data:** `course`, `bundle`, `chapter`, `module`
- **Coupon Data:** `coupons`, `coupon_usage`

**Important:** The API does NOT modify any of these tables. It only reads data for analytics purposes.

---

## **🏗️ ARCHITECTURE & DESIGN DECISIONS**

### **API Structure**

All Analytics V2 endpoints follow this pattern:

```
GET /v2/admin/analytics/{category}/{action}
```

**Examples:**

- `/v2/admin/analytics/dashboard/overview`
- `/v2/admin/analytics/revenue/summary`
- `/v2/admin/analytics/users/growth`

### **Response Format**

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "meta": {
    // Optional metadata (pagination, date ranges, etc.)
  }
}
```

### **Error Format**

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### **Date Handling**

- **Format:** Unix timestamps (seconds, not milliseconds)
- **Timezone:** All dates are in UTC
- **Display:** Frontend should convert to local timezone (Dhaka, Bangladesh) for display
- **Presets:** Support for common date presets (`today`, `this_month`, `last_30_days`, etc.)

### **Pagination**

- **Default Limit:** 20 items per page
- **Maximum Limit:** 100 items per page
- **Offset:** 0-based indexing
- **Response:** Includes `meta` object with `total`, `limit`, `offset`

---

## **🔐 AUTHENTICATION**

### **Required Authentication**

All Analytics V2 endpoints require **Admin Authentication** using JWT Bearer tokens.

### **How to Authenticate**

1. **Get Admin Token:**

   ```javascript
   // Login endpoint (existing API)
   POST /admin/auth/login
   {
     "login": "admin@example.com",
     "password": "password"
   }

   // Response
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": { ... }
     }
   }
   ```

2. **Include Token in Requests:**
   ```javascript
   headers: {
     'Authorization': `Bearer ${adminToken}`,
     'Content-Type': 'application/json'
   }
   ```

### **Token Expiration**

- Tokens expire after a certain period (check your auth system)
- Handle 401 responses by redirecting to login
- Implement token refresh if your system supports it

---

## **🔧 COMMON PATTERNS**

### **1. Date Presets**

Use these preset values for quick date filtering:

```javascript
const datePresets = {
  allTime: "all_time", // Fetch all-time data (no date filtering)
  today: "today",
  yesterday: "yesterday",
  thisWeek: "this_week",
  lastWeek: "last_week",
  thisMonth: "this_month",
  lastMonth: "last_month",
  thisQuarter: "this_quarter",
  lastQuarter: "last_quarter",
  thisYear: "this_year",
  lastYear: "last_year",
  last7Days: "last_7_days",
  last30Days: "last_30_days",
  last90Days: "last_90_days",
  last365Days: "last_365_days",
};
```

**Note:** You can also fetch all-time data by:

- Using `period=all_time` or `period=all`
- Omitting both `start_date` and `end_date` parameters

### **2. Custom Date Ranges**

For custom date ranges, use Unix timestamps:

```javascript
// Get Unix timestamp (seconds)
const startDate = Math.floor(new Date('2025-01-01').getTime() / 1000);
const endDate = Math.floor(new Date('2025-01-31').getTime() / 1000);

// Use in API call
GET /v2/admin/analytics/revenue/summary?start_date=${startDate}&end_date=${endDate}
```

### **3. Pagination Pattern**

```javascript
// Initial load
const limit = 20;
const offset = 0;

// Load more
const nextOffset = offset + limit;

// Check if more data available
if (response.meta.offset + response.meta.limit < response.meta.total) {
  // Load more
}
```

### **4. Error Handling Pattern**

```javascript
try {
  const response = await fetchAnalyticsData();
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
    showError(response.error);
  }
} catch (error) {
  // Handle network/other errors
  showError("Network error. Please try again.");
}
```

---

## **📊 METADATA & HELP TEXT API**

### **Overview**

The Analytics V2 API provides metadata endpoints that return help text, labels, units, and categories for all data points. Use these to display tooltips, help icons, and contextual information in your frontend.

### **Endpoints**

#### **1. Get All Metadata**

**Endpoint:** `GET /v2/admin/analytics/metadata`

**Purpose:** Get complete metadata for all data points across all categories.

**Response:**

```json
{
  "success": true,
  "data": {
    "dashboard": {
      "summary": {
        "total_revenue": {
          "label": "Total Revenue",
          "helpText": "Total revenue generated from all course enrollments and bundle purchases since platform launch. This is cumulative revenue.",
          "unit": "currency",
          "category": "revenue"
        },
        "total_users": {
          "label": "Total Users",
          "helpText": "Total number of registered users (type 3) in the system. Includes all users regardless of activity status.",
          "unit": "users",
          "category": "users"
        }
      },
      "operational": { ... },
      "revenue": { ... },
      "enrollments": { ... }
    },
    "revenue": { ... },
    "users": { ... },
    "courses": { ... },
    "bundles": { ... },
    "learning": { ... },
    "engagement": { ... },
    "coupons": { ... },
    "payments": { ... }
  }
}
```

#### **2. Get Category Metadata**

**Endpoint:** `GET /v2/admin/analytics/metadata/{category}`

**Purpose:** Get metadata for all data points in a specific category.

**Categories:** `dashboard`, `revenue`, `users`, `courses`, `bundles`, `learning`, `engagement`, `coupons`, `payments`

**Example:**

```javascript
GET / v2 / admin / analytics / metadata / dashboard;
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": { ... },
      "total_users": { ... }
    },
    "operational": { ... }
  }
}
```

#### **3. Get Specific Data Point Metadata**

**Endpoint:** `GET /v2/admin/analytics/metadata/{category}/{key}`

**Purpose:** Get metadata for a specific data point.

**Example:**

```javascript
GET / v2 / admin / analytics / metadata / dashboard / summary / total_revenue;
```

**Response:**

```json
{
  "success": true,
  "data": {
    "label": "Total Revenue",
    "helpText": "Total revenue generated from all course enrollments and bundle purchases since platform launch. This is cumulative revenue.",
    "unit": "currency",
    "category": "revenue"
  }
}
```

### **Frontend Integration Example**

```javascript
// Fetch metadata on app load
const metadataResponse = await fetch("/v2/admin/analytics/metadata", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const { data: metadata } = await metadataResponse.json();

// Display help text for a data point
function MetricCard({ category, key, value }) {
  // Navigate nested structure (e.g., dashboard.summary.total_revenue)
  const keys = key.split(".");
  let meta = metadata[category];
  for (const k of keys) {
    meta = meta?.[k];
  }

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{meta?.label || key}</span>
        {meta?.helpText && (
          <Tooltip content={meta.helpText}>
            <HelpIcon />
          </Tooltip>
        )}
      </div>
      <div className="metric-value">{formatValue(value, meta?.unit)}</div>
    </div>
  );
}

// Format value based on unit
function formatValue(value, unit) {
  switch (unit) {
    case "currency":
      return `৳${value.toLocaleString()}`;
    case "percentage":
      return `${value}%`;
    case "users":
    case "courses":
    case "enrollments":
      return value.toLocaleString();
    default:
      return value;
  }
}

// Usage example
<MetricCard
  category="dashboard"
  key="summary.total_revenue"
  value={dashboardData.summary.total_revenue}
/>;
```

### **Metadata Structure**

Each data point has:

- **`label`** - Display name (e.g., "Total Revenue")
- **`helpText`** - Detailed explanation of what the metric means
- **`unit`** - Unit type (`currency`, `percentage`, `users`, `courses`, `enrollments`, `days`, etc.)
- **`category`** - Category for grouping (`revenue`, `users`, `engagement`, etc.)

### **Best Practices**

1. **Fetch Once:** Load metadata on app initialization, not on every request
2. **Cache Locally:** Store metadata in localStorage or state management
3. **Show Help Icons:** Add a small help icon (?) next to metric labels
4. **Tooltips:** Display help text in tooltips on hover
5. **Format Values:** Use the `unit` field to format values correctly

---

## **📡 ENDPOINT DOCUMENTATION**

### **1. Dashboard Overview**

**Purpose:** Get a comprehensive overview of platform metrics for the dashboard.

**Endpoint:** `GET /v2/admin/analytics/dashboard/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp in seconds. Omit for all-time data.
- `end_date` (optional, integer): Unix timestamp in seconds. Omit for all-time data.
- `period` (optional, string): Date preset (`today`, `this_month`, `last_30_days`, `all_time`, etc.). Use `all_time` or `all` for all-time data.

**Request Example:**

```javascript
// With period preset
GET /v2/admin/analytics/dashboard/overview?period=this_month

// All-time data
GET /v2/admin/analytics/dashboard/overview?period=all_time

// All-time data (alternative - omit dates)
GET /v2/admin/analytics/dashboard/overview
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_users": 1000,
      "total_courses": 50,
      "total_bundles": 10,
      "total_revenue": 5000000,
      "total_enrollments": 2000,
      "active_users_30d": 500
    },
    "operational": {
      "recent_enrollments_24h": 10,
      "recent_payments_24h": 10,
      "recent_payment_amount_24h": 50000,
      "failed_payment_rate_24h": 5.0
    },
    "revenue": {
      "current": 500000,
      "previous": 450000,
      "growth_percentage": "11.11"
    },
    "enrollments": {
      "current": 100,
      "previous": 90,
      "growth_percentage": "11.11"
    },
    "top_courses": [
      {
        "course_id": 1,
        "title": "Course Name",
        "enrollments": 200,
        "revenue": 2000000
      }
    ],
    "top_bundles": [
      {
        "bundle_id": 1,
        "title": "Bundle Name",
        "purchases": 50,
        "revenue": 500000
      }
    ]
  },
  "meta": {
    "period": "this_month",
    "start_date": 1704067200,
    "end_date": 1706659200
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Use this endpoint for the main dashboard page
- Display summary cards with key metrics
- Show growth percentages with up/down indicators
- Display top courses and bundles in tables or cards
- Update when date range changes

---

### **2. Revenue Summary**

**Purpose:** Get comprehensive revenue summary with breakdowns.

**Endpoint:** `GET /v2/admin/analytics/revenue/summary`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `group_by` (optional, string): `day`, `week`, `month`, `quarter`, `year`
- `course_id` (optional, integer): Filter by course
- `bundle_id` (optional, integer): Filter by bundle

**Request Example:**

```javascript
GET /v2/admin/analytics/revenue/summary?start_date=1704067200&end_date=1706659200&group_by=month
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_revenue": 5000000,
    "course_revenue": 4000000,
    "bundle_revenue": 1000000,
    "with_coupon_revenue": 500000,
    "without_coupon_revenue": 4500000,
    "discount_given": 500000,
    "average_order_value": 2500,
    "total_transactions": 2000,
    "trends": [
      {
        "period": "2025-01",
        "revenue": 500000,
        "enrollments": 200
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display revenue breakdown in pie charts or bar charts
- Show coupon impact (with vs without coupon revenue)
- Display trends over time if `group_by` is provided
- Use for revenue reports and financial dashboards

---

### **3. Revenue Trends**

**Purpose:** Get revenue trends over time with detailed breakdowns.

**Endpoint:** `GET /v2/admin/analytics/revenue/trends`

**Query Parameters:**

- `start_date` (required, integer): Unix timestamp
- `end_date` (required, integer): Unix timestamp
- `group_by` (optional, string): `day`, `week`, `month`, `quarter`, `year` (default: `day`)
- `course_id` (optional, integer): Filter by course
- `bundle_id` (optional, integer): Filter by bundle

**Request Example:**

```javascript
GET /v2/admin/analytics/revenue/trends?start_date=1704067200&end_date=1706659200&group_by=day
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2025-01-01",
        "revenue": 50000,
        "enrollments": 20,
        "course_revenue": 40000,
        "bundle_revenue": 10000
      }
    ],
    "summary": {
      "total_revenue": 500000,
      "average_daily_revenue": 16666.67
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required `start_date` or `end_date`
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Perfect for line charts showing revenue over time
- Use `group_by` to control chart granularity (daily, weekly, monthly)
- Display course vs bundle revenue breakdown
- Show summary statistics (total, average)

---

### **4. Revenue by Course**

**Purpose:** Get revenue breakdown by individual courses.

**Endpoint:** `GET /v2/admin/analytics/revenue/by-course`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `limit` (optional, integer): Default 20, max 100
- `offset` (optional, integer): Default 0
- `sort_by` (optional, string): `revenue` or `enrollments` (default: `revenue`)
- `order` (optional, string): `asc` or `desc` (default: `desc`)

**Request Example:**

```javascript
GET /v2/admin/analytics/revenue/by-course?limit=10&sort_by=revenue&order=desc
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "course_id": 1,
        "title": "Course Name",
        "revenue": 2000000,
        "enrollments": 200,
        "average_revenue_per_student": 10000,
        "with_coupon_revenue": 200000,
        "without_coupon_revenue": 1800000
      }
    ],
    "meta": {
      "total": 50,
      "limit": 10,
      "offset": 0
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display in a sortable table
- Implement pagination using `limit` and `offset`
- Allow sorting by revenue or enrollments
- Show coupon impact per course
- Use for course performance reports

---

### **5. Revenue by Bundle**

**Purpose:** Get revenue breakdown by individual bundles.

**Endpoint:** `GET /v2/admin/analytics/revenue/by-bundle`

**Query Parameters:** Same as Revenue by Course

**Request Example:**

```javascript
GET /v2/admin/analytics/revenue/by-bundle?limit=10&sort_by=revenue&order=desc
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bundles": [
      {
        "bundle_id": 1,
        "title": "Bundle Name",
        "revenue": 1000000,
        "purchases": 50,
        "average_revenue_per_purchase": 20000,
        "with_coupon_revenue": 100000,
        "without_coupon_revenue": 900000
      }
    ],
    "meta": {
      "total": 10,
      "limit": 10,
      "offset": 0
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Similar to Revenue by Course
- Display in sortable table with pagination
- Show bundle performance metrics

---

### **6. Revenue Predictions**

**Purpose:** Get simple revenue predictions based on historical data.

**Endpoint:** `GET /v2/admin/analytics/revenue/predictions`

**Query Parameters:**

- `period` (required, string): `week`, `month`, `quarter`, `year`
- `method` (optional, string): `average` or `trend` (default: `average`)

**Request Example:**

```javascript
GET /v2/admin/analytics/revenue/predictions?period=month&method=average
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "prediction": {
      "period": "next_month",
      "predicted_revenue": 550000,
      "confidence": "medium",
      "method": "average",
      "based_on": {
        "historical_periods": 6,
        "average_revenue": 500000,
        "growth_rate": 0.1
      }
    },
    "disclaimer": "Predictions are based on simple historical averages and trends. Actual results may vary."
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required `period` parameter
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display predictions with confidence indicators
- Show disclaimer about prediction accuracy
- Use for forecasting dashboards
- Display historical vs predicted comparison

---

### **7. User Overview**

**Purpose:** Get comprehensive user statistics and metrics.

**Endpoint:** `GET /v2/admin/analytics/users/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / users / overview;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_users": 1000,
    "regular_users": 950,
    "admins": 50,
    "new_users_today": 10,
    "new_users_this_month": 100,
    "new_users_in_range": 100,
    "active_users_7d": 300,
    "active_users_30d": 500,
    "paying_users": 600,
    "conversion_rate": 63.16
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display user metrics in cards or dashboard widgets
- Show conversion rate prominently
- Display active user counts with time ranges
- Use for user management dashboards

---

### **8. User Growth**

**Purpose:** Get user growth trends over time.

**Endpoint:** `GET /v2/admin/analytics/users/growth`

**Query Parameters:**

- `start_date` (required, integer): Unix timestamp
- `end_date` (required, integer): Unix timestamp
- `group_by` (optional, string): `day`, `week`, `month`, `quarter`, `year` (default: `month`)

**Request Example:**

```javascript
GET /v2/admin/analytics/users/growth?start_date=1704067200&end_date=1706659200&group_by=month
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "growth": [
      {
        "period": "2025-01",
        "new_users": 100,
        "total_users": 1000,
        "paying_users": 60
      }
    ],
    "summary": {
      "total_new_users": 100,
      "average_daily_new_users": 3.33
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required `start_date` or `end_date`
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Perfect for line charts showing user growth
- Display new users vs total users
- Show paying users trend
- Use for growth analysis reports

---

### **9. User Engagement**

**Purpose:** Get user engagement metrics and activity statistics.

**Endpoint:** `GET /v2/admin/analytics/users/engagement`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `user_id` (optional, integer): Filter by specific user

**Request Example:**

```javascript
GET /v2/admin/analytics/users/engagement?user_id=123
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "active_users_7d": 300,
    "active_users_30d": 500,
    "users_with_progress": 400,
    "users_with_discussions": 200,
    "users_with_submissions": 150,
    "average_modules_completed": 5.5,
    "average_streak_days": 7.2
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display engagement metrics in dashboard
- Show activity breakdown (progress, discussions, submissions)
- Use for user engagement analysis
- Filter by specific user for individual profiles

---

### **10. Course Overview**

**Purpose:** Get comprehensive course statistics and performance metrics.

**Endpoint:** `GET /v2/admin/analytics/courses/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `course_id` (optional, integer): Filter by specific course

**Request Example:**

```javascript
GET /v2/admin/analytics/courses/overview?course_id=1
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_courses": 50,
    "live_courses": 45,
    "total_enrollments": 2000,
    "average_enrollments_per_course": 40,
    "top_courses": [
      {
        "course_id": 1,
        "title": "Course Name",
        "enrollments": 200,
        "revenue": 2000000,
        "completion_rate": 65.5
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display course statistics in overview cards
- Show top courses with performance metrics
- Use for course management dashboards
- Filter by specific course for detailed view

---

### **11. Course Detailed Analytics**

**Purpose:** Get detailed analytics for a specific course.

**Endpoint:** `GET /v2/admin/analytics/courses/:courseId/detailed`

**Path Parameters:**

- `courseId` (required, integer): Course ID

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / courses / 1 / detailed;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "Course Name",
      "price": 10000
    },
    "enrollments": {
      "total": 200,
      "this_month": 20,
      "last_month": 15,
      "growth_percentage": "33.33"
    },
    "revenue": {
      "total": 2000000,
      "this_month": 200000,
      "last_month": 150000
    },
    "completion": {
      "total_enrolled": 200,
      "completed": 131,
      "in_progress": 50,
      "not_started": 19,
      "completion_rate": 65.5
    },
    "engagement": {
      "discussions": 100,
      "submissions": 150,
      "average_streak": 7.2
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid course ID format
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Course not found or server error

**Integration Notes:**

- Use for detailed course analytics pages
- Display enrollment trends with growth indicators
- Show completion rate with progress breakdown
- Display engagement metrics
- Use for course performance reports

---

### **12. Course Completion**

**Purpose:** Get course completion statistics across all courses.

**Endpoint:** `GET /v2/admin/analytics/courses/completion`

**Query Parameters:**

- `course_id` (optional, integer): Filter by course
- `limit` (optional, integer): Default 20, max 100
- `offset` (optional, integer): Default 0

**Request Example:**

```javascript
GET /v2/admin/analytics/courses/completion?limit=20&offset=0
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "course_id": 1,
        "title": "Course Name",
        "total_enrolled": 200,
        "completed": 131,
        "in_progress": 50,
        "not_started": 19,
        "completion_rate": 65.5
      }
    ],
    "meta": {
      "total": 50,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display in sortable table with pagination
- Show completion rates with progress bars
- Filter by specific course
- Use for completion analysis reports

---

### **13. Bundle Overview**

**Purpose:** Get comprehensive bundle statistics and performance metrics.

**Endpoint:** `GET /v2/admin/analytics/bundles/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / bundles / overview;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_bundles": 10,
    "live_bundles": 8,
    "total_purchases": 500,
    "total_revenue": 5000000,
    "average_revenue_per_bundle": 500000,
    "top_bundles": [
      {
        "bundle_id": 1,
        "title": "Bundle Name",
        "purchases": 50,
        "revenue": 500000
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display bundle statistics in overview cards
- Show top bundles with performance metrics
- Use for bundle management dashboards

---

### **14. Bundle Detailed Analytics**

**Purpose:** Get detailed analytics for a specific bundle.

**Endpoint:** `GET /v2/admin/analytics/bundles/:bundleId/detailed`

**Path Parameters:**

- `bundleId` (required, integer): Bundle ID

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / bundles / 1 / detailed;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bundle": {
      "id": 1,
      "title": "Bundle Name",
      "price": 50000
    },
    "purchases": {
      "total": 50,
      "this_month": 5,
      "last_month": 4,
      "growth_percentage": "25.00"
    },
    "revenue": {
      "total": 2500000,
      "this_month": 250000,
      "last_month": 200000
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid bundle ID format
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Bundle not found or server error

**Integration Notes:**

- Use for detailed bundle analytics pages
- Display purchase trends with growth indicators
- Show revenue breakdown
- Use for bundle performance reports

---

### **15. Learning Progress**

**Purpose:** Get learning progress statistics and module completion data.

**Endpoint:** `GET /v2/admin/analytics/learning/progress`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `course_id` (optional, integer): Filter by course

**Request Example:**

```javascript
GET /v2/admin/analytics/learning/progress?course_id=1
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_modules_completed": 5000,
    "active_learners_30d": 400,
    "total_progress_records": 10000,
    "average_completion_rate": 65.5,
    "top_learners": [
      {
        "user_id": 123,
        "name": "User Name",
        "modules_completed": 50,
        "current_streak": 10
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display progress metrics in dashboard
- Show top learners leaderboard
- Filter by course for course-specific progress
- Use for learning analytics reports

---

### **16. Streak Analytics**

**Purpose:** Get learning streak statistics and leaderboards.

**Endpoint:** `GET /v2/admin/analytics/learning/streaks`

**Query Parameters:**

- `course_id` (optional, integer): Filter by course
- `limit` (optional, integer): Default 20, max 100
- `offset` (optional, integer): Default 0

**Request Example:**

```javascript
GET /v2/admin/analytics/learning/streaks?limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "streaks": [
      {
        "user_id": 123,
        "name": "User Name",
        "course_id": 1,
        "course_title": "Course Name",
        "current_streak": 10,
        "longest_streak": 15,
        "last_activity_date": "2025-01-15"
      }
    ],
    "meta": {
      "total": 200,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display streak leaderboard
- Show current vs longest streak
- Filter by course for course-specific streaks
- Use for gamification features

---

### **17. Discussion Analytics**

**Purpose:** Get discussion activity statistics and engagement metrics.

**Endpoint:** `GET /v2/admin/analytics/engagement/discussions`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `course_id` (optional, integer): Filter by course
- `module_id` (optional, integer): Filter by module

**Request Example:**

```javascript
GET /v2/admin/analytics/engagement/discussions?course_id=1
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_discussions": 1000,
    "total_replies": 5000,
    "active_discussions_30d": 200,
    "unique_participants": 300,
    "average_replies_per_discussion": 5.0,
    "top_discussions": [
      {
        "discussion_id": 1,
        "module_id": 10,
        "course_id": 1,
        "replies": 50,
        "participants": 20
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display discussion activity metrics
- Show top discussions by engagement
- Filter by course or module
- Use for engagement analysis

---

### **18. Submission Analytics**

**Purpose:** Get assignment submission statistics and activity metrics.

**Endpoint:** `GET /v2/admin/analytics/engagement/submissions`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `course_id` (optional, integer): Filter by course

**Request Example:**

```javascript
GET /v2/admin/analytics/engagement/submissions?course_id=1
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_submissions": 2000,
    "submissions_this_month": 200,
    "unique_submitters": 500,
    "average_submissions_per_user": 4.0,
    "top_submitters": [
      {
        "user_id": 123,
        "name": "User Name",
        "submissions": 50
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display submission activity metrics
- Show top submitters leaderboard
- Filter by course
- Use for engagement analysis

---

### **19. Coupon Overview**

**Purpose:** Get comprehensive coupon usage statistics and performance metrics.

**Endpoint:** `GET /v2/admin/analytics/coupons/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / coupons / overview;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_coupons": 50,
    "active_coupons": 30,
    "total_usage": 1000,
    "total_discount_given": 500000,
    "conversion_rate": 10.5,
    "top_coupons": [
      {
        "coupon_id": 1,
        "code": "SAVE20",
        "usage_count": 100,
        "discount_given": 50000
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display coupon performance metrics
- Show top coupons by usage
- Display conversion rate
- Use for coupon management dashboards

---

### **20. Coupon Performance**

**Purpose:** Get detailed performance metrics for individual coupons.

**Endpoint:** `GET /v2/admin/analytics/coupons/performance`

**Query Parameters:**

- `coupon_id` (optional, integer): Filter by coupon
- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp
- `limit` (optional, integer): Default 20, max 100
- `offset` (optional, integer): Default 0

**Request Example:**

```javascript
GET /v2/admin/analytics/coupons/performance?limit=20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "coupons": [
      {
        "coupon_id": 1,
        "code": "SAVE20",
        "usage_count": 100,
        "discount_given": 50000,
        "revenue_generated": 200000,
        "conversion_rate": 10.5
      }
    ],
    "meta": {
      "total": 50,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display coupon performance in sortable table
- Show usage, discount, and revenue metrics
- Filter by specific coupon
- Use for coupon optimization analysis

---

### **21. Payment Overview**

**Purpose:** Get payment statistics and transaction success rates.

**Endpoint:** `GET /v2/admin/analytics/payments/overview`

**Query Parameters:**

- `start_date` (optional, integer): Unix timestamp
- `end_date` (optional, integer): Unix timestamp

**Request Example:**

```javascript
GET / v2 / admin / analytics / payments / overview;
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_payments": 2000,
    "successful_payments": 1900,
    "failed_payments": 100,
    "success_rate": 95.0,
    "total_amount": 5000000,
    "trends": [
      {
        "period": "2025-01",
        "successful": 100,
        "failed": 5
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Display payment success rate prominently
- Show payment trends over time
- Display failed payment analysis
- Use for payment monitoring dashboards

---

### **22. Filter Options**

**Purpose:** Get dropdown options for filters (courses, bundles, coupons, users, teachers).

**Endpoint:** `GET /v2/admin/analytics/filters/options`

**Query Parameters:**

- `type` (required, string): `courses`, `bundles`, `coupons`, `users`, `teachers`

**Request Example:**

```javascript
GET /v2/admin/analytics/filters/options?type=courses
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "options": [
      {
        "id": 1,
        "name": "Course Name",
        "value": 1
      }
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid `type` parameter
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

**Integration Notes:**

- Use to populate filter dropdowns
- Support all filter types (courses, bundles, coupons, users, teachers)
- Cache results in localStorage for performance
- Refresh when needed (e.g., new courses added)

---

## **⚠️ ERROR HANDLING**

### **Common Error Responses**

#### **401 Unauthorized**

```json
{
  "success": false,
  "error": "Unauthorized. Please login."
}
```

**Handling:**

- Redirect user to login page
- Clear stored tokens
- Show login prompt

#### **400 Bad Request**

```json
{
  "success": false,
  "error": "Missing required parameter: start_date"
}
```

**Handling:**

- Show error message to user
- Highlight missing/invalid fields
- Provide guidance on correct format

#### **500 Internal Server Error**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Handling:**

- Show generic error message
- Log error for debugging
- Allow user to retry
- Contact support if persistent

### **Error Handling Best Practices**

1. **Always Check `success` Field:**

   ```javascript
   if (response.success) {
     // Handle success
   } else {
     // Handle error
     showError(response.error);
   }
   ```

2. **Handle Network Errors:**

   ```javascript
   try {
     const response = await fetchData();
   } catch (error) {
     if (error.name === "NetworkError") {
       showError("Network error. Please check your connection.");
     } else {
       showError("An unexpected error occurred.");
     }
   }
   ```

3. **Show User-Friendly Messages:**

   - Don't show raw error messages
   - Translate technical errors to user-friendly language
   - Provide actionable guidance

4. **Retry Logic:**
   - Implement retry for network errors
   - Use exponential backoff
   - Limit retry attempts

---

## **✅ BEST PRACTICES**

### **1. Caching Strategy**

Since the API doesn't use server-side caching, implement client-side caching:

```javascript
// Cache responses in localStorage
const cacheKey = `analytics_${endpoint}_${params}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  const data = JSON.parse(cached);
  const age = Date.now() - data.timestamp;
  if (age < 5 * 60 * 1000) {
    // 5 minutes
    return data.response;
  }
}

// Fetch fresh data
const response = await fetchAnalytics();
localStorage.setItem(
  cacheKey,
  JSON.stringify({
    response,
    timestamp: Date.now(),
  })
);
```

### **2. Loading States**

Always show loading indicators:

```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get("/analytics/dashboard/overview");
    setData(response.data);
  } finally {
    setLoading(false);
  }
};
```

### **3. Pagination Implementation**

Implement proper pagination:

```javascript
const [page, setPage] = useState(0);
const limit = 20;

const fetchPage = async (offset) => {
  const response = await api.get("/analytics/revenue/by-course", {
    params: { limit, offset },
  });
  return response.data;
};

// Load more
const loadMore = async () => {
  const nextOffset = (page + 1) * limit;
  const data = await fetchPage(nextOffset);
  setData([...data, ...data.courses]);
  setPage(page + 1);
};
```

### **4. Date Range Selection**

Provide user-friendly date pickers:

```javascript
// Convert date picker to Unix timestamp
const startDate = Math.floor(startDatePicker.getTime() / 1000);
const endDate = Math.floor(endDatePicker.getTime() / 1000);

// Or use presets
const presets = {
  "Last 7 Days": "last_7_days",
  "Last 30 Days": "last_30_days",
  "This Month": "this_month",
  // etc.
};
```

### **5. Data Visualization**

- Use appropriate chart types:
  - **Line Charts:** Trends over time (revenue, user growth)
  - **Bar Charts:** Comparisons (revenue by course, top performers)
  - **Pie Charts:** Breakdowns (revenue sources, user types)
  - **Tables:** Detailed data with sorting and pagination

### **6. Performance Optimization**

- **Debounce Search/Filter:** Don't fetch on every keystroke
- **Lazy Load:** Load data as needed (infinite scroll, pagination)
- **Memoization:** Cache computed values
- **Request Batching:** Combine multiple requests when possible

---

## **💻 INTEGRATION EXAMPLES**

### **React Example**

```javascript
import { useState, useEffect } from "react";
import axios from "axios";

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "/v2/admin/analytics/dashboard/overview",
        {
          headers: {
            Authorization: `Bearer ${getAdminToken()}`,
          },
          params: {
            period: "this_month",
          },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <div>
      <SummaryCards data={data.summary} />
      <RevenueChart data={data.revenue} />
      <TopCoursesTable data={data.top_courses} />
    </div>
  );
};
```

### **Vue.js Example**

```javascript
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <SummaryCards :data="data.summary" />
      <RevenueChart :data="data.revenue" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      data: null,
      loading: true,
      error: null
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        this.loading = true;
        const response = await axios.get(
          '/v2/admin/analytics/dashboard/overview',
          {
            headers: {
              'Authorization': `Bearer ${this.getAdminToken()}`
            },
            params: {
              period: 'this_month'
            }
          }
        );

        if (response.data.success) {
          this.data = response.data.data;
        } else {
          this.error = response.data.error;
        }
      } catch (err) {
        this.error = 'Failed to load dashboard data';
      } finally {
        this.loading = false;
      }
    },
    getAdminToken() {
      return localStorage.getItem('admin_token');
    }
  }
};
</script>
```

### **Vanilla JavaScript Example**

```javascript
async function fetchAnalyticsData(endpoint, params = {}) {
  const token = localStorage.getItem("admin_token");
  const baseUrl = "http://localhost:4000";

  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}/v2/admin/analytics/${endpoint}?${queryString}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Analytics API Error:", error);
    throw error;
  }
}

// Usage
const dashboardData = await fetchAnalyticsData("dashboard/overview", {
  period: "this_month",
});
```

---

## **📊 DATA VISUALIZATION RECOMMENDATIONS**

### **Dashboard Overview**

- **Summary Cards:** Total users, courses, revenue, enrollments
- **Growth Indicators:** Show percentage changes with up/down arrows
- **Top Lists:** Top 10 courses and bundles in tables or cards
- **Quick Stats:** Recent enrollments, payments, active users

### **Revenue Analytics**

- **Line Charts:** Revenue trends over time
- **Bar Charts:** Revenue by course/bundle
- **Pie Charts:** Revenue breakdown (course vs bundle, with vs without coupon)
- **Tables:** Detailed revenue data with sorting

### **User Analytics**

- **Line Charts:** User growth over time
- **Bar Charts:** Active users by time period
- **Cards:** Conversion rate, paying users
- **Tables:** User engagement metrics

### **Course Analytics**

- **Progress Bars:** Completion rates
- **Line Charts:** Enrollment trends
- **Tables:** Course performance with sorting
- **Cards:** Course-specific metrics

### **Learning Analytics**

- **Progress Indicators:** Module completion
- **Leaderboards:** Top learners, longest streaks
- **Charts:** Learning activity over time

### **Engagement Analytics**

- **Bar Charts:** Discussion and submission counts
- **Tables:** Top discussions, top submitters
- **Metrics Cards:** Engagement statistics

---

## **🔗 QUICK REFERENCE**

### **Base URL**

- **Local:** `http://localhost:4000`
- **Production:** `https://api.mathpro.com`

### **API Version**

- All endpoints: `/v2/admin/analytics/...`

### **Authentication**

- Header: `Authorization: Bearer {token}`
- Token from: `POST /admin/auth/login`

### **Common Date Presets**

- `all_time` or `all` - Fetch all-time data (no date filtering)
- `today`, `yesterday`, `this_week`, `last_week`
- `this_month`, `last_month`, `this_quarter`, `last_quarter`
- `this_year`, `last_year`
- `last_7_days`, `last_30_days`, `last_90_days`, `last_365_days`

**Note:** To fetch all-time data, you can either:

1. Use `period=all_time` or `period=all`
2. Omit both `start_date` and `end_date` parameters

### **Pagination Defaults**

- Default limit: 20
- Maximum limit: 100
- Default offset: 0

---

## **📝 SUMMARY**

The Analytics V2 API provides comprehensive analytics capabilities for the Math Pro platform. Key points:

1. **21 Analytics Endpoints** covering all aspects of platform analytics
2. **3 Metadata Endpoints** for help text and data point information
3. **Consistent Response Format** for easy integration
4. **Flexible Filtering** with date ranges, presets, and all-time support
5. **Pagination Support** for efficient data loading
6. **Error Handling** with clear error messages
7. **Client-Side Caching** recommended for performance
8. **Help Text API** for displaying contextual information to users

**Next Steps:**

1. Set up authentication
2. Choose endpoints needed for your dashboard
3. Implement data fetching with error handling
4. Add data visualization components
5. Test with real data
6. Optimize performance with caching

**Support:**

- Check API documentation in Swagger UI
- Review error messages for debugging
- Test endpoints in Postman first
- Refer to this guide for integration patterns

---

**Happy Integrating! 🚀**
