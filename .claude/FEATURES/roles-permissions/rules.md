# Feature: roles-permissions — Rules & Guardrails

Inherits all of `invariants.md` and `conventions.md`. Invariants always win.

## Permission strings are the source of truth

- Valid permission strings come from the backend (`usePermissions` /
  `docs/admin_api_permission_mapping.md`). Never hardcode a permission string that isn't in
  that list, and never invent a new one client-side — a new permission is a **backend
  change** (see `util/permissions.js` in `Math_Pro_backend`), flag it as cross-repo.
- `RoleFormDialog`'s permission multi-select must reflect the backend's permission list, not
  a client-maintained copy.

## System roles

- `super_admin` is non-deletable and non-modifiable (enforced server-side, see
  `invariants.md` § Auth & Permissions). `RoleTable` / `DeleteRoleDialog` must not offer
  delete/edit affordances for it — this is a UX guard for a server-enforced rule, not
  optional polish.
- System roles (admin, moderator, student, teacher, ambassador) are visually distinguished
  from custom roles in `RoleTable` — preserve that distinction when changing the table.

## Blast radius

- `roles`/`permissions` from the decoded JWT (`AuthContext`) gate UI across **every**
  dashboard surface, not just `app/(dashboard)/roles/`. Before changing how permissions are
  read or shaped here, check other surfaces that call `useAuth()` / `lib/permissions.ts` —
  a change here can silently hide/show nav items elsewhere.
- User-role assignment (`UserRoleAssignment`, `UserRoleModal`) writes via
  `role.service.ts` — assigning a role takes effect on the user's *next* token refresh, not
  retroactively on their current session. Don't imply otherwise in UI copy.
