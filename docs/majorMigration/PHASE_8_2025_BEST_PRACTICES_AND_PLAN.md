# Phase 8: Course Editing - 2025 Best Practices & Improvement Plan

**Date:** December 2025  
**Purpose:** Research 2025 industry standards and plan improvements for course editing flow  
**Status:** Planning Complete - Ready for Implementation

---

## 📋 Table of Contents

1. [2025 Industry Standards Research](#2025-industry-standards-research)
2. [Modern Course Builder Features](#modern-course-builder-features)
3. [Rich Text Editor Comparison](#rich-text-editor-comparison)
4. [State Management Best Practices](#state-management-best-practices)
5. [UX/UI Improvements](#uxui-improvements)
6. [Technical Architecture Plan](#technical-architecture-plan)
7. [Implementation Plan](#implementation-plan)
8. [Feature Comparison Matrix](#feature-comparison-matrix)
9. [Bulk Course Import/Export](#bulk-course-importexport)

---

## 2025 Industry Standards Research

### Modern LMS Course Builders (2025)

**Leading Platforms Analyzed:**

- Canvas LMS
- Moodle 4.x
- Teachable
- Thinkific
- LearnDash
- Notion (for content editing patterns)
- Linear (for inline editing patterns)

### Key Patterns Identified

#### 1. **Inline Editing**

- ✅ Click to edit directly in context
- ✅ No separate edit pages for simple changes
- ✅ Save on blur or Enter key
- ✅ Visual indicators for editable fields
- ✅ Cancel with Escape key

**Implementation:**

- Use contenteditable or controlled inputs
- Show edit icon on hover
- Highlight on focus
- Auto-save on blur

#### 2. **Modal-Based Complex Editing**

- ✅ Modals for complex forms (module editing)
- ✅ Side panels for detailed editing
- ✅ Preserve context (don't navigate away)
- ✅ Close on Escape or outside click
- ✅ Loading states in modals

**Implementation:**

- Use shadcn Dialog component
- Full-screen or large modals for complex forms
- Keep parent page visible in background
- Smooth animations

#### 3. **Collapsible Sections**

- ✅ Chapters collapsible by default
- ✅ Modules collapsible within chapters
- ✅ Remember expanded state
- ✅ Keyboard accessible (Space/Enter to toggle)
- ✅ Visual indicators (chevron icons)

**Implementation:**

- Use shadcn Accordion or Collapsible
- Store expanded state in URL or localStorage
- Smooth expand/collapse animations

#### 4. **Drag-and-Drop Improvements**

- ✅ Visual drag preview
- ✅ Drop zone highlighting
- ✅ Smooth animations
- ✅ Haptic feedback (on mobile)
- ✅ Undo/redo support
- ✅ Auto-save on drop

**Implementation:**

- Use `@dnd-kit/core` (2025 standard, better than react-beautiful-dnd)
- Visual feedback during drag
- Optimistic updates
- Debounced auto-save

#### 5. **Keyboard Shortcuts**

- ✅ `Ctrl/Cmd + S` - Save
- ✅ `Ctrl/Cmd + Z` - Undo
- ✅ `Ctrl/Cmd + Shift + Z` - Redo
- ✅ `Escape` - Cancel/Close
- ✅ `Enter` - Save/Confirm
- ✅ `Arrow keys` - Navigate
- ✅ `Tab` - Next field
- ✅ `Shift + Tab` - Previous field

**Implementation:**

- Use `react-hotkeys-hook` or `useKeyboardShortcut`
- Show shortcuts in tooltips
- Help modal with all shortcuts

#### 6. **Auto-Save & Draft Management**

- ✅ Auto-save every 2-3 seconds (debounced)
- ✅ Visual save indicator (saving/saved/error)
- ✅ Unsaved changes warning
- ✅ Draft restoration on page reload
- ✅ Conflict resolution for concurrent edits

**Implementation:**

- Debounced auto-save (2-3 second delay)
- Save status indicator in header
- localStorage for drafts
- Optimistic updates with rollback

#### 7. **Optimistic Updates**

- ✅ Update UI immediately
- ✅ Show loading state
- ✅ Rollback on error
- ✅ Retry failed requests
- ✅ Queue multiple updates

**Implementation:**

- React Query with optimistic updates
- Update cache immediately
- Rollback on error
- Show error toast

---

## Modern Course Builder Features

### Essential Features (2025)

1. **Visual Course Builder**
   - Drag-and-drop course structure
   - Live preview
   - WYSIWYG editing
   - Real-time collaboration (optional)

2. **Module Management**
   - Quick add (inline)
   - Bulk operations
   - Duplicate modules
   - Module templates
   - Module library/reuse

3. **Content Editor**
   - Modern rich text editor (Lexical with LaTeX/Markdown)
   - Media embeds
   - Code blocks with syntax highlighting
   - **Math equations (LaTeX)** - Required for quiz questions
   - Tables
   - Collaborative editing

4. **Serialization & Ordering**
   - Visual drag-drop
   - Auto-numbering
   - Manual override
   - Conflict resolution
   - Batch reordering

5. **Preview & Testing**
   - Live preview
   - Student view
   - Test mode
   - Version history

6. **Analytics & Insights**
   - Module completion rates
   - Time spent
   - Drop-off points
   - Engagement metrics

### Module-Specific Features (Required)

#### 1. **Video Module**

- Video URL and hosting selection (Youtube, BunnyCDN)
- Video description (rich text with LaTeX)
- **NEW: Optional PDF attachment** (under video)
  - Upload PDF to S3 OR
  - Enter Google Drive public link
  - Display in user frontend with expand/collapse

#### 2. **PDF Module**

- **Enhanced: Dual upload options**
  - Upload PDF to S3 (existing)
  - OR enter Google Drive public link (new)
- PDF preview and download
- Score, isLive, isFree flags (unchanged)

#### 3. **Assignment Module**

- Assignment title
- Score, isLive, isFree flags
- Deadline (date + time)
- Assignment question document upload (NEW)
  - Upload to S3 or Google Drive
- Assignment description (rich text with LaTeX)
- Instruction video (optional)
- View submissions button
- **NEW: `willEvaluated` flag**
  - Toggle on/off if assignment needs evaluation
  - Default: true (backward compatible)

#### 4. **Quiz Module**

- **Enhanced UX** - Industry standard quiz builder
- **NEW: Quiz time limit** (optional, in minutes)
- **NEW: Quiz attempt limit** (optional)
- **NEW: JSON import/export**
  - Import quiz questions from JSON
  - Export quiz to JSON
  - GUI editing + JSON upload both supported
- Questions with LaTeX equations support
- Options management (improved UX)
- Answer encryption (existing)
- Explanation with LaTeX support

#### 5. **Text Module**

- Enhanced rich text editor
- LaTeX/Markdown support
- Better formatting options

#### 6. **Code Module**

- Keep all existing features
- Follow 2025 implementation standards
- Modern UI/UX

#### 7. **All Modules - NEW: Instructor Field**

- Optional instructor dropdown
- Link module to instructor
- Fetch instructors from database
- Display instructor info in module

### Advanced Features (Nice to Have)

1. **AI Assistance**
   - Auto-generate content
   - Content suggestions
   - Grammar/spell check
   - Translation

2. **Templates & Presets**
   - Course templates
   - Module templates
   - Quiz templates
   - Assignment templates

3. **Version Control**
   - Version history
   - Rollback
   - Compare versions
   - Branching

4. **Collaboration**
   - Real-time editing
   - Comments
   - Mentions
   - Activity feed

---

## Rich Text Editor Comparison

### Lexical vs Tiptap (2025)

#### Lexical (Facebook/Meta)

**Pros:**

- ✅ Lightweight and performant
- ✅ Modern architecture
- ✅ Headless (full control)
- ✅ Active development (2025)
- ✅ TypeScript first
- ✅ Extensible plugin system
- ✅ Good for complex use cases
- ✅ LaTeX/Markdown support available

**Cons:**

- ⚠️ Steeper learning curve
- ⚠️ Smaller community
- ⚠️ Fewer pre-built extensions
- ⚠️ More setup required

**Best For:**

- Custom requirements
- Performance-critical apps
- Complex editing needs
- Long-term projects

#### Tiptap (ProseMirror-based)

**Pros:**

- ✅ Mature and stable
- ✅ Large community
- ✅ Many extensions
- ✅ Good documentation
- ✅ Easy to get started
- ✅ Collaborative editing (Y.js)
- ✅ Good default setup
- ✅ LaTeX/Markdown extensions available

**Cons:**

- ⚠️ Larger bundle size
- ⚠️ Less flexible than Lexical
- ⚠️ ProseMirror dependency

**Best For:**

- Quick implementation
- Standard use cases
- Collaborative editing
- Team projects

### Recommendation: **Lexical with LaTeX/Markdown Support**

**Reasoning:**

1. 2025 standard - Modern, actively developed
2. Performance - Better for large documents
3. Future-proof - Facebook backing
4. Flexibility - Can customize to needs
5. TypeScript - Better type safety
6. **LaTeX Support** - Required for equations in quiz questions and descriptions

**Required Features:**

- ✅ LaTeX equation support (`$...$` for inline, `$$...$$` for block)
- ✅ Markdown support
- ✅ Rich text formatting (bold, italic, lists, etc.)
- ✅ Code blocks with syntax highlighting
- ✅ Tables
- ✅ Links and images

**Migration Path:**

- Start with Lexical basic setup
- Add LaTeX plugin (e.g., `@lexical/latex` or KaTeX integration)
- Add Markdown support
- Customize toolbar with equation button
- Add collaborative features later (if needed)

**LaTeX Integration:**

- Use KaTeX or MathJax for rendering
- Support inline: `$x^2 + 5x + 6 = 0$`
- Support block: `$$\int_0^1 x^2 dx$$`
- Preview equations in editor
- Export as HTML with LaTeX delimiters

---

## State Management Best Practices

### Recommended Approach (2025)

#### 1. **React Query (TanStack Query)**

- ✅ Server state management
- ✅ Caching
- ✅ Background updates
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Loading states

**Usage:**

```typescript
// Course data
const { data: course, isLoading } = useQuery({
  queryKey: ["course", courseId],
  queryFn: () => fetchCourse(courseId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Update course
const { mutate: updateCourse } = useMutation({
  mutationFn: updateCourseAPI,
  onMutate: async (newData) => {
    // Optimistic update
    await queryClient.cancelQueries(["course", courseId]);
    const previous = queryClient.getQueryData(["course", courseId]);
    queryClient.setQueryData(["course", courseId], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["course", courseId], context.previous);
  },
});
```

#### 2. **Zustand (Client State)**

- ✅ Simple API
- ✅ Small bundle
- ✅ TypeScript support
- ✅ No boilerplate
- ✅ DevTools support

**Usage:**

```typescript
interface CourseStore {
  expandedChapters: Set<number>;
  toggleChapter: (id: number) => void;
  draftChanges: Record<string, unknown>;
  setDraft: (key: string, value: unknown) => void;
}

const useCourseStore = create<CourseStore>((set) => ({
  expandedChapters: new Set(),
  toggleChapter: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedChapters);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return { expandedChapters: newSet };
    }),
  draftChanges: {},
  setDraft: (key, value) =>
    set((state) => ({
      draftChanges: { ...state.draftChanges, [key]: value },
    })),
}));
```

#### 3. **URL State (for Navigation)**

- ✅ Deep linking
- ✅ Shareable URLs
- ✅ Browser history
- ✅ Bookmarkable

**Usage:**

```typescript
// Use URL params for view state
const [searchParams, setSearchParams] = useSearchParams();
const expandedChapter = searchParams.get("chapter");
const activeModule = searchParams.get("module");
```

### State Management Architecture

```
┌─────────────────────────────────────┐
│     React Query (Server State)      │
│  - Course data                       │
│  - Chapters                          │
│  - Modules                           │
│  - Caching & refetching              │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│     Zustand (Client State)           │
│  - UI state (expanded, selected)    │
│  - Draft changes                    │
│  - Form state                       │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│     URL State (Navigation)           │
│  - Active course/chapter/module     │
│  - View mode                        │
│  - Filters                          │
└─────────────────────────────────────┘
```

---

## UX/UI Improvements

### Design System (shadcn/ui)

**Components to Use:**

- `Dialog` - Modals for editing
- `Accordion` - Collapsible chapters
- `Collapsible` - Expand/collapse modules
- `Button` - Consistent buttons
- `Input` - Form inputs
- `Textarea` - Multi-line inputs
- `Card` - Content containers
- `Badge` - Status indicators
- `Toast` - Notifications (Sonner)
- `Skeleton` - Loading states
- `Separator` - Visual dividers

### Layout Improvements

#### 1. **Three-Column Layout** (Optional)

```
┌──────────┬──────────────────┬──────────┐
│          │                  │          │
│ Chapters │   Module Editor  │ Preview  │
│  List    │                  │          │
│          │                  │          │
└──────────┴──────────────────┴──────────┘
```

#### 2. **Two-Column Layout** (Recommended)

```
┌──────────────┬──────────────────────┐
│              │                      │
│  Chapters &  │    Module Editor     │
│   Modules    │    (Modal/Sidebar)   │
│    List      │                      │
│              │                      │
└──────────────┴──────────────────────┘
```

#### 3. **Single Column with Modals** (Current + Improved)

```
┌────────────────────────────────────┐
│                                    │
│      Chapters & Modules List       │
│                                    │
│  [Click module → Opens Modal]      │
│                                    │
└────────────────────────────────────┘
```

### Visual Improvements

1. **Compact Design**
   - Reduce padding/margins
   - Tighter spacing
   - More content visible

2. **Better Alignment**
   - Grid system
   - Consistent spacing
   - Aligned buttons/fields

3. **Visual Hierarchy**
   - Clear headings
   - Proper typography scale
   - Color coding for module types

4. **Status Indicators**
   - Save status (saving/saved/error)
   - Module status (draft/live)
   - Completion indicators

5. **Loading States**
   - Skeleton loaders
   - Progress indicators
   - Optimistic UI updates

---

## Technical Architecture Plan

### Component Structure

```
app/(dashboard)/courses/
├── page.tsx                    # Courses list
├── [courseId]/
│   ├── page.tsx                # Course view (chapters/modules)
│   ├── edit/
│   │   └── page.tsx            # Course edit (basic info, etc.)
│   └── chapter/
│       └── [chapterId]/
│           └── module/
│               └── [moduleId]/
│                   └── page.tsx # Module edit (modal or page)

components/course/
├── CourseHeader.tsx            # Course header with actions
├── ChapterList.tsx             # List of chapters
├── ChapterItem.tsx             # Single chapter (collapsible)
├── ModuleList.tsx              # List of modules in chapter
├── ModuleItem.tsx              # Single module item
├── ModuleEditor/
│   ├── ModuleEditor.tsx        # Main editor component
│   ├── ModuleEditorHeader.tsx  # Editor header
│   ├── ModuleInstructorSelect.tsx # Instructor dropdown (NEW)
│   ├── VideoModuleForm.tsx     # Video form (with PDF option)
│   ├── AssignmentModuleForm.tsx # Assignment form (enhanced)
│   ├── CodeModuleForm.tsx      # Code form (2025 standards)
│   ├── QuizModuleForm.tsx      # Quiz form (enhanced UX + JSON)
│   ├── PDFModuleForm.tsx       # PDF form (S3 + Drive)
│   └── TextModuleForm.tsx      # Text form (enhanced editor)
├── ModuleSerializer.tsx        # Serialization tool
├── CourseBuilder.tsx           # Drag-drop builder
└── BulkImport/
    ├── BulkImportDialog.tsx    # Bulk import modal (NEW)
    ├── ImportFileUpload.tsx    # File upload component (NEW)
    ├── ImportPreview.tsx       # Import preview/validation (NEW)
    ├── ImportProgress.tsx     # Import progress tracker (NEW)
    └── ExportButton.tsx        # Export course button (NEW)

hooks/
├── useCourse.ts                # Course data (React Query)
├── useChapters.ts             # Chapters data
├── useModules.ts              # Modules data
├── useModuleEditor.ts         # Module editor state
├── useAutoSave.ts             # Auto-save logic
├── useKeyboardShortcuts.ts    # Keyboard shortcuts
├── useBulkImport.ts           # Bulk import logic (NEW)
└── useCourseExport.ts         # Course export logic (NEW)

services/
├── course.service.ts           # Course API calls
├── chapter.service.ts         # Chapter API calls
└── module.service.ts          # Module API calls

lib/
├── editors/
│   ├── lexical-setup.ts       # Lexical editor config
│   ├── latex-plugin.ts        # LaTeX equation plugin (NEW)
│   └── markdown-plugin.ts     # Markdown support plugin (NEW)
├── serialization/
│   └── serialization-utils.ts # Serialization helpers
├── quiz/
│   ├── quiz-json-parser.ts    # Quiz JSON import/export (NEW)
│   └── quiz-validator.ts      # Quiz validation (NEW)
├── file-upload/
│   ├── s3-upload.ts           # S3 upload utilities
│   └── drive-validator.ts     # Google Drive link validation (NEW)
└── bulk-import/
    ├── csv-parser.ts          # CSV course import parser (NEW)
    ├── json-parser.ts         # JSON course import parser (NEW)
    ├── import-validator.ts   # Bulk import validation (NEW)
    ├── import-processor.ts   # Bulk import processor (NEW)
    └── export-generator.ts   # Course export generator (NEW)
```

### Data Flow

```
User Action
    │
    ▼
Component (UI)
    │
    ▼
Hook (useMutation/useQuery)
    │
    ▼
Service (API call)
    │
    ▼
React Query Cache
    │
    ▼
UI Update (optimistic + real)
```

### Key Technologies

1. **Next.js 16** - App Router, Server Components
2. **React 19** - Latest features
3. **TypeScript 5.9** - Type safety
4. **shadcn/ui** - UI components
5. **React Query** - Server state
6. **Zustand** - Client state
7. **Lexical** - Rich text editor
8. **@dnd-kit/core** - Drag and drop
9. **Sonner** - Toast notifications
10. **Zod** - Validation

---

## Implementation Plan

### Phase 8.1: Foundation (Week 1)

**Goals:**

- Set up new component structure
- Migrate to React Query
- Set up Zustand store
- Create base components

**Tasks:**

1. ✅ Create component structure
2. ✅ Set up React Query provider
3. ✅ Create Zustand stores
4. ✅ Create base hooks (useCourse, useChapters, useModules)
5. ✅ Create service layer (course.service.ts, etc.)
6. ✅ Set up Lexical editor
7. ✅ Create base UI components (shadcn)

**Deliverables:**

- Component structure in place
- Data fetching via React Query
- Base components working
- Editor setup complete

### Phase 8.2: Course View Redesign (Week 2)

**Goals:**

- Redesign course page with collapsible chapters
- Implement drag-and-drop with @dnd-kit
- Add keyboard shortcuts
- Improve navigation

**Tasks:**

1. ✅ Create ChapterList component
2. ✅ Create ChapterItem (collapsible)
3. ✅ Create ModuleList component
4. ✅ Create ModuleItem component
5. ✅ Implement drag-and-drop with @dnd-kit
6. ✅ Fix serialization logic
7. ✅ Add keyboard shortcuts
8. ✅ Implement auto-save for serialization
9. ✅ Add save status indicators

**Deliverables:**

- Redesigned course page
- Working drag-and-drop
- Fixed serialization
- Keyboard shortcuts
- Auto-save

### Phase 8.3: Module Editor Modal (Week 3)

**Goals:**

- Create modal-based module editor
- Replace React Draft with Lexical
- Improve module forms
- Add auto-save

**Tasks:**

1. ✅ Create ModuleEditor modal component
2. ✅ Create module type-specific forms
3. ✅ Migrate to Lexical editor
4. ✅ Implement auto-save (debounced)
5. ✅ Add save status indicators
6. ✅ Improve error handling
7. ✅ Add validation
8. ✅ Improve file uploads (S3)

**Deliverables:**

- Modal-based module editor
- Lexical editor integrated
- Auto-save working
- Better error handling

### Phase 8.4: Module Forms Redesign (Week 4)

**Goals:**

- Redesign all module forms with new features
- Improve UX for each type
- Add inline editing where appropriate
- Improve file uploads
- Integrate LaTeX/Markdown editor
- Add instructor field to all modules

**Tasks:**

1. ✅ Redesign VideoForm
   - Add optional PDF field (S3 or Drive)
   - Enhanced editor with LaTeX
2. ✅ Redesign AssignmentForm
   - Add `willEvaluated` flag
   - Add assignment document upload (S3 or Drive)
   - Enhanced editor with LaTeX
3. ✅ Redesign CodeForm (modularize)
   - Keep all existing features
   - 2025 implementation standards
4. ✅ Redesign QuizForm
   - Enhanced UX (industry standard)
   - Add quiz time limit field
   - Add quiz attempt limit field
   - Add JSON import/export
   - LaTeX support in questions/explanations
5. ✅ Redesign PDFForm
   - Add Google Drive link option
   - Keep S3 upload option
   - Toggle between S3/Drive
6. ✅ Redesign TextForm
   - Enhanced editor with LaTeX/Markdown
   - Better formatting options
7. ✅ Add InstructorSelect component
   - Dropdown for all modules
   - Fetch from API
   - Optional field
8. ✅ Improve file uploads
   - Progress indicators
   - Error handling
   - S3 and Drive support
9. ✅ Add LaTeX/Markdown editor integration
   - KaTeX or MathJax rendering
   - Equation button in toolbar
   - Preview support

**Deliverables:**

- All module forms redesigned with new features
- LaTeX/Markdown editor integrated
- Instructor field added to all modules
- Enhanced file uploads (S3 + Drive)
- Quiz JSON import/export working (with encryption)
- Bulk course import/export UI components

### Phase 8.5: Course Edit Page (Week 5)

**Goals:**

- Redesign course edit page
- Improve tabs/navigation
- Better form organization
- Auto-save

**Tasks:**

1. ✅ Redesign EditCoursePage
2. ✅ Improve tab navigation
3. ✅ Better form sections
4. ✅ Add auto-save
5. ✅ Improve image uploads
6. ✅ Better validation

**Deliverables:**

- Redesigned course edit page
- Better organization
- Auto-save

### Phase 8.6: New Course Page (Week 6)

**Goals:**

- Redesign new course page
- Better workflow
- Step-by-step wizard (optional)
- Auto-save drafts

**Tasks:**

1. ✅ Redesign NewCoursePage
2. ✅ Improve form organization
3. ✅ Add draft saving
4. ✅ Better validation
5. ✅ Improve image uploads

**Deliverables:**

- Redesigned new course page
- Draft saving
- Better workflow

### Phase 8.7: Polish & Testing (Week 7)

**Goals:**

- Polish UI/UX
- Add missing features
- Fix bugs
- Performance optimization
- Testing

**Tasks:**

1. ✅ UI polish
2. ✅ Add tooltips
3. ✅ Add help text
4. ✅ Keyboard shortcuts help modal
5. ✅ Performance optimization
6. ✅ Accessibility improvements
7. ✅ Testing (manual + automated)
8. ✅ Bug fixes

**Deliverables:**

- Polished UI
- All features working
- Performance optimized
- Tested

---

## Feature Comparison Matrix

### Current vs Planned

| Feature                    | Current             | Planned                           | Priority  |
| -------------------------- | ------------------- | --------------------------------- | --------- |
| **Text Editor**            | React Draft WYSIWYG | Lexical + LaTeX/Markdown          | 🔴 High   |
| **Drag & Drop**            | react-beautiful-dnd | @dnd-kit/core                     | 🔴 High   |
| **State Management**       | useState + Context  | React Query + Zustand             | 🔴 High   |
| **Auto-Save**              | ❌ None             | ✅ Debounced (2-3s)               | 🔴 High   |
| **Keyboard Shortcuts**     | ❌ None             | ✅ Full support                   | 🔴 High   |
| **Collapse/Expand**        | ❌ None             | ✅ Chapters & Modules             | 🔴 High   |
| **Modal Editing**          | ❌ New pages        | ✅ Modals                         | 🔴 High   |
| **Error Handling**         | ❌ Silent           | ✅ Toast + Retry                  | 🔴 High   |
| **Caching**                | ❌ None             | ✅ React Query                    | 🔴 High   |
| **Serialization**          | ⚠️ Broken           | ✅ Fixed                          | 🔴 High   |
| **LaTeX Support**          | ❌ None             | ✅ Equations in quiz/descriptions | 🔴 High   |
| **Instructor Field**       | ❌ None             | ✅ All modules (optional)         | 🔴 High   |
| **PDF Enhancements**       | S3 only             | ✅ S3 + Google Drive              | 🔴 High   |
| **Assignment Docs**        | ❌ None             | ✅ Upload S3/Drive                | 🔴 High   |
| **Quiz JSON Import**       | ❌ None             | ✅ Import/Export                  | 🔴 High   |
| **Quiz Answer Encryption** | ⚠️ Manual           | ✅ Auto-encrypt on import         | 🔴 High   |
| **Bulk Course Import**     | ❌ None             | ✅ CSV/JSON import/export         | 🔴 High   |
| **Quiz Time/Attempt**      | ❌ None             | ✅ Optional limits                | 🟡 Medium |
| **willEvaluated Flag**     | ❌ None             | ✅ Assignment evaluation toggle   | 🟡 Medium |
| **Save Status**            | ❌ None             | ✅ Indicator                      | 🟡 Medium |
| **Undo/Redo**              | ❌ None             | ✅ Basic support                  | 🟡 Medium |
| **Module Templates**       | ❌ None             | ✅ Templates                      | 🟢 Low    |
| **Version History**        | ❌ None             | ✅ Basic                          | 🟢 Low    |
| **Collaboration**          | ❌ None             | ✅ Future                         | 🟢 Low    |

### Priority Legend

- 🔴 **High** - Critical for Phase 8
- 🟡 **Medium** - Important but can wait
- 🟢 **Low** - Nice to have, future enhancement

---

## Success Criteria

### Must Have (Phase 8)

1. ✅ **Fixed Serialization**
   - Drag-drop works correctly
   - Serials update properly
   - No modules moving between chapters

2. ✅ **Modal-Based Editing**
   - Modules open in modals
   - No new windows
   - Context preserved

3. ✅ **Collapsible Sections**
   - Chapters collapsible
   - Modules collapsible
   - State remembered

4. ✅ **Auto-Save**
   - Debounced auto-save
   - Save status indicator
   - Unsaved changes warning

5. ✅ **Modern Editor**
   - Lexical integrated
   - Better performance
   - Modern features

6. ✅ **Better Error Handling**
   - Error toasts
   - Retry mechanism
   - User-friendly messages

7. ✅ **Keyboard Shortcuts**
   - Save (Ctrl+S)
   - Cancel (Escape)
   - Navigation shortcuts

8. ✅ **Improved UX**
   - Compact, aligned design
   - Better spacing
   - Professional appearance

### Nice to Have (Future)

1. ⏭️ Undo/Redo
2. ⏭️ Module templates
3. ⏭️ Version history
4. ⏭️ Real-time collaboration
5. ⏭️ AI assistance

---

## API Compatibility

### Important: Backward Compatibility Required

**Constraint:**

- ✅ **Existing APIs MUST continue to work 100%**
- ✅ New APIs will be added (see API Requirements doc)
- ✅ Existing APIs enhanced with optional fields
- ✅ Build new UI with new APIs, but support old APIs

**Current APIs (Must Continue Working):**

- `GET /admin/course/getFull/{courseId}` - Enhanced with new optional fields
- `PUT /admin/course/updateFull/{courseId}` - Accepts new optional fields
- `GET /admin/module/get/{moduleId}` - Enhanced with new optional fields
- `PUT /admin/module/update/{moduleId}` - Accepts new optional fields
- `POST /admin/module/create/{chapterId}` - Accepts new optional fields
- `DELETE /admin/module/delete/{moduleId}` - No changes
- `POST /admin/chapter/create/{courseId}` - No changes
- `PUT /admin/chapter/update/{chapterId}` - No changes
- `DELETE /admin/chapter/delete/{chapterId}` - No changes
- `GET /admin/teacher/list` - For instructor dropdown

**New APIs (See API Requirements Doc):**

- `POST /admin/module/{moduleId}/assignment/document` - Upload assignment doc
- `POST /admin/module/{moduleId}/quiz/import` - Import quiz JSON (with encryption)
- `GET /admin/module/{moduleId}/quiz/export` - Export quiz JSON
- `PUT /admin/module/{moduleId}/instructor` - Assign instructor
- `POST /admin/module/{moduleId}/duplicate` - Duplicate module
- `PUT /admin/course/{courseId}/modules/reorder` - Better serialization
- `POST /admin/course/import` - Bulk import course (CSV/JSON) - **NEW**
- `GET /admin/course/{courseId}/export` - Export course (CSV/JSON) - **NEW**
- `GET /admin/course/import/{importId}/status` - Check import status - **NEW**
- `GET /admin/course/import/template` - Download import template - **NEW**

**Data Format:**

- Existing request/response formats maintained
- New fields are **OPTIONAL** - APIs work without them
- Backward compatible - old frontend code works
- See `PHASE_8_API_REQUIREMENTS.md` for full API spec

---

## New Features Summary

### 1. LaTeX/Markdown Editor Support

**Required For:**

- Quiz questions (equations)
- Quiz explanations (equations)
- Module descriptions (equations)
- Assignment descriptions (equations)

**Implementation:**

- Lexical editor with KaTeX/MathJax plugin
- Inline equations: `$x^2 + 5x + 6 = 0$`
- Block equations: `$$\int_0^1 x^2 dx$$`
- Markdown support for formatting
- Export as HTML with LaTeX delimiters

### 2. PDF Module Enhancements

**Video Module:**

- Optional PDF attachment field
- Upload to S3 OR enter Google Drive link
- Display in user frontend with expand/collapse

**PDF Module:**

- Dual upload options:
  - Upload to S3 (existing)
  - OR enter Google Drive public link (new)
- Toggle between S3/Drive
- Preview and download support

### 3. Assignment Module Enhancements

**New Fields:**

- `willEvaluated` flag (toggle on/off)
- Assignment question document upload
  - Upload to S3 or Google Drive
  - File types: PDF, DOC, DOCX
- Assignment title field
- Enhanced description with LaTeX

**Existing Fields (Unchanged):**

- Score, isLive, isFree
- Deadline (date + time)
- Instruction video
- View submissions button

### 4. Quiz Module Improvements

**New Features:**

- Quiz time limit (optional, in minutes)
- Quiz attempt limit (optional)
- JSON import/export
  - Import quiz questions from JSON
  - Export quiz to JSON
  - Standardized format
- Enhanced UX (industry standard)
- LaTeX support in questions/explanations

**Improved UX:**

- Better question/option management
- Drag-drop for question order
- Bulk operations
- Template support

### 5. Instructor Association

**All Modules:**

- Optional instructor dropdown
- Fetch instructors from `/admin/teacher/list`
- Link module to instructor
- Display instructor info
- Nullable field (backward compatible)

### 6. Text Module Enhancements

- Enhanced Lexical editor
- LaTeX/Markdown support
- Better formatting options
- Code blocks
- Tables

### 7. Code Module

- Keep all existing features
- Follow 2025 implementation standards
- Modern UI/UX
- No breaking changes

### 8. Bulk Course Import/Export (NEW)

**CSV/JSON Import:**

- Import entire course structure (course, chapters, modules)
- Support CSV and JSON formats
- Intelligent validation and auto-correction
- Non-atomic processing (partial success support)
- Detailed error reporting with line numbers
- Import modes: create, update, upsert
- Progress tracking for large imports

**CSV Format:**

- Flat structure with chapter/module context
- Required and optional columns
- Example data in template
- UTF-8 encoding support

**JSON Format:**

- Hierarchical structure (course → chapters → modules)
- Full module data support
- Versioned format (v1.0)
- Comments and documentation

**Export:**

- Export course to CSV or JSON
- Match import format exactly
- Include/exclude content options
- Quiz answers encrypted in export

**Features:**

- Template download (CSV/JSON with examples)
- Validation-only mode (preview before import)
- Auto-correction of common issues
- Batch processing for large imports
- Status tracking for async operations

---

## Bulk Course Import/Export

### Industry Standards (2025)

**Research Findings:**

- CSV and JSON are standard formats for bulk imports
- Non-atomic processing (partial success) is preferred
- Validation-only mode for preview before import
- Detailed error reporting with line numbers
- Template files with examples
- UTF-8 encoding standard
- Incremental/batch processing for large imports

### Implementation Strategy

#### 1. **CSV Format**

**Structure:**

- Flat structure with chapter/module context in each row
- One row per module
- Chapter information repeated per module row
- Course information in first row(s) or separate section

**Advantages:**

- Easy to edit in Excel/Google Sheets
- Human-readable
- Good for bulk data entry
- Simple validation

**Disadvantages:**

- Limited for complex nested data
- Quiz questions need special handling (JSON in cell or separate file)

#### 2. **JSON Format**

**Structure:**

- Hierarchical: course → chapters → modules
- Full module data support
- Quiz questions as nested arrays
- Rich data types

**Advantages:**

- Supports complex structures
- Better for programmatic generation
- Full data fidelity
- Easy to version

**Disadvantages:**

- Harder to edit manually
- Requires JSON knowledge

#### 3. **Import Features**

**Validation:**

- Pre-import validation (validate_only mode)
- Field-level validation
- Relationship validation (chapters → modules)
- Data type validation
- Business rule validation

**Auto-Correction:**

- Auto-assign missing serials
- Auto-fix duplicate serials
- Auto-correct common format issues
- Warn but continue on non-critical issues

**Error Handling:**

- Non-atomic processing (partial success)
- Detailed error messages with:
  - Line number (CSV) or path (JSON)
  - Field name
  - Error type
  - Suggested fix
- Continue processing valid items
- Report summary at end

**Processing:**

- Batch processing for large imports
- Progress tracking
- Async processing for very large imports
- Status endpoint for checking progress

#### 4. **Export Features**

**Formats:**

- CSV export (matches import format)
- JSON export (full structure)
- Template download (with examples)

**Options:**

- Include/exclude module content
- Include/exclude quiz answers
- Include/exclude instructor data
- Format selection (CSV/JSON)

#### 5. **Frontend Implementation**

**Components:**

- `BulkImportDialog` - Main import modal
- `ImportFileUpload` - File upload with drag-drop
- `ImportPreview` - Validation preview before import
- `ImportProgress` - Progress tracking
- `ExportButton` - Export course button

**Workflow:**

1. User clicks "Import Course" button
2. Upload CSV/JSON file
3. Validate file (client-side + server-side)
4. Show preview with validation results
5. User reviews and confirms
6. Start import (sync or async)
7. Show progress
8. Display results (success/errors)

**UX Features:**

- Drag-drop file upload
- File format detection
- Real-time validation feedback
- Preview before import
- Download template button
- Export course button
- Import history (optional)

### Quiz Answer Encryption in Import

**CRITICAL REQUIREMENT:**

- Quiz answers in import JSON/CSV must be in **plain text**
- **Frontend encrypts answers** using `NEXT_PUBLIC_SECRET_KEY_QUIZ` before sending to backend
  - Frontend uses `encryptString()` function with `NEXT_PUBLIC_SECRET_KEY_QUIZ`
  - Backend receives and stores already-encrypted data (no encryption on backend)
  - This maintains backward compatibility with existing quiz modules
- Same encryption method as existing quiz system
- Explanations also encrypted
- Export should include encrypted answers (or option to exclude)

**Import Flow:**

1. User provides plain text answers in import file
2. Frontend validates answers match options
3. **Frontend encrypts answers and explanations** using `NEXT_PUBLIC_SECRET_KEY_QUIZ`
4. Frontend sends encrypted data to backend
5. Backend stores encrypted data (as-is, no additional encryption)
6. Export returns encrypted data (or decrypts if include_answers=true)

### CSV Template Structure

**Required Columns:**

```
course_title, course_description, course_language, course_price, course_x_price,
chapter_serial, chapter_title, chapter_is_free, chapter_is_live,
module_serial, module_title, module_category, module_score, module_is_live, module_is_free,
module_description, module_instructor_id, module_data_videoUrl, ...
```

**Example Row:**

```
"Intro to React","Learn React basics","English",5000,8000,1,"Basics",false,true,1,"Welcome","VIDEO",10,true,false,"Welcome video",5,"https://youtube.com/...","Youtube"
```

### JSON Template Structure

```json
{
  "version": "1.0",
  "format_version": "1.0",
  "course": {
    /* course fields */
  },
  "chapters": [
    {
      "serial": 1,
      "title": "Chapter 1",
      "modules": [
        {
          "serial": 1,
          "title": "Module 1",
          "category": "QUIZ",
          "data": {
            "quiz": [
              {
                "question": "What is 2+2?",
                "options": ["3", "4", "5"],
                "correct_answer": "4", // Plain text - frontend encrypts before sending
                "explanation": "Basic math" // Plain text - frontend encrypts before sending
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### Error Handling

**Validation Errors:**

- Field-level errors with line numbers
- Relationship errors (orphaned modules, etc.)
- Data type errors
- Business rule violations

**Processing Errors:**

- Database errors
- Constraint violations
- File system errors

**Response Format:**

```json
{
  "errors": [
    {
      "type": "validation",
      "level": "module",
      "chapter_index": 1,
      "module_index": 2,
      "field": "module_category",
      "error": "Invalid category: 'INVALID'",
      "line": 45,
      "suggestion": "Use one of: VIDEO, ASSIGNMENT, CODE, QUIZ, PDF, TEXT"
    }
  ]
}
```

### Success Criteria

1. ✅ Import entire course structure from CSV/JSON
2. ✅ Export course to CSV/JSON (matches import format)
3. ✅ Template download with examples
4. ✅ Validation before import
5. ✅ Auto-correction of common issues
6. ✅ Detailed error reporting
7. ✅ Partial success support
8. ✅ Progress tracking for large imports
9. ✅ Quiz answers encrypted on import
10. ✅ UTF-8 encoding support

## Next Steps

1. ✅ **Analysis Complete** - Current implementation documented
2. ✅ **Research Complete** - 2025 best practices identified
3. ✅ **Plan Complete** - Implementation plan ready
4. ✅ **API Requirements Complete** - Backend team has requirements
5. ⏭️ **Backend Implementation** - Backend team to implement APIs
6. ⏭️ **Begin Phase 8.1** - Foundation setup (after APIs ready)
7. ⏭️ **Iterate** - Weekly phases
8. ⏭️ **Test** - Continuous testing
9. ⏭️ **Deploy** - Staged rollout

---

**Document Status:** ✅ Complete (Updated with New Requirements)  
**Last Updated:** December 2025  
**Related Documents:**

- `PHASE_8_CURRENT_IMPLEMENTATION_ANALYSIS.md` - Current system analysis
- `PHASE_8_API_REQUIREMENTS.md` - Backend API requirements
  **Ready for:** Phase 8 Implementation (after backend APIs ready)
