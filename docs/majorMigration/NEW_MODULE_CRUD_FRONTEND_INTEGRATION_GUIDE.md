# Phase 8: Frontend Integration Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Base URLs](#api-base-urls)
3. [Authentication](#authentication)
4. [Database Schema](#database-schema)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Data Structures](#data-structures)
7. [Error Handling](#error-handling)
8. [Quiz Encryption](#quiz-encryption)
9. [File Uploads](#file-uploads)
10. [Bulk Import/Export](#bulk-importexport)
11. [Migration & Setup](#migration--setup)
12. [Code Examples](#code-examples)

---

## Overview

Phase 8 introduces comprehensive course editing features with new v2 APIs. All new endpoints are under `/v2/admin/` to maintain backward compatibility with existing APIs.

### Key Features

- ✅ **Instructor Management** - Assign instructors to modules
- ✅ **Assignment Documents** - Upload assignment question documents (S3)
- ✅ **Quiz Import/Export** - JSON-based quiz management with encryption
- ✅ **Enhanced Module Updates** - New Phase 8 fields support
- ✅ **Module Duplication** - Copy modules with content
- ✅ **Batch Operations** - Update multiple modules at once
- ✅ **Module Reordering** - Reorder modules across chapters
- ✅ **Bulk Import/Export** - Import/export entire courses (CSV/JSON)

### Backward Compatibility

**100% Backward Compatible** - All existing APIs continue to work unchanged. New fields are optional and nullable.

---

## API Base URLs

### V2 APIs (Phase 8 - New)

```
Base URL: /v2/admin
```

### Existing APIs (Still Active)

```
Base URL: /admin (for admin endpoints)
Base URL: /user (for user endpoints)
```

**Important:** Use v2 APIs for all Phase 8 features. Existing APIs remain unchanged.

---

## Authentication

All v2 endpoints require admin authentication:

```javascript
Headers: {
  'Authorization': 'Bearer {admin_jwt_token}',
  'Content-Type': 'application/json'
}
```

### Getting Admin Token

Use existing authentication endpoint:

```
POST /admin/auth/login
```

---

## Database Schema

### Module Table (New Columns Added)

```sql
-- New Phase 8 columns (all nullable for backward compatibility)
ALTER TABLE module ADD COLUMN instructor_id INT NULL;
ALTER TABLE module ADD COLUMN will_evaluated BOOLEAN DEFAULT TRUE;
ALTER TABLE module ADD COLUMN quiz_time_limit INT NULL;
ALTER TABLE module ADD COLUMN quiz_attempt_limit INT NULL;
ALTER TABLE module ADD COLUMN pdf_drive_link TEXT NULL;
ALTER TABLE module ADD COLUMN assignment_question_doc_url TEXT NULL;
ALTER TABLE module ADD COLUMN assignment_question_doc_type VARCHAR(20) NULL;

-- Foreign key
ALTER TABLE module ADD CONSTRAINT fk_module_instructor
  FOREIGN KEY (instructor_id) REFERENCES managerial_auth(id) ON DELETE SET NULL;
```

### Module Table Structure

| Column                         | Type        | Nullable | Description                         |
| ------------------------------ | ----------- | -------- | ----------------------------------- |
| `id`                           | INT         | NO       | Primary key                         |
| `title`                        | VARCHAR     | NO       | Module title                        |
| `description`                  | TEXT        | YES      | Module description                  |
| `data`                         | JSONB       | YES      | Module content (category-specific)  |
| `is_live`                      | BOOLEAN     | YES      | Is module live                      |
| `is_free`                      | BOOLEAN     | YES      | Is module free                      |
| `serial`                       | INT         | NO       | Serial number within chapter        |
| `score`                        | INT         | YES      | Module score                        |
| `chapter_id`                   | INT         | NO       | Foreign key to chapter              |
| `instructor_id`                | INT         | YES      | **NEW** - Instructor/teacher ID     |
| `will_evaluated`               | BOOLEAN     | YES      | **NEW** - For assignments           |
| `quiz_time_limit`              | INT         | YES      | **NEW** - Quiz time limit (minutes) |
| `quiz_attempt_limit`           | INT         | YES      | **NEW** - Quiz attempt limit        |
| `pdf_drive_link`               | TEXT        | YES      | **NEW** - Google Drive PDF link     |
| `assignment_question_doc_url`  | TEXT        | YES      | **NEW** - Assignment doc URL        |
| `assignment_question_doc_type` | VARCHAR(20) | YES      | **NEW** - 's3' or 'drive'           |

### Course Import Tracking Table

```sql
CREATE TABLE course_import_tracking (
    id SERIAL PRIMARY KEY,
    import_id VARCHAR(100) UNIQUE NOT NULL,
    course_id INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    format VARCHAR(10) NOT NULL,
    import_mode VARCHAR(10) NOT NULL,
    summary JSONB NULL,
    errors JSONB NULL,
    warnings JSONB NULL,
    progress JSONB NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL,
    created_by INT NULL
);
```

### Teachers/Instructors

Instructors are stored in `managerial_auth` table where `type = 2` (moderator).

```sql
SELECT id, name, login, profile
FROM managerial_auth
WHERE type = 2
```

---

## API Endpoints Reference

### Module Endpoints (`/v2/admin/module`)

#### 1. Get Module Instructor

```http
GET /v2/admin/module/{moduleId}/instructor
```

**Response:**

```json
{
  "success": true,
  "data": {
    "instructor_id": 5,
    "instructor": {
      "id": 5,
      "name": "John Doe",
      "login": "john.doe",
      "profile": {
        "credibility": "Senior Developer",
        "imageUploadedLink": "https://..."
      }
    }
  }
}
```

#### 2. Assign Instructor

```http
PUT /v2/admin/module/{moduleId}/instructor
```

**Request:**

```json
{
  "instructor_id": 5 // or null to remove
}
```

#### 3. Upload Assignment Document

```http
POST /v2/admin/module/{moduleId}/assignment/document
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: File (PDF, DOC, DOCX) - Max 10MB
- `upload_type`: "s3" | "drive" (optional, default: "s3")

**Response:**

```json
{
  "success": true,
  "data": {
    "document_url": "https://s3.amazonaws.com/...",
    "document_type": "s3",
    "file_name": "assignment.pdf",
    "file_size": 1024000,
    "uploaded_at": "2025-12-15T10:30:00Z"
  }
}
```

#### 4. Delete Assignment Document

```http
DELETE /v2/admin/module/{moduleId}/assignment/document
```

#### 5. Import Quiz

```http
POST /v2/admin/module/{moduleId}/quiz/import
```

**Request:**

```json
{
  "quiz_data": {
    "version": "1.0",
    "quiz": [
      {
        "question": "What is 2 + 2?",
        "question_html": "<p>What is 2 + 2?</p>",
        "options": ["3", "4", "5", "6"],
        "correct_answer": "4", // MUST BE ENCRYPTED BY FRONTEND
        "explanation": "Basic addition", // MUST BE ENCRYPTED BY FRONTEND
        "explanation_html": "<p>Basic addition</p>",
        "points": 1
      }
    ],
    "metadata": {
      "time_limit": 30,
      "attempt_limit": 3
    }
  },
  "merge_mode": "replace" // or "append"
}
```

**⚠️ CRITICAL:** Quiz answers and explanations MUST be encrypted by frontend before sending!

#### 6. Export Quiz

```http
GET /v2/admin/module/{moduleId}/quiz/export?format=full&include_answers=true
```

**Response:**

```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "quiz": [...],
    "metadata": {
      "time_limit": 30,
      "attempt_limit": 3,
      "total_points": 10
    }
  }
}
```

#### 7. Enhanced Module Update

```http
PUT /v2/admin/module/{moduleId}/update-enhanced
```

**Request:**

```json
{
  "title": "Module Title",
  "description": "Description",
  "score": 10,
  "is_live": true,
  "is_free": false,
  "serial": 1,
  "instructor_id": 5, // NEW
  "will_evaluated": true, // NEW - for assignments
  "quiz_time_limit": 30, // NEW - for quizzes
  "quiz_attempt_limit": 3, // NEW - for quizzes
  "data": {
    "category": "VIDEO",
    "videoUrl": "https://...",
    "videoHost": "Youtube",
    "pdf_drive_link": "https://drive.google.com/..." // NEW - optional
  }
}
```

#### 8. Duplicate Module

```http
POST /v2/admin/module/{moduleId}/duplicate?include_content=true&new_chapter_id=10
```

**Query Parameters:**

- `include_content`: boolean (default: true)
- `new_chapter_id`: number (optional)

#### 9. Batch Update Modules

```http
POST /v2/admin/module/batch-update
```

**Request:**

```json
{
  "updates": [
    {
      "module_id": 1,
      "updates": {
        "is_live": true,
        "instructor_id": 5
      }
    },
    {
      "module_id": 2,
      "updates": {
        "will_evaluated": false
      }
    }
  ]
}
```

### Course Endpoints (`/v2/admin/course`)

#### 1. Reorder Modules

```http
PUT /v2/admin/course/{courseId}/modules/reorder
```

**Request:**

```json
{
  "module_orders": [
    {
      "module_id": 1,
      "chapter_id": 10,
      "serial": 1
    },
    {
      "module_id": 2,
      "chapter_id": 10,
      "serial": 2
    }
  ]
}
```

#### 2. Get Full Course (Enhanced)

```http
GET /v2/admin/course/{courseId}/getFull-enhanced
```

**Response:** Same as existing `getFull` but includes Phase 8 fields:

- `instructor_id`, `instructor` object
- `will_evaluated`
- `quiz_time_limit`, `quiz_attempt_limit`
- `pdf_drive_link` in module data

#### 3. Import Course

```http
POST /v2/admin/course/import
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: CSV or JSON file
- `format`: "csv" | "json" (auto-detected from extension)
- `import_mode`: "create" | "update" | "upsert" (default: "create")
- `validate_only`: boolean (default: false)

**Response:**

```json
{
  "success": true,
  "data": {
    "import_id": "import_123456",
    "status": "processing",
    "message": "Import started"
  }
}
```

**Note:** Import is async. Use `import_id` to check status.

#### 4. Get Import Status

```http
GET /v2/admin/course/import/{importId}/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "import_id": "import_123456",
    "status": "completed", // processing | completed | failed | partial
    "course_id": 456,
    "summary": {
      "course_created": true,
      "chapters_created": 5,
      "modules_created": 25
    },
    "errors": [],
    "warnings": [],
    "progress": {
      "total_items": 30,
      "processed_items": 30,
      "percentage": 100
    },
    "started_at": "2025-12-15T10:30:00Z",
    "completed_at": "2025-12-15T10:35:00Z"
  }
}
```

#### 5. Export Course

```http
GET /v2/admin/course/{courseId}/export?format=json&include_content=true&include_quiz_answers=false
```

**Query Parameters:**

- `format`: "json" | "csv" (default: "json")
- `include_content`: boolean (default: true)
- `include_quiz_answers`: boolean (default: false)

#### 6. Get Import Template

```http
GET /v2/admin/course/import/template?format=json&example_data=true
```

Returns template file for download.

---

## Data Structures

### Module Object (Enhanced)

```typescript
interface Module {
  id: number;
  title: string;
  description: string | null;
  data: {
    category: "VIDEO" | "ASSIGNMENT" | "CODE" | "QUIZ" | "PDF" | "TEXT";
    // Category-specific fields
    videoUrl?: string;
    videoHost?: "Youtube" | "BunnyCDN";
    pdf_drive_link?: string; // NEW - Google Drive link
    deadline?: string; // ISO 8601 for assignments
    quiz?: QuizQuestion[]; // For QUIZ modules
    // ... other category fields
  };
  is_live: boolean;
  is_free: boolean;
  serial: number;
  score: number;
  chapter_id: number;

  // NEW Phase 8 fields
  instructor_id: number | null;
  instructor?: {
    id: number;
    name: string;
    login: string;
    profile: object;
  } | null;
  will_evaluated: boolean | null; // For assignments
  quiz_time_limit: number | null; // Minutes
  quiz_attempt_limit: number | null;
  pdf_drive_link: string | null;
  assignment_question_doc_url: string | null;
  assignment_question_doc_type: "s3" | "drive" | null;
}
```

### Quiz Question Structure

```typescript
interface QuizQuestion {
  question: string; // Plain text
  question_html: string; // HTML with LaTeX support
  question_latex?: string; // Optional LaTeX
  options: string[];
  answer: string; // ENCRYPTED - frontend must encrypt before sending
  explanation: string; // ENCRYPTED - frontend must encrypt before sending
  explanation_html: string; // ENCRYPTED HTML
  explanation_latex?: string; // Optional encrypted LaTeX
  points: number;
}
```

### Course Import JSON Format

```json
{
  "version": "1.0",
  "format_version": "1.0",
  "course": {
    "title": "Course Title",
    "description": "Course description",
    "language": "English" | "বাংলা",
    "price": 5000,
    "x_price": 8000,
    "short_description": "Short description",
    "intro_video": "https://...",
    "url": "https://course-url.com",
    "is_live": true
  },
  "chapters": [
    {
      "serial": 1,
      "title": "Chapter Title",
      "is_free": false,
      "is_live": true,
      "modules": [
        {
          "serial": 1,
          "title": "Module Title",
          "category": "VIDEO",
          "score": 10,
          "is_live": true,
          "is_free": false,
          "description": "Module description",
          "instructor_id": 5,
          "will_evaluated": true,
          "quiz_time_limit": 30,
          "quiz_attempt_limit": 3,
          "data": {
            "category": "VIDEO",
            "videoUrl": "https://...",
            "videoHost": "Youtube",
            "pdf_drive_link": "https://drive.google.com/..."
          }
        }
      ]
    }
  ]
}
```

---

## Error Handling

All v2 endpoints return consistent error format:

```typescript
interface ErrorResponse {
  success: false;
  error: string; // Human-readable message
  code: string; // Error code (e.g., "MODULE_NOT_FOUND")
  details?: {
    [field: string]: string; // Field-level validation errors
  };
  timestamp: string; // ISO 8601
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

### Error Codes

**Module Errors:**

- `MODULE_NOT_FOUND`
- `INVALID_MODULE_CATEGORY`
- `VALIDATION_ERROR`
- `INSTRUCTOR_NOT_FOUND`

**Quiz Errors:**

- `QUIZ_INVALID_JSON`
- `QUIZ_ANSWER_MISMATCH`
- `QUIZ_INSUFFICIENT_OPTIONS`

**Import Errors:**

- `IMPORT_VALIDATION_ERROR`
- `IMPORT_PARSING_ERROR`
- `IMPORT_NOT_FOUND`

**File Upload Errors:**

- `FILE_TOO_LARGE`
- `FILE_INVALID_TYPE`
- `UPLOAD_FAILED`

---

## Quiz Encryption

**⚠️ CRITICAL:** Frontend MUST encrypt quiz answers and explanations before sending to backend!

### Encryption Requirements

1. **Environment Variable:**

   ```env
   NEXT_PUBLIC_SECRET_KEY_QUIZ=your_secret_key_here
   ```

2. **Encryption Function:**
   Use the same encryption method as existing quiz system (`encryptString()` function).

3. **What to Encrypt:**

   - `correct_answer` field in quiz questions
   - `explanation` field in quiz questions
   - `explanation_html` field in quiz questions

4. **When to Encrypt:**

   - Before sending to `POST /v2/admin/module/{moduleId}/quiz/import`
   - Before sending quiz data in bulk course import

5. **Backend Behavior:**
   - Backend stores encrypted data as-is
   - Backend does NOT encrypt/decrypt
   - Backend validates structure only

### Example Encryption Flow

```javascript
// Frontend code example
import { encryptString } from "@/utils/encryption"; // Your encryption utility

const quizData = {
  quiz: [
    {
      question: "What is 2 + 2?",
      question_html: "<p>What is 2 + 2?</p>",
      options: ["3", "4", "5", "6"],
      correct_answer: encryptString(
        "4",
        process.env.NEXT_PUBLIC_SECRET_KEY_QUIZ
      ), // ENCRYPT
      explanation: encryptString(
        "Basic addition",
        process.env.NEXT_PUBLIC_SECRET_KEY_QUIZ
      ), // ENCRYPT
      explanation_html: encryptString(
        "<p>Basic addition</p>",
        process.env.NEXT_PUBLIC_SECRET_KEY_QUIZ
      ), // ENCRYPT
      points: 1,
    },
  ],
};

// Send to backend
await fetch(`/v2/admin/module/${moduleId}/quiz/import`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ quiz_data: quizData }),
});
```

---

## File Uploads

### Assignment Document Upload

**Endpoint:** `POST /v2/admin/module/{moduleId}/assignment/document`

**Requirements:**

- File types: PDF, DOC, DOCX
- Max size: 10MB
- Content-Type: `multipart/form-data`

**Example (React/Next.js):**

```javascript
const uploadAssignmentDocument = async (moduleId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_type", "s3");

  const response = await fetch(
    `/v2/admin/module/${moduleId}/assignment/document`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - browser sets it with boundary
      },
      body: formData,
    }
  );

  return await response.json();
};
```

### Google Drive Links

For PDF modules, you can use Google Drive links instead of S3:

**Format:**

- `https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing`
- `https://drive.google.com/uc?export=download&id={FILE_ID}`

**Validation:**

- Backend validates Google Drive URL format
- Store full shareable URL in `pdf_drive_link` field

---

## Bulk Import/Export

### Import Process

1. **Upload File:**

   ```javascript
   const formData = new FormData();
   formData.append("file", file);
   formData.append("format", "json");
   formData.append("import_mode", "create");
   formData.append("validate_only", "false");

   const response = await fetch("/v2/admin/course/import", {
     method: "POST",
     headers: { Authorization: `Bearer ${token}` },
     body: formData,
   });

   const { import_id } = await response.json();
   ```

2. **Poll Status:**

   ```javascript
   const checkImportStatus = async (importId) => {
     const response = await fetch(
       `/v2/admin/course/import/${importId}/status`,
       {
         headers: { Authorization: `Bearer ${token}` },
       }
     );
     return await response.json();
   };

   // Poll every 2 seconds
   const interval = setInterval(async () => {
     const status = await checkImportStatus(importId);
     if (status.data.status !== "processing") {
       clearInterval(interval);
       // Handle completion/failure
     }
   }, 2000);
   ```

### Export Process

```javascript
const exportCourse = async (courseId) => {
  const response = await fetch(
    `/v2/admin/course/${courseId}/export?format=json&include_content=true&include_quiz_answers=false`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();

  // Download as file
  const blob = new Blob([JSON.stringify(data.data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `course_${courseId}_export.json`;
  a.click();
};
```

### Import Template

```javascript
const downloadTemplate = async (format = "json") => {
  const response = await fetch(
    `/v2/admin/course/import/template?format=${format}&example_data=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (format === "json") {
    const data = await response.json();
    // Download JSON
  } else {
    const blob = await response.blob();
    // Download CSV
  }
};
```

---

## Migration & Setup

### Backend Migration

Before using Phase 8 APIs, backend must run migrations:

```bash
node database/runNewCourseUpdateMigrations.js
```

This adds new columns to the `module` table and creates the `course_import_tracking` table.

### Frontend Setup

1. **Install Dependencies:**
   No new dependencies required for frontend.

2. **Environment Variables:**

   ```env
   NEXT_PUBLIC_SECRET_KEY_QUIZ=your_quiz_encryption_key
   ```

3. **API Base URL:**
   ```javascript
   const API_BASE_URL =
     process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";
   const V2_API_BASE = `${API_BASE_URL}/v2/admin`;
   ```

---

## Code Examples

### Complete Module Update with Phase 8 Fields

```javascript
const updateModule = async (moduleId, moduleData) => {
  const response = await fetch(`/v2/admin/module/${moduleId}/update-enhanced`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: moduleData.title,
      description: moduleData.description,
      score: moduleData.score,
      is_live: moduleData.is_live,
      is_free: moduleData.is_free,
      serial: moduleData.serial,
      instructor_id: moduleData.instructor_id, // NEW
      will_evaluated: moduleData.will_evaluated, // NEW
      quiz_time_limit: moduleData.quiz_time_limit, // NEW
      quiz_attempt_limit: moduleData.quiz_attempt_limit, // NEW
      data: {
        ...moduleData.data,
        pdf_drive_link: moduleData.pdf_drive_link, // NEW
      },
    }),
  });

  return await response.json();
};
```

### Get Module with Instructor

```javascript
const getModuleWithInstructor = async (moduleId) => {
  const response = await fetch(`/v2/admin/module/${moduleId}/instructor`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();

  if (result.success) {
    return {
      moduleId,
      instructorId: result.data.instructor_id,
      instructor: result.data.instructor,
    };
  }

  throw new Error(result.error);
};
```

### Batch Update Modules

```javascript
const batchUpdateModules = async (updates) => {
  const response = await fetch("/v2/admin/module/batch-update", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });

  const result = await response.json();

  if (result.success) {
    console.log(
      `Updated: ${result.data.updated_count}, Failed: ${result.data.failed_count}`
    );
    result.data.results.forEach((r) => {
      if (!r.success) {
        console.error(`Module ${r.module_id}: ${r.error}`);
      }
    });
  }

  return result;
};
```

### Duplicate Module

```javascript
const duplicateModule = async (moduleId, options = {}) => {
  const { includeContent = true, newChapterId = null } = options;

  const params = new URLSearchParams({
    include_content: includeContent.toString(),
  });
  if (newChapterId) params.append("new_chapter_id", newChapterId);

  const response = await fetch(
    `/v2/admin/module/${moduleId}/duplicate?${params}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return await response.json();
};
```

---

## Testing Checklist

### Module Features

- [ ] Get module instructor
- [ ] Assign/remove instructor
- [ ] Upload assignment document
- [ ] Delete assignment document
- [ ] Import quiz (with encryption)
- [ ] Export quiz
- [ ] Enhanced module update
- [ ] Duplicate module
- [ ] Batch update modules

### Course Features

- [ ] Reorder modules
- [ ] Get full course (enhanced)
- [ ] Import course (JSON)
- [ ] Import course (CSV)
- [ ] Check import status
- [ ] Export course
- [ ] Download import template

### Error Handling

- [ ] Validation errors show field-level details
- [ ] 404 errors for non-existent resources
- [ ] 422 errors for validation failures
- [ ] 401 errors for unauthorized access

---

## Support & Questions

For questions or issues:

1. Check error responses for detailed field-level errors
2. Verify authentication token is valid
3. Ensure all required fields are provided
4. Check that file uploads meet size/type requirements
5. Verify quiz encryption is working correctly

---

## Teacher Management APIs

### Overview

Teachers are **platform-wide entities** stored in `managerial_auth` table. They can exist independently and be linked to courses, bundles, and modules as needed.

### Teacher Endpoints (`/v2/admin/teacher`)

#### 1. Get All Teachers (Names Only)

```http
GET /v2/admin/teacher/list-names
```

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Arghya Pal" },
    { "id": 2, "name": "John Doe" }
  ]
}
```

#### 2. Get All Teachers (Full Info)

```http
GET /v2/admin/teacher/list-full
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Arghya Pal",
      "role": "Instructor at Math Pro",
      "university": "BUET",
      "bio": "Software Engineer at Google",
      "image": "/CP instructors/arghya_pal_linkedin.jpeg",
      "achievements": [
        "Software Engineer at Google",
        "ACM ICPC WORLD Finalist"
      ],
      "social": {
        "facebook": "https://www.facebook.com/...",
        "linkedin": "https://www.linkedin.com/..."
      },
      "courses_teaching": [2, 5],
      "bundles_teaching": [1],
      "category": "instructor",
      "isActive": true,
      "isPrivileged": false
    }
  ]
}
```

#### 3. Get Teacher Full Info

```http
GET /v2/admin/teacher/{teacherId}/full
```

**Response:** Same structure as list-full but for single teacher, includes:

- `courses_teaching_details` - Full course objects
- `bundles_teaching_details` - Full bundle objects

#### 4. Get Teachers by Course

```http
GET /v2/admin/teacher/by-course/{courseId}
```

**Response:** Array of teachers teaching the specified course

#### 5. Get Teachers by Bundle

```http
GET /v2/admin/teacher/by-bundle/{bundleId}
```

**Response:** Array of teachers teaching the specified bundle

#### 6. Create Teacher (Enhanced)

```http
POST /v2/admin/teacher/create-enhanced
```

**Request:**

```json
{
  "name": "Arghya Pal",
  "login": "01712345678", // Phone or email
  "role": "Instructor at Math Pro",
  "university": "BUET",
  "bio": "Software Engineer at Google",
  "image": "/CP instructors/arghya_pal_linkedin.jpeg",
  "achievements": [
    "Software Engineer at Google",
    "ACM ICPC WORLD Finalist-2 Times in a Row"
  ],
  "social": {
    "facebook": "https://www.facebook.com/arghya.pal.3557",
    "linkedin": "https://www.linkedin.com/in/arghya-pal-240a241b2/"
  },
  "courses_teaching": [2], // Optional - array of course IDs
  "bundles_teaching": [1], // Optional - array of bundle IDs
  "category": "instructor",
  "isActive": true,
  "isPrivileged": false // CRITICAL: Controls admin panel access
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Arghya Pal",
    "login": "01712345678",
    "isPrivileged": false,
    "credentials_sent": false,
    "message": "Teacher created without admin panel access."
  }
}
```

**Important Notes:**

- If `isPrivileged = false`: No credentials sent, no `type=2` assigned, teacher exists but can't login
- If `isPrivileged = true`: Credentials sent via SMS, `type=2` assigned, teacher can access admin panel
- `courses_teaching` and `bundles_teaching` are optional - teachers can exist without them

#### 7. Update Teacher (Enhanced)

```http
PUT /v2/admin/teacher/{teacherId}/update-enhanced
```

**Request:** Same fields as create, all optional

**Special Behavior:**

- If `isPrivileged` changes from `false` to `true`: Credentials are generated and sent
- If `isPrivileged` changes from `true` to `false`: Admin access revoked, but teacher still exists

### Teacher Data Structure

```typescript
interface Teacher {
  id: number;
  name: string;
  login: string; // Phone or email
  role: string | null;
  university: string | null;
  bio: string | null;
  image: string | null;
  achievements: string[];
  social: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  courses_teaching: number[]; // Course IDs
  courses_teaching_details?: Course[]; // Full course objects (in full response)
  bundles_teaching: number[]; // Bundle IDs
  bundles_teaching_details?: Bundle[]; // Full bundle objects (in full response)
  category: "instructor" | "teacher" | string;
  isActive: boolean;
  isPrivileged: boolean; // Controls admin panel access
  created_at: string;
  updated_at: string;
}
```

### Teacher Creation Example

```javascript
const createTeacher = async (teacherData) => {
  const response = await fetch("/v2/admin/teacher/create-enhanced", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: teacherData.name,
      login: teacherData.login,
      role: teacherData.role,
      university: teacherData.university,
      bio: teacherData.bio,
      image: teacherData.image,
      achievements: teacherData.achievements,
      social: teacherData.social,
      courses_teaching: teacherData.courses_teaching || [],
      bundles_teaching: teacherData.bundles_teaching || [],
      category: teacherData.category || "instructor",
      isActive:
        teacherData.isActive !== undefined ? teacherData.isActive : true,
      isPrivileged: teacherData.isPrivileged || false, // CRITICAL FLAG
    }),
  });

  return await response.json();
};
```

### Additional Recommended APIs

### Additional Teacher Management APIs

#### 8. Assign Teacher to Course

```http
POST /v2/admin/teacher/{teacherId}/assign-course
```

**Request:**

```json
{
  "course_id": 5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "course_id": 5,
    "message": "Teacher assigned to course successfully"
  }
}
```

#### 9. Remove Teacher from Course

```http
DELETE /v2/admin/teacher/{teacherId}/course/{courseId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Teacher removed from course successfully"
  }
}
```

#### 10. Get All Courses for Teacher

```http
GET /v2/admin/teacher/{teacherId}/courses
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "React Fundamentals",
      "url": "react-fundamentals",
      "price": 5000,
      "description": "Learn React from scratch"
    }
  ]
}
```

#### 11. Assign Teacher to Bundle

```http
POST /v2/admin/teacher/{teacherId}/assign-bundle
```

**Request:**

```json
{
  "bundle_id": 3
}
```

#### 12. Remove Teacher from Bundle

```http
DELETE /v2/admin/teacher/{teacherId}/bundle/{bundleId}
```

#### 13. Get All Bundles for Teacher

```http
GET /v2/admin/teacher/{teacherId}/bundles
```

#### 14. Search Teachers

```http
GET /v2/admin/teacher/search?q=arghya&category=instructor&isActive=true&limit=10&offset=0
```

**Query Parameters:**

- `q` - Search term (name, role, university)
- `category` - Filter by category
- `isActive` - Filter by active status (true/false)
- `isPrivileged` - Filter by privilege status (true/false)
- `hasCourses` - Filter teachers with/without courses (true/false)
- `limit` - Number of results (default: all)
- `offset` - Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Arghya Pal",
      "login": "01712345678",
      "role": "Instructor at Math Pro",
      "university": "BUET",
      "category": "instructor",
      "isActive": true,
      "isPrivileged": false
    }
  ],
  "count": 1
}
```

#### 15. Upload Teacher Image

```http
POST /v2/admin/teacher/{teacherId}/image
Content-Type: multipart/form-data
```

**Form Data:**

- `image`: File (JPG, PNG, GIF, WEBP) - Max 5MB

**Response:**

```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "image": "https://s3.amazonaws.com/bucket/teachers/uuid.jpg",
    "message": "Teacher image updated successfully"
  }
}
```

#### 16. Delete Teacher Image

```http
DELETE /v2/admin/teacher/{teacherId}/image
```

#### 17. Get Teacher Statistics

```http
GET /v2/admin/teacher/{teacherId}/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "total_courses": 5,
    "total_bundles": 2,
    "total_modules": 25,
    "total_students": 150,
    "average_rating": null
  }
}
```

#### 18. Toggle Teacher Active Status

```http
PUT /v2/admin/teacher/{teacherId}/toggle-active
```

**Request:**

```json
{
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "teacher_id": 1,
    "isActive": true,
    "message": "Teacher activated successfully"
  }
}
```

#### 19. Bulk Assign Teachers to Course

```http
POST /v2/admin/teacher/bulk-assign-course
```

**Request:**

```json
{
  "course_id": 5,
  "teacher_ids": [1, 2, 3]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "course_id": 5,
    "total": 3,
    "successful": 2,
    "failed": 1,
    "results": {
      "success": [1, 2],
      "failed": [
        {
          "teacher_id": 3,
          "error": "Teacher is already assigned to this course",
          "code": "ALREADY_ASSIGNED"
        }
      ]
    }
  }
}
```

#### 20. Bulk Assign Teachers to Bundle

```http
POST /v2/admin/teacher/bulk-assign-bundle
```

**Request:**

```json
{
  "bundle_id": 3,
  "teacher_ids": [1, 2, 3]
}
```
