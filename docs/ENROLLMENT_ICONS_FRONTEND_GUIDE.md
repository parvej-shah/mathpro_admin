# Enrollment Icons Frontend Guide

This doc explains how frontend should read enrollment detail icons from course `chips` JSON and render them safely, with backend/frontend alignment.

## Source Of Truth

- Icon library: `lucide-react`

Always use this file as the single source for:
- allowed icon IDs
- icon label list
- icon component mapping
- ID validation (`isEnrollmentIconId`)

## JSON Contract

`chips.enrollment` values now support an optional `icon` field.

Each enrollment entry shape:
- `label`: display label
- `value`: display value
- `icon` (optional): canonical icon ID

If `icon` is missing, empty, or invalid, frontend should fallback to: `calendar-days`.

## Allowed Icon IDs

Calendar/time icons:
- `calendar-days`
- `calendar-range`
- `calendar-clock`
- `calendar-check`
- `clock`
- `alarm`
- `timer`

Start/end/status icons:
- `play-circle`
- `stop-circle`
- `flag`
- `check-circle`
- `rocket`
- `sparkles`
- `milestone`
- `unlock`
- `lock`
- `door-open`
- `door-closed`

Course/session icons:
- `graduation-cap`
- `book-open-check`
- `trophy`

## Frontend Handling Steps

1. Read `course.chips.enrollment` as a key-value object.
2. For each entry, read `label`, `value`, and `icon`.
3. Validate `icon` against the allowed icon IDs (using `isEnrollmentIconId` from the source file).
4. If valid, resolve the icon component from `ENROLLMENT_ICON_COMPONENTS`.
5. If invalid or missing, use fallback icon ID `calendar-days`.
6. Render icon + label + value in the enrollment details UI.

## Backend / Frontend Alignment Rules
 
- Backend stores only canonical icon IDs from the allowed list.
- Frontend does not directly trust raw icon strings from API.
- Frontend validates icon ID before rendering.
- Unknown IDs must gracefully render fallback icon (`calendar-days`), never break UI.
- Avoid storing component names, SVG paths, or library-specific class names in API JSON.
