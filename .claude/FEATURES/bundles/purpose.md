# Feature: bundles — Purpose

## Domain

Owns the bundle (Combo) authoring surface: `components/bundles/**`,
`services/bundle.service.ts`, `hooks/useBundles.ts`, and the route
`app/(dashboard)/combos/`. Bundles package multiple courses together for sale; students
purchase a bundle to unlock all bundled courses.

## Intent

This is the admin's content-authoring tool for the Bundle System (v2.0, Nov 2025). Admins
create/edit/delete bundles with rich metadata — title, price, `short_description`,
`you_get` (feature list), `chips`, `faq_list`, `feedback_list`, `intro_video`, `is_live`,
`is_active` — and manage which courses belong to each bundle.

## What lives here

- **Components:** `BundleCard` (grid display, overflow menu for edit/delete/export),
  `BundleForm` (create/edit form), `BundleList` (grid wrapper).
- **Hooks:** `useBundles`, `useBundle(id)`, `useBundleBySlug(slug)`,
  `useCreateBundle`, `useUpdateBundle`, `useDeleteBundle`, `useBundleStats(id)`,
  `useBundlePurchases`, `useBundlePrebookings`.
- **Service:** `bundle.service.ts` — CRUD + stats + bundle-course relationships,
  including combo detail fetches by numeric id or slug.

## Reference docs

- `docs/BUNDLE_SYSTEM_COMPLETE_GUIDE.md` — comprehensive API, schema, versioning.
- `docs/COURSE_ACCESS_API.md` — bundle <-> course relationships, access grants.

## Vocabulary

Internal identifiers stay `bundle` (API, types, component names like `BundleCard`).
Admin-facing copy on the `/combos` route should use **"Combo"** and label the `url` field
as **"Slug"**.
