import {
  buildCourseChipsPayload,
  createDefaultCourseChips,
  normalizeCourseForEditor,
} from "@/lib/course-form-mapper";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`course-form-mapper test failed: ${message}`);
  }
}

export function runCourseFormMapperTests(): void {
  const canonicalCourse = {
    title: "Test",
    slug: "discrete-mathematics",
    total_seats: 600,
    tags: ["math", "discrete", "university"],
    course_outline: "https://drive.google.com/file/1",
    chips: {
      sections: [
        { label: "চ্যাপ্টার সংখ্যা", value: "17 টি" },
        { label: "ভিডিও ডিউরেশন", value: "100+ ঘণ্টা" },
      ],
      enrollment_details: {
        prebooking_end_date: 1781000000,
        enrollment_end_date: 1782000000,
        course_start_date: 1782500000,
      },
      socials: {
        facebook_community: "https://facebook.com/community",
        facebook_private_group: "https://facebook.com/private",
        facebook_page: "https://facebook.com/page",
        telegram_group: "https://t.me/group",
        whatsapp: "https://wa.me/8801",
        messenger: "https://m.me/test",
        phone: "tel:+8801",
        email: "mailto:test@example.com",
      },
      thumbnails: {
        course_thumbnail_16_9: "https://img/course.jpg",
        trailer_video_thumb_16_9: "https://img/trailer.jpg",
        facebook_community_thumb_16_9: "https://img/community.jpg",
      },
      bundle_id: 4,
      custom_legacy_field: "preserve-me",
    },
  };

  const canonical = normalizeCourseForEditor(canonicalCourse);
  assert(
    canonical.chips.sections[0]?.value === "17 টি",
    "canonical sections should remain unchanged"
  );
  assert(
    canonical.chips.socials.facebook_page === "https://facebook.com/page",
    "canonical socials should remain unchanged"
  );
  assert(
    canonical.chips.socials.telegram_group === "https://t.me/group",
    "telegram_group should round-trip in socials"
  );
  assert(
    canonical.chips.enrollment_details.prebooking_end_date === 1781000000,
    "canonical enrollment_details should remain unchanged"
  );
  assert(
    canonical.chips.extra.custom_legacy_field === "preserve-me",
    "unknown chip fields should be preserved in extra"
  );
  assert(canonical.formData.slug === "discrete-mathematics", "flat slug should normalize");
  assert(canonical.formData.seat_amount === 600, "flat total_seats should map to seat_amount");
  assert(canonical.formData.tags === "math, discrete, university", "tags array should join to csv");
  assert(
    canonical.formData.course_outline === "https://drive.google.com/file/1",
    "flat course_outline should normalize"
  );
  assert(canonical.chips.bundle_id === "4", "bundle_id should normalize to string");

  const legacyCourse = {
    chips: {
      sections: {
        chapter: { label: "Legacy Chapter", value: "10" },
        video: { label: "Legacy Video", value: "20h" },
      },
      enrollment: {
        prebooking_end: { label: "P End", value: "2026-01-02" },
        enrollment_end: { label: "E End", value: "2026-01-04" },
      },
      facebookPublicGroupLink: "https://facebook.com/public-group",
      facebookSecretGroupLink: "https://facebook.com/private-group",
      course_thumbnail_link_16_9: "https://img/legacy-thumb.jpg",
    },
    instructor_list: {
      instructors: [
        {
          name: "A",
          credibility: "Cred",
          image: "https://img/a.jpg",
          imageUploadedLink: "https://img/fallback.jpg",
        },
      ],
    },
  };

  const normalizedLegacy = normalizeCourseForEditor(legacyCourse);
  assert(
    normalizedLegacy.chips.sections.some((s) => s.label === "Legacy Chapter"),
    "legacy map-shaped sections should convert to an array"
  );
  assert(
    normalizedLegacy.chips.enrollment_details.enrollment_end_date !== null,
    "legacy enrollment.enrollment_end should convert to enrollment_details.enrollment_end_date"
  );
  assert(
    normalizedLegacy.chips.socials.facebook_community.includes("public-group"),
    "legacy public group should map to socials.facebook_community"
  );
  assert(
    normalizedLegacy.chips.thumbnails.course_thumbnail_16_9 ===
      "https://img/legacy-thumb.jpg",
    "legacy course_thumbnail_link_16_9 should map to thumbnails.course_thumbnail_16_9"
  );
  assert(
    normalizedLegacy.instructors[0].imageUploadedLink === "https://img/a.jpg",
    "image should be canonical source over imageUploadedLink fallback"
  );

  const payload = buildCourseChipsPayload(
    {
      ...createDefaultCourseChips(),
      sections: canonical.chips.sections,
      enrollment_details: canonical.chips.enrollment_details,
      socials: canonical.chips.socials,
      thumbnails: canonical.chips.thumbnails,
      bundle_id: canonical.chips.bundle_id,
      extra: { keep_extra: "yes" },
    },
    { old_field: "keep-old" }
  );

  assert(payload.old_field === "keep-old", "legacy chips should be preserved");
  assert(
    payload.keep_extra === "yes",
    "passthrough chip extra fields should be preserved"
  );
  assert(payload.bundle_id === 4, "bundle_id should serialize as a number");
  assert(
    payload.sections === canonical.chips.sections,
    "canonical sections should be serialized"
  );
  assert(
    (payload.enrollment_details as Record<string, number | null>)
      .prebooking_end_date === 1781000000,
    "enrollment_details should be serialized in payload"
  );
}

if (process.env.RUN_COURSE_MAPPER_TESTS === "1") {
  runCourseFormMapperTests();
}
