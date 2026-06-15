# Invariants — Non-Negotiable Global Laws

These are never overrideable by a feature rule, by "it looks cleaner," or by an implicit
inference. They may only be broken if the user explicitly names the invariant and confirms
they want it broken. Otherwise: **stop and flag, do not proceed.**

## Scope Control (the most important one)

- Change **only** what the task requires. The blast radius of an edit must match the
  intent of the request.
- Never refactor, rename, reformat, dedupe, or "clean up" code outside the task's scope —
  even if it is clearly improvable. Note it; do not do it.
- A change that is *locally correct* but *globally harmful* (alters shared behavior, breaks
  a contract elsewhere, changes a public export) is a **defect**, not an improvement.
- "This pattern is repeated, I'll extract it" is a proposal, not an action. Propose it.

## Documentation / Memory

- Never delete `context.md`, `.claude/*.md`, `docs/**`, or any `FEATURES/**` doc without
  explicit instruction naming the file.
- Never replace a doc with an alias, stub, or "see other file" pointer.
- Never auto-deduplicate or auto-condense docs. Structure may improve; usability must not
  drop. If a restructure would reduce usability, **stop and ask.**
- `memory.md` is append-only. Do not rewrite or prune past entries.

## Styling

- This is **Tailwind v3.4 + webpack**, not the Frontend repo's Tailwind v4. Never carry over
  Frontend-specific syntax (e.g. `bg-linear-to-*` gradient classes) — this repo uses
  `bg-gradient-to-{dir}`.
- Design tokens are CSS custom properties in `oklch()` defined in `app/globals.css` —
  semantic (`--teal`, `--yellow`, `--heading`, `--paragraph`, `--page-bg`, `--section-a/b`),
  UI (`--primary`, `--secondary`, `--accent`, `--destructive`, `--success`, `--warning`,
  `--info`), component (`--card`, `--popover`, `--border`, `--input`, `--ring`), sidebar and
  chart tokens. Use these via Tailwind classes, not raw `oklch(...)` / hex in JSX.
- `cn()` from `lib/utils.ts` for conditional class merging — match existing component
  patterns.

## Auth & Permissions

- This is an **internal admin console behind RBAC**. UI visibility decisions (showing or
  hiding nav items, buttons, tabs) must check `user.permissions` / `user.roles` from the
  decoded JWT (`AuthContext`), not assume access. Never hardcode a bypass.
- The JWT is **shared with the backend and the student Frontend** — identity claims
  (`id`, `name`, `type`, `roles`, `permissions`, `exp`) and `exp` semantics must not drift
  client-side. Decoding/validation logic lives in `lib/auth.ts` — don't duplicate it.
- `super_admin` role is non-deletable and non-modifiable by design (enforced
  server-side) — don't add client UI that implies otherwise.

## Vocabulary

- `bundle` is the correct term **in this repo** (API, types, services, internal
  component names like `PremiumBundleCard`/`BundleCard`).
- Admin-facing copy on the `/combos` surface should use **"Combo"**. Keep `bundle` for
  code, API paths, types, and service names.
- The backend key remains `url`, but admin-facing copy should call it **"Slug"**.

## Platform

- This is **Next.js 16 (App Router, webpack build, `--webpack`)**, React 19, TypeScript
  strict. Webpack is required for AWS SDK compatibility — never suggest switching to the
  default Turbopack bundler.
- Never commit a change that fails `npm run type-check` (`tsc --noEmit`).
