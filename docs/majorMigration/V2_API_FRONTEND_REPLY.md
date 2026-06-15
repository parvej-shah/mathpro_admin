# V2 API Implementation - Frontend Reply Document

**Date:** January 2025  
**Status:** ✅ **ALL REQUIRED ENDPOINTS IMPLEMENTED**  
**Base URL:** `/v2/admin`

---

## 📋 Executive Summary

All required v2 APIs for Phase 8 course editing have been **fully implemented and are ready for use**. The critical `getFull-enhanced` endpoint has been fixed to return the correct response format. All endpoints follow consistent error handling and response formats.

### ✅ Implementation Status

- 🔴 **CRITICAL:** `GET /v2/admin/course/{courseId}/getFull-enhanced` - ✅ **IMPLEMENTED & FIXED**
- 🟡 **HIGH Priority:** All 7 module endpoints - ✅ **IMPLEMENTED**
- 🟡 **HIGH Priority:** All course endpoints - ✅ **IMPLEMENTED**
- 🟢 **MEDIUM Priority:** All endpoints - ✅ **IMPLEMENTED**

---

## 🔐 Authentication

All endpoints require admin authentication:

```
Authorization: Bearer {admin_jwt_token}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

---

## 📡 API Endpoints

### 1. Course APIs

#### 1.1 Get Course Full (Enhanced) - 🔴 CRITICAL

**Endpoint:** `GET /v2/admin/course/{courseId}/getFull-enhanced`

**Description:** Returns complete course data with chapters, modules, and all Phase 8 fields.

**Request:**

```http
GET /v2/admin/course/5/getFull-enhanced
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "React Fundamentals",
    "description": "Learn React from scratch",
    "price": 5000,
    "x_price": 8000,
    "language": "English",
    "is_live": true,
    "chapters": [
      {
        "id": 10,
        "title": "Chapter 1: Introduction",
        "serial": 1,
        "is_free": false,
        "is_live": true,
        "modules": [
          {
            "id": 25,
            "title": "Module 1: Getting Started",
            "category": "VIDEO",
            "serial": 1,
            "score": 10,
            "is_live": true,
            "is_free": false,
            "description": "Module description",
            // Phase 8 fields (all optional/nullable)
            "instructor_id": 5,
            "instructor": {
              "id": 5,
              "name": "John Doe",
              "login": "john.doe",
              "profile": {
                "role": "Instructor",
                "university": "BUET"
              }
            },
            "will_evaluated": true,
            "quiz_time_limit": 30,
            "quiz_attempt_limit": 3,
            "pdf_drive_link": "https://drive.google.com/file/d/...",
            "assignment_question_doc_url": "https://s3.amazonaws.com/...",
            "assignment_question_doc_type": "s3",
            "data": {
              "category": "VIDEO",
              "video_link": "https://youtube.com/..."
              // Other module-specific data
            }
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "error": "Course not found",
  "code": "COURSE_NOT_FOUND"
}
```

**400 Bad Request (Invalid ID):**

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "courseId": "Course ID must be a valid number"
  }
}
```

**Key Features:**

- ✅ Returns all Phase 8 fields (even if null)
- ✅ Includes instructor details if `instructor_id` is set
- ✅ Works with existing courses (backward compatible)
- ✅ Response wrapped in `data` object (fixed)

---

#### 1.2 Reorder Modules

**Endpoint:** `PUT /v2/admin/course/{courseId}/modules/reorder`

**Description:** Batch reorder modules across chapters.

**Request:**

```http
PUT /v2/admin/course/5/modules/reorder
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "module_orders": [
    {
      "module_id": 25,
      "chapter_id": 10,
      "serial": 1
    },
    {
      "module_id": 26,
      "chapter_id": 10,
      "serial": 2
    },
    {
      "module_id": 27,
      "chapter_id": 11,
      "serial": 1
    }
  ]
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Modules reordered successfully",
    "updated_count": 3
  }
}
```

**Error Responses:**

**400 Bad Request (Validation Error):**

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "module_25": "Module does not exist or does not belong to this course"
  }
}
```

**Key Features:**

- ✅ Updates all modules in a single transaction
- ✅ Validates module and chapter existence
- ✅ Supports cross-chapter moves
- ✅ Returns count of updated modules

---

#### 1.3 Export Course

**Endpoint:** `GET /v2/admin/course/{courseId}/export`

**Description:** Export course to JSON or CSV format.

**Query Parameters:**

- `format` (optional): `"json"` | `"csv"` (default: `"json"`)
- `include_content` (optional): `"true"` | `"false"` (default: `"true"`)
- `include_quiz_answers` (optional): `"true"` | `"false"` (default: `"false"`)

**Request:**

```http
GET /v2/admin/course/5/export?format=json&include_content=true&include_quiz_answers=false
Authorization: Bearer {token}
```

**Success Response (200 OK):**

**JSON Format:**

```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "format_version": "1.0",
    "exported_at": "2025-01-15T10:00:00.000Z",
    "course": {
      "id": 5,
      "title": "React Fundamentals",
      "description": "Course description",
      "language": "English",
      "price": 5000,
      "x_price": 8000
    },
    "chapters": [
      {
        "serial": 1,
        "title": "Chapter 1",
        "is_free": false,
        "is_live": true,
        "modules": [
          {
            "serial": 1,
            "title": "Module 1",
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
              // Module content (if include_content=true)
            }
          }
        ]
      }
    ]
  }
}
```

**CSV Format:**

- Returns CSV file with `Content-Type: text/csv`
- Includes all course, chapter, and module data

**Key Features:**

- ✅ Supports JSON and CSV formats
- ✅ Can exclude content for structure-only export
- ✅ Quiz answers encrypted if included
- ✅ Includes all Phase 8 fields

---

#### 1.4 Import Course

**Endpoint:** `POST /v2/admin/course/import`

**Description:** Import course from CSV or JSON file (async processing).

**Request:**

```http
POST /v2/admin/course/import
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: File (CSV or JSON) - Max 50MB
- `format` (optional): `"csv"` | `"json"` (auto-detected if not provided)
- `import_mode` (optional): `"create"` | `"update"` | `"upsert"` (default: `"create"`)
- `validate_only` (optional): `"true"` | `"false"` (default: `"false"`)

**Success Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "import_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "message": "Import started successfully"
  }
}
```

**Error Responses:**

**400 Bad Request (Invalid File):**

```json
{
  "success": false,
  "error": "Invalid file format. Only CSV and JSON files are allowed",
  "code": "INVALID_FILE_FORMAT"
}
```

**Key Features:**

- ✅ Async processing for large imports
- ✅ Returns `import_id` for status tracking
- ✅ Supports create, update, and upsert modes
- ✅ File size limit: 50MB

---

#### 1.5 Get Import Status

**Endpoint:** `GET /v2/admin/course/import/{importId}/status`

**Description:** Check status of course import operation.

**Request:**

```http
GET /v2/admin/course/import/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "import_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "course_id": 123,
    "summary": {
      "course_created": true,
      "chapters_created": 5,
      "modules_created": 20
    },
    "errors": [
      {
        "line": 10,
        "field": "module_title",
        "message": "Module title is required"
      }
    ],
    "warnings": [
      {
        "line": 15,
        "field": "module_serial",
        "message": "Duplicate serial, auto-corrected"
      }
    ],
    "progress": {
      "total_items": 100,
      "processed_items": 100,
      "percentage": 100
    },
    "started_at": "2025-01-15T10:00:00Z",
    "completed_at": "2025-01-15T10:05:00Z"
  }
}
```

**Status Values:**

- `"processing"` - Import in progress (poll every 2 seconds)
- `"completed"` - Import finished successfully
- `"failed"` - Import failed
- `"partial"` - Some items succeeded, some failed

**Key Features:**

- ✅ Detailed error reporting with line numbers
- ✅ Progress tracking for long-running imports
- ✅ Supports polling (frontend polls every 2 seconds if status="processing")

---

#### 1.6 Download Import Template

**Endpoint:** `GET /v2/admin/course/import/template`

**Description:** Download course import template (JSON or CSV) with example data.

**Query Parameters:**

- `format` (optional): `"json"` | `"csv"` (default: `"json"`)
- `example_data` (optional): `"true"` | `"false"` (default: `"true"`)

**Request:**

```http
GET /v2/admin/course/import/template?format=json&example_data=true
Authorization: Bearer {token}
```

**Success Response (200 OK):**

- Returns file download
- Content-Type: `application/json` or `text/csv`
- Includes example data if `example_data=true`

**Key Features:**

- ✅ Matches import format exactly
- ✅ Includes all required and optional fields
- ✅ Provides example data for reference

---

### 2. Module APIs

#### 2.1 Update Module (Enhanced)

**Endpoint:** `PUT /v2/admin/module/{moduleId}/update-enhanced`

**Description:** Update module with Phase 8 fields support.

**Request:**

```http
PUT /v2/admin/module/25/update-enhanced
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "title": "Updated Module Title",
  "description": "Updated description",
  "category": "VIDEO",
  "score": 10,
  "is_live": true,
  "is_free": false,
  // Phase 8 fields (all optional)
  "instructor_id": 5,
  "will_evaluated": true,
  "quiz_time_limit": 30,
  "quiz_attempt_limit": 3,
  "pdf_drive_link": "https://drive.google.com/file/d/...",
  "assignment_question_doc_url": "https://s3.amazonaws.com/...",
  "assignment_question_doc_type": "s3",
  "data": {
    "category": "VIDEO",
    "video_link": "https://youtube.com/..."
  }
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "title": "Updated Module Title"
    // ... all updated fields
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "error": "Module not found",
  "code": "MODULE_NOT_FOUND"
}
```

**400 Bad Request (Invalid Instructor):**

```json
{
  "success": false,
  "error": "Instructor not found",
  "code": "INSTRUCTOR_NOT_FOUND"
}
```

**Key Features:**

- ✅ Validates instructor_id exists if provided
- ✅ Handles null values for optional fields
- ✅ Updates module data structure
- ✅ All Phase 8 fields supported

---

#### 2.2 Upload Assignment Document

**Endpoint:** `POST /v2/admin/module/{moduleId}/assignment/document`

**Description:** Upload assignment question document (PDF, DOC, DOCX) to S3.

**Request:**

```http
POST /v2/admin/module/25/assignment/document
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: File (PDF, DOC, DOCX) - Max 10MB

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "document_url": "https://s3.amazonaws.com/bucket/assignments/uuid.pdf",
    "document_type": "s3",
    "file_name": "assignment.pdf",
    "file_size": 1024000,
    "module_id": 25,
    "message": "Assignment document uploaded successfully"
  }
}
```

**Error Responses:**

**400 Bad Request (Invalid File Type):**

```json
{
  "success": false,
  "error": "Invalid file type. Allowed types: .pdf, .doc, .docx",
  "code": "INVALID_FILE_TYPE"
}
```

**400 Bad Request (File Too Large):**

```json
{
  "success": false,
  "error": "File size exceeds 10MB limit",
  "code": "FILE_TOO_LARGE"
}
```

**Key Features:**

- ✅ Validates file type (PDF, DOC, DOCX)
- ✅ File size limit: 10MB
- ✅ Uploads to S3 and returns public URL
- ✅ Automatically updates module's `assignment_question_doc_url` and `assignment_question_doc_type` fields

---

#### 2.3 Delete Assignment Document

**Endpoint:** `DELETE /v2/admin/module/{moduleId}/assignment/document`

**Description:** Delete assignment document from S3 and clear module fields.

**Request:**

```http
DELETE /v2/admin/module/25/assignment/document
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "Assignment document deleted successfully"
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "error": "Module not found",
  "code": "MODULE_NOT_FOUND"
}
```

**Key Features:**

- ✅ Deletes file from S3
- ✅ Clears `assignment_question_doc_url` and `assignment_question_doc_type` fields

---

#### 2.4 Import Quiz

**Endpoint:** `POST /v2/admin/module/{moduleId}/quiz/import`

**Description:** Import quiz questions from JSON. **⚠️ CRITICAL:** Frontend must send pre-encrypted answers.

**Request:**

```http
POST /v2/admin/module/25/quiz/import
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "quiz_data": {
    "version": "1.0",
    "quiz": [
      {
        "question": "What is 2+2?",
        "question_html": "<p>What is 2+2?</p>",
        "options": ["3", "4", "5"],
        "correct_answer": "encrypted_string_here",
        "explanation": "encrypted_string_here",
        "explanation_html": "<p>encrypted_string_here</p>",
        "points": 10
      }
    ],
    "metadata": {
      "time_limit": 30,
      "attempt_limit": 3
    }
  },
  "merge_mode": "replace"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "title": "Module Title",
    "data": {
      "category": "QUIZ",
      "quiz": [
        // Quiz questions
      ]
    },
    "quiz_time_limit": 30,
    "quiz_attempt_limit": 3
  }
}
```

**⚠️ CRITICAL NOTES:**

- ✅ Backend does NOT encrypt answers - frontend must encrypt before sending
- ✅ Backend stores encrypted data as-is
- ✅ Use `NEXT_PUBLIC_SECRET_KEY_QUIZ` for encryption on frontend

**Error Responses:**

**400 Bad Request (Invalid Quiz Structure):**

```json
{
  "success": false,
  "error": "Invalid quiz structure",
  "code": "INVALID_QUIZ_STRUCTURE",
  "details": {
    "quiz": "Quiz array is required"
  }
}
```

**Key Features:**

- ✅ Validates quiz structure
- ✅ Updates `quiz_time_limit` and `quiz_attempt_limit` from metadata
- ✅ Supports merge modes: `"replace"` (default) or `"append"`

---

#### 2.5 Export Quiz

**Endpoint:** `GET /v2/admin/module/{moduleId}/quiz/export`

**Description:** Export quiz questions to JSON format.

**Query Parameters:**

- `format` (optional): `"full"` | `"minimal"` (default: `"full"`)
- `include_answers` (optional): `"true"` | `"false"` (default: `"false"`)

**Request:**

```http
GET /v2/admin/module/25/quiz/export?format=full&include_answers=false
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "quiz": [
      {
        "question": "What is 2+2?",
        "question_html": "<p>What is 2+2?</p>",
        "options": ["3", "4", "5"],
        "correct_answer": "encrypted_string", // Only if include_answers=true
        "explanation": "encrypted_string", // Only if include_answers=true
        "explanation_html": "<p>encrypted_string</p>", // Only if include_answers=true
        "points": 10
      }
    ],
    "metadata": {
      "time_limit": 30,
      "attempt_limit": 3,
      "total_points": 10
    }
  }
}
```

**Key Features:**

- ✅ Returns encrypted answers if `include_answers=true`
- ✅ Includes all quiz metadata
- ✅ Matches import format exactly

---

#### 2.6 Get/Assign Instructor

**Endpoint:** `GET /v2/admin/module/{moduleId}/instructor`  
**Endpoint:** `PUT /v2/admin/module/{moduleId}/instructor`

**Description:** Get or assign instructor to module.

**GET Request:**

```http
GET /v2/admin/module/25/instructor
Authorization: Bearer {token}
```

**GET Success Response (200 OK):**

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
        "role": "Instructor",
        "university": "BUET"
      }
    }
  }
}
```

**PUT Request:**

```http
PUT /v2/admin/module/25/instructor
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "instructor_id": 5
}
```

**To Remove Instructor:**

```json
{
  "instructor_id": null
}
```

**PUT Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "instructor_id": 5,
    "instructor": {
      "id": 5,
      "name": "John Doe",
      "login": "john.doe",
      "profile": {}
    },
    "message": "Instructor assigned successfully"
  }
}
```

**Error Responses:**

**404 Not Found:**

```json
{
  "success": false,
  "error": "Instructor not found",
  "code": "INSTRUCTOR_NOT_FOUND"
}
```

**Key Features:**

- ✅ Validates instructor_id exists
- ✅ Returns instructor details if assigned
- ✅ Allows null to remove instructor

---

#### 2.7 Duplicate Module

**Endpoint:** `POST /v2/admin/module/{moduleId}/duplicate`

**Description:** Duplicate a module (creates a copy).

**Query Parameters:**

- `include_content` (optional): `"true"` | `"false"` (default: `"true"`)
- `new_chapter_id` (optional): Chapter ID to place duplicate in (default: same chapter)

**Request:**

```http
POST /v2/admin/module/25/duplicate?include_content=true&new_chapter_id=11
Authorization: Bearer {token}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "original_module_id": 25,
    "new_module_id": 150,
    "new_module": {
      "id": 150,
      "title": "Module Title (Copy)",
      "chapter_id": 11,
      "serial": 3
    },
    "message": "Module duplicated successfully"
  }
}
```

**Key Features:**

- ✅ Creates new module with copied content
- ✅ Handles module-specific data (quiz, code problems, etc.)
- ✅ Can place in different chapter
- ✅ Sets appropriate serial number
- ✅ Duplicated module starts as `is_live: false`
- ✅ Does NOT copy assignment document URLs

---

## 🔧 Error Handling

### Standard Error Response Format

All endpoints use consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field_name": "Field-specific error message"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `202` - Accepted (async operations)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Common Error Codes

| Code                     | Description               |
| ------------------------ | ------------------------- |
| `VALIDATION_ERROR`       | Input validation failed   |
| `MODULE_NOT_FOUND`       | Module does not exist     |
| `COURSE_NOT_FOUND`       | Course does not exist     |
| `INSTRUCTOR_NOT_FOUND`   | Instructor does not exist |
| `INVALID_FILE_FORMAT`    | File type not allowed     |
| `FILE_TOO_LARGE`         | File exceeds size limit   |
| `INVALID_QUIZ_STRUCTURE` | Quiz data format invalid  |
| `UNAUTHORIZED`           | Authentication required   |
| `INTERNAL_SERVER_ERROR`  | Server error              |

---

## 📝 Phase 8 Fields Reference

All Phase 8 fields are **optional/nullable** and work with existing courses:

| Field                          | Type                      | Description                           | Default                 |
| ------------------------------ | ------------------------- | ------------------------------------- | ----------------------- |
| `instructor_id`                | `number \| null`          | Instructor/teacher ID                 | `null`                  |
| `will_evaluated`               | `boolean \| null`         | Whether assignment will be evaluated  | `true` (for ASSIGNMENT) |
| `quiz_time_limit`              | `number \| null`          | Quiz time limit in minutes            | `null`                  |
| `quiz_attempt_limit`           | `number \| null`          | Maximum quiz attempts                 | `null`                  |
| `pdf_drive_link`               | `string \| null`          | Google Drive PDF link                 | `null`                  |
| `assignment_question_doc_url`  | `string \| null`          | Assignment document URL (S3 or Drive) | `null`                  |
| `assignment_question_doc_type` | `"s3" \| "drive" \| null` | Document storage type                 | `null`                  |

---

## 🧪 Testing Checklist

### getFull-enhanced Endpoint

- [x] Test with course that has no chapters
- [x] Test with course that has chapters but no modules
- [x] Test with course that has all Phase 8 fields populated
- [x] Test with course that has no Phase 8 fields (all null)
- [x] Test with course that has instructor assignments
- [x] Verify response format: `{ success: true, data: { ... } }`
- [x] Verify all Phase 8 fields are present (even if null)

### Module Endpoints

- [x] Test update-enhanced with all Phase 8 fields
- [x] Test assignment document upload/delete
- [x] Test quiz import/export
- [x] Test instructor assignment/removal
- [x] Test module duplication

### Course Endpoints

- [x] Test module reordering
- [x] Test course export (JSON/CSV)
- [x] Test course import
- [x] Test import status polling

---

## 🚀 Quick Start Examples

### Example 1: Get Course with Phase 8 Fields

```javascript
const response = await fetch("/v2/admin/course/5/getFull-enhanced", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const result = await response.json();
if (result.success) {
  const course = result.data;
  course.chapters.forEach((chapter) => {
    chapter.modules.forEach((module) => {
      console.log("Module:", module.title);
      console.log("Instructor:", module.instructor?.name);
      console.log("Will Evaluated:", module.will_evaluated);
    });
  });
}
```

### Example 2: Update Module with Phase 8 Fields

```javascript
const response = await fetch("/v2/admin/module/25/update-enhanced", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Updated Title",
    instructor_id: 5,
    will_evaluated: true,
    quiz_time_limit: 30,
    quiz_attempt_limit: 3,
  }),
});

const result = await response.json();
```

### Example 3: Upload Assignment Document

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("/v2/admin/module/25/assignment/document", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
if (result.success) {
  console.log("Document URL:", result.data.document_url);
}
```

### Example 4: Import Course (Async)

```javascript
// Start import
const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("format", "json");
formData.append("import_mode", "create");

const startResponse = await fetch("/v2/admin/course/import", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const startResult = await startResponse.json();
const importId = startResult.data.import_id;

// Poll for status
const pollStatus = async () => {
  const statusResponse = await fetch(
    `/v2/admin/course/import/${importId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const statusResult = await statusResponse.json();

  if (statusResult.data.status === "processing") {
    // Poll again after 2 seconds
    setTimeout(pollStatus, 2000);
  } else if (statusResult.data.status === "completed") {
    console.log("Import completed!", statusResult.data.summary);
  } else {
    console.error("Import failed:", statusResult.data.errors);
  }
};

pollStatus();
```

---

## ⚠️ Important Notes

### 1. Quiz Encryption

**CRITICAL:** Frontend must encrypt quiz answers before sending to backend:

```javascript
// Frontend encryption (example)
import CryptoJS from 'crypto-js';

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_QUIZ;
const encryptedAnswer = CryptoJS.AES.encrypt(answer, secretKey).toString();

// Send encrypted answer to backend
{
  "correct_answer": encryptedAnswer,
  "explanation": encryptedExplanation
}
```

Backend stores encrypted data as-is - **NO additional encryption**.

### 2. Response Format Consistency

All endpoints return:

```json
{
  "success": true,
  "data": { ... }
}
```

The `getFull-enhanced` endpoint was fixed to wrap response in `data` object.

### 3. File Upload Limits

- **Assignment Documents:** 10MB max (PDF, DOC, DOCX)
- **Course Import Files:** 50MB max (JSON, CSV)
- **Teacher Images:** 5MB max (JPG, PNG, GIF, WEBP)

### 4. Backward Compatibility

- ✅ All Phase 8 fields are optional/nullable
- ✅ Existing courses work without Phase 8 fields
- ✅ Legacy endpoints still work
- ✅ No breaking changes

### 5. Edge Cases & Error Handling

**All edge cases have been identified and fixed:**

- ✅ **Null/Undefined Handling:** All endpoints handle null/undefined values gracefully
- ✅ **Array Validation:** All array operations validate structure before processing
- ✅ **Data Parsing:** Module `data` field (JSON) is safely parsed with try-catch
- ✅ **Transaction Safety:** All multi-step operations use database transactions with rollback
- ✅ **Input Validation:** All inputs are validated before processing
- ✅ **Error Responses:** Consistent error format across all endpoints

**Key Edge Cases Handled:**

1. **getFull-enhanced:**

   - Handles null/undefined chapters and modules
   - Ensures chapters is always an array
   - Skips null items in loops

2. **Module Reordering:**

   - Validates order object structure
   - Validates required fields (module_id, chapter_id, serial)
   - Validates fields are not null before database update

3. **Quiz Import/Export:**

   - Filters null/undefined questions
   - Validates options is an array
   - Handles missing correct_answer gracefully

4. **Module Duplication:**

   - Handles null title (defaults to "Untitled")
   - Handles null description/metadata/data
   - Validates insert results before accessing

5. **Course Import:**
   - Validates chapters is an array
   - Skips null chapters/modules
   - Validates all insert results
   - Safe JSON.stringify with null checks

**All code is production-ready with comprehensive edge case handling!**

---

## 📞 Support

**Backend Team Contact:**

- See implementation in: `service/managerial/courseV2.js`, `service/managerial/moduleV2.js`
- See routes in: `routes/managerial/courseV2.js`, `routes/managerial/moduleV2.js`

**Questions:**

- Response format issues?
- Field validation rules?
- Error handling requirements?
- Performance considerations?

---

## ✅ Implementation Summary

### What Was Done

1. ✅ **Fixed getFull-enhanced response format** - Now wraps response in `data` object
2. ✅ **All CRITICAL endpoints implemented** - Course detail page now works
3. ✅ **All HIGH priority endpoints implemented** - Full Phase 8 feature support
4. ✅ **All MEDIUM priority endpoints implemented** - Complete feature set
5. ✅ **Consistent error handling** - All endpoints use ErrorHandler
6. ✅ **File upload support** - Assignment documents, course imports, teacher images
7. ✅ **Async import processing** - Large imports handled asynchronously
8. ✅ **Backward compatibility** - All existing functionality preserved

### Endpoints Implemented

**Course APIs (6 endpoints):**

- ✅ GET `/v2/admin/course/{courseId}/getFull-enhanced`
- ✅ PUT `/v2/admin/course/{courseId}/modules/reorder`
- ✅ GET `/v2/admin/course/{courseId}/export`
- ✅ POST `/v2/admin/course/import`
- ✅ GET `/v2/admin/course/import/{importId}/status`
- ✅ GET `/v2/admin/course/import/template`

**Module APIs (8 endpoints):**

- ✅ PUT `/v2/admin/module/{moduleId}/update-enhanced`
- ✅ POST `/v2/admin/module/{moduleId}/assignment/document`
- ✅ DELETE `/v2/admin/module/{moduleId}/assignment/document`
- ✅ POST `/v2/admin/module/{moduleId}/quiz/import`
- ✅ GET `/v2/admin/module/{moduleId}/quiz/export`
- ✅ GET `/v2/admin/module/{moduleId}/instructor`
- ✅ PUT `/v2/admin/module/{moduleId}/instructor`
- ✅ POST `/v2/admin/module/{moduleId}/duplicate`

**Total: 14 endpoints fully implemented and tested**

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** ✅ **READY FOR FRONTEND INTEGRATION**
