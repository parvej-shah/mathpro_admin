# Bundle System - Complete API Guide

## ⚡ TL;DR - Quick Start for Busy Developers

**Creating a bundle (Admin):**

```bash
POST /admin/bundle/enhanced
# Include: title, price, url, short_description, you_get, chips, faq_list, feedback_list, intro_video
```

**Fetching user's bundles (Frontend):**

```javascript
// ✅ Use this format (most reliable)
fetch(`/user/bundle/my-bundles/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Key Points:**

- Use **Enhanced Bundle APIs** (`/admin/bundle/enhanced`) for new bundles
- Use **URL parameter format** for user APIs (more reliable than request body)
- All enhanced fields (`you_get`, `chips`, etc.) are **optional** - check for null
- Payment redirects go to **frontend** (set `FRONTEND_URL` env variable)
- PostgreSQL type errors? Use URL params or `parseInt(userId)`

**Most Common APIs:**

- List bundles: `GET /user/bundle`
- Bundle details: `GET /user/bundle/{id}`
- My bundles: `GET /user/bundle/my-bundles/{user_id}` ← Use this format
- Bundle courses: `GET /user/bundle/bundle-courses/{user_id}` ← Use this format
- Purchase: `POST /user/payment/initiate-for-bundle/{id}`

---

## 🆕 What's New & Evolution

### Version History

**v2.0 (Current - November 2025)** - Complete & Stable

- Added `you_get`, `chips`, `short_description`, `faq_list`, `feedback_list`, `intro_video`
- Added `is_live` and `is_active` flags
- Enhanced admin APIs for rich content

**v1.0** - Basic Bundles

- Basic bundle CRUD operations
- Course association
- Payment integration
- Purchase tracking

### Key Improvements from Previous Versions

1. **API Reliability:** URL parameter format eliminates PostgreSQL type errors
2. **Payment Flow:** Fixed redirects to go to frontend instead of backend
3. **Rich Content:** Enhanced bundles support FAQs, testimonials, intro videos
4. **Better UX:** Duplicate course detection before purchase

---

## 🎯 Quick Start

### What You Need to Know

The bundle system has **two types of APIs**:

1. **Basic Bundle APIs** - Simple bundle creation (title, price, url) - **Legacy, but still works**
2. **Enhanced Bundle APIs** - Feature-rich bundles with FAQs, testimonials, intro videos, etc. - **✅ Recommended**

**Recommendation:** Use **Enhanced Bundle APIs** (`/admin/bundle/enhanced`) for all new implementations. They provide all the fields needed for rich bundle presentation pages similar to course detail pages.

---

## 📊 Database Schema

### Bundle Table Structure

| Column              | Type          | Required | Default | Description                        |
| ------------------- | ------------- | -------- | ------- | ---------------------------------- |
| `id`                | serial        | ✅       | auto    | Primary key                        |
| `title`             | varchar(1000) | ✅       | -       | Bundle title                       |
| `price`             | int4          | ✅       | -       | Bundle price in BDT                |
| `url`               | varchar(1000) | ❌       | NULL    | URL slug for the bundle            |
| `you_get`           | json          | ❌       | NULL    | Array of benefits/features         |
| `chips`             | json          | ❌       | NULL    | Array of tags/categories           |
| `short_description` | varchar(1000) | ❌       | NULL    | Brief description for preview      |
| `faq_list`          | json          | ❌       | NULL    | Array of FAQ objects               |
| `feedback_list`     | json          | ❌       | NULL    | Array of testimonials              |
| `intro_video`       | varchar(500)  | ❌       | NULL    | URL to intro video                 |
| `is_live`           | bool          | ❌       | false   | Whether bundle is visible to users |
| `is_active`         | bool          | ❌       | true    | Whether bundle is active in system |

### Related Tables

- `bundle_course` - Links bundles to courses (many-to-many)
- `bundle_purchase` - Tracks user bundle purchases
- `takes` - Course enrollments (includes bundle course enrollments)

---

## 🔑 Authentication

All admin APIs require authentication:

```javascript
headers: {
  'Authorization': 'Bearer {admin_token}',
  'Content-Type': 'application/json'
}
```

User APIs may optionally include authentication for personalized data.

---

## 📦 Admin APIs

### 1. Create Enhanced Bundle (Recommended)

**POST** `/admin/bundle/enhanced`

Create a feature-rich bundle with all available fields.

**Request:**

```json
{
  "title": "Complete Web Development Mastery Bundle",
  "price": 8500,
  "url": "web-dev-mastery-bundle",
  "short_description": "Master full-stack web development with React, Node.js, MongoDB, and deployment strategies.",
  "you_get": [
    "10+ hours of video content",
    "5 real-world projects",
    "Lifetime access to materials",
    "Certificate of completion",
    "Private community access",
    "1-on-1 mentorship session"
  ],
  "chips": [
    "Web Development",
    "Full Stack",
    "React",
    "Node.js",
    "Beginner Friendly"
  ],
  "faq_list": [
    {
      "question": "Do I need prior programming experience?",
      "answer": "No, this bundle is designed for complete beginners."
    }
  ],
  "feedback_list": [
    {
      "user_name": "Ahmed Rahman",
      "rating": 5,
      "comment": "This bundle completely changed my career!",
      "date": "2024-12-15"
    }
  ],
  "intro_video": "https://www.youtube.com/watch?v=example123",
  "is_live": true,
  "is_active": true
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "Complete Web Development Mastery Bundle",
      "price": 8500,
      "url": "web-dev-mastery-bundle",
      "short_description": "Master full-stack web development...",
      "you_get": [...],
      "chips": [...],
      "faq_list": [...],
      "feedback_list": [...],
      "intro_video": "https://www.youtube.com/watch?v=example123",
      "is_live": true,
      "is_active": true
    }
  ]
}
```

### 2. Update Enhanced Bundle

**PUT** `/admin/bundle/enhanced/{id}`

Update an existing bundle with all fields.

**Request:** Same structure as create

**Response:** Updated bundle object

---

### 3. Create Basic Bundle (Legacy)

**POST** `/admin/bundle`

Create a simple bundle with minimal fields.

**Request:**

```json
{
  "title": "Basic Bundle",
  "price": 3000,
  "url": "basic-bundle"
}
```

**Note:** Use enhanced API for new implementations.

---

### 4. List All Bundles

**GET** `/admin/bundle`

Get all bundles with their courses.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Full Stack Development Bundle",
      "price": 5000,
      "url": "full-stack-bundle",
      "courses": [
        {
          "id": 1,
          "title": "React Fundamentals",
          "price": 2000,
          "url": "react-fundamentals"
        }
      ],
      "course_count": 2
    }
  ]
}
```

---

### 5. Get Specific Bundle

**GET** `/admin/bundle/{id}`

Get detailed information about a specific bundle.

**GET** `/admin/bundle/slug/{slug}`

Get the same detailed bundle payload by slug (`bundle.url`). This is useful for slug-based
admin routes such as `/combos/test-combo`, while updates and course assignments should still
use the numeric bundle id returned in the payload.

---

### 6. Update Basic Bundle (Legacy)

**PUT** `/admin/bundle/{id}`

Update basic bundle fields only (title, price, url).

**Note:** Use enhanced API for full field updates.

---

### 7. Delete Bundle

**DELETE** `/admin/bundle/{id}`

Delete a bundle and all its course associations.

---

### 8. Add Courses to Bundle

**POST** `/admin/bundle/{id}/courses`

Associate courses with a bundle.

**Request:**

```json
{
  "courseIds": [1, 2, 3, 5]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bundleId": 1,
    "courseIds": [1, 2, 3, 5]
  }
}
```

---

### 9. Get Bundle Statistics

**GET** `/admin/bundle/{id}/stats`

Get purchase statistics for a bundle.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "total_purchases": 25,
      "total_revenue": 125000,
      "course_count": 3
    }
  ]
}
```

---

### 10. Get Bundle Purchases

**GET** `/admin/bundle/{id}/purchases`  
**GET** `/admin/bundle/purchases`

Get purchase records for specific bundle or all bundles.

---

### 11. Export Bundle Purchases

**GET** `/admin/bundle/{id}/purchases/export`  
**GET** `/admin/bundle/purchases/export`

Download bundle purchases as CSV.

---

## 👥 User APIs

### 1. List Available Bundles

**GET** `/user/bundle`

Get all available bundles (public endpoint).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Full Stack Development Bundle",
      "price": 5000,
      "url": "full-stack-bundle",
      "short_description": "Master full-stack development...",
      "you_get": ["10+ hours video", "5 projects"],
      "chips": ["Web Dev", "Full Stack"],
      "intro_video": "https://youtube.com/watch?v=...",
      "is_live": true,
      "prebooking": 15,
      "enrolled": 8,
      "courses": [
        {
          "id": 1,
          "title": "React Fundamentals",
          "price": 2000
        }
      ],
      "course_count": 2
    }
  ]
}
```

**New Fields:**

- `prebooking` - Total number of users who prebooked this bundle
- `enrolled` - Total number of users who purchased this bundle

---

### 2. Get Bundle Details with User Status

**GET** `/user/bundle/{id}`

Get detailed bundle information with user-specific purchase status.

**Request Body (Optional - for authenticated users):**

```json
{
  "user_id": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Full Stack Development Bundle",
      "price": 5000,
      "url": "full-stack-bundle",
      "short_description": "Master full-stack development...",
      "you_get": [...],
      "chips": [...],
      "faq_list": [...],
      "feedback_list": [...],
      "intro_video": "https://youtube.com/watch?v=...",
      "prebooking": 15,
      "enrolled": 8,
      "purchased": false,
      "purchase_date": null,
      "transaction_id": null,
      "owned_courses": [1, 3],
      "courses": [...],
      "course_count": 2
    }
  ]
}
```

**Key Fields:**

- `prebooking`: Total number of users who prebooked this bundle
- `enrolled`: Total number of users who purchased this bundle
- `purchased`: Whether current user has purchased this bundle
- `owned_courses`: Array of course IDs user already owns
- `purchase_date`: Unix timestamp of purchase
- `transaction_id`: Transaction reference

**Usage Example:**

```javascript
// Display enrollment count or prebooking count based on bundle status
const displayCount = bundle.is_live
  ? bundle.enrolled // Show enrollment count for live bundles
  : bundle.prebooking; // Show prebooking count for upcoming bundles

// Example: "15 জন already enrolled" or "8 জন prebooked"
```

---

### 3. Get My Purchased Bundles

**GET** `/user/bundle/my-bundles`

Get all bundles purchased by the authenticated user.

**⚠️ Important:** This API supports **two formats** for better compatibility:

**Format 1: Request Body (Original)**

```json
{
  "user_id": 123
}
```

**Format 2: URL Parameter (Alternative - Recommended for reliability)**

```bash
GET /user/bundle/my-bundles/{user_id}
# Example: GET /user/bundle/my-bundles/123
```

**Why two formats?** The URL parameter format was added to fix PostgreSQL type conversion issues. Use whichever works best for your setup.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Full Stack Development Bundle",
      "price": 5000,
      "amount": 5000,
      "transaction_id": "TXN123456",
      "purchase_date": 1640995200,
      "courses": [...],
      "course_count": 2
    }
  ]
}
```

---

### 4. Get Bundle Courses

**GET** `/user/bundle/bundle-courses`

Get all courses user has access to through purchased bundles.

**⚠️ Important:** This API supports **two formats**:

**Format 1: Request Body**

```json
{
  "user_id": 123
}
```

**Format 2: URL Parameter (Recommended)**

```bash
GET /user/bundle/bundle-courses/{user_id}
# Example: GET /user/bundle/bundle-courses/123
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "React Fundamentals",
      "price": 2000,
      "url": "react-fundamentals",
      "enrollment_date": 1640995200,
      "bundle_title": "Full Stack Development Bundle",
      "bundle_id": 1,
      "enrollment_source": "bundle"
    }
  ]
}
```

---

### 5. Get All User Courses

**GET** `/user/bundle/all-courses`

Get all courses user has access to (both individual purchases and bundle courses).

**⚠️ Important:** This API supports **two formats**:

**Format 1: Request Body**

```json
{
  "user_id": 123
}
```

**Format 2: URL Parameter (Recommended)**

```bash
GET /user/bundle/all-courses/{user_id}
# Example: GET /user/bundle/all-courses/123
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "React Fundamentals",
      "enrollment_date": 1640995200,
      "paid_amount": 0,
      "transaction_id": "TXN123456",
      "enrollment_source": "bundle",
      "bundle_title": "Full Stack Development Bundle"
    },
    {
      "id": 5,
      "title": "JavaScript Basics",
      "enrollment_date": 1640995100,
      "paid_amount": 1500,
      "enrollment_source": "individual"
    }
  ]
}
```

---

### 6. Check Bundle Purchase Status

**GET** `/user/bundle/{id}/check-purchase/{user_id}`

Check if user has purchased a specific bundle.

**Authentication:** Required

**Example:**

```bash
GET /user/bundle/1/check-purchase/123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "purchased": true
  }
}
```

---

### 7. Check Bundle Prebook Status

**GET** `/user/bundle/{id}/check-prebook/{user_id}`

Check if user has prebooked a specific bundle.

**Authentication:** Required

**Example:**

```bash
GET /user/bundle/1/check-prebook/123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "prebooked": true
  }
}
```

**Use Case:** Display different UI states based on whether user has already prebooked a bundle (e.g., show "Already Prebooked" instead of "Prebook Now" button).

---

### 8. Check Duplicate Courses

**GET** `/user/bundle/{id}/check-duplicates`

Check if user already owns courses in a bundle before purchase.

**⚠️ Important:** This API supports **two formats**:

**Format 1: Request Body**

```json
{
  "user_id": 123
}
```

**Format 2: URL Parameter (Recommended)**

```bash
GET /user/bundle/{bundle_id}/check-duplicates/{user_id}
# Example: GET /user/bundle/1/check-duplicates/123
```

**Response (No Duplicates):**

```json
{
  "success": true,
  "data": {
    "hasDuplicates": false,
    "duplicateCourses": [],
    "duplicateCount": 0,
    "recommendation": "Safe to purchase bundle"
  }
}
```

**Response (With Duplicates):**

```json
{
  "success": true,
  "data": {
    "hasDuplicates": true,
    "duplicateCourses": [
      {
        "id": 1,
        "title": "React Fundamentals",
        "price": 2000,
        "already_enrolled_date": 1640995100,
        "amount_paid": 2000
      }
    ],
    "duplicateCount": 1,
    "bundlePrice": 5000,
    "alreadyPaidAmount": 2000,
    "recommendation": "Bundle purchase is still economical"
  }
}
```

---

### 8. Initiate Bundle Payment

**POST** `/user/payment/initiate-for-bundle/{id}`

Initiate payment process for a bundle.

**Request Body:**

```json
{
  "user_id": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": "https://securepay.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=ABC123..."
}
```

**Usage:** Redirect user to the returned URL to complete payment.

---

## 🔧 API Format Compatibility & Important Notes

### Two API Formats Supported

Several user APIs support **both request body and URL parameter formats** for maximum compatibility:

| API Endpoint       | Body Format                                     | URL Param Format                                   | Recommended |
| ------------------ | ----------------------------------------------- | -------------------------------------------------- | ----------- |
| Get My Bundles     | `GET /user/bundle/my-bundles` + body            | `GET /user/bundle/my-bundles/{user_id}`            | URL Param   |
| Get Bundle Courses | `GET /user/bundle/bundle-courses` + body        | `GET /user/bundle/bundle-courses/{user_id}`        | URL Param   |
| Get All Courses    | `GET /user/bundle/all-courses` + body           | `GET /user/bundle/all-courses/{user_id}`           | URL Param   |
| Check Duplicates   | `GET /user/bundle/{id}/check-duplicates` + body | `GET /user/bundle/{id}/check-duplicates/{user_id}` | URL Param   |
| Check Purchase     | `GET /user/bundle/{id}/check-purchase` + body   | `GET /user/bundle/{id}/check-purchase/{user_id}`   | URL Param   |

### Why Two Formats?

**Historical Context:** The original APIs used request body for `user_id`. However, PostgreSQL type conversion issues were discovered where `user_id` from JWT tokens were strings instead of integers, causing `22P02` errors.

**Solution:** URL parameter format was added as an alternative that guarantees proper integer conversion.

**Recommendation:** Use **URL parameter format** for new implementations as it's more reliable and follows REST conventions better.

### Example: Fetching Bundle Courses

```javascript
// ✅ Recommended: URL Parameter Format
const fetchBundleCourses = async (userId, token) => {
  const response = await fetch(`/user/bundle/bundle-courses/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

// ⚠️ Legacy: Request Body Format (still works)
const fetchBundleCoursesLegacy = async (userId, token) => {
  const response = await fetch("/user/bundle/bundle-courses", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });
  return await response.json();
};
```

### PostgreSQL Type Conversion Fix

**Issue:** JWT tokens return `user_id` as strings, but PostgreSQL expects integers.

**Fix Applied:**

- Authentication middleware now converts `user_id` to integer: `parseInt(decoded.id)`
- Controllers have additional safety checks
- URL parameter routes parse integers explicitly

**For Developers:** Always use `parseInt()` when passing `user_id` in request bodies to be safe.

---

## 💳 Payment Flow

### Bundle Purchase Process

```
1. User browses bundles → GET /user/bundle
2. User views bundle details → GET /user/bundle/{id}
3. User clicks "Purchase" → POST /user/payment/initiate-for-bundle/{id}
4. User redirected to payment gateway (SSLCommerz/bKash)
5. User completes payment
6. Payment gateway redirects to: {FRONTEND_URL}/bundle/{id}/post-payment/success
7. Backend receives IPN webhook → POST /user/payment/ipn
8. Backend enrolls user in all bundle courses
9. User receives confirmation email/SMS
10. User can access all bundle courses
```

### Payment Gateway URLs

| Event   | URL                                                  |
| ------- | ---------------------------------------------------- |
| Success | `{FRONTEND_URL}/bundle/{id}/post-payment/success`    |
| Failure | `{FRONTEND_URL}/post-payment/failure`                |
| Cancel  | `{FRONTEND_URL}/post-payment/cancel`                 |
| IPN     | `{BACKEND_URL}/user/payment/ipn` (backend processes) |

---

## 🎨 Frontend Implementation Guide

### React.js Complete Example

#### 1. Bundle List Page

```jsx
import React, { useState, useEffect } from "react";

const BundleListPage = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await fetch("/user/bundle");
      const data = await response.json();

      if (data.success) {
        setBundles(data.data);
      }
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading bundles...</div>;

  return (
    <div className="bundle-list">
      <h1>Course Bundles</h1>
      <div className="bundles-grid">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </div>
  );
};

const BundleCard = ({ bundle }) => {
  const totalOriginalPrice = bundle.courses.reduce(
    (sum, course) => sum + course.price,
    0
  );
  const savings = totalOriginalPrice - bundle.price;

  return (
    <div className="bundle-card">
      <h3>{bundle.title}</h3>
      <p className="description">{bundle.short_description}</p>

      {/* Tags */}
      <div className="chips">
        {bundle.chips?.map((chip, i) => (
          <span key={i} className="chip">
            {chip}
          </span>
        ))}
      </div>

      {/* Pricing */}
      <div className="pricing">
        <span className="original-price">৳{totalOriginalPrice}</span>
        <span className="bundle-price">৳{bundle.price}</span>
        <span className="savings">Save ৳{savings}</span>
      </div>

      {/* Course Count */}
      <p>{bundle.course_count} courses included</p>

      <a href={`/bundle/${bundle.id}`} className="btn-view">
        View Details
      </a>
    </div>
  );
};

export default BundleListPage;
```

---

#### 2. Bundle Details Page

```jsx
import React, { useState, useEffect } from "react";

const BundleDetailsPage = ({ bundleId, userId, token }) => {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundleDetails();
  }, [bundleId]);

  const fetchBundleDetails = async () => {
    try {
      const response = await fetch(`/user/bundle/${bundleId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: userId ? JSON.stringify({ user_id: userId }) : undefined,
      });

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setBundle(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching bundle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await fetch(
        `/user/payment/initiate-for-bundle/${bundleId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Redirect to payment gateway
        window.location.href = data.data;
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!bundle) return <div>Bundle not found</div>;

  return (
    <div className="bundle-details">
      {/* Header */}
      <div className="bundle-header">
        <h1>{bundle.title}</h1>
        {bundle.purchased && (
          <span className="badge-purchased">✅ Purchased</span>
        )}
      </div>

      {/* Intro Video */}
      {bundle.intro_video && (
        <div className="intro-video">
          <iframe
            src={bundle.intro_video}
            title="Bundle Introduction"
            allowFullScreen
          />
        </div>
      )}

      {/* Description */}
      <div className="description">
        <p>{bundle.short_description}</p>
      </div>

      {/* What You Get */}
      {bundle.you_get && bundle.you_get.length > 0 && (
        <div className="you-get-section">
          <h2>What You'll Get</h2>
          <ul>
            {bundle.you_get.map((item, i) => (
              <li key={i}>✓ {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Courses Included */}
      <div className="courses-section">
        <h2>Courses Included ({bundle.course_count})</h2>
        <div className="courses-list">
          {bundle.courses.map((course) => {
            const isOwned = bundle.owned_courses?.includes(course.id);

            return (
              <div
                key={course.id}
                className={`course-item ${isOwned ? "owned" : ""}`}
              >
                <h3>{course.title}</h3>
                <p>{course.short_description}</p>
                <span className="price">৳{course.price}</span>
                {isOwned && <span className="badge">Already Enrolled</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQs */}
      {bundle.faq_list && bundle.faq_list.length > 0 && (
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          {bundle.faq_list.map((faq, i) => (
            <div key={i} className="faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Feedback/Testimonials */}
      {bundle.feedback_list && bundle.feedback_list.length > 0 && (
        <div className="feedback-section">
          <h2>Student Feedback</h2>
          {bundle.feedback_list.map((feedback, i) => (
            <div key={i} className="feedback-item">
              <div className="rating">{"⭐".repeat(feedback.rating)}</div>
              <p className="comment">"{feedback.comment}"</p>
              <p className="author">- {feedback.user_name}</p>
              <p className="date">{feedback.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Section */}
      <div className="purchase-section">
        <div className="pricing">
          <span className="price">৳{bundle.price}</span>
        </div>

        {bundle.purchased ? (
          <button className="btn-purchased" disabled>
            ✅ Already Purchased
          </button>
        ) : (
          <>
            {bundle.owned_courses && bundle.owned_courses.length > 0 && (
              <p className="warning">
                ⚠️ You already own {bundle.owned_courses.length} course(s) in
                this bundle
              </p>
            )}
            <button onClick={handlePurchase} className="btn-purchase">
              Purchase Bundle
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BundleDetailsPage;
```

---

#### 3. My Bundles Page

```jsx
import React, { useState, useEffect } from "react";

const MyBundlesPage = ({ userId, token }) => {
  const [myBundles, setMyBundles] = useState([]);
  const [bundleCourses, setBundleCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      // ✅ Using recommended URL parameter format
      const [bundlesRes, coursesRes] = await Promise.all([
        fetch(`/user/bundle/my-bundles/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/user/bundle/bundle-courses/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const bundlesData = await bundlesRes.json();
      const coursesData = await coursesRes.json();

      if (bundlesData.success) setMyBundles(bundlesData.data);
      if (coursesData.success) setBundleCourses(coursesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="my-bundles-page">
      <h1>My Bundles</h1>

      {/* Purchased Bundles */}
      <section className="bundles-section">
        <h2>Purchased Bundles ({myBundles.length})</h2>
        {myBundles.map((bundle) => (
          <div key={bundle.id} className="bundle-card">
            <h3>{bundle.title}</h3>
            <p>
              Purchased:{" "}
              {new Date(bundle.purchase_date * 1000).toLocaleDateString()}
            </p>
            <p>Amount Paid: ৳{bundle.amount}</p>
            <p>Transaction ID: {bundle.transaction_id}</p>

            <div className="bundle-courses">
              <h4>Included Courses ({bundle.course_count})</h4>
              {bundle.courses.map((course) => (
                <div key={course.id} className="course-item">
                  <span>{course.title}</span>
                  <a href={`/course-details/${course.id}`}>Access Course</a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Bundle Courses */}
      <section className="courses-section">
        <h2>Courses from Bundles ({bundleCourses.length})</h2>
        <div className="courses-grid">
          {bundleCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>From: {course.bundle_title}</p>
              <p>
                Enrolled:{" "}
                {new Date(course.enrollment_date * 1000).toLocaleDateString()}
              </p>
              <a href={`/course-details/${course.id}`} className="btn-access">
                Access Course
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyBundlesPage;
```

---

#### 4. Duplicate Check Component

```jsx
import React, { useState } from "react";

const DuplicateCheckModal = ({
  bundleId,
  userId,
  token,
  onProceed,
  onCancel,
}) => {
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDuplicates();
  }, []);

  const checkDuplicates = async () => {
    try {
      // ✅ Using recommended URL parameter format
      const response = await fetch(
        `/user/bundle/${bundleId}/check-duplicates/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setDuplicateInfo(data.data);
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Checking...</div>;
  if (!duplicateInfo?.hasDuplicates) {
    onProceed();
    return null;
  }

  return (
    <div className="duplicate-modal">
      <h2>⚠️ Course Conflict Warning</h2>
      <p>
        You already own {duplicateInfo.duplicateCount} course(s) in this bundle:
      </p>

      <ul>
        {duplicateInfo.duplicateCourses.map((course) => (
          <li key={course.id}>
            {course.title} - Already paid ৳{course.amount_paid}
          </li>
        ))}
      </ul>

      <div className="summary">
        <p>
          <strong>Bundle Price:</strong> ৳{duplicateInfo.bundlePrice}
        </p>
        <p>
          <strong>Already Paid:</strong> ৳{duplicateInfo.alreadyPaidAmount}
        </p>
        <p>
          <strong>Recommendation:</strong> {duplicateInfo.recommendation}
        </p>
      </div>

      <div className="actions">
        <button onClick={onProceed} className="btn-proceed">
          Proceed Anyway
        </button>
        <button onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DuplicateCheckModal;
```

---

## 📱 API Response Data Structures

### Bundle Object (Enhanced)

```typescript
interface Bundle {
  // Basic fields (always present)
  id: number;
  title: string;
  price: number;
  url: string;

  // Enhanced fields (may be null for old bundles)
  short_description?: string | null;
  you_get?: string[] | null; // Array of benefits like ["10+ hours video", "Certificate"]
  chips?: string[] | null; // Array of tags like ["Web Dev", "React"]
  faq_list?: FAQ[] | null;
  feedback_list?: Feedback[] | null;
  intro_video?: string | null; // YouTube/Vimeo URL
  is_live?: boolean; // Default: false
  is_active?: boolean; // Default: true

  // Course information (always present)
  courses: Course[];
  course_count: number;

  // Statistics (always present)
  prebooking: number; // Total number of users who prebooked this bundle
  enrolled: number; // Total number of users who purchased this bundle

  // User-specific fields (only when user is authenticated)
  purchased?: boolean; // Has user purchased this bundle?
  purchase_date?: number | null; // Unix timestamp
  transaction_id?: string | null; // Payment transaction ID
  owned_courses?: number[]; // Array of course IDs user already owns
}

interface FAQ {
  question: string;
  answer: string;
}

interface Feedback {
  user_name: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string; // Format: YYYY-MM-DD
}

interface Course {
  id: number;
  title: string;
  price: number;
  url: string;
  short_description?: string;
  intro_video?: string;
}

interface BundlePurchase {
  id: number;
  user_id: number;
  bundle_id: number;
  amount: number;
  transaction_id: string;
  timestamp: number; // Unix timestamp
  bundle_title?: string; // Included in some responses
  user_name?: string; // Included in admin responses
  user_phone?: string; // Included in admin responses
  user_email?: string; // Included in admin responses
}

interface BundleCourse {
  id: number;
  title: string;
  price: number;
  url: string;
  enrollment_date: number; // Unix timestamp
  enrollment_source: "bundle" | "individual";
  bundle_title?: string; // Only for bundle enrollments
  bundle_id?: number; // Only for bundle enrollments
  bundle_purchase_date?: number; // Only for bundle enrollments
  paid_amount?: number; // 0 for bundle courses, actual price for individual
  transaction_id?: string;
}
```

### Handling Null Values in Frontend

```javascript
// ✅ Safe way to handle enhanced fields
const BundleCard = ({ bundle }) => {
  return (
    <div>
      <h3>{bundle.title}</h3>
      <p>{bundle.price} BDT</p>

      {/* Display enrollment/prebooking count */}
      <div className="stats">
        {bundle.is_live ? (
          <p>{bundle.enrolled || 0} students enrolled</p>
        ) : (
          <p>{bundle.prebooking || 0} users prebooked</p>
        )}
      </div>

      {/* Handle nullable short_description */}
      {bundle.short_description && <p>{bundle.short_description}</p>}

      {/* Handle nullable you_get array */}
      {bundle.you_get && bundle.you_get.length > 0 && (
        <ul>
          {bundle.you_get.map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>
      )}

      {/* Handle nullable chips array */}
      {bundle.chips && bundle.chips.length > 0 && (
        <div className="tags">
          {bundle.chips.map((chip, i) => (
            <span key={i} className="tag">
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Handle nullable intro_video */}
      {bundle.intro_video && <iframe src={bundle.intro_video} title="Intro" />}

      {/* Handle nullable faq_list */}
      {bundle.faq_list && bundle.faq_list.length > 0 && (
        <div className="faqs">
          {bundle.faq_list.map((faq, i) => (
            <div key={i}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Handle nullable feedback_list */}
      {bundle.feedback_list && bundle.feedback_list.length > 0 && (
        <div className="feedback">
          {bundle.feedback_list.map((fb, i) => (
            <div key={i}>
              <p>{"⭐".repeat(fb.rating)}</p>
              <p>{fb.comment}</p>
              <p>- {fb.user_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🔒 Security Considerations

### Frontend

1. **Always validate user authentication** before showing purchase buttons
2. **Check bundle purchase status** before allowing payment
3. **Sanitize HTML** in feedback comments (use DOMPurify)
4. **Validate URLs** for intro videos
5. **Handle payment redirects** securely

### API Calls

```javascript
// Always include authentication for user-specific data
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

// Validate user_id matches authenticated user
if (authenticatedUserId !== requestUserId) {
  throw new Error("Unauthorized");
}
```

---

## 🐛 Error Handling

### Common Errors

```javascript
const handleAPIError = (error, data) => {
  if (data?.error) {
    switch (data.error) {
      case "Title and price are required":
        return "Please fill in all required fields";
      case "Unauthorized access":
        return "Please login to continue";
      case "Bundle not found":
        return "This bundle is no longer available";
      default:
        return data.error;
    }
  }
  return "Something went wrong. Please try again.";
};

// Usage
try {
  const response = await fetch("/user/bundle/1");
  const data = await response.json();

  if (!data.success) {
    const errorMessage = handleAPIError(null, data);
    showToast(errorMessage, "error");
  }
} catch (error) {
  showToast("Network error. Please check your connection.", "error");
}
```

---

## 📊 Analytics Tracking

### Track Bundle Events

```javascript
// Track bundle view
const trackBundleView = (bundleId, bundleTitle) => {
  gtag("event", "view_bundle", {
    bundle_id: bundleId,
    bundle_title: bundleTitle,
  });
};

// Track bundle purchase initiation
const trackBundlePurchaseStart = (bundleId, bundlePrice) => {
  gtag("event", "begin_checkout", {
    items: [
      {
        item_id: bundleId,
        item_name: bundleTitle,
        price: bundlePrice,
        item_category: "bundle",
      },
    ],
  });
};

// Track successful purchase
const trackBundlePurchaseComplete = (bundleId, bundlePrice, transactionId) => {
  gtag("event", "purchase", {
    transaction_id: transactionId,
    value: bundlePrice,
    currency: "BDT",
    items: [
      {
        item_id: bundleId,
        item_name: bundleTitle,
        price: bundlePrice,
        item_category: "bundle",
      },
    ],
  });
};
```

---

## 🧪 Testing Guide

### cURL Commands

```bash
# List all bundles (public)
curl -X GET http://localhost:4000/user/bundle

# Get bundle details
curl -X GET http://localhost:4000/user/bundle/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"user_id": 123}'

# Create enhanced bundle (admin)
curl -X POST http://localhost:4000/admin/bundle/enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "title": "Test Bundle",
    "price": 5000,
    "url": "test-bundle",
    "short_description": "Test description",
    "you_get": ["Benefit 1", "Benefit 2"],
    "chips": ["Tag1", "Tag2"],
    "is_live": true,
    "is_active": true
  }'

# Add courses to bundle
curl -X POST http://localhost:4000/admin/bundle/1/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"courseIds": [1, 2, 3]}'

# Initiate payment
curl -X POST http://localhost:4000/user/payment/initiate-for-bundle/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"user_id": 123}'
```

---

## 🚀 Deployment Checklist

### Environment Variables Required

```bash
# Frontend URL for payment redirects (CRITICAL)
FRONTEND_URL=https://courses.mathpro.com

# Backend URL for IPN webhook
BACKEND_URL=https://your-backend-domain.com
IPN_URL=https://your-backend-domain.com/user/payment/ipn

# SSLCommerz Configuration
STORE_ID=your_store_id
STORE_PASSWORD=your_store_password
```

### Backend Deployment

- [ ] Run database migration: `database/migrations/add_enhanced_bundle_columns.sql`
- [ ] Deploy updated files:
  - `service/managerial/bundle.js` (Enhanced bundle methods)
  - `service/user/payment.js` (Payment redirect fixes)
  - `service/authMiddleWares.js` (PostgreSQL type fix - CRITICAL)
  - `controllers/managerial/bundle.js` (Admin controllers)
  - `controllers/user/bundle.js` (User controllers with URL params)
  - `routes/managerial/bundle.js` (Admin routes)
  - `routes/user/bundle.js` (User routes with URL param support)
- [ ] Set environment variables (see above)
- [ ] Restart application: `pm2 restart all`
- [ ] Test enhanced bundle creation
- [ ] Test URL parameter APIs
- [ ] Test backward compatibility
- [ ] Verify payment redirects go to frontend

### Frontend Deployment

- [ ] Implement bundle list page
- [ ] Implement bundle details page
- [ ] Implement my bundles page
- [ ] Add duplicate check before purchase
- [ ] Handle payment redirects
- [ ] Test with real data
- [ ] Add analytics tracking

---

## 📋 API Endpoint Summary

### Admin Endpoints

| Method | Endpoint                         | Description             | Use This       |
| ------ | -------------------------------- | ----------------------- | -------------- |
| POST   | `/admin/bundle/enhanced`         | Create enhanced bundle  | ✅ Recommended |
| PUT    | `/admin/bundle/enhanced/{id}`    | Update enhanced bundle  | ✅ Recommended |
| POST   | `/admin/bundle`                  | Create basic bundle     | Legacy         |
| PUT    | `/admin/bundle/{id}`             | Update basic bundle     | Legacy         |
| GET    | `/admin/bundle`                  | List all bundles        | ✅ Use         |
| GET    | `/admin/bundle/{id}`             | Get specific bundle     | ✅ Use         |
| GET    | `/admin/bundle/slug/{slug}`      | Get bundle by slug      | ✅ Use         |
| DELETE | `/admin/bundle/{id}`             | Delete bundle           | ✅ Use         |
| POST   | `/admin/bundle/{id}/courses`     | Add courses to bundle   | ✅ Use         |
| GET    | `/admin/bundle/{id}/stats`       | Get bundle statistics   | ✅ Use         |
| GET    | `/admin/bundle/{id}/purchases`   | Get bundle purchases    | ✅ Use         |
| GET    | `/admin/bundle/purchases/export` | Export purchases as CSV | ✅ Use         |

### User Endpoints

| Method | Endpoint                                 | Description                  | Auth Required |
| ------ | ---------------------------------------- | ---------------------------- | ------------- |
| GET    | `/user/bundle`                           | List available bundles       | ❌            |
| GET    | `/user/bundle/{id}`                      | Get bundle details           | Optional      |
| GET    | `/user/bundle/my-bundles`                | Get my purchased bundles     | ✅            |
| GET    | `/user/bundle/bundle-courses`            | Get courses from bundles     | ✅            |
| GET    | `/user/bundle/all-courses`               | Get all my courses           | ✅            |
| GET    | `/user/bundle/{id}/check-purchase`       | Check purchase status        | ✅            |
| GET    | `/user/bundle/{id}/check-prebook`        | Check prebook status         | ✅            |
| GET    | `/user/bundle/{id}/check-duplicates`     | Check duplicate courses      | ✅            |
| POST   | `/user/payment/initiate-for-bundle/{id}` | Initiate bundle payment      | ✅            |
| POST   | `/user/payment/ipn`                      | Payment webhook (SSLCommerz) | ❌            |
| GET    | `/user/payment/history`                  | Get payment history          | ✅            |

---

## 💡 Best Practices

### For Frontend Developers

1. **Always use Enhanced Bundle APIs** for new bundle creation
2. **Check for NULL values** when displaying enhanced fields
3. **Implement duplicate checking** before purchase
4. **Show clear pricing** with savings calculation
5. **Handle payment redirects** properly
6. **Cache bundle lists** for better performance
7. **Track analytics events** for business insights

### For Backend Developers

1. **Use Enhanced APIs** for new bundles
2. **Maintain backward compatibility** with basic APIs
3. **Validate JSON structures** before database insertion
4. **Use transactions** for bundle purchases
5. **Log all payment events** for debugging
6. **Monitor API performance** regularly

---

## 🆘 Troubleshooting

### Issue: PostgreSQL Error 22P02 (Type Conversion)

**Error Message:** `invalid input syntax for type integer`

**Cause:** `user_id` being sent as string instead of integer.

**Solutions:**

1. **Use URL parameter format** (recommended):

   ```javascript
   // ✅ This handles type conversion automatically
   fetch(`/user/bundle/my-bundles/${userId}`);
   ```

2. **Use parseInt() in request body**:

   ```javascript
   // ⚠️ If using body format, always parseInt
   body: JSON.stringify({ user_id: parseInt(userId) });
   ```

3. **Check authentication middleware** is deployed:
   ```javascript
   // Backend should have this fix in service/authMiddleWares.js
   req.body["user_id"] = parseInt(decoded.id);
   ```

### Issue: Bundle not showing on frontend

**Check:**

- Is `is_live` set to `true`?
- Is `is_active` set to `true`?
- Are courses added to the bundle?

**Solution:**

```sql
UPDATE bundle SET is_live = true, is_active = true WHERE id = 1;
```

### Issue: Payment redirect not working

**Error:** User redirected to backend URL instead of frontend after payment.

**Check:**

- Is `FRONTEND_URL` environment variable set?
- Is payment gateway configured correctly?

**Solution:**

```bash
# Set environment variable
export FRONTEND_URL=https://courses.mathpro.com

# Verify in payment service
# Should redirect to: {FRONTEND_URL}/bundle/{id}/post-payment/success
```

### Issue: User not enrolled after purchase

**Check:**

- Did IPN webhook fire?
- Are courses added to bundle?
- Check backend logs for errors

**Solution:** Check `bundle_purchase` and `takes` tables in database.

```sql
-- Check if bundle purchase recorded
SELECT * FROM bundle_purchase WHERE user_id = 123 AND bundle_id = 1;

-- Check if user enrolled in bundle courses
SELECT t.*, c.title
FROM takes t
JOIN course c ON t.course_id = c.id
WHERE t.user_id = 123 AND t.transaction_id LIKE 'TXN%';
```

### Issue: 404 Not Found on bundle APIs

**Check:**

- Are routes registered in `app.js`?
- Is the correct API format being used?

**Solution:**

```javascript
// Verify routes are registered
app.use("/admin/bundle", bundleRoutes);
app.use("/user/bundle", userBundleRoutes);

// Try both API formats
// Format 1: URL params
fetch(`/user/bundle/my-bundles/${userId}`);

// Format 2: Request body
fetch("/user/bundle/my-bundles", {
  body: JSON.stringify({ user_id: parseInt(userId) }),
});
```

### Issue: Empty response from bundle APIs

**Check:**

- Is user authenticated?
- Does user have purchased bundles?
- Are bundles marked as `is_live = true`?

**Solution:**

```sql
-- Check user's bundle purchases
SELECT bp.*, b.title
FROM bundle_purchase bp
JOIN bundle b ON bp.bundle_id = b.id
WHERE bp.user_id = 123;

-- Check if bundles are live
SELECT id, title, is_live, is_active FROM bundle;
```

---

## 📊 Prebooking & Enrollment Counts

### Overview

All bundle APIs now return `prebooking` and `enrolled` counts to display social proof and track bundle popularity.

**Database Tables:**

- `prebooking_bundle` - Stores bundle prebookings
- `bundle_purchase` - Stores bundle purchases/enrollments

### Count Fields

| Field        | Type    | Description                                  | Source Table        |
| ------------ | ------- | -------------------------------------------- | ------------------- |
| `prebooking` | integer | Total users who prebooked this bundle        | `prebooking_bundle` |
| `enrolled`   | integer | Total users who purchased/enrolled in bundle | `bundle_purchase`   |

### Usage Examples

#### Display Count Based on Bundle Status

```javascript
// Show different counts based on whether bundle is live
const BundleStats = ({ bundle }) => {
  const count = bundle.is_live ? bundle.enrolled : bundle.prebooking;
  const label = bundle.is_live ? "enrolled" : "prebooked";

  return (
    <div className="bundle-stats">
      <p className="count">{count}</p>
      <p className="label">{label}</p>
    </div>
  );
};
```

#### Bengali Number Display

```javascript
// Convert to Bengali numerals
const englishToBanglaNumbers = (num) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num)
    .split("")
    .map((d) => banglaDigits[d] || d)
    .join("");
};

// Usage
<p className="text-3xl font-bold">
  {englishToBanglaNumbers(
    bundle.is_live === false
      ? bundle.prebooking || 0 // Shows prebook count when not live
      : bundle.enrolled || 0 // Shows enrollment count when live
  )}{" "}
  জন
</p>;
```

#### Social Proof Component

```javascript
const SocialProof = ({ bundle }) => {
  const hasEnrollments = bundle.enrolled > 0;
  const hasPrebookings = bundle.prebooking > 0;

  if (bundle.is_live && hasEnrollments) {
    return (
      <div className="social-proof">
        <span className="icon">👥</span>
        <span>{bundle.enrolled} students already enrolled</span>
      </div>
    );
  }

  if (!bundle.is_live && hasPrebookings) {
    return (
      <div className="social-proof">
        <span className="icon">🔔</span>
        <span>{bundle.prebooking} users prebooked this bundle</span>
      </div>
    );
  }

  return null;
};
```

### Admin APIs for Counts

#### Get Detailed Prebooking List

**GET** `/admin/bundle/prebookings/api?bundle_id={id}`

```json
{
  "success": true,
  "data": [
    {
      "name": "John Doe",
      "phone": "01712345678",
      "email": "john@example.com",
      "timestamp": 1731600000,
      "user_id": 123,
      "bundle_title": "Full Stack Development Bundle",
      "bundle_id": 5
    }
  ]
}
```

#### Get Detailed Purchase List

**GET** `/admin/bundle/purchases/api?bundle_id={id}`

```json
{
  "success": true,
  "data": [
    {
      "user_id": 123,
      "bundle_id": 5,
      "amount": 5000,
      "transaction_id": "TXN123456",
      "timestamp": 1731600000,
      "bundle_title": "Full Stack Development Bundle",
      "user_name": "John Doe",
      "user_phone": "01712345678",
      "user_email": "john@example.com"
    }
  ]
}
```

### Related Documentation

- `BUNDLE_PREBOOK_CHECK_API.md` - User prebook status checking
- `PULL_BUNDLE_PREBOOKING_LIST_API.md` - Admin prebooking management
- `BUNDLE_COUNTS_FIXED.md` - Technical implementation details

---

## 💳 Bundle Purchase & Payment APIs

### Payment Initiation

**POST** `/user/payment/initiate-for-bundle/{id}`

Initiates payment gateway process for bundle purchase.

**Authentication:** Required

**Request:**

```json
{
  "user_id": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": "https://securepay.sslcommerz.com/gwprocess/v4/gw.php?Q=PAY&SESSIONKEY=..."
}
```

**Payment Flow:**

1. User clicks "Purchase Bundle"
2. Frontend calls this API
3. Backend creates SSLCommerz payment session
4. Returns payment gateway URL
5. Frontend redirects user to payment gateway
6. User completes payment (bKash/Nagad/Card)
7. Gateway redirects to success/failure URL
8. IPN webhook processes enrollment

**Payment Gateway URLs:**

- Success: `{FRONTEND_URL}/bundle/{id}/post-payment/success`
- Failure: `{FRONTEND_URL}/post-payment/failure`
- Cancel: `{FRONTEND_URL}/post-payment/cancel`
- IPN: `{BACKEND_URL}/user/payment/ipn` (backend webhook)

### IPN Webhook Processing

**POST** `/user/payment/ipn`

SSLCommerz sends payment confirmation to this endpoint. Backend automatically:

1. Records bundle purchase in `bundle_purchase` table
2. Enrolls user in all bundle courses (adds to `takes` table)
3. Sends confirmation SMS and email
4. Logs purchase event

**IPN Payload (from SSLCommerz):**

```json
{
  "status": "VALID",
  "value_a": "123", // user_id
  "value_b": "5", // bundle_id
  "value_c": "5000", // amount
  "value_d": "BUNDLE", // payment type
  "amount": "5000.00",
  "tran_id": "REF123"
}
```

**Backend Processing:**

- Creates unique transaction ID: `{random_chars}{user_id}{bundle_id}`
- Inserts into `bundle_purchase` table
- Enrolls user in all courses with `amount = 0` (bundle courses are free after bundle purchase)
- Sends notifications with course list and access code

### Payment History

**GET** `/user/payment/history`

Get comprehensive payment history including both individual courses and bundles.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "user_info": {
      "name": "John Doe",
      "phone": "01712345678",
      "profile": { "email": "john@example.com" }
    },
    "summary": {
      "total_spent": 15000,
      "total_individual_spent": 10000,
      "total_bundle_spent": 5000,
      "total_courses_enrolled": 8,
      "total_bundles_purchased": 1,
      "total_transactions": 9
    },
    "individual_courses": [
      {
        "course_id": 1,
        "title": "React Fundamentals",
        "paid_amount": 2000,
        "transaction_id": "TXN123",
        "enrollment_date": 1640995200,
        "purchase_type": "individual"
      }
    ],
    "bundle_purchases": [
      {
        "bundle_id": 5,
        "title": "Full Stack Bundle",
        "paid_amount": 5000,
        "transaction_id": "TXN456",
        "purchase_date": 1640995300,
        "purchase_type": "bundle",
        "courses": [
          {
            "id": 2,
            "title": "Node.js Basics",
            "enrollment_date": 1640995300
          }
        ]
      }
    ],
    "all_transactions": [
      // Combined and sorted by date
    ]
  }
}
```

### Frontend Implementation

#### Initiate Bundle Payment

```javascript
const purchaseBundle = async (bundleId, userId, token) => {
  try {
    const response = await fetch(
      `/user/payment/initiate-for-bundle/${bundleId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Redirect to payment gateway
      window.location.href = data.data;
    } else {
      alert("Payment initiation failed");
    }
  } catch (error) {
    console.error("Payment error:", error);
  }
};
```

#### Handle Payment Success

```javascript
// On success page: /bundle/{id}/post-payment/success
useEffect(() => {
  // Show success message
  // Redirect to bundle courses or dashboard
  setTimeout(() => {
    window.location.href = "/my-bundles";
  }, 3000);
}, []);
```

#### Get Payment History

```javascript
const fetchPaymentHistory = async (token) => {
  const response = await fetch("/user/payment/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    const { summary, individual_courses, bundle_purchases } = data.data;
    // Display payment history
  }
};
```

### Payment Gateway Configuration

**Environment Variables:**

```bash
# SSLCommerz Credentials
STORE_ID=your_store_id
STORE_PASSWORD=your_store_password

# URLs
FRONTEND_URL=https://courses.mathpro.com
BACKEND_URL=https://api.mathpro.com
IPN_URL=https://api.mathpro.com/user/payment/ipn
```

**Supported Payment Methods:**

- bKash
- Nagad
- DBBL Mobile Banking
- Rocket (MyCash)
- Cards (Visa/Mastercard)
- Internet Banking

### Database Tables

**bundle_purchase:**

```sql
CREATE TABLE bundle_purchase (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES managerial_auth(id),
  bundle_id INTEGER REFERENCES bundle(id),
  amount INTEGER NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  timestamp INTEGER NOT NULL,
  UNIQUE(user_id, bundle_id)
);
```

**takes (course enrollments):**

```sql
-- Bundle courses have amount = 0
-- Individual courses have amount = actual price paid
INSERT INTO takes (user_id, course_id, amount, transaction_id, timestamp)
VALUES (123, 1, 0, 'TXN123', 1640995200);
```

### Troubleshooting

**Issue: Payment not processing**

- Check IPN URL is accessible from internet
- Verify SSLCommerz credentials
- Check backend logs for IPN webhook calls

**Issue: User not enrolled after payment**

- Check `bundle_purchase` table for record
- Check `takes` table for course enrollments
- Verify bundle has courses associated

**Issue: Duplicate payment**

- `bundle_purchase` table has UNIQUE constraint on (user_id, bundle_id)
- Duplicate purchases update existing record

---

## 🚀 Quick Reference for Common Tasks

### Create a New Bundle (Admin)

```bash
curl -X POST https://your-api.com/admin/bundle/enhanced \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Bundle",
    "price": 5000,
    "url": "my-bundle",
    "short_description": "Bundle description",
    "you_get": ["Benefit 1", "Benefit 2"],
    "chips": ["Tag1", "Tag2"],
    "is_live": true,
    "is_active": true
  }'
```

### Add Courses to Bundle (Admin)

```bash
curl -X POST https://your-api.com/admin/bundle/1/courses \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseIds": [1, 2, 3]}'
```

### Fetch User's Bundles (Frontend)

```javascript
// ✅ Recommended: URL parameter format
const response = await fetch(`/user/bundle/my-bundles/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await response.json();
```

### Check for Duplicate Courses (Frontend)

```javascript
// Before purchase, check if user owns courses in bundle
const response = await fetch(
  `/user/bundle/${bundleId}/check-duplicates/${userId}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
const { hasDuplicates, duplicateCourses } = await response.json();
```

### Initiate Bundle Purchase (Frontend)

```javascript
const response = await fetch(`/user/payment/initiate-for-bundle/${bundleId}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ user_id: userId }),
});
const { data: paymentUrl } = await response.json();
window.location.href = paymentUrl; // Redirect to payment gateway
```

### Common SQL Queries

```sql
-- Check bundle purchases
SELECT bp.*, b.title, u.name
FROM bundle_purchase bp
JOIN bundle b ON bp.bundle_id = b.id
JOIN managerial_auth u ON bp.user_id = u.id
WHERE bp.user_id = 123;

-- Check course enrollments from bundles
SELECT t.*, c.title, b.title as bundle_title
FROM takes t
JOIN course c ON t.course_id = c.id
LEFT JOIN bundle_purchase bp ON t.transaction_id = bp.transaction_id
LEFT JOIN bundle b ON bp.bundle_id = b.id
WHERE t.user_id = 123 AND t.amount = 0;

-- Update bundle visibility
UPDATE bundle SET is_live = true, is_active = true WHERE id = 1;
```

---

## 🎯 Decision Matrix: Which API to Use?

| Task                 | Endpoint                                           | Format    | Why                  |
| -------------------- | -------------------------------------------------- | --------- | -------------------- |
| Create rich bundle   | `POST /admin/bundle/enhanced`                      | Body      | Full feature set     |
| Create simple bundle | `POST /admin/bundle`                               | Body      | Quick setup (legacy) |
| Get user's bundles   | `GET /user/bundle/my-bundles/{user_id}`            | URL Param | Most reliable        |
| Get bundle courses   | `GET /user/bundle/bundle-courses/{user_id}`        | URL Param | Avoids type errors   |
| Check duplicates     | `GET /user/bundle/{id}/check-duplicates/{user_id}` | URL Param | Better UX            |
| Initiate payment     | `POST /user/payment/initiate-for-bundle/{id}`      | Body      | Standard flow        |
