import type {
  CourseFormData,
  CourseChipsCanonical,
  CourseSections,
  EnrollmentDetailsChips,
  CourseSocials,
  CourseThumbnails,
  LabeledValue,
  Instructor,
  FAQ,
  Feedback,
} from "@/types/course.types";

type UnknownRecord = Record<string, unknown>;

const CHIP_RESERVED_KEYS = new Set<string>([
  "bundle_id",
  "thumbnails",
  "socials",
  "sections",
  "enrollment_details",
]);

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (lowered === "true" || lowered === "1") return true;
    if (lowered === "false" || lowered === "0") return false;
  }
  return fallback;
}

function toLabeledValue(value: unknown): LabeledValue {
  if (!isRecord(value)) return { label: "", value: "" };
  return {
    label: asString(value.label),
    value: asString(value.value),
  };
}

function createDefaultSections(): CourseSections {
  return [];
}

function createDefaultEnrollmentDetails(): EnrollmentDetailsChips {
  return {
    prebooking_end_date: null,
    enrollment_end_date: null,
    course_start_date: null,
  };
}

function createDefaultSocials(): CourseSocials {
  return {
    facebook_community: "",
    facebook_page: "",
    facebook_private_group: "",
    telegram_group: "",
    whatsapp: "",
    messenger: "",
    phone: "",
    email: "",
  };
}

function createDefaultThumbnails(): CourseThumbnails {
  return {
    course_thumbnail_16_9: "",
    course_thumbnail_card_4_3: "",
  };
}

export function createDefaultCourseFormData(): CourseFormData {
  return {
    title: "",
    hosted_url: "",
    intro_video: "",
    short_description: "",
    description: "",
    price: 0,
    x_price: 0,
    is_free: false,
    language: "English",
    is_live: true,
    enrolled: 0,
    you_get: "",
    seat_amount: 0,
    slug: "",
    tags: "",
    course_outline: "",
  };
}

export function createDefaultCourseChips(): CourseChipsCanonical {
  return {
    sections: createDefaultSections(),
    enrollment_details: createDefaultEnrollmentDetails(),
    socials: createDefaultSocials(),
    thumbnails: createDefaultThumbnails(),
    bundle_id: "",
    extra: {},
  };
}

/** Convert a JS Date to unix seconds, or null. */
export function dateToUnixSeconds(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor(date.getTime() / 1000);
}

/** Convert unix seconds to a JS Date, or null. */
export function unixSecondsToDate(value: number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const n = asNullableNumber(value);
  if (n === null) return null;
  return new Date(n * 1000);
}

function normalizeSections(chips: UnknownRecord): CourseSections {
  const sections = chips.sections;

  if (Array.isArray(sections)) {
    return sections.map(toLabeledValue);
  }

  // Legacy: sections was a Record<string, {label, value}> map.
  if (isRecord(sections)) {
    return Object.values(sections).map(toLabeledValue);
  }

  return createDefaultSections();
}

function normalizeEnrollmentDetails(chips: UnknownRecord): EnrollmentDetailsChips {
  const defaults = createDefaultEnrollmentDetails();
  const details = isRecord(chips.enrollment_details) ? chips.enrollment_details : undefined;

  if (details) {
    return {
      prebooking_end_date: asNullableNumber(details.prebooking_end_date),
      enrollment_end_date: asNullableNumber(details.enrollment_end_date),
      course_start_date: asNullableNumber(details.course_start_date),
    };
  }

  // Legacy: chips.enrollment had prebooking_end / enrollment_end as label/value (ISO strings).
  const legacy = isRecord(chips.enrollment) ? chips.enrollment : undefined;
  if (legacy) {
    const toUnix = (entry: unknown): number | null => {
      const lv = toLabeledValue(entry);
      if (!lv.value) return null;
      const d = new Date(lv.value);
      return isNaN(d.getTime()) ? null : dateToUnixSeconds(d);
    };
    return {
      prebooking_end_date: toUnix(legacy.prebooking_end),
      enrollment_end_date: toUnix(legacy.enrollment_end),
      course_start_date: toUnix(legacy.classStart),
    };
  }

  return defaults;
}

function normalizeSocials(chips: UnknownRecord): CourseSocials {
  const defaults = createDefaultSocials();
  const socials = isRecord(chips.socials) ? chips.socials : undefined;

  const parsed: CourseSocials = { ...defaults };
  if (socials) {
    Object.entries(socials).forEach(([key, value]) => {
      parsed[key] = asString(value);
    });
  }

  return {
    ...parsed,
    facebook_community: asString(
      parsed.facebook_community || chips.facebookPublicGroupLink
    ),
    facebook_private_group: asString(
      parsed.facebook_private_group || chips.facebookSecretGroupLink
    ),
    facebook_page: asString(parsed.facebook_page || chips.facebookGroupLink),
  };
}

function normalizeThumbnails(chips: UnknownRecord): CourseThumbnails {
  const defaults = createDefaultThumbnails();
  const thumbnails = isRecord(chips.thumbnails) ? chips.thumbnails : undefined;
  const parsed: CourseThumbnails = { ...defaults };
  if (thumbnails) {
    Object.entries(thumbnails).forEach(([key, value]) => {
      parsed[key] = asString(value);
    });
  }
  parsed.course_thumbnail_16_9 = asString(
    parsed.course_thumbnail_16_9 ||
      chips.course_thumbnail_link_16_9 ||
      chips.course_thumbnail_link
  );
  return parsed;
}

function normalizeInstructor(entry: unknown): Instructor & { id?: number } {
  const record = isRecord(entry) ? entry : {};
  const image = asNonEmptyString(record.image);
  const imageUploadedLink = asNonEmptyString(record.imageUploadedLink);
  const id = typeof record.id === "number" ? record.id : undefined;
  return {
    ...(id !== undefined ? { id } : {}),
    name: asString(record.name),
    credibility: asString(record.credibility),
    imageUploadedLink: image ?? imageUploadedLink,
  };
}

function normalizeFeedback(entry: unknown): Feedback {
  const record = isRecord(entry) ? entry : {};
  const image = asNonEmptyString(record.image);
  const imageUploadedLink = asNonEmptyString(record.imageUploadedLink);
  return {
    name: asString(record.name),
    bio: asString(record.bio),
    description: asString(record.description),
    imageUploadedLink: image ?? imageUploadedLink,
  };
}

export interface NormalizedCourseEditorData {
  formData: CourseFormData;
  chips: CourseChipsCanonical;
  instructors: Array<Instructor & { id?: number }>;
  faqs: FAQ[];
  feedbacks: Feedback[];
}

export function normalizeCourseForEditor(course: unknown): NormalizedCourseEditorData {
  const defaultForm = createDefaultCourseFormData();
  const defaultChips = createDefaultCourseChips();

  if (!isRecord(course)) {
    return {
      formData: defaultForm,
      chips: defaultChips,
      instructors: [],
      faqs: [],
      feedbacks: [],
    };
  }

  const rawChips = isRecord(course.chips) ? course.chips : {};
  const normalizedChips: CourseChipsCanonical = {
    sections: normalizeSections(rawChips),
    enrollment_details: normalizeEnrollmentDetails(rawChips),
    socials: normalizeSocials(rawChips),
    thumbnails: normalizeThumbnails(rawChips),
    bundle_id: rawChips.bundle_id !== undefined && rawChips.bundle_id !== null
      ? String(rawChips.bundle_id)
      : "",
    extra: Object.fromEntries(
      Object.entries(rawChips).filter(([key]) => !CHIP_RESERVED_KEYS.has(key))
    ),
  };

  const instructorList = isRecord(course.instructor_list)
    ? course.instructor_list
    : {};
  const faqList = isRecord(course.faq_list) ? course.faq_list : {};
  const feedbackList = isRecord(course.feedback_list) ? course.feedback_list : {};

  const instructors = Array.isArray(instructorList.instructors)
    ? instructorList.instructors.map(normalizeInstructor)
    : [];

  const faqs: FAQ[] = Array.isArray(faqList.faqs)
    ? faqList.faqs.map((item) => {
        const record = isRecord(item) ? item : {};
        return {
          question: asString(record.question),
          answer: asString(record.answer),
        };
      })
    : [];

  const feedbacks = Array.isArray(feedbackList.feedbacks)
    ? feedbackList.feedbacks.map(normalizeFeedback)
    : [];

  const normalizedYouGet = isRecord(course.you_get)
    ? asString(course.you_get.you_get)
    : asString(course.you_get);

  const tags = Array.isArray(course.tags)
    ? course.tags.map((t) => asString(t)).filter(Boolean).join(", ")
    : asString(course.tags);

  const formData: CourseFormData = {
    title: asString(course.title),
    hosted_url: asString(course.url),
    intro_video: asString(course.intro_video),
    short_description: asString(course.short_description),
    description: asString(course.description),
    price: asNumber(course.price, 0),
    x_price: asNumber(course.x_price, 0),
    is_free: asBoolean(course.is_free, false),
    language: course.language === "বাংলা" ? "বাংলা" : "English",
    is_live: asBoolean(course.is_live, true),
    enrolled: asNumber(course.enrolled, 0),
    you_get: normalizedYouGet,
    seat_amount: asNumber(course.total_seats, 0),
    slug: asString(course.slug),
    tags,
    course_outline: asString(course.course_outline),
  };

  return {
    formData,
    chips: normalizedChips,
    instructors,
    faqs,
    feedbacks,
  };
}

export function buildCourseChipsPayload(
  chips: CourseChipsCanonical,
  legacyChips?: unknown
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...(isRecord(legacyChips) ? legacyChips : {}),
    ...chips.extra,
  };

  const bundleId = chips.bundle_id.trim();
  payload.bundle_id = bundleId ? Number(bundleId) : null;
  payload.sections = chips.sections;
  payload.enrollment_details = chips.enrollment_details;
  payload.socials = chips.socials;
  payload.thumbnails = chips.thumbnails;

  return payload;
}

export function serializeTagsForApi(raw: string | undefined): string[] | undefined {
  const normalized = asString(raw).trim();
  if (!normalized) return undefined;
  return normalized
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function serializeYouGetForApi(raw: string | undefined): Record<string, string> | undefined {
  const normalized = asString(raw).trim();
  if (!normalized) return undefined;
  return { you_get: normalized };
}

export function serializeFeedbacksForApi(
  feedbacks: Feedback[]
): Array<Record<string, unknown>> {
  return feedbacks.map((feedback) => {
    const image = asString(feedback.imageUploadedLink);
    return {
      name: feedback.name,
      bio: feedback.bio,
      description: feedback.description,
      image,
      imageUploadedLink: image,
    };
  });
}
