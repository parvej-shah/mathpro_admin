# Feature: bundles — Rules & Guardrails

Inherits all of `invariants.md` and `conventions.md`. Invariants always win.

## Data

- Bundle data goes through `useBundles` / `useBundle` / mutation hooks — don't fetch
  inline or bypass `bundle.service.ts`.
- Combo detail/edit routes may arrive with either a numeric id or a slug; resolve the
  bundle record first, then use the numeric id for update/export/course-assignment calls.
- Admin-facing `/combos` labels should say **"Combo"** and **"Slug"** even though service
  fields and payload keys remain `bundle` / `url`.
- `chips`, `you_get`, `faq_list`, `feedback_list` are structured fields (arrays/objects per
  `docs/BUNDLE_SYSTEM_COMPLETE_GUIDE.md`) — match the documented shape exactly when
  building forms or payloads; a shape mismatch is a backend-contract issue, not a
  client-side workaround.
- `is_live` / `is_active` gate visibility to students — don't conflate the two or repurpose
  either flag for unrelated UI state.

## Course relationships

- A bundle's course list is managed via the bundle-course relationship endpoints
  (`COURSE_ACCESS_API.md`), not by editing course records directly from this surface.
- Course access checks (`check-purchase`, `check-prebook`, `check-duplicates`) belong in
  `bundle.service.ts` — don't duplicate access logic in components.

## Forms

- `BundleForm` is the single create/edit entry point. New bundle fields go through the
  form + `bundle.service.ts` payload together — don't add a field to one without the
  other.
