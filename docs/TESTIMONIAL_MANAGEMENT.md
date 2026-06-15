# Testimonial Management

## Overview

The `Testimonials` tab lets admins curate which existing course reviews appear in the public testimonial marquee.

This does not create new reviews. It only selects from existing `feedbacks` that already have comments.

## Access

- Route: `/testimonial-management`
- Required permission: `feedback.manage.all`

## How it works

1. Open the `Testimonials` tab from the admin sidebar.
2. Use the `Review library` filters to find an existing review.
3. Click `Feature` to add that review to the public testimonial list.
4. In `Featured selection`, adjust:
   - `Order`: controls display priority
   - `Published`: controls whether the selected review is active publicly
5. Click `Save` to persist changes.
6. Click the delete icon to remove a review from the public testimonial list.

## Public behavior

The curated testimonials are used by the shared public testimonial section on:

- Homepage
- Courses page
- Course details page
- Combo pages

If no curated testimonials are available, the frontend component still falls back to its local static testimonial set.

## Backend dependency

This feature depends on the backend testimonial APIs and the `public_testimonial` table migration.

Relevant endpoints:

- `GET /admin/testimonial/list`
- `POST /admin/testimonial/create`
- `PUT /admin/testimonial/update/:feedbackId`
- `DELETE /admin/testimonial/delete/:feedbackId`
- `GET /user/testimonial/list`
