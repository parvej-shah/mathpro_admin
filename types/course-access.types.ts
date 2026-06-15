/**
 * Course Access Management Types
 */

export interface CourseAccess {
  id: number;
  course_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface CourseAccessWithDetails extends CourseAccess {
  course?: {
    id: number;
    title: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

export interface CourseAccessUser {
  access_id: number;
  course_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name: string;
}

export interface UserCourseAccess {
  access_id: number;
  course_id: number;
  user_id: number;
  course_title: string;
  course_description: string;
  course_price: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name: string;
}

export interface AssignCourseAccessData {
  userId: number;
  courseId: number;
  additionalUserIds?: number[];
}
