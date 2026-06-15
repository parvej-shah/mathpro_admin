# Next.js 16 + React 19 + TypeScript 5.9 + shadcn/ui Migration Plan (2025)

## 📋 Executive Summary

This document outlines the complete migration plan for converting the Math Pro Admin Client from React + Vite + JavaScript to **Next.js 16 + React 19 + TypeScript 5.9 + shadcn/ui** following **2025 industry standards**.

**Current State:** React 18 + Vite + JavaScript (JSX)  
**Target State:** Next.js 16.1.0 + React 19.2.1 + TypeScript 5.9 + shadcn/ui (2025)  
**Timeline:** Phased approach with incremental migration  
**Branch:** New git branch for all changes  
**Year:** 2025 - All practices and versions reflect latest 2025 standards

---

## 🎯 Migration Goals

1. ✅ Migrate to Next.js 15 with App Router
2. ✅ Convert entire codebase to TypeScript
3. ✅ Replace MUI/DaisyUI with shadcn/ui components
4. ✅ Remove Framer Motion and use CSS transitions
5. ✅ Modularize large files (1000+ lines)
6. ✅ Implement best practices for Next.js
7. ✅ Ensure Vercel compatibility
8. ✅ Maintain all existing functionality
9. ✅ Use latest package versions
10. ✅ Minimal black/white design with shadcn

---

## 📦 Technology Stack (Target - 2025)

### Core Framework

- **Next.js:** 16.1.0 (latest stable as of December 2025)
- **React:** 19.2.1 (latest stable as of December 2025)
- **TypeScript:** 5.9.x (latest stable as of August 2025)

### UI Framework

- **shadcn/ui:** 2.5.0+ (latest)
- **Tailwind CSS:** 3.4.x
- **Radix UI:** (via shadcn)
- **Sonner:** (for toast notifications, replaces react-hot-toast)

### Utilities

- **Axios:** 1.13.2+ (latest 2025)
- **React Query/TanStack Query:** 5.91.1+ (latest as of November 2025)
- **Zod:** 4.2.1+ (for validation, via shadcn)
- **date-fns:** 4.1.0+ (for date handling, replaces dayjs)
- **jwt-decode:** 4.0.0+ (latest)
- **crypto-js:** 4.2.0+ (for encryption)

### Development

- **ESLint:** (Next.js default + custom rules)
- **Prettier:** (code formatting)
- **TypeScript:** (strict mode)

### Removed Packages

- ❌ Material-UI (MUI)
- ❌ DaisyUI
- ❌ Framer Motion
- ❌ React Beautiful DnD (if not needed)
- ❌ React Draft WYSIWYG (replace with shadcn editor)
- ❌ React Quill (replace with shadcn editor)
- ❌ React Hot Toast (replace with Sonner)

---

## 🗂️ Project Structure (Target)

```
admin-client-mathpro/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Homepage
│   │   ├── courses/
│   │   │   ├── page.tsx          # Courses list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # New course
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx      # Course details
│   │   │       ├── edit/
│   │   │       │   └── page.tsx  # Edit course
│   │   │       └── chapter/
│   │   │           └── [chapterId]/
│   │   │               └── module/
│   │   │                   └── [moduleId]/
│   │   │                       └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── sms-management/
│   │   │   └── page.tsx
│   │   └── ...                    # Other routes
│   ├── api/                       # API routes (if needed)
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── pagination.tsx
│   │   ├── toast.tsx
│   │   └── ...                    # All shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Nav.tsx
│   │   └── ProtectedRoute.tsx
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── CourseForm.tsx
│   │   └── ...
│   ├── user/
│   │   ├── UserTable.tsx
│   │   ├── UserFilter.tsx
│   │   └── ...
│   └── ...                        # Feature-specific components
├── lib/
│   ├── utils.ts                   # Utility functions (cn, etc.)
│   ├── api.ts                     # API client setup
│   ├── auth.ts                    # Auth helpers
│   └── constants.ts               # Constants
├── hooks/
│   ├── useAuth.ts
│   ├── useUsers.ts
│   ├── useCourses.ts
│   └── ...
├── services/
│   ├── user.service.ts
│   ├── course.service.ts
│   ├── admin.service.ts
│   └── ...
├── types/
│   ├── user.types.ts
│   ├── course.types.ts
│   ├── api.types.ts
│   └── ...
├── contexts/
│   └── AuthContext.tsx            # Auth context (if needed)
├── public/                        # Static assets
├── .env.local                     # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔄 Migration Phases

### Phase 1: Setup & Foundation (Week 1)

**Goal:** Set up Next.js project structure and core infrastructure

#### Tasks:

1. ✅ Create new git branch: `nextjs-migration`
2. ✅ Initialize Next.js 15 project with TypeScript
3. ✅ Install and configure shadcn/ui
4. ✅ Set up Tailwind CSS with shadcn config
5. ✅ Configure TypeScript (strict mode)
6. ✅ Set up ESLint and Prettier
7. ✅ Create folder structure
8. ✅ Set up environment variables
9. ✅ Configure Next.js for Vercel deployment
10. ✅ Install core dependencies (axios, react-query, etc.)

#### Deliverables:

- Working Next.js 15 project
- shadcn/ui configured
- TypeScript compiling without errors
- Basic layout structure

---

### Phase 2: Core Infrastructure (Week 1-2)

**Goal:** Migrate core functionality and utilities

#### Tasks:

1. ✅ Create API client setup (`lib/api.ts`)
2. ✅ Migrate helper functions to TypeScript (`lib/utils.ts`, `lib/auth.ts`)
3. ✅ Create TypeScript types for all entities
4. ✅ Set up React Query for data fetching
5. ✅ Create authentication context/hooks
6. ✅ Migrate ProtectedRoute to Next.js middleware + layout
7. ✅ Set up Sonner for toast notifications
8. ✅ Create base layout with Sidebar
9. ✅ Migrate routing structure

#### Deliverables:

- Core utilities migrated
- TypeScript types defined
- Authentication working
- Protected routes working
- Toast notifications working

---

### Phase 3: UI Components Migration (Week 2-3)

**Goal:** Replace MUI/DaisyUI with shadcn components

#### Tasks:

1. ✅ Install all required shadcn components:
   - button, card, dialog, table, pagination, toast (sonner)
   - input, select, textarea, checkbox, radio-group
   - tabs, accordion, alert, badge, dropdown-menu
   - form, label, separator, skeleton, spinner
   - calendar, date-picker (if needed)
2. ✅ Create custom components from shadcn base:
   - DataTable component
   - Form components
   - Modal/Dialog components
   - Pagination wrapper
3. ✅ Migrate Sidebar component
4. ✅ Migrate Nav component
5. ✅ Remove MUI and DaisyUI dependencies
6. ✅ Update all component imports

#### Deliverables:

- All UI components using shadcn
- No MUI/DaisyUI dependencies
- Consistent design system

---

### Phase 4: Service Layer Migration (Week 3)

**Goal:** Migrate API services to TypeScript

#### Tasks:

1. ✅ Migrate `UserService.js` → `user.service.ts`
2. ✅ Migrate `AdminService.js` → `admin.service.ts`
3. ✅ Migrate `CourseService.js` → `course.service.ts`
4. ✅ Migrate `BundleService.js` → `bundle.service.ts`
5. ✅ Migrate `CouponService.js` → `coupon.service.ts`
6. ✅ Migrate `ContestService.js` → `contest.service.ts`
7. ✅ Migrate `AnnouncementService.js` → `announcement.service.ts`
8. ✅ Migrate `AfterMessageService.js` → `after-message.service.ts`
9. ✅ Migrate `PaymentService.js` → `payment.service.ts`
10. ✅ Add TypeScript types to all services
11. ✅ Integrate with React Query

#### Deliverables:

- All services migrated to TypeScript
- Type-safe API calls
- React Query integration

---

### Phase 5: Page Migration - Core Pages (Week 4-5)

**Goal:** Migrate essential pages first

#### Priority Order:

1. ✅ Login page
2. ✅ Homepage/Dashboard
3. ✅ User Management (already modular)
4. ✅ Admin Management
5. ✅ Courses List
6. ✅ Analytics Dashboard

#### Tasks per Page:

- Convert to TypeScript
- Replace MUI components with shadcn
- Remove Framer Motion animations
- Use React Query for data fetching
- Implement proper error handling
- Add loading states
- **Apply max-width 1440px container to ALL pages**
- **Ensure light/dark theme support**
- **Follow industry-standard styling practices**
- **Consistent useEffect patterns (check isOpen, window checks)**
- **Proper state management with functional updates**
- Test functionality

#### Critical Requirements (2025 Standards - Added Post-Phase 5):

1. **Max-Width 1440px (2025 Standard):**
   - Apply `max-w-[1440px] mx-auto w-full` to ALL pages (login, dashboard, all routes)
   - Use consistent padding: `px-4 sm:px-6 lg:px-8`
   - Create reusable `PageContainer` component for consistency
   - Industry standard for admin dashboards in 2025

2. **Theme Support (2025 Standard):**
   - Ensure all pages work with light/dark/system theme
   - Use shadcn theme variables (`bg-background`, `text-foreground`, etc.)
   - Test theme switching on all pages
   - No hardcoded colors
   - Use `next-themes` for theme management (2025 standard)

3. **Industry-Standard Styling (2025):**
   - Follow Next.js 16 App Router best practices (2025)
   - Use Tailwind CSS 3.4+ utility classes consistently
   - Responsive design: mobile-first approach
   - Proper spacing and typography scales
   - Consistent component patterns
   - Accessibility compliance (WCAG 2025 standards)

4. **Data Fetching (React 19 2025 Standards):**
   - ✅ **Use React Query (TanStack Query) for client-side data fetching** (correct pattern)
   - ✅ **DO NOT use useEffect for data fetching** (React 19 best practice)
   - Use Server Actions for mutations when possible (React 19 preference)
   - Use Server Components for initial data fetching when possible
   - React Query provides caching, refetching, and error handling (2025 standard)

5. **useEffect Best Practices (2025):**
   - Always check `typeof window !== "undefined"` for client-side code
   - Check `isOpen` prop before setting state in modals/dialogs
   - Use functional state updates: `setState((prev) => ...)`
   - Include all dependencies in dependency arrays
   - Clean up subscriptions/effects properly
   - **Avoid useEffect for data fetching** (use React Query or Server Actions)

6. **State Management (React 19 2025):**
   - Use functional updates for state that depends on previous state
   - Avoid stale closures
   - Use `useMemo` and `useCallback` appropriately
   - Type all state properly with TypeScript
   - Leverage React 19 improved state management patterns

7. **TypeScript (2025 Standards):**
   - Zero TypeScript errors
   - Proper type inference where possible
   - Explicit types for complex objects
   - No `any` types (use `unknown` if needed)
   - Use TypeScript 5.9 features (deferred module evaluation, etc.)

#### Deliverables:

- Core pages fully migrated
- All functionality working
- Type-safe components
- Consistent max-width across all pages
- Full theme support
- Industry-standard code quality

---

### Phase 6: Page Migration - Complex Pages (Week 5-7)

**Goal:** Migrate large, complex pages with modularization

#### Pages to Migrate (in order):

1. ✅ **SMS Management** (1764 lines) - Break into:
   - `SMSHistory.tsx`
   - `SMSSender.tsx`
   - `SMSStatistics.tsx`
   - `SMSRecipients.tsx`
   - `SMSFilters.tsx`

2. ✅ **Coupon Management** (1564 lines) - Break into:
   - `CouponList.tsx`
   - `CouponForm.tsx`
   - `CouponAnalytics.tsx`
   - `CouponCourses.tsx`

3. ⏸️ **Edit Course Page** (1447 lines) - **DEFERRED to LMS Overhaul Phase**
   - See `docs/PHASE_LMS_OVERHAUL_PLAN.md` for details
   - Will be redesigned with industry-standard UX/UI

4. ⏸️ **New Course Page** (1324 lines) - **DEFERRED to LMS Overhaul Phase**
   - See `docs/PHASE_LMS_OVERHAUL_PLAN.md` for details
   - Will be redesigned with industry-standard UX/UI

5. ✅ **Announcements** (1253 lines) - Break into:
   - `AnnouncementList.tsx`
   - `AnnouncementForm.tsx`
   - `AnnouncementFilters.tsx`

6. ⏸️ **Course Page** (1221 lines) - **DEFERRED to LMS Overhaul Phase**
   - Course details with chapters/modules viewing/editing
   - See `docs/PHASE_LMS_OVERHAUL_PLAN.md` for details
   - Will be redesigned with industry-standard UX/UI

7. ✅ **After Purchase Messages** (1178 lines) - **COMPLETE** - Break into:
   - `MessageList.tsx`
   - `MessageForm.tsx`
   - `MessageStats.tsx`

8. ✅ **Payment Audit Log** (1153 lines) - **COMPLETE** - Break into:
   - `PaymentList.tsx`
   - `PaymentFilters.tsx`
   - `PaymentStats.tsx`
   - `PaymentDetailsDialog.tsx`
   - `ReconcileDialog.tsx`

9. ✅ **Threads** (1056 lines) - **COMPLETE** - Break into:
   - `ThreadList.tsx`
   - `ThreadView.tsx`

10. ⏸️ **Code Form** (1036 lines) - **DEFERRED to LMS Overhaul Phase**
    - Part of module editing components
    - See `docs/PHASE_LMS_OVERHAUL_PLAN.md` for details

#### Tasks:

- Break down large files into smaller components
- Create reusable hooks for data fetching
- Implement proper TypeScript types
- Replace all UI components
- Remove animations
- Test thoroughly

#### Deliverables:

- All large pages modularized
- Components under 300 lines each
- Maintainable code structure

---

### Phase 7: Remaining Pages (Week 7-8)

**Goal:** Migrate remaining pages (excluding LMS-related pages)

**Status:** ✅ **COMPLETE**

#### Pages:

- ✅ **Phase 7.1: Teacher Dashboard** (920 lines) - **COMPLETE**
- ✅ **Phase 7.2: Live Class Pages** (864 lines) - **COMPLETE**
- ✅ **Phase 7.3: Contest Pages** (681 lines) - **COMPLETE**
- ✅ **Phase 7.4: Purchased Users** (719 lines) - **COMPLETE**
- ✅ **Phase 7.4: Prebooked Users** (509 lines) - **COMPLETE**
- ✅ **Phase 7.4: Certificate Issue** (179 lines) - **COMPLETE**
- ✅ **Phase 7.4: Rewards** (429 lines) - **COMPLETE**
- ✅ **Phase 7.4: Forum** (334 lines) - **COMPLETE**
- ✅ **Phase 7.4: Student Profile** (722 lines) - **COMPLETE**
- ✅ **Phase 7.4: Routine Management** - **COMPLETE**
- ✅ **Phase 7.4: Bundle Management** - **COMPLETE**

#### ⏸️ Deferred to Phase 8 (LMS Overhaul Phase):

- Edit Course Page (1447 lines)
- New Course Page (1324 lines)
- Course Page (1221 lines)
- Module Page
- Assignment Page
- All Module Components (VideoForm, CodeForm, AssignmentForm, QuizForm, PDFForm, TextForm)
- See Phase 8 section below for details

#### Tasks:

- Convert to TypeScript
- Replace UI components
- Remove animations
- Test functionality

#### Deliverables:

- All pages migrated
- No JavaScript files remaining

---

### Phase 8: LMS Course Editing Overhaul (Week 8-9)

**Goal:** ✅ **COMPLETE - Industry-Standard Course Editing Implementation**

**Status:** ✅ **COMPLETED - December 2025**

#### Overview

This phase implemented a comprehensive industry-standard course editing system with modern UX/UI, enhanced module management, and robust features for content creation and editing.

#### Completed Features

1. **✅ Teacher Management (v2 APIs)**
   - Comprehensive teacher CRUD operations
   - Teacher assignment to courses/bundles
   - Image upload support
   - Status toggle and search functionality
   - Updated teacher dashboard and all references

2. **✅ Enhanced Module Forms**
   - **Video Module**: Optional PDF attachment (S3 or Google Drive)
   - **PDF Module**: Dual upload options (S3 or Google Drive)
   - **Assignment Module**: Document uploads, `willEvaluated` flag, deadline management
   - **Quiz Module**: Enhanced GUI builder with rich text, time/attempt limits, JSON import/export
   - **Code Module**: Custom problem builder with rich text, test cases, time/memory limits
   - **Text Module**: Enhanced Lexical editor integration
   - All modules: Optional instructor field

3. **✅ Rich Text & LaTeX Support**
   - Lexical editor with KaTeX integration
   - Extensive rich text support for quiz questions, options, and explanations
   - LaTeX/Markdown equation support throughout

4. **✅ Quiz Builder Enhancement**
   - Comprehensive GUI for quiz question creation
   - Rich text editor for all quiz fields (questions, options, explanations)
   - JSON import/export with frontend encryption
   - Time limit and attempt limit fields
   - Drag-and-drop question reordering

5. **✅ Code Module Custom Builder**
   - Tabbed interface for problem creation
   - Rich text for problem statements, input/output formats, samples, notes
   - Test case management with file uploads
   - Time and memory limit configuration
   - Editorial section with code editor (Monaco)

6. **✅ Course Import/Export**
   - Bulk course data import (CSV/JSON)
   - Course export functionality
   - Import status tracking with progress
   - Template downloads
   - Comprehensive error/warning reporting

7. **✅ Module Reordering**
   - Efficient v2 API for batch module reordering
   - Support for intra-chapter and inter-chapter moves
   - Optimistic updates with proper error handling

8. **✅ File Upload Enhancements**
   - S3 upload support maintained
   - Google Drive public link support
   - Module-specific document upload APIs
   - Assignment question document uploads

9. **✅ State Management & UX**
   - Modal-based module editing (preserves context)
   - Keyboard shortcuts support
   - Auto-save functionality
   - Proper error handling with toast notifications
   - Loading states and skeleton screens

#### Implemented Components

1. **✅ Module Editor System**
   - `ModuleEditor.tsx` - Main modal-based editor
   - `ModuleTypeSelector.tsx` - Module type selection
   - All module form components migrated to TypeScript with Lexical

2. **✅ Module Forms (All Types)**
   - `VideoModuleForm.tsx` - Video module with optional PDF attachment
   - `PDFModuleForm.tsx` - PDF module with dual upload options
   - `AssignmentModuleForm.tsx` - Assignment with document uploads and `willEvaluated` flag
   - `QuizModuleForm.tsx` - Enhanced quiz with rich text builder
   - `CodeModuleForm.tsx` - Code module with custom builder
   - `TextModuleForm.tsx` - Text module with Lexical editor
   - `BaseModuleForm.tsx` - Base form with common fields (instructor selection)

3. **✅ Enhanced Builders**
   - `QuizBuilder.tsx` - Comprehensive quiz question builder with rich text
   - `CodeProblemBuilder.tsx` - Custom coding problem builder with tabs

4. **✅ Course Management**
   - `app/(dashboard)/courses/[courseId]/page.tsx` - Main course view with drag-drop
   - `ChapterList.tsx` - Chapter management with collapsible sections
   - `CourseHeader.tsx` - Course header with import/export actions
   - `ImportDialog.tsx` - Bulk import interface with progress tracking

5. **✅ Services & Hooks**
   - `services/teacher.service.ts` - v2 teacher APIs
   - `services/module.service.ts` - Enhanced v2 module APIs
   - `services/course.service.ts` - Course import/export and reordering
   - `hooks/useTeachers.ts` - Teacher management hooks
   - `hooks/useModules.ts` - Module management hooks
   - `hooks/useCourse.ts` - Course management hooks

#### Achieved Goals

1. **✅ Industry-Standard UX/UI**
   - Modern modal-based editing (preserves context)
   - Consistent shadcn/ui components throughout
   - Professional, aligned layouts
   - Responsive design with proper spacing

2. **✅ Better State Management**
   - React Query for server state
   - Zustand for client state (course store)
   - Proper TypeScript types throughout
   - No stale closures, efficient re-renders

3. **✅ Improved Navigation**
   - Modal-based module editing (no page navigation)
   - Keyboard shortcuts support
   - Smooth transitions with CSS
   - Context preservation

4. **✅ Robust Serialization**
   - v2 API for efficient module reordering
   - Batch operations for better performance
   - Reliable ordering system
   - 100% backward compatible

5. **✅ Better Module/Chapter Management**
   - Collapsible chapter sections
   - Modal-based module editing
   - Clear visual hierarchy
   - Easy add/edit/delete workflows
   - Drag-and-drop with visual feedback

#### Technical Implementation

- ✅ **New v2 APIs Integrated** - Backend team provided comprehensive v2 APIs
- ✅ **100% Backward Compatible** - All existing APIs continue to work
- ✅ **Technical Stack:**
  - Next.js 16.1.0 (App Router)
  - React 19.2.3
  - TypeScript 5.9.3
  - shadcn/ui components
  - React Query (TanStack Query) for data fetching
  - Lexical editor with KaTeX for rich text
  - Monaco editor for code editing
  - @dnd-kit for drag-and-drop
  - 2025 industry standards
  - Max-width 1440px
  - Full theme support (light/dark/system)

#### Research & Implementation

**Industry Standards Researched & Implemented:**

- ✅ Modern LMS course builder patterns (Canvas, Moodle, Teachable, Thinkific, LearnDash)
- ✅ Drag-and-drop course builders with @dnd-kit
- ✅ Modal-based editing patterns (preserves context)
- ✅ Module/chapter management best practices
- ✅ Efficient serialization with v2 batch APIs
- ✅ Keyboard shortcuts support
- ✅ Rich text editing with Lexical + LaTeX
- ✅ State management with React Query + Zustand

#### Implementation Steps Completed

1. **✅ Research Phase** - Researched modern LMS editing UIs, documented best practices
2. **✅ API Integration** - Integrated new v2 APIs from backend team
3. **✅ Design Phase** - Created modular component structure, designed state management
4. **✅ Implementation Phase** - Built all module forms, enhanced builders, import/export
5. **✅ Testing Phase** - TypeScript errors resolved, build successful, ready for testing

#### Success Criteria (All Met)

- ✅ Industry-standard UX/UI implemented
- ✅ All existing APIs work correctly (100% backward compatible)
- ✅ Serialization is reliable (v2 batch API)
- ✅ Navigation preserves context (modal-based editing)
- ✅ Keyboard shortcuts support implemented
- ✅ Professional, aligned appearance (shadcn/ui)
- ✅ Proper state management (React Query + Zustand)
- ✅ No breaking changes to backend
- ✅ All module types fully functional
- ✅ Rich text editor (Lexical) integrated throughout

#### Tasks Completed:

- ✅ Converted all components to TypeScript
- ✅ Replaced editors with Lexical (with KaTeX for LaTeX)
- ✅ Removed legacy dependencies
- ✅ Implemented industry-standard UX/UI
- ✅ Fixed serialization with v2 APIs
- ✅ Added keyboard shortcuts support
- ✅ Implemented modals and collapse/expand
- ✅ Tested all form types
- ✅ Integrated teacher management v2 APIs
- ✅ Implemented course import/export
- ✅ Enhanced quiz builder with rich text
- ✅ Built custom code problem builder

#### Deliverables:

- ✅ All module forms working with industry-standard UX
- ✅ Rich text editor (Lexical) integrated throughout
- ✅ Proper serialization with v2 batch APIs
- ✅ Better navigation and state management
- ✅ Teacher management system
- ✅ Course import/export functionality
- ✅ Enhanced quiz and code builders
- ✅ Comprehensive documentation

#### All Remaining Tasks Completed:

- ✅ **Edit Chapter Dialog** - **COMPLETED**
  - Fully functional dialog to edit chapter details (title, isFree, isLive)
  - Location: `app/(dashboard)/courses/[courseId]/page.tsx`
  - Uses `useUpdateChapter` hook with proper form validation and loading states
  - Pre-populates form with existing chapter data

- ✅ **Assignment Submissions Page** - **COMPLETED**
  - Complete page to view and evaluate student submissions
  - Location: `app/(dashboard)/courses/[courseId]/assignments/[moduleId]/submissions/page.tsx`
  - Features: Display submissions, evaluation forms, verdict selection (PASSED/FAILED), feedback
  - Navigation: Updated `AssignmentModuleForm.tsx` to navigate to submissions page
  - API: Uses `/admin/assignment/pendingEvaluations/{moduleId}` endpoint

- ✅ **Teacher Delete v2 API** - **COMPLETED**
  - Updated to try v2 API first (`/v2/admin/teacher/{id}`), falls back to legacy if 404
  - Location: `services/teacher.service.ts`
  - Benefit: Better error messages from v2 API when available

#### Optional Future Enhancements (Non-Critical):

- ⏳ Client-side validation for Google Drive URLs (currently backend-only, works fine)
- ⏳ Type refinement for legacy data (`any` types in some places - non-critical)

---

### Phase 9: Charts & Analytics (Week 9)

**Goal:** Migrate chart components

**Status:** ✅ **COMPLETE** - All analytics components migrated to Next.js 16 + TypeScript

#### Tasks:

1. ✅ Evaluate chart libraries:
   - Recharts (already used) - Kept and compatible
   - All charts work with shadcn theme
2. ✅ Migrate chart components:
   - BarChartComponent → `components/analytics/charts/BarChart.tsx`
   - LineChartComponent → `components/analytics/charts/LineChart.tsx`
   - PieChartComponent → `components/analytics/charts/PieChart.tsx`
   - DataTable → `components/analytics/charts/DataTable.tsx`
3. ✅ Migrate analytics components:
   - RevenueOverview → `components/analytics/RevenueOverview.tsx`
   - CourseRevenue → `components/analytics/CourseRevenue.tsx`
   - UserAnalytics → `components/analytics/UserAnalytics.tsx`
   - CourseAnalytics → `components/analytics/CourseAnalytics.tsx`
   - EngagementAnalytics → `components/analytics/EngagementAnalytics.tsx`
   - CertificateAnalytics → `components/analytics/CertificateAnalytics.tsx`
4. ✅ Created analytics service and hooks:
   - `services/analytics.service.ts` - All analytics API endpoints
   - `hooks/useAnalytics.ts` - React Query hooks for all analytics data
5. ✅ Main analytics dashboard page:
   - `app/(dashboard)/analytics-dashboard/page.tsx` - Complete with all tabs

#### Deliverables:

- ✅ All charts migrated to TypeScript with shadcn/ui
- ✅ Consistent styling with theme support
- ✅ Working analytics dashboard with all 6 tabs
- ✅ Course-specific module completion and discussion activity
- ✅ All data fetching via React Query

#### Action Required:

- ✅ **Bundle Management** - **COMPLETE** (migrated to `app/(dashboard)/bundle-management/`)
- ✅ **Routine Management** - **COMPLETE** (migrated to `app/(dashboard)/routine-management/`)
- ✅ **Analytics Dashboard** - **COMPLETE** (migrated to `app/(dashboard)/analytics-dashboard/`)
- ✅ **Middleware Migration** - **COMPLETE** (migrated from `middleware.ts` to `app/proxy.ts` per Next.js 16 standards)

---

### Phase 10: AWS S3 Integration (Week 9)

**Goal:** Ensure AWS SDK works with Next.js

#### Tasks:

1. ✅ Research Next.js AWS SDK compatibility
2. ✅ Update AWS SDK configuration
3. ✅ Handle file uploads properly
4. ✅ Test on Vercel (may need API routes)
5. ✅ Consider alternative: Upload to API endpoint instead

#### Deliverables:

- File uploads working
- Vercel compatible

---

### Phase 11: Testing & Bug Fixes (Week 10)

**Goal:** Comprehensive testing and fixes

#### Tasks:

1. ✅ Test all pages
2. ✅ Test all forms
3. ✅ Test authentication flow
4. ✅ Test protected routes
5. ✅ Test API integrations
6. ✅ Test file uploads
7. ✅ Test on Vercel
8. ✅ Fix TypeScript errors
9. ✅ Fix linting errors
10. ✅ Performance optimization
11. ✅ Accessibility checks
12. ✅ Mobile responsiveness

#### Deliverables:

- All tests passing
- No TypeScript errors
- No linting errors
- Working on Vercel

---

### Phase 12: Documentation & Cleanup (Week 10)

**Goal:** Final documentation and cleanup

#### Tasks:

1. ✅ Update README.md
2. ✅ Document new structure
3. ✅ Remove old files
4. ✅ Clean up unused dependencies
5. ✅ Update environment variable docs
6. ✅ Create migration guide
7. ✅ Code review
8. ✅ Final testing

#### Deliverables:

- Complete documentation
- Clean codebase
- Ready for production

---

## 🎨 Design System (shadcn/ui)

### Color Palette (Minimal Black/White)

```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#000000',  // Black
    foreground: '#FFFFFF', // White
  },
  secondary: {
    DEFAULT: '#F5F5F5',  // Light gray
    foreground: '#000000',
  },
  accent: {
    DEFAULT: '#E5E5E5',  // Medium gray
    foreground: '#000000',
  },
  background: '#FFFFFF',
  foreground: '#000000',
  muted: {
    DEFAULT: '#FAFAFA',
    foreground: '#737373',
  },
  border: '#E5E5E5',
  // ... shadcn defaults
}
```

### Typography

- Use shadcn default typography
- Minimal font weights
- Clean, readable sizes

### Components to Install

```bash
# Core components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add alert
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add pagination
npx shadcn@latest add sonner  # Toast notifications
npx shadcn@latest add calendar
npx shadcn@latest add date-picker
```

---

## 🔧 Technical Decisions

### 1. Routing (2025 Standards)

- **Decision:** Use Next.js 16 App Router with typed routes
- **Reason:** Latest 2025 standard, better for TypeScript, enables type-safe routing
- **Implementation:** Enable `typedRoutes: true` in `next.config.ts`
- **Best Practice:** Leverage React Server Components (RSC) by default, use `"use client"` only when needed

### 2. Data Fetching (2025 Standards)

- **Decision:** React Query (TanStack Query 5.90.12+) for client-side data fetching
- **Reason (2025):**
  - ✅ **React 19 best practice: DO NOT use useEffect for data fetching**
  - ✅ **React Query is the 2025 standard for client-side data fetching with caching**
  - React Query provides: caching, refetching, error handling, loading states
  - Server Components can be used for initial data, but React Query handles client-side state
  - Server Actions preferred for mutations (React 19 pattern)
- **Implementation (2025):**
  - ✅ Use React Query (`useQuery`, `useMutation`) for all client-side data fetching
  - ✅ Use Server Actions for mutations when possible
  - ✅ Use Server Components for initial server-side data when beneficial
  - ✅ **DO NOT use useEffect for data fetching** (outdated pattern)

### 3. State Management (2025 Standards)

- **Decision:** React Context + React Query + React 19 features
- **Reason:**
  - React 19 introduces improved state management patterns
  - React Query handles server state efficiently
  - Keep it simple, avoid over-engineering
  - Use `useState` with proper TypeScript types
  - Use functional updates: `setState((prev) => ...)`
  - Avoid stale closures with proper dependency arrays

### 4. Form Handling

- **Decision:** React Hook Form + Zod (via shadcn)
- **Reason:** shadcn standard, type-safe validation

### 5. Rich Text Editor

- **Decision:** TBD - Research shadcn-compatible editor
- **Options:** Tiptap, Lexical, or simple textarea
- **Action:** Ask user preference

### 6. File Uploads

- **Decision:** Upload to API endpoint (not direct S3)
- **Reason:** Better Vercel compatibility, more secure

### 7. Animations

- **Decision:** CSS transitions only (no Framer Motion)
- **Reason:** User requirement, simpler, better performance

### 8. Date Handling

- **Decision:** date-fns (replace dayjs)
- **Reason:** Better TypeScript support, tree-shakeable

### 9. Page Container & Layout

- **Decision:** Max-width 1440px for ALL pages (not just dashboard)
- **Reason:** Industry standard, consistent UX, better readability on large screens
- **Implementation:** Apply `max-w-[1440px] mx-auto w-full` to all page containers
- **Padding:** Responsive padding `px-4 sm:px-6 lg:px-8`

### 10. Theme System

- **Decision:** Full light/dark theme support using `next-themes`
- **Reason:** Modern UX standard, user preference, accessibility
- **Implementation:**
  - Use shadcn theme variables throughout
  - Test all pages in both themes
  - No hardcoded colors
  - Theme switcher in sidebar

### 11. State Management & useEffect Patterns (2025 Standards)

- **Decision:** Follow React 19 best practices strictly
- **Requirements (2025):**
  - **Prefer Server Actions over useEffect for data fetching** (React 19 standard)
  - Always check `typeof window !== "undefined"` for client-side code
  - Check `isOpen` before setting state in modals
  - Use functional updates: `setState((prev) => ...)`
  - Proper dependency arrays (include all dependencies)
  - Clean up effects (return cleanup functions)
  - Avoid overusing useEffect (derive state from props directly when possible)
  - Use `useMemo` and `useCallback` appropriately for performance
- **Reason:** React 19 best practices, prevent bugs, stale closures, memory leaks
- **2025 Update:** React 19 prefers Server Actions for async operations

---

## ⚠️ Risks & Mitigation

### Risk 1: Vercel Compatibility Issues

- **Risk:** AWS SDK, buffer polyfills may not work
- **Mitigation:** Use API routes for file uploads, test early

### Risk 2: Large File Migration

- **Risk:** Complex pages may have hidden dependencies
- **Mitigation:** Modularize incrementally, test after each module

### Risk 3: TypeScript Errors

- **Risk:** Many type errors during migration
- **Mitigation:** Use `any` temporarily, fix incrementally

### Risk 4: Breaking Changes

- **Risk:** API changes may break functionality
- **Mitigation:** Keep API calls identical, only change UI layer

### Risk 5: Performance Issues

- **Risk:** Next.js may have different performance characteristics
- **Mitigation:** Monitor performance, optimize as needed

---

## 📝 Checklist

### Pre-Migration

- [ ] Create git branch
- [ ] Backup current code
- [ ] Document current functionality
- [ ] List all dependencies
- [ ] Identify all API endpoints

### Setup

- [ ] Initialize Next.js 15 project
- [ ] Configure TypeScript
- [ ] Set up shadcn/ui
- [ ] Configure Tailwind
- [ ] Set up ESLint/Prettier
- [ ] Create folder structure

### Core

- [ ] Migrate helpers
- [ ] Create TypeScript types
- [ ] Set up API client
- [ ] Migrate authentication
- [ ] Set up protected routes
- [ ] Configure toast notifications

### Components

- [ ] Install all shadcn components
- [ ] Migrate Sidebar
- [ ] Migrate Nav
- [ ] Create reusable components
- [ ] Remove MUI/DaisyUI

### Services

- [ ] Migrate all services to TypeScript
- [ ] Integrate React Query
- [ ] Add error handling

### Pages

- [ ] Migrate login
- [ ] Migrate homepage
- [ ] Migrate core pages
- [ ] Migrate complex pages (with modularization)
- [ ] Migrate remaining pages

### Testing

- [ ] Test all pages
- [ ] Test authentication
- [ ] Test API calls
- [ ] Test file uploads
- [ ] Test on Vercel
- [ ] Fix all errors

### Final

- [ ] Remove unused dependencies
- [ ] Update documentation
- [ ] Code review
- [ ] Final testing
- [ ] Deploy to staging

---

## 🚀 Getting Started

### Step 1: Create Branch

```bash
git checkout -b nextjs-migration
```

### Step 2: Initialize Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

### Step 3: Install shadcn

```bash
npx shadcn@latest init
```

### Step 4: Install Dependencies

```bash
npm install axios @tanstack/react-query zod react-hook-form date-fns jwt-decode crypto-js
npm install -D @types/crypto-js
```

### Step 5: Follow Phases

Work through phases sequentially, testing after each phase.

---

## 🎉 Recent Improvements & Enhancements (December 2025)

This section documents major improvements and fixes implemented in recent development sessions.

### ✅ Sidebar Enhancements

#### 1. Collapsible/Expandable Sidebar (All Screen Sizes)

- **Status:** ✅ Completed
- **Implementation:**
  - Made sidebar fully collapsible on all screen sizes (not just mobile)
  - Toggle button always visible in sidebar header
  - Smooth transitions with CSS animations
  - Collapsed state: 64px width (w-16) showing only icons
  - Expanded state: 288px width (w-72) showing full labels
- **Files Modified:**
  - `components/layout/Sidebar.tsx` - Added `isOpen` and `onToggle` props, conditional rendering
  - `components/layout/DashboardLayout.tsx` - Added state management for sidebar toggle
- **Features:**
  - Mobile: Starts collapsed, overlay when open, auto-closes on navigation
  - Desktop: Always visible, can be toggled anytime
  - Icons-only view in collapsed state with tooltips
  - Badge indicators (red dots) for new content in collapsed state

#### 2. Fixed Collapsed Sidebar Issues

- **Status:** ✅ Completed
- **Problems Fixed:**
  - Horizontal scrolling in collapsed state (removed with `overflow-x-hidden`)
  - Icons not fitting properly (proper centering and padding)
  - Default scrollbar appearance (custom styled scrollbar)
- **Solutions:**
  - Added `overflow-x-hidden` to prevent horizontal scrolling
  - Proper icon sizing and centering with consistent padding
  - Custom webkit scrollbar styling (thin, subtle)
  - Removed unnecessary padding in collapsed state
  - Badge positioning fixed to avoid overflow

#### 3. Fixed Text Clipping in Sidebar

- **Status:** ✅ Completed
- **Problem:** Navigation labels were being truncated with ellipsis (`truncate` class)
- **Solution:**
  - Increased sidebar width from 256px (w-64) to 288px (w-72) when expanded
  - Removed `truncate` classes from navigation labels
  - Replaced with `break-words` to allow wrapping if needed
  - Updated main content margin from `ml-64` to `ml-72`
- **Result:** All navigation labels now display fully (e.g., "Coupon Management", "After Purchase Messages", "Payment Audit Log")

#### 4. Fixed Nested Button Hydration Error

- **Status:** ✅ Completed
- **Problem:** Theme hover menu had `<button>` elements nested inside a `Button` component, causing React hydration errors
- **Solution:**
  - Replaced `Button` component with regular `<button>` element for theme trigger
  - Moved hover menu outside button as sibling (not child)
  - Maintained hover functionality with absolute positioning
- **Files Modified:** `components/layout/Sidebar.tsx`

### ✅ Theme-Aware Logo Implementation

- **Status:** ✅ Completed
- **Implementation:**
  - Logo automatically switches based on current theme
  - Light mode: Uses `/logo.png`
  - Dark mode: Uses `/logo_light.png`
  - System theme: Respects system preference
- **Files Modified:**
  - `app/(auth)/login/page.tsx` - Added theme detection for login page logo
  - `components/layout/Sidebar.tsx` - Added theme detection for sidebar logo
- **Features:**
  - Uses `useTheme` hook from `next-themes`
  - Handles `systemTheme` for system preference
  - Prevents hydration issues with `mounted` state check
  - Smooth logo switching on theme change

### ✅ Previous Major Improvements (From Earlier Sessions)

#### Routine Management

- ✅ Added thumbnail view (default) and list view toggle
- ✅ Implemented `ViewToggle` component for switching display modes
- ✅ Separate loading skeletons for each view mode

#### User Management Pages

- ✅ Restored "Purchased Users" page with proper data transformation
- ✅ Restored "Prebooked Users" page
- ✅ Fixed user management pagination
- ✅ Fixed API response parsing for user lists

#### Student Profile

- ✅ Created `ModuleProgressModal` component for course completion display
- ✅ Fixed duplicate modules issue (using Set for unique IDs)
- ✅ Fixed module type inference (prioritizing module name keywords)
- ✅ Proper modal state management

#### Forum Enhancements

- ✅ Added creation timestamp display for forum issues
- ✅ Implemented red glowing badge system for new issues
- ✅ LocalStorage-based tracking of latest issue timestamp
- ✅ Badge appears on sidebar when new issues arrive
- ✅ Badge disappears when forum page is visited
- ✅ Fixed text overflow and styling issues
- ✅ Removed auto-refresh polling (manual refetch only)

#### Payment Audit Log

- ✅ Added red glowing badge system (similar to forum)
- ✅ LocalStorage-based tracking for new payment logs
- ✅ Handles both `timestamp` and `created_at` fields

#### Bundle Management

- ✅ Converted to fully modal-based system (create, view, update)
- ✅ Created `BundleFormModal` component
- ✅ Created `BundleViewModal` component
- ✅ Removed per-bundle stats functionality (analytics on dashboard)
- ✅ Fixed URL overflow in bundle cards

#### Live Classes

- ✅ Converted to fully modal-based system
- ✅ Removed separate create page
- ✅ Enhanced form reset logic for create mode
- ✅ Proper modal state management

#### Global Loader

- ✅ Reworked to appear in top-right corner (toast-like position)
- ✅ Transparent overlay keeps page unclickable
- ✅ Industry-standard appearance
- ✅ No more full-page blur

#### Sidebar Improvements (Earlier)

- ✅ Removed "Settings" link
- ✅ Added "Purchased Users" and "Prebooked Users" links
- ✅ Changed theme selection from click to hover
- ✅ Fixed theme dropdown font sizes
- ✅ Integrated forum and payment badge systems

#### Polling Removal

- ✅ Removed ALL `refetchInterval` from React Query hooks
- ✅ Disabled `refetchOnWindowFocus` for badge checks
- ✅ Manual refetching only where needed
- ✅ Prevents backend and frontend overload

#### .gitignore Update

- ✅ Updated for 2025 Next.js project structure
- ✅ Added common ignored files and patterns

### 📊 Technical Improvements Summary

1. **Performance:**
   - Removed all automatic polling/refetching
   - Optimized sidebar rendering
   - Better state management

2. **UX/UI:**
   - Collapsible sidebar for better space utilization
   - Theme-aware logos
   - Better text visibility (no clipping)
   - Modal-based workflows (bundle, live classes)
   - Improved loader positioning

3. **Code Quality:**
   - Fixed hydration errors
   - Better TypeScript types
   - Proper error handling
   - Industry-standard patterns

4. **Mobile Responsiveness:**
   - Collapsible sidebar on mobile
   - Overlay for mobile sidebar
   - Auto-close on navigation

### 🔧 Files Created/Modified in Recent Sessions

**New Files:**

- `lib/forumBadge.ts` - Forum badge utility functions
- `lib/paymentBadge.ts` - Payment badge utility functions
- `hooks/useForumBadge.ts` - Forum badge hook
- `hooks/usePaymentBadge.ts` - Payment badge hook
- `components/students/ModuleProgressModal.tsx` - Student progress modal
- `components/bundles/BundleFormModal.tsx` - Bundle form modal
- `components/bundles/BundleViewModal.tsx` - Bundle view modal

**Modified Files:**

- `components/layout/Sidebar.tsx` - Major refactoring for collapsibility, theme logos, text clipping fixes
- `components/layout/DashboardLayout.tsx` - Sidebar state management
- `components/layout/GlobalLoader.tsx` - Top-right positioning
- `app/(auth)/login/page.tsx` - Theme-aware logo
- `app/(dashboard)/bundle-management/page.tsx` - Modal-based system
- `app/(dashboard)/live-classes/page.tsx` - Modal-based system
- `app/(dashboard)/users/page.tsx` - Pagination fixes
- `app/(dashboard)/forum/page.tsx` - Badge integration, timestamp display
- `app/(dashboard)/payment-audit-log/page.tsx` - Badge integration
- `services/purchase.service.ts` - Data transformation fixes
- `.gitignore` - Updated for 2025

**Deleted Files:**

- `app/(dashboard)/live-classes/create/page.tsx` - Replaced with modal
- `components/bundles/BundleStatsModal.tsx` - Removed per-bundle stats

---

## 📞 Questions for User

Before starting implementation, need clarification on:

1. **Rich Text Editor:** Which editor should we use? (Tiptap, Lexical, or simple textarea?)
2. **File Uploads:** Should we upload directly to S3 or via API endpoint?
3. **React Query:** Are you comfortable with React Query, or prefer simpler approach?
4. **Modularization:** Preferred component size limit? (suggest 200-300 lines)
5. **Testing:** Do you want unit tests, or just manual testing?
6. **Deployment:** Should we set up staging environment first?

---

## 📚 Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Document Version:** 2.0 (Updated for 2025 Standards)  
**Created:** 2025-01-XX  
**Last Updated:** December 2025  
**Status:** Phase 5 Complete - Following 2025 Best Practices  
**Next Step:** Continue with remaining phases using 2025 standards

---

## 📅 2025 Standards & Best Practices

### React 19 (2025) Key Changes:

- **Server Actions preferred over useEffect for data fetching**
- Enhanced Server Components support
- Improved state management patterns
- Better TypeScript integration

### Next.js 16 (2025) Key Features:

- **Typed Routes** - Enable `typedRoutes: true` for type-safe navigation
- React Server Components by default
- Enhanced routing with layout deduplication
- Incremental prefetching improvements

### TypeScript 5.9 (2025) Features:

- Deferred module evaluation support
- Enhanced type inference
- Better developer experience

### Implementation Checklist (2025):

- ✅ Use Server Components where possible
- ✅ Use Server Actions for mutations
- ✅ Use React Query for client-side caching
- ✅ Enable typed routes in Next.js config
- ✅ Follow React 19 useEffect best practices
- ✅ Use functional state updates
- ✅ Proper TypeScript types throughout
- ✅ Max-width 1440px on all pages
- ✅ Full theme support (light/dark/system)
