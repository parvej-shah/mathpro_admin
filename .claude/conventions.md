# Conventions — Naming, API Patterns, Coding Standards

Default patterns for this codebase. Follow them unless an `invariants.md` law or a feature
`rules.md` says otherwise. These describe *how* the code is written; `invariants.md`
describes what must *never* change.

## Project layout

```
app/
  (auth)/login/         Public auth routes
  (dashboard)/          Protected routes — combos, courses, course-access, roles,
                         announcements, books, instructors, payment-audit-log,
                         faq-management, coupon-management, live-classes,
                         feedback-management, admins, after-purchase-messages, prebooked
  globals.css            Design tokens (oklch) + Tailwind v3.4 theme
  middleware.ts          Auth guard — redirects unauthenticated users to /login
  providers.tsx          Query / Auth / Toaster / Theme providers
components/
  ui/                    shadcn/Radix primitives
  layout/                DashboardLayout, PageHeader, Sidebar, Loaders
  <feature>/             Feature-grouped UI (course/, bundles/, roles/, announcements/,
                         analytics-v2/, books/, coupons/, live-classes/, payments/,
                         purchases/, admins/, teachers/, users/, feedback/, routines/,
                         contests/, faqs/, testimonials/, after-messages/, …)
contexts/
  AuthContext.tsx        user, isAuthenticated, loading, logout, refreshUser
hooks/
  useXxx.ts              TanStack Query wrappers, one file per domain (~40 total)
services/
  xxx.service.ts         Imperative API calls per domain (~32 total)
lib/
  api.ts                 Axios instance + JWT interceptor + error handling
  auth.ts                JWT decode, checkTokenValidity, logout, encrypt/decrypt
  constants.ts           API_ENDPOINTS — all backend routes, centralized
  permissions.ts         Permission check helpers
  course-form-mapper.ts  Form data <-> API payload conversion (+ .test.ts)
  utils.ts               cn() (clsx + tailwind-merge)
  stores/                Zustand stores (e.g. course-store.ts) for local UI state
types/
  index.ts               Central types — User, Role, Course, Bundle, Chapter, Module,
                         ApiResponse<T>, PaginatedResponse<T>
  <domain>.types.ts       Domain-specific extended types
docs/                    Integration guides — read the relevant one before touching a surface
```

## Naming

- Components: `PascalCase.tsx`, feature-grouped under `components/<feature>/`. Nested
  sub-components in subfolders (e.g. `components/course/ModuleEditor/`).
- Hooks: `useXxx.ts`, camelCase, export multiple related hooks per file
  (`useBundles`, `useBundle`, `useCreateBundle`, `useUpdateBundle`, `useDeleteBundle`).
- Services: `xxx.service.ts`, export a const object `xxxService` with methods
  `getAllX`, `getX`, `createX`, `updateX`, `deleteX`, plus domain-specific methods.
  Methods return `Promise<ApiResponse<T>>` / `ApiResponse<T[]>`.
- Stores: `xxx-store.ts` in `lib/stores/`, exported as `useStore` hook — for local UI
  state only (e.g. chapter-expand state, drafts), not server data.
- Types: in `types/index.ts` (shared) or `types/<domain>.types.ts`. Import directly
  (`@/types`, `@/types/domain.types.ts`) — no barrel re-exports.

## Styling

- Tokens only — see `invariants.md` § Styling for the hard bans (no Frontend Tailwind v4
  syntax here).
- `cn()` from `lib/utils.ts` for conditional class merging.
- shadcn/Radix primitives live in `components/ui/` — reuse before adding new ones.

## Data & API

- HTTP through the shared axios instance in `lib/api.ts` (`apiClient`). It adds the
  `Authorization: Bearer <token>` header from `localStorage.token`, validates token expiry
  before each request, and on 401 calls `logout()`.
- Endpoints are centralized in `lib/constants.ts` (`API_ENDPOINTS`) — don't inline URL
  strings in services/components.
- Server state: `@tanstack/react-query` via `hooks/useXxx.ts`. Query hooks for reads,
  mutation hooks for writes; on mutation success invalidate related query keys and toast.
- Imperative calls go through `services/xxx.service.ts`, not inline `apiClient` calls in
  components.
- `NEXT_PUBLIC_BASE_API_URL` in `.env*` selects backend (prod API Gateway vs
  `http://localhost:8000` — toggle by commenting/uncommenting).

## Auth & State

- Client auth state: `AuthContext` (`user`, `isAuthenticated`, `loading`, `logout`,
  `refreshUser`). Token validity is re-checked every 60s.
- JWT decode/validation: `lib/auth.ts` (`checkTokenValidity`, `isLoggedIn`, `logout`,
  `getDecodedToken`, `getUserType`). Don't reimplement decoding inline.
- Route protection: `app/middleware.ts` checks the `token` cookie for SSR; deeper checks
  happen client-side via `useAuth()`.

## Routing (App Router, Next.js 16)

- Routes under `app/(dashboard)/<feature>/`. Layout-level `DashboardLayout` /
  `Sidebar` render once; pages don't re-render a second nav/sidebar.
- Before writing route handlers, server components, or router APIs, read the relevant
  guide in `node_modules/next/dist/docs/` — v16 differs from training data.

## Verification

- `npm run type-check` (`tsc --noEmit`) must pass.
- `npm run lint` (`next lint`) clean for files you touched.
- `npm run format` (prettier: semi, trailing comma, 80 printWidth, 2 tabWidth) for touched
  files if formatting drifts.
- `npm run dev` runs on port **2026** (`next dev -p 2026`).
