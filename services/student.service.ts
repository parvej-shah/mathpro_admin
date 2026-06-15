import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface StudentBasicInfo {
  name?: string;
  phone?: string;
  email?: string;
  facebookId?: string;
  address?: string;
  schoolCollege?: string;
  group?: string;
  guardianName?: string;
  guardianMobile?: string;
  relationWithGuardian?: string;
  gender?: string;
  classLevel?: string;
  version?: string;
  districtName?: string;
  subDistrict?: string;
  cf_handle?: string;
  tshirt_size?: string;
  passingYear?: string;
  interestedTopic?: string;
  skills?: Array<{ skillName: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface EnrolledCourse {
  id?: number;
  course_id?: number;
  title: string;
  current_serial?: number;
  max_serial?: number;
  last_accessed?: number;
  enrolled?: number;
  [key: string]: unknown;
}

export interface StudentProfile {
  basicInfo: StudentBasicInfo;
  enrolledCourses: EnrolledCourse[];
  [key: string]: unknown;
}

export const studentService = {
  /**
   * Get student profile
   */
  getStudentProfile: async (
    userId: number
  ): Promise<ApiResponse<StudentProfile>> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE(userId));
    return response.data;
  },
};
