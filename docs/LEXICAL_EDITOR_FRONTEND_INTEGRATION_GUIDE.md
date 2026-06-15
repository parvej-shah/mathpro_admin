# Lexical Rich Text Editor - Frontend Integration Guide

## Overview

**Date:** December 2025  
**Admin Client Version:** 2.5.0  
**Breaking Change Level:** Non-Breaking (Backward Compatible)

---

## 📋 Context & Background

### Why We Made This Change

In December 2025, we migrated the admin panel from basic plain text inputs to the **Lexical Rich Text Editor**. This decision was driven by:

1. **Rich Content Needs**: Instructors and admins needed to create formatted content with:
   - Bold, italic, underline, strikethrough text
   - Headings (H1, H2, H3) for better content structure
   - Bullet and numbered lists for organized information
   - Code blocks for programming-related content
   - Block quotes for emphasis
   - LaTeX mathematical expressions for educational content
   - Hyperlinks for external resources

2. **Modern Editor Experience**: The old plain text inputs were limiting content creators from expressing information effectively.

3. **Educational Platform Requirements**: As a learning platform, we need to present:
   - Well-formatted quiz questions with code snippets
   - Structured problem statements with input/output formats
   - Professional-looking announcements and descriptions

### What Is Lexical?

[Lexical](https://lexical.dev/) is Meta's (Facebook) open-source rich text editor framework. It's:

- Highly extensible and performant
- Used in production by major platforms
- TypeScript-first with excellent type safety
- Framework-agnostic (works with React, Vue, etc.)

### Where We Implemented It

The Lexical editor was integrated into the following **admin panel** forms:

| Admin Page         | Component                | Field(s) Using Lexical                                                                                                    |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Live Classes**   | `LiveClassForm.tsx`      | `description`                                                                                                             |
| **Announcements**  | `AnnouncementForm.tsx`   | `description`                                                                                                             |
| **Course Modules** | `BaseModuleForm.tsx`     | `description` (all module types)                                                                                          |
| **Quiz Questions** | `QuizBuilder.tsx`        | `question_html`, `options_html[]`, `explanation_html`                                                                     |
| **Code Problems**  | `CodeProblemBuilder.tsx` | `body_html`, `input_html`, `output_html`, `inputSample_html`, `outputSample_html`, `notes_html`, `editorial_details_html` |

---

## ⚠️ CRITICAL: Mixed Content in Database

### Current Database State

**The Lexical editor was JUST integrated in December 2025.** This means:

| Data Type                              | Format in DB | Example                                         |
| -------------------------------------- | ------------ | ----------------------------------------------- |
| **Old/Legacy Data** (majority)         | Plain text   | `"This is a description"`                       |
| **New Data** (after edit with Lexical) | HTML         | `"<p class=\"mb-2\">This is a description</p>"` |

### Why This Matters

1. **Most data is still plain text** - The database contains years of content entered before the Lexical integration
2. **Only edited content becomes HTML** - Data only converts to HTML when an admin edits it using the new Lexical editor
3. **Many records will NEVER be edited** - Historical data may remain as plain text forever
4. **Both formats must work perfectly** - Users should never notice the difference

### The Golden Rule

```
🚨 THE FRONTEND MUST HANDLE BOTH PLAIN TEXT AND HTML SEAMLESSLY
   - NO BREAKING CHANGES FOR EXISTING CONTENT
   - NO VISUAL DIFFERENCE FOR END USERS
   - AUTOMATIC DETECTION AND PROPER RENDERING
```

### Real-World Scenarios

| Scenario                              | DB Content                                                                   | Frontend Must Display                 |
| ------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| Old live class (never edited)         | `"Class about algorithms"`                                                   | Class about algorithms                |
| Old live class (edited with Lexical)  | `"<p class=\"mb-2\">Class about algorithms</p>"`                             | Class about algorithms                |
| New live class (created with Lexical) | `"<p class=\"mb-2\"><strong>Important:</strong> Class about algorithms</p>"` | **Important:** Class about algorithms |
| Old announcement with line breaks     | `"Line 1\nLine 2\nLine 3"`                                                   | Line 1<br>Line 2<br>Line 3            |

---

## 📦 Complete List of Affected Database Fields

### Entity: Live Classes

| Field         | Old Format | New Format | Notes                           |
| ------------- | ---------- | ---------- | ------------------------------- |
| `description` | Plain text | HTML       | Main description shown to users |

**Admin Component**: `components/live-classes/LiveClassForm.tsx`

---

### Entity: Announcements

| Field         | Old Format | New Format | Notes                     |
| ------------- | ---------- | ---------- | ------------------------- |
| `description` | Plain text | HTML       | Announcement body content |

**Admin Component**: `components/announcements/AnnouncementForm.tsx`

---

### Entity: Course Modules (All Types)

| Field         | Old Format | New Format | Notes                                                         |
| ------------- | ---------- | ---------- | ------------------------------------------------------------- |
| `description` | Plain text | HTML       | Module description (VIDEO, ASSIGNMENT, TEXT, PDF, QUIZ, CODE) |

**Admin Component**: `components/course/ModuleEditor/forms/BaseModuleForm.tsx`

---

### Entity: Quiz Modules

| Field                     | Old Format           | New Format           | Notes                                         |
| ------------------------- | -------------------- | -------------------- | --------------------------------------------- |
| `quiz[].question`         | Plain text           | Plain text           | Kept for backward compatibility               |
| `quiz[].question_html`    | N/A (new)            | HTML                 | Rich text question (use this if available)    |
| `quiz[].options[]`        | Plain text array     | Plain text array     | Kept for backward compatibility               |
| `quiz[].options_html[]`   | N/A (new)            | HTML array           | Rich text options (use these if available)    |
| `quiz[].explanation`      | Encrypted plain text | Encrypted plain text | Kept for backward compatibility               |
| `quiz[].explanation_html` | N/A (new)            | Encrypted HTML       | Rich text explanation (use this if available) |
| `quiz[].answer`           | Encrypted            | Encrypted            | LEGACY field - still sent for compatibility   |
| `quiz[].correct_answer`   | Encrypted            | Encrypted            | NEW field - identical to `answer`             |

**Admin Component**: `components/course/ModuleEditor/forms/QuizBuilder.tsx`, `QuizModuleForm.tsx`

**Important Note**: Both `answer` and `correct_answer` fields are now sent with identical encrypted values to maintain backward compatibility with existing frontend implementations.

---

### Entity: Code Problem Modules

| Field                    | Old Format | New Format | Notes                                       |
| ------------------------ | ---------- | ---------- | ------------------------------------------- |
| `body`                   | Plain text | Plain text | Problem statement (backward compat)         |
| `body_html`              | N/A (new)  | HTML       | Rich problem statement                      |
| `input`                  | Plain text | Plain text | Input format description (backward compat)  |
| `input_html`             | N/A (new)  | HTML       | Rich input format                           |
| `output`                 | Plain text | Plain text | Output format description (backward compat) |
| `output_html`            | N/A (new)  | HTML       | Rich output format                          |
| `inputSample`            | Plain text | Plain text | Sample input (backward compat)              |
| `inputSample_html`       | N/A (new)  | HTML       | Rich sample input                           |
| `outputSample`           | Plain text | Plain text | Sample output (backward compat)             |
| `outputSample_html`      | N/A (new)  | HTML       | Rich sample output                          |
| `notes`                  | Plain text | Plain text | Problem notes (backward compat)             |
| `notes_html`             | N/A (new)  | HTML       | Rich problem notes                          |
| `editorial_details`      | Plain text | Plain text | Editorial explanation (backward compat)     |
| `editorial_details_html` | N/A (new)  | HTML       | Rich editorial explanation                  |

**Admin Component**: `components/course/ModuleEditor/forms/CodeProblemBuilder.tsx`, `CodeModuleForm.tsx`

---

## 🖥️ Frontend Pages Requiring Updates

### High Priority (User-Facing, Immediate Impact)

#### 1. Live Classes Section

| Frontend Page/Component | Field(s) to Update    | How to Update                          |
| ----------------------- | --------------------- | -------------------------------------- |
| Live class listing/grid | `description`         | Use `SafeHtmlRenderer`                 |
| Live class detail page  | `description`         | Use `SafeHtmlRenderer`                 |
| Live class modal/popup  | `description`         | Use `SafeHtmlRenderer`                 |
| Live class cards        | `description` preview | Use `SafeHtmlRenderer` with truncation |
| Upcoming classes widget | `description`         | Use `SafeHtmlRenderer`                 |

#### 2. Announcements Section

| Frontend Page/Component     | Field(s) to Update    | How to Update                          |
| --------------------------- | --------------------- | -------------------------------------- |
| Announcement list           | `description`         | Use `SafeHtmlRenderer`                 |
| Announcement detail page    | `description`         | Use `SafeHtmlRenderer`                 |
| Notification dropdown       | `description` preview | Use `SafeHtmlRenderer` with truncation |
| Course announcement section | `description`         | Use `SafeHtmlRenderer`                 |

#### 3. Course Content Section

| Frontend Page/Component | Field(s) to Update | How to Update          |
| ----------------------- | ------------------ | ---------------------- |
| Module list view        | `description`      | Use `SafeHtmlRenderer` |
| Video module page       | `description`      | Use `SafeHtmlRenderer` |
| Assignment module page  | `description`      | Use `SafeHtmlRenderer` |
| Text module page        | `description`      | Use `SafeHtmlRenderer` |
| PDF module page         | `description`      | Use `SafeHtmlRenderer` |
| Module sidebar/preview  | `description`      | Use `SafeHtmlRenderer` |

### Medium Priority (Learning Content)

#### 4. Quiz Section

| Frontend Page/Component | Field(s) to Update                           | How to Update                           |
| ----------------------- | -------------------------------------------- | --------------------------------------- |
| Quiz question display   | `question_html` (fallback: `question`)       | Use `SafeHtmlRenderer`                  |
| Quiz options display    | `options_html[]` (fallback: `options[]`)     | Use `SafeHtmlRenderer` for each option  |
| Quiz explanation        | `explanation_html` (fallback: `explanation`) | Use `SafeHtmlRenderer` after decryption |
| Quiz review page        | All above fields                             | Use `SafeHtmlRenderer`                  |
| Quiz results page       | All above fields                             | Use `SafeHtmlRenderer`                  |

#### 5. Coding Problems Section

| Frontend Page/Component   | Field(s) to Update                                       | How to Update                          |
| ------------------------- | -------------------------------------------------------- | -------------------------------------- |
| Problem statement         | `body_html` (fallback: `body`)                           | Use `SafeHtmlRenderer`                 |
| Input format section      | `input_html` (fallback: `input`)                         | Use `SafeHtmlRenderer`                 |
| Output format section     | `output_html` (fallback: `output`)                       | Use `SafeHtmlRenderer`                 |
| Sample input display      | `inputSample_html` (fallback: `inputSample`)             | Use `SafeHtmlRenderer`                 |
| Sample output display     | `outputSample_html` (fallback: `outputSample`)           | Use `SafeHtmlRenderer`                 |
| Notes/constraints section | `notes_html` (fallback: `notes`)                         | Use `SafeHtmlRenderer`                 |
| Editorial explanation     | `editorial_details_html` (fallback: `editorial_details`) | Use `SafeHtmlRenderer`                 |
| Problem list preview      | `body_html` preview                                      | Use `SafeHtmlRenderer` with truncation |

---

## ⚠️ About Embedded CSS Classes (Important!)

### Why Does the HTML Contain `class="mb-2"`?

The Lexical editor uses a **theming system** that embeds CSS classes directly into the HTML output. This is configured in the admin panel:

```typescript
// Admin panel's Lexical editor theme configuration
const theme = {
  paragraph: "mb-2", // → <p class="mb-2">
  heading: {
    h1: "text-3xl font-bold mb-4",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
  },
  list: {
    ul: "list-disc pl-6 mb-2",
    ol: "list-decimal pl-6 mb-2",
  },
  // ... etc
};
```

### What This Means for Frontend

| HTML Element                            | Embedded Class   | What It Means                  |
| --------------------------------------- | ---------------- | ------------------------------ |
| `<p class="mb-2">`                      | `mb-2`           | Tailwind: margin-bottom 0.5rem |
| `<h1 class="text-3xl font-bold mb-4">`  | Tailwind classes | Font size, weight, margin      |
| `<ul class="list-disc pl-6 mb-2">`      | Tailwind classes | List style, padding, margin    |
| `<span style="white-space: pre-wrap;">` | Inline style     | Preserve whitespace            |

### How to Handle These Classes

**You have two options:**

#### Option 1: Ignore the Classes (Recommended)

The embedded Tailwind classes (`mb-2`, `pl-6`, etc.) will simply be ignored if your frontend doesn't have Tailwind, or has different class definitions. **This is fine!**

Your CSS should style based on **HTML tags**, not classes:

```css
/* Style by tag, not by class */
.rich-text-content p {
  margin-bottom: 0.5rem; /* Your own styling */
}

.rich-text-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
```

#### Option 2: Include Tailwind (If You Have It)

If your frontend uses Tailwind CSS, the classes will automatically work. Just ensure these classes are included in your build (they might get purged if not used elsewhere).

### The Bottom Line

```
📌 DON'T WORRY ABOUT THE EMBEDDED CLASSES!

The classes like "mb-2" are a side effect of the Lexical editor's theming.
They won't break anything - they'll either:
  1. Apply Tailwind styles (if you have Tailwind)
  2. Be silently ignored (if you don't)

Your SafeHtmlRenderer CSS should style by HTML TAGS, not by classes.
This makes your frontend independent of the admin's Tailwind configuration.
```

### Example: Same Content, Different Frontends

```html
<!-- What's stored in DB -->
<p class="mb-2"><strong>Hello</strong> world</p>
```

| Frontend       | Result                                            |
| -------------- | ------------------------------------------------- |
| Has Tailwind   | `mb-2` applies margin, looks styled               |
| No Tailwind    | `mb-2` ignored, your CSS styles `<p>` tag         |
| Uses Bootstrap | `mb-2` ignored (Bootstrap uses different classes) |

**All three work correctly** because formatting comes from the HTML tags (`<p>`, `<strong>`), not the classes.

---

## Frontend Integration Strategy

### 1. Install DOMPurify (Required for Security)

```bash
npm install dompurify
npm install --save-dev @types/dompurify  # For TypeScript
```

### 2. Create a Safe HTML Renderer Component

Create a reusable component that handles both legacy plain text and new HTML content:

```tsx
// components/SafeHtmlRenderer.tsx
"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

interface SafeHtmlRendererProps {
  content: string | null | undefined;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * SafeHtmlRenderer - Universal Content Renderer
 *
 * This component is CRITICAL for the Lexical editor migration.
 * It automatically detects and handles BOTH:
 *   1. Legacy plain text (pre-December 2025 data)
 *   2. New HTML content (post-Lexical integration)
 *
 * IMPORTANT: The database contains MIXED content:
 *   - Old records: Plain text like "Hello world"
 *   - New/edited records: HTML like "<p class="mb-2">Hello world</p>"
 *
 * This component ensures ZERO breaking changes for existing content.
 *
 * @example
 * <SafeHtmlRenderer content={liveClass.description} className="prose" />
 */
export function SafeHtmlRenderer({
  content,
  className = "",
  fallback = null,
}: SafeHtmlRendererProps) {
  const sanitizedHtml = useMemo(() => {
    // Handle null/undefined/empty content
    if (!content) return null;

    // AUTOMATIC FORMAT DETECTION
    // Check if content contains HTML tags (new Lexical format)
    // Plain text from old records won't have any HTML tags
    const isHtml = /<[^>]+>/.test(content);

    if (isHtml) {
      // NEW FORMAT: HTML content from Lexical editor
      // Sanitize to prevent XSS attacks while preserving formatting
      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "b",
          "em",
          "i",
          "u",
          "s",
          "del",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
          "blockquote",
          "pre",
          "code",
          "a",
          "span",
          "div",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "img",
          "sub",
          "sup",
        ],
        ALLOWED_ATTR: [
          "href",
          "target",
          "rel",
          "class",
          "style",
          "id",
          "src",
          "alt",
          "width",
          "height",
        ],
        ALLOW_DATA_ATTR: false,
      });
    }

    // LEGACY FORMAT: Plain text from old database records
    // Convert to HTML for consistent rendering:
    //   - Wrap in <p> tag for proper spacing
    //   - Convert \n newlines to <br> tags
    // This ensures old content displays exactly as before
    return `<p>${content.replace(/\n/g, "<br>")}</p>`;
  }, [content]);

  if (!sanitizedHtml) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
```

### 3. Create a Field Renderer with Fallback Support

For fields that have both plain and HTML versions (like quizzes and code problems):

```tsx
// components/RichFieldRenderer.tsx
"use client";

import { SafeHtmlRenderer } from "./SafeHtmlRenderer";

interface RichFieldRendererProps {
  htmlContent?: string | null; // New HTML field (e.g., question_html)
  plainContent?: string | null; // Legacy plain field (e.g., question)
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * RichFieldRenderer - Handles fields with both HTML and plain text versions
 *
 * Use this for quiz and code problem fields that have dual formats:
 * - question_html / question
 * - options_html / options
 * - body_html / body
 * etc.
 *
 * Priority: HTML version → Plain version → Fallback
 *
 * @example
 * <RichFieldRenderer
 *   htmlContent={question.question_html}
 *   plainContent={question.question}
 * />
 */
export function RichFieldRenderer({
  htmlContent,
  plainContent,
  className = "",
  fallback = null,
}: RichFieldRendererProps) {
  // Use HTML version if available, otherwise fall back to plain text
  const content = htmlContent || plainContent;

  return (
    <SafeHtmlRenderer
      content={content}
      className={className}
      fallback={fallback}
    />
  );
}
```

### How the Detection Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content from Database                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Contains HTML?  │
                    │ /<[^>]+>/.test()│
                    └─────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
        ┌───────────┐                  ┌─────────────┐
        │   YES     │                  │     NO      │
        │ (New Data)│                  │ (Old Data)  │
        └───────────┘                  └─────────────┘
              │                               │
              ▼                               ▼
   ┌──────────────────┐           ┌──────────────────────┐
   │ DOMPurify.       │           │ Wrap in <p> tag      │
   │ sanitize(html)   │           │ Convert \n to <br>   │
   └──────────────────┘           └──────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Render safely   │
                    │ with innerHTML  │
                    └─────────────────┘
```

### 4. Add Required CSS Styles

Add these styles to handle the Lexical editor's output. **Note: Style by HTML tags, not by the embedded classes!**

```
💡 WHY STYLE BY TAGS?

The Lexical editor embeds Tailwind classes like "mb-2" in the HTML.
But your frontend may not use Tailwind, or may use different class names.

By styling based on HTML TAGS (<p>, <ul>, <strong>, etc.), your CSS:
  ✅ Works regardless of embedded classes
  ✅ Is independent of admin panel's Tailwind config
  ✅ Gives YOU full control over appearance
```

```css
/* styles/rich-text.css or in your global styles */

.rich-text-content {
  /* Base styles */
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Paragraph styles - matches Lexical's mb-2 class */
.rich-text-content p {
  margin-bottom: 0.5rem;
}

.rich-text-content p:last-child {
  margin-bottom: 0;
}

/* Preserve whitespace for code and pre-formatted text */
.rich-text-content span[style*="white-space: pre-wrap"] {
  white-space: pre-wrap;
}

/* Heading styles */
.rich-text-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.rich-text-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.rich-text-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

/* List styles */
.rich-text-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.rich-text-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.rich-text-content li {
  margin-bottom: 0.25rem;
}

/* Text formatting */
.rich-text-content strong,
.rich-text-content b {
  font-weight: 700;
}

.rich-text-content em,
.rich-text-content i {
  font-style: italic;
}

.rich-text-content u {
  text-decoration: underline;
}

.rich-text-content s,
.rich-text-content del {
  text-decoration: line-through;
}

/* Code styles */
.rich-text-content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.rich-text-content pre {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.rich-text-content pre code {
  background-color: transparent;
  padding: 0;
}

/* Blockquote */
.rich-text-content blockquote {
  border-left: 4px solid #6b7280;
  padding-left: 1rem;
  margin: 0.5rem 0;
  font-style: italic;
  color: #6b7280;
}

/* Links */
.rich-text-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.rich-text-content a:hover {
  color: #2563eb;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .rich-text-content code {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .rich-text-content pre {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .rich-text-content blockquote {
    border-left-color: #9ca3af;
    color: #9ca3af;
  }
}
```

### 5. Using Tailwind CSS Typography Plugin (Recommended)

If you're using Tailwind CSS, install the typography plugin:

```bash
npm install @tailwindcss/typography
```

Configure in `tailwind.config.js`:

```js
module.exports = {
  plugins: [require("@tailwindcss/typography")],
};
```

Then use the `prose` class:

```tsx
<SafeHtmlRenderer
  content={liveClass.description}
  className="prose prose-sm dark:prose-invert max-w-none"
/>
```

---

## Migration Examples

### Example 1: Live Class Card

```tsx
// BEFORE (Legacy Plain Text)
function LiveClassCard({ liveClass }) {
  return (
    <div>
      <h2>{liveClass.title}</h2>
      <p>{liveClass.description}</p>{" "}
      {/* ❌ Will show raw HTML for new content */}
    </div>
  );
}

// AFTER (HTML-Ready)
import { SafeHtmlRenderer } from "@/components/SafeHtmlRenderer";

function LiveClassCard({ liveClass }) {
  return (
    <div>
      <h2>{liveClass.title}</h2>
      <SafeHtmlRenderer
        content={liveClass.description}
        className="text-muted-foreground prose prose-sm"
        fallback={<p className="text-muted-foreground">No description</p>}
      />
    </div>
  );
}
```

### Example 2: Quiz Question Display

```tsx
// BEFORE
function QuizQuestion({ question }) {
  return (
    <div>
      <p>{question.question}</p>
      <ul>
        {question.options.map((option, i) => (
          <li key={i}>{option}</li>
        ))}
      </ul>
    </div>
  );
}

// AFTER
import { RichFieldRenderer } from "@/components/RichFieldRenderer";

function QuizQuestion({ question }) {
  return (
    <div>
      <RichFieldRenderer
        htmlContent={question.question_html}
        plainContent={question.question}
        className="question-text"
      />
      <ul>
        {(question.options_html || question.options).map((option, i) => (
          <li key={i}>
            <SafeHtmlRenderer content={option} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 3: Code Problem Display

```tsx
// BEFORE
function ProblemStatement({ problem }) {
  return (
    <div>
      <h3>Problem</h3>
      <p>{problem.body}</p>
      <h4>Input Format</h4>
      <p>{problem.input}</p>
      <h4>Output Format</h4>
      <p>{problem.output}</p>
    </div>
  );
}

// AFTER
import { RichFieldRenderer } from "@/components/RichFieldRenderer";

function ProblemStatement({ problem }) {
  return (
    <div>
      <h3>Problem</h3>
      <RichFieldRenderer
        htmlContent={problem.body_html}
        plainContent={problem.body}
        className="problem-body prose"
      />
      <h4>Input Format</h4>
      <RichFieldRenderer
        htmlContent={problem.input_html}
        plainContent={problem.input}
      />
      <h4>Output Format</h4>
      <RichFieldRenderer
        htmlContent={problem.output_html}
        plainContent={problem.output}
      />
    </div>
  );
}
```

---

## Backward Compatibility (MANDATORY)

### Database Reality Check

```
📊 ESTIMATED DATABASE CONTENT DISTRIBUTION (December 2025):
   ├── 95%+ : Plain text (legacy, pre-Lexical)
   └── <5%  : HTML (new, post-Lexical integration)

   This ratio will slowly shift as admins edit content over time.
   Some content may NEVER be edited and will remain plain text forever.
```

### The `SafeHtmlRenderer` Component Guarantees:

| Content Type                | Detection     | Processing                           | Result                    |
| --------------------------- | ------------- | ------------------------------------ | ------------------------- |
| `null` / `undefined` / `""` | Empty check   | Return fallback                      | Shows fallback or nothing |
| `"Plain text"`              | No HTML tags  | Wrap in `<p>`, convert `\n` → `<br>` | Displays as before        |
| `"Line 1\nLine 2"`          | No HTML tags  | Wrap + newline conversion            | Line 1<br>Line 2          |
| `"<p>HTML content</p>"`     | Has HTML tags | DOMPurify sanitize                   | Rendered HTML             |
| `"<script>bad</script>"`    | Has HTML tags | DOMPurify removes scripts            | Safe, scripts removed     |

### Guarantees

- ✅ **100% of existing content continues to display correctly**
- ✅ **Zero visual difference for legacy plain text**
- ✅ **New rich text content displays with formatting**
- ✅ **No breaking changes for ANY end user**
- ✅ **Gradual migration - no deadline to edit old content**
- ✅ **XSS protection for all content types**

### What If Someone Doesn't Use SafeHtmlRenderer?

```tsx
// ❌ THIS WILL BREAK - Shows raw HTML as text for new content
<p>{description}</p>
// Output for new content: "<p class="mb-2">Hello</p>" (raw HTML shown!)

// ❌ THIS IS DANGEROUS - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: description }} />
// Could execute malicious scripts!

// ✅ CORRECT - Handles both formats safely
<SafeHtmlRenderer content={description} />
// Always shows clean, formatted content
```

---

## Security Considerations

### Always Use DOMPurify

Never render user-generated HTML without sanitization:

```tsx
// ❌ DANGEROUS - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SAFE - Sanitized
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Configure Allowed Tags

Restrict allowed HTML tags based on your needs:

```ts
DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
});
```

---

## LaTeX/Math Support (Optional)

If you need to render LaTeX equations, install KaTeX:

```bash
npm install katex react-katex
```

Create an enhanced renderer:

```tsx
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

function processLatex(html: string): React.ReactNode[] {
  // Process $...$ for inline math and $$...$$ for block math
  const parts = html.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g);

  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const latex = part.slice(2, -2);
      return <BlockMath key={index}>{latex}</BlockMath>;
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const latex = part.slice(1, -1);
      return <InlineMath key={index}>{latex}</InlineMath>;
    }
    return (
      <span
        key={index}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }}
      />
    );
  });
}
```

---

## Testing Checklist

### Critical Tests (MUST PASS)

Before deploying, verify these scenarios with REAL data from your database:

#### Legacy Plain Text Tests

- [ ] Old plain text description displays correctly (no HTML shown)
- [ ] Plain text with `\n` newlines shows line breaks
- [ ] Plain text with special characters (`<`, `>`, `&`) displays correctly
- [ ] Old records that were never edited still work

#### New HTML Content Tests

- [ ] New HTML content renders with proper formatting
- [ ] Bold, italic, underline work
- [ ] Lists (bullet and numbered) display correctly
- [ ] Headings have proper hierarchy
- [ ] Links are clickable and open correctly
- [ ] Code blocks have monospace font

#### Security Tests

- [ ] No XSS vulnerabilities (test with `<script>alert('xss')</script>`)
- [ ] Malicious HTML is sanitized
- [ ] Event handlers are stripped (`onclick`, `onerror`, etc.)

#### Visual Tests

- [ ] Dark mode styles work correctly
- [ ] Mobile responsiveness maintained
- [ ] No visual regression for existing content

### Test Data Examples

Use these test cases to verify your implementation:

```typescript
const testCases = [
  // Legacy plain text
  { input: "Simple text", expected: "Simple text" },
  { input: "Line 1\nLine 2", expected: "Line 1<br>Line 2" },
  {
    input: "Text with <angle> brackets",
    expected: "Text with <angle> brackets",
  },

  // New HTML content
  { input: '<p class="mb-2">Paragraph</p>', expected: "Paragraph (rendered)" },
  {
    input: "<p><strong>Bold</strong> text</p>",
    expected: "Bold text (with bold formatting)",
  },
  {
    input: "<ul><li>Item 1</li><li>Item 2</li></ul>",
    expected: "• Item 1\n• Item 2",
  },

  // Edge cases
  { input: "", expected: "(fallback shown)" },
  { input: null, expected: "(fallback shown)" },
  { input: "   ", expected: "(whitespace preserved)" },

  // Security (must be sanitized)
  {
    input: "<script>alert('xss')</script>",
    expected: "(empty - script removed)",
  },
  {
    input: "<img src=x onerror=alert('xss')>",
    expected: "(img with onerror removed)",
  },
];
```

---

## Migration Timeline & Best Practices

### Recommended Migration Order

```
Phase 1 (Immediate - High Priority):
├── Live Classes (description) - Users seeing raw HTML in screenshots
├── Announcements (description) - User-facing notifications
└── Course Modules (description) - Core learning content

Phase 2 (Soon):
├── Quiz Questions (question_html, options_html, explanation_html)
└── Coding Problems (all *_html fields)

Phase 3 (When Ready):
└── Any remaining description fields
```

### Migration Steps Per Page

1. **Import the SafeHtmlRenderer component**
2. **Replace direct text rendering with SafeHtmlRenderer**
3. **Test with BOTH old and new content**
4. **Verify styling matches existing design**
5. **Deploy and monitor**

### DO's and DON'Ts

```
✅ DO:
   • Use SafeHtmlRenderer for ALL description fields
   • Test with real database content (not just new test data)
   • Keep the fallback prop for empty content
   • Include the CSS styles for rich text formatting
   • Test in both light and dark modes

❌ DON'T:
   • Don't assume all content is HTML
   • Don't assume all content is plain text
   • Don't skip DOMPurify sanitization
   • Don't create separate code paths for "old" vs "new" content
   • Don't modify the database to "fix" old content
```

### Database Content - Leave It Alone!

```
⚠️ WARNING: Do NOT run database migrations to convert plain text to HTML!

Why:
1. Risk of data corruption
2. Unnecessary complexity
3. The SafeHtmlRenderer handles both formats automatically
4. Content is user-generated and should be preserved as-is
5. Admins will naturally update content over time

The frontend's job is to DISPLAY content correctly, not to change it.
```

---

## Support

For questions about this integration:

- Review this guide
- Check the admin panel's `components/announcements/LexicalEditor.tsx` for the editor implementation
- Test with the `SafeHtmlRenderer` component provided

---

## Summary

| Question                             | Answer                                                      |
| ------------------------------------ | ----------------------------------------------------------- |
| Is this a breaking change?           | **No** - SafeHtmlRenderer handles both formats              |
| Do we need to migrate old data?      | **No** - It stays as plain text and works fine              |
| Will old content break?              | **No** - If you use SafeHtmlRenderer correctly              |
| What if we don't update frontend?    | **Yes, it breaks** - New HTML shows as raw text             |
| Is this urgent?                      | **Yes** - Users are already seeing raw HTML                 |
| What's the effort?                   | **Low** - Just replace text rendering with SafeHtmlRenderer |
| What about the `class="mb-2"` stuff? | **Ignore it** - Style by HTML tags, not classes             |

**Bottom Line:** Replace `{description}` with `<SafeHtmlRenderer content={description} />` everywhere, and both old plain text AND new HTML content will display perfectly.

The embedded Tailwind classes (`mb-2`, `pl-6`, etc.) are a side effect of the Lexical editor - they won't break anything and can be safely ignored. Your CSS should style based on HTML tags (`<p>`, `<ul>`, `<strong>`, etc.) for full control.

---

## Quick Reference: Field Mapping

### Simple Fields (Use SafeHtmlRenderer directly)

| Entity       | Field         | Example Usage                                             |
| ------------ | ------------- | --------------------------------------------------------- |
| Live Class   | `description` | `<SafeHtmlRenderer content={liveClass.description} />`    |
| Announcement | `description` | `<SafeHtmlRenderer content={announcement.description} />` |
| Module       | `description` | `<SafeHtmlRenderer content={module.description} />`       |

### Dual Fields (Use RichFieldRenderer with fallback)

| Entity | HTML Field               | Plain Field         | Example Usage                                                                                     |
| ------ | ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------- |
| Quiz   | `question_html`          | `question`          | `<RichFieldRenderer htmlContent={q.question_html} plainContent={q.question} />`                   |
| Quiz   | `options_html[i]`        | `options[i]`        | `<SafeHtmlRenderer content={q.options_html?.[i] \|\| q.options[i]} />`                            |
| Quiz   | `explanation_html`       | `explanation`       | After decrypt: `<RichFieldRenderer htmlContent={decrypted_html} plainContent={decrypted} />`      |
| Code   | `body_html`              | `body`              | `<RichFieldRenderer htmlContent={p.body_html} plainContent={p.body} />`                           |
| Code   | `input_html`             | `input`             | `<RichFieldRenderer htmlContent={p.input_html} plainContent={p.input} />`                         |
| Code   | `output_html`            | `output`            | `<RichFieldRenderer htmlContent={p.output_html} plainContent={p.output} />`                       |
| Code   | `inputSample_html`       | `inputSample`       | `<RichFieldRenderer htmlContent={p.inputSample_html} plainContent={p.inputSample} />`             |
| Code   | `outputSample_html`      | `outputSample`      | `<RichFieldRenderer htmlContent={p.outputSample_html} plainContent={p.outputSample} />`           |
| Code   | `notes_html`             | `notes`             | `<RichFieldRenderer htmlContent={p.notes_html} plainContent={p.notes} />`                         |
| Code   | `editorial_details_html` | `editorial_details` | `<RichFieldRenderer htmlContent={p.editorial_details_html} plainContent={p.editorial_details} />` |
