# Feature: roles-permissions — Purpose

## Domain

Owns the RBAC management surface: `components/roles/**`, `services/role.service.ts`,
`hooks/useRoles.ts`, `lib/permissions.ts`, and the route `app/(dashboard)/roles/`.

## Intent

Admins define roles (name, `display_name`, description, permission list) and assign them
to users. The backend enforces permissions on every endpoint (`resource.action.all`
strings, e.g. `user.manage.all`); this surface is where those roles are authored and
assigned. The decoded JWT's `roles` / `permissions` arrays drive UI visibility across the
**entire admin console**, not just this feature — changes here have wide blast radius.

## What lives here

- **Components:** `RoleTable` (list roles, distinguish system roles — admin, moderator,
  student, teacher, ambassador — from custom roles), `RoleFormDialog` (create/edit, with a
  permission multi-select fetched from the backend), `UserRoleAssignment` (search user,
  assign/remove roles), `UserRoleModal` (bulk assignment), `DeleteRoleDialog`.
- **Hooks:** `useRoles`, `useRole(id)`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`,
  `usePermissions` (valid permission list for form options), `useUserRoles(userId)`,
  `useAssignUserRole`, `useRemoveUserRole`.
- **Service:** `role.service.ts` — role CRUD, user-role assignment, permission listing.

## Reference docs

- `docs/ROLE_MANAGEMENT_API_FRONTEND.md` — API, permission string format, endpoints.
- `docs/admin_api_permission_mapping.md` — full permission definitions.
- `docs/ADMIN_DASHBOARD_TABS_PERMISSIONS.md` — which dashboard tabs require which
  permissions.
- `docs/FRONTEND_PERMISSION_UPDATE_2026.md` — most recent permission changes.
- `docs/JWT_TOKEN_SYSTEM_FRONTEND.md` — how `roles`/`permissions` appear in the JWT.
