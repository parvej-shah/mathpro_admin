# MathPro Admin (`mathpro-admin-client`) — Operating Contract

> Cross-tool agent instructions (Codex, Cursor, Gemini, Windsurf, Claude, etc.).
> Claude reads this via `CLAUDE.md` (`@AGENTS.md`); other tools read `AGENTS.md` directly.
> Keep this file the single source of truth — do not duplicate it into tool-specific files.
> Workspace-level orientation (how the three repos fit together) lives in the **parent
> folder's** `AGENTS.md`. Read that first if a task spans repos.

## What this repo is

The **internal admin console** for MathPro — content authoring, permissions, analytics,
enrollment/payment ops. Not student-facing. It is a **client** of the backend
(`Math_Pro_backend`), which owns the API contract; this repo never owns data, only edits it
through the API.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), shadcn/ui (Radix + Tailwind v3.4),
  TanStack Query + Zustand, React Hook Form. Rich editors: **Lexical** (rich text) and
  **Monaco** (code); **dnd-kit** for drag-and-drop ordering.
- **Run:** `npm run dev` → port **2026** (`next dev -p 2026`).
- **Verify:** `npm run type-check` (`tsc --noEmit`) **and** `npm run lint` (`next lint`).
  Format with `npm run format` (prettier).

> Note: this is Tailwind **v3.4** and the default Next.js bundler — *different from the Frontend repo* (Tailwind
> v4, default bundler). Don't carry Frontend-specific class syntax (e.g. `bg-linear-to-*`)
> over here. Match this repo's existing components.

## Backend is the contract — you consume it

- **Wiring:** `NEXT_PUBLIC_BASE_API_URL` in `.env*` selects the backend (prod AWS API
  Gateway URL vs `http://localhost:8000` — toggled by commenting/uncommenting). API access
  goes through `lib/api.ts`.
- **Auth:** decode the same JWT `token` the backend issues (shared with the Frontend). Keep
  identity-claim / `exp` handling consistent. See `contexts/AuthContext.tsx`, `lib/auth.ts`,
  `app/middleware.ts`.
- If a feature needs a backend route/shape that doesn't exist yet, that's a **backend
  change** — flag it as cross-repo; don't fake it client-side.
- Vocabulary: `bundle` remains correct for API/types/internal code here, but the admin
  `/combos` surface should display "Combo" and label the backend `url` field as "Slug".

## Structure

```
app/                  App Router — (auth)/, (dashboard)/ route groups, layout, middleware, providers
components/           Feature-grouped UI — course, bundles, coupons, students, teachers,
                      roles, permissions, analytics-v2/v3, live-classes, books, faqs, …, ui/
contexts/             AuthContext.tsx
lib/                  api.ts, auth.ts, constants, course-form-mapper(+test), analytics utils, editors/
services/, hooks/, types/
docs/                 Integration guides — READ THE RELEVANT ONE before touching a surface
```

## Docs — read before touching a surface

`docs/` holds the integration guides. Match the guide before editing:

- Permissions / roles: `admin_api_permission_mapping.md`,
  `ADMIN_DASHBOARD_TABS_PERMISSIONS.md`, `FRONTEND_PERMISSION_UPDATE_2026.md`,
  `ROLE_MANAGEMENT_API_FRONTEND.md`.
- Bundles / access: `BUNDLE_SYSTEM_COMPLETE_GUIDE.md`, `COURSE_ACCESS_API.md`,
  `COURSE_ACCESS_IMPLEMENTATION.md`, `STUDENT_HISTORY_AND_ACCESS_FRONTEND_GUIDE.md`.
- Analytics: `ANALYTICS_V2_FRONTEND_INTEGRATION_GUIDE.md`.
- Editors: `LEXICAL_EDITOR_FRONTEND_INTEGRATION_GUIDE.md`.
- Auth: `JWT_TOKEN_SYSTEM_FRONTEND.md`. Quiz import: `QUIZ_IMPORT_LLM_PROMPT.md`.

## Document map (`.claude/`)

| File | Authority | Read when |
|---|---|---|
| `.claude/invariants.md` | **Non-negotiable.** Global laws. Never overrideable, even on explicit request without the user acknowledging the override. | Always — before any code change. |
| `.claude/conventions.md` | Naming, project layout, API patterns, coding standards. | Before writing or editing any file. |
| `.claude/memory.md` | Append-only execution log. Continuity across sessions. | Start of session; append at end. |
| `.claude/FEATURES/<feature>/purpose.md` | Domain ownership + intent for that feature. | Before touching anything under that feature's directory. |
| `.claude/FEATURES/<feature>/rules.md` | Feature-level constraints + guardrails. | Same. |
| `context.md` | Long-form product/design reference (audience, tokens, page architecture). | When you need the *why* behind a design rule. |
| `docs/**` | API/integration guides (table above). | Before touching the matching surface. |

`invariants.md` > `conventions.md` > feature `rules.md` > `docs/` / `context.md`.
If a feature rule conflicts with an invariant, the invariant wins and you stop and flag it.

### Routing — where work goes

| Touching… | Owner doc to read first |
|---|---|
| `components/bundles/**`, `services/bundle.service.ts`, `hooks/useBundles.ts`, `app/(dashboard)/combos/` | `.claude/FEATURES/bundles/` |
| `components/roles/**`, `services/role.service.ts`, `hooks/useRoles.ts`, `lib/permissions.ts`, `app/(dashboard)/roles/` | `.claude/FEATURES/roles-permissions/` |
| `app/**` (routes, layouts) | `.claude/conventions.md` § Routing + the relevant feature |
| `services/**`, `lib/api.ts`, `lib/constants.ts`, `hooks/use*` | `.claude/conventions.md` § Data & API |
| `contexts/AuthContext.tsx`, `lib/auth.ts`, `app/middleware.ts` | `.claude/conventions.md` § Auth & State + `.claude/invariants.md` § Auth & Permissions |
| styling / tokens anywhere | `.claude/invariants.md` § Styling |

### Execution order for a typical task

1. Read `.claude/invariants.md` + `.claude/conventions.md` (cheap, always).
2. Identify the feature; read its `FEATURES/<feature>/purpose.md` + `rules.md` if it has
   one, else the relevant `docs/*.md` guide.
3. Make the minimal change. Stay in scope.
4. `npm run type-check` clean. `npm run lint` clean for touched files.
5. Append a one-line entry to `.claude/memory.md` (what changed, why, scope).

## Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with the project-specific
instructions above as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- Admin-specific: if a request is ambiguous about *which surface* or *whether it needs a
  backend change*, resolve that first — don't fake a missing endpoint client-side.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently (Tailwind v3 + shadcn patterns here;
  don't carry the Frontend repo's Tailwind-v4 syntax over).
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require
constant clarification. Concretely: `type-check` + `lint` clean for touched files; for a
feature backed by a new endpoint, the check includes the backend.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due
to overcomplication, and clarifying questions come before implementation rather than after
mistakes.

## Repo-local scratch

- Keep repo-local TODO/plan notes here. Cross-repo backlog lives in the parent `todo.md`.
- This repo is a **local-only git repo** (no remote). It commits separately from the others.
