/**
 * Course Form Types
 * Shared types for course creation and editing forms
 */

export interface CourseFormData {
  title: string;
  hosted_url?: string;
  intro_video?: string;
  short_description: string;
  description: string;
  price: number;
  x_price: number;
  is_free: boolean;
  language: "বাংলা" | "English";
  is_live: boolean;
  enrolled: number;
  you_get?: string;
  seat_amount: number;
  slug?: string;
  tags?: string;
  course_outline?: string;
}

export interface Instructor {
  name: string;
  credibility: string;
  image?: File;
  imagePreviewLink?: string;
  imageUploadedLink?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Feedback {
  name: string;
  bio: string;
  description: string;
  image?: File;
  imagePreviewLink?: string;
  imageUploadedLink?: string;
}

export interface LabeledValue {
  label: string;
  value: string;
  icon?: string;
}

export type CourseSections = LabeledValue[];

export interface EnrollmentDetailsChips {
  prebooking_end_date?: number | null;
  enrollment_end_date?: number | null;
  course_start_date?: number | null;
}

export type CourseSocials = Record<string, string>;
export type CourseThumbnails = Record<string, string>;

export interface CourseChipsCanonical {
  sections: CourseSections;
  enrollment_details: EnrollmentDetailsChips;
  socials: CourseSocials;
  thumbnails: CourseThumbnails;
  bundle_id: string;
  extra: Record<string, unknown>;
}
