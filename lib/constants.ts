/**
 * User Types
 */
export const USER_TYPES = {
  ADMIN: 1,
  MODERATOR: 2,
  USER: 3,
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/admin/auth/login",
  },
  
  // Users
  USERS: {
    LIST: "/admin/users",
    GET: (id: number) => `/admin/users/${id}` ,
    HISTORY: (id: number) => `/admin/users/${id}/history`,
    ACCESS: (id: number) => `/admin/users/${id}/access`,
    CREATE: "/admin/users",
    UPDATE: (id: number) => `/admin/users/${id}`,
    DELETE: (id: number) => `/admin/users/${id}`,
    RESET_PASSWORD: (id: number) => `/admin/users/${id}/reset-password`,
    PROFILE: (userId: number) => `/admin/users/${userId}`,
  },
  
  // Admins
  ADMINS: {
    LIST: "/admin/admins",
    GET: (id: number) => `/admin/admins/${id}`,
    CREATE: "/admin/admins",
    UPDATE: (id: number) => `/admin/admins/${id}`,
    DELETE: (id: number) => `/admin/admins/${id}`,
    SET_PASSWORD: (id: number) => `/admin/admins/${id}/set-password`,
    PROMOTE: (id: number) => `/admin/admins/${id}/promote`,
    SEARCH_USERS: "/admin/admins/search-users",
  },

  // Roles (Role Management API)
  ROLES: {
    BASE: "/admin/roles",
    PERMISSIONS: "/admin/roles/permissions",
    LIST: "/admin/roles",
    GET: (id: number) => `/admin/roles/${id}`,
    CREATE: "/admin/roles",
    UPDATE: (id: number) => `/admin/roles/${id}`,
    DELETE: (id: number) => `/admin/roles/${id}`,
    USER_ROLES: (userId: number) => `/admin/roles/users/${userId}/roles`,
    ASSIGN_ROLE: (userId: number) => `/admin/roles/users/${userId}/roles`,
    REMOVE_ROLE: (userId: number, roleId: number) =>
      `/admin/roles/users/${userId}/roles/${roleId}`,
    USER_PERMISSIONS: (userId: number) =>
      `/admin/roles/users/${userId}/permissions`,
  },

  // Teachers
  TEACHERS: {
    LIST: "/admin/teacher/list",
    GET: (id: number) => `/admin/teacher/get/${id}`,
    CREATE: "/admin/teacher/create",
    UPDATE: (id: number) => `/admin/teacher/update/${id}`,
    DELETE: (id: number) => `/admin/teacher/delete/${id}`,
    RESET_PASSWORD: (id: number) => `/admin/teacher/reset-password/${id}`,
  },
  
  // Courses (v2)
  COURSES: {
    LIST: "/v2/admin/course",
    GET: (id: number) => `/v2/admin/course/${id}`,
    UPDATE: (id: number) => `/v2/admin/course/${id}`,
    GET_FULL: (id: number) => `/v2/admin/course/${id}/full`,
    CREATE: "/v2/admin/course",
    UPDATE_FULL: (id: number) => `/v2/admin/course/${id}/full`,
    REVENUE: "/admin/course/getAllRevenue",
    PURCHASES: (courseId: number) => `/admin/course/getAllCoursePerchasesApi?identifier=${639 * courseId}`,
  },

  // Featured rail (mixed courses + bundles)
  FEATURED_ITEMS: {
    LIST: "/v2/admin/featured",
    CREATE: "/v2/admin/featured",
    UPDATE: (itemType: "course" | "bundle", itemId: number) =>
      `/v2/admin/featured/${itemType}/${itemId}`,
    DELETE: (itemType: "course" | "bundle", itemId: number) =>
      `/v2/admin/featured/${itemType}/${itemId}`,
    REORDER: "/v2/admin/featured/reorder",
  },
  
  // Chapters
  CHAPTERS: {
    CREATE: (courseId: number) => `/admin/chapter/create/${courseId}`,
    GET: (id: number) => `/admin/chapter/get/${id}`,
    UPDATE: (id: number) => `/admin/chapter/update/${id}`,
    DELETE: (id: number) => `/admin/chapter/delete/${id}`,
  },
  
  // Modules
  MODULES: {
    CREATE: (chapterId: number) => `/admin/module/create/${chapterId}`,
    GET: (id: number) => `/admin/module/get/${id}`,
    UPDATE: (id: number) => `/admin/module/update/${id}`,
    DELETE: (id: number) => `/admin/module/delete/${id}`,
    USER_PROGRESS: (courseId: number, userId: number) => `/admin/course/getUserProgress/${courseId}/${userId}`,
  },
  
  // Bundles
  BUNDLES: {
    LIST: "/admin/bundle",
    GET: (id: number) => `/admin/bundle/${id}`,
    GET_BY_SLUG: (slug: string) => `/admin/bundle/slug/${slug}`,
    CREATE: "/admin/bundle",
    UPDATE: (id: number) => `/admin/bundle/${id}`,
    CREATE_ENHANCED: "/admin/bundle/enhanced",
    UPDATE_ENHANCED: (id: number) => `/admin/bundle/enhanced/${id}`,
    DELETE: (id: number) => `/admin/bundle/${id}`,
    GET_COURSES: (id: number) => `/admin/bundle/${id}/courses`,
    ADD_COURSES: (id: number) => `/admin/bundle/${id}/courses`,
    STATS: (id: number) => `/admin/bundle/${id}/stats`,
    PURCHASES: (id?: number) => id ? `/admin/bundle/purchases/api?bundle_id=${id}` : "/admin/bundle/purchases/api",
    PREBOOKINGS: (id?: number) => id ? `/admin/bundle/prebookings/api?bundle_id=${id}` : "/admin/bundle/prebookings/api",
  },
  
  // Coupons
  COUPONS: {
    LIST: "/admin/coupon",
    GET: (id: number) => `/admin/coupon/${id}`,
    CREATE: "/admin/coupon",
    UPDATE: (id: number) => `/admin/coupon/${id}`,
    DELETE: (id: number) => `/admin/coupon/${id}`,
    ADD_COURSES: (id: number) => `/admin/coupon/${id}/courses`,
    REMOVE_COURSES: (id: number) => `/admin/coupon/${id}/courses`,
    GET_COURSES: (id: number) => `/admin/coupon/${id}/courses`,
    AVAILABLE_COURSES: "/admin/coupon/available-courses",
    GET_BUNDLES: (id: number) => `/admin/coupon/${id}/bundles`,
    ADD_BUNDLES: (id: number) => `/admin/coupon/${id}/bundles`,
    REMOVE_BUNDLES: (id: number) => `/admin/coupon/${id}/bundles`,
    AVAILABLE_BUNDLES: (couponId?: number) =>
      couponId
        ? `/admin/coupon/available-bundles?couponId=${couponId}`
        : "/admin/coupon/available-bundles",
    STATISTICS: "/admin/coupon/analytics/statistics",
    DASHBOARD: "/admin/coupon/analytics/dashboard",
  },
  
  // Books
  BOOKS: {
    LIST: "/admin/book",
    GET: (id: number) => `/admin/book/${id}`,
    CREATE: "/admin/book",
    UPDATE: (id: number) => `/admin/book/${id}`,
    DELETE: (id: number) => `/admin/book/${id}`,
    COURSE_BOOKS: (courseId: number) => `/admin/book/course/${courseId}`,
    ATTACH_TO_COURSE: (courseId: number) => `/admin/book/course/${courseId}`,
    DETACH_FROM_COURSE: (courseId: number, bookId: number) =>
      `/admin/book/course/${courseId}/${bookId}`,
    ORDERS: (status?: string) =>
      status ? `/admin/book/orders?status=${status}` : "/admin/book/orders",
    UPDATE_ORDER_STATUS: (id: number) => `/admin/book/orders/${id}/status`,
  },

  // Contests
  CONTESTS: {
    LIST: (courseId?: number) => courseId ? `/admin/contest/list/${courseId}` : "/admin/contest/all",
    GET: (id: number) => `/admin/contest/get/${id}`,
    CREATE: (courseId: number) => `/admin/contest/create/${courseId}`,
    UPDATE: (id: number) => `/admin/contest/update/${id}`,
    DELETE: (id: number) => `/admin/contest/delete/${id}`,
    PARTICIPANTS: (id: number) => `/admin/contest/participants/${id}`,
    ADD_PARTICIPANT: (id: number) => `/admin/contest/participant/add/${id}`,
    REMOVE_PARTICIPANT: (id: number) => `/admin/contest/participant/remove/${id}`,
    UPDATE_SCORE: (id: number) => `/admin/contest/participant/score/${id}`,
    SEARCH_USERS: "/admin/contest/users",
    COURSES: "/admin/contest/courses",
  },
  
  // Announcements
  ANNOUNCEMENTS: {
    LIST: "/admin/announcement/list",
    LIST_BY_COURSE: (courseId: number) => `/admin/announcement/list/${courseId}`,
    GET: (id: number) => `/admin/announcement/get/${id}`,
    CREATE: (courseId: number) => `/admin/announcement/create/${courseId}`,
    UPDATE: (id: number) => `/admin/announcement/update/${id}`,
    DELETE: (id: number) => `/admin/announcement/delete/${id}`,
    SEND: (id: number) => `/admin/announcement/send/${id}`,
  },

  // Shared FAQ library
  FAQ: {
    LIST: "/admin/faq/list",
    GET: (id: number) => `/admin/faq/get/${id}`,
    CREATE: "/admin/faq/create",
    UPDATE: (id: number) => `/admin/faq/update/${id}`,
    DELETE: (id: number) => `/admin/faq/delete/${id}`,
  },

  TESTIMONIALS: {
    LIST: "/admin/testimonial/list",
    CREATE: "/admin/testimonial/create",
    UPDATE: (feedbackId: string) => `/admin/testimonial/update/${feedbackId}`,
    DELETE: (feedbackId: string) => `/admin/testimonial/delete/${feedbackId}`,
    MANUAL_REVIEW: "/admin/testimonial/manual-review",
  },
  
  // After Purchase Messages
  AFTER_MESSAGES: {
    LIST: "/admin/aftermessage",
    CREATE: "/admin/aftermessage",
    UPDATE: (id: number) => `/admin/aftermessage/${id}`,
    DELETE: (id: number) => `/admin/aftermessage/${id}`,
  },
  
  // Payments
  PAYMENTS: {
    AUDIT_LOGS: "/admin/payment/audit-logs",
    RECONCILE: "/admin/payment/reconcile",
  },
  
  // Threads/Discussions
  THREADS: {
    LIST: "/admin/discussion/list",
    DELETE: (id: number) => `/admin/discussion/delete/${id}`,
    SUB_DISCUSSIONS: (threadId: number) => `/admin/subDiscussion/list/${threadId}`,
    CREATE_SUB_DISCUSSION: (threadId: number) => `/admin/subDiscussion/create/${threadId}`,
    DELETE_SUB_DISCUSSION: (id: number) => `/admin/subDiscussion/delete/${id}`,
  },
  
  // SMS Management
  SMS: {
    HISTORY: "/admin/sms/history",
    STATUS: (smsId: number) => `/admin/sms/status/${smsId}`,
    RECIPIENTS: (smsId: number) => `/admin/sms/history/${smsId}/recipients`,
    STATISTICS: (period: string) => `/admin/sms/statistics?period=${period}`,
    SEND: "/admin/sms/send",
    RETRY: (smsId: number) => `/admin/sms/retry/${smsId}`,
    EXPORT: "/admin/sms/export?format=csv",
  },
  
  // Live Classes
  LIVE_CLASSES: {
    LIST: "/admin/live/list",
    GET: (id: number) => `/admin/live/get/${id}`,
    CREATE: "/admin/live/create",
    UPDATE: (id: number) => `/admin/live/update/${id}`,
    DELETE: (id: number) => `/admin/live/delete/${id}`,
    INTEREST_COUNT: (id: number) => `/admin/live/interestCount/${id}`,
    BULK_IMPORT: "/admin/live/bulk-import",
    EXPORT: "/admin/live/export",
    TEMPLATE: "/admin/live/template",
    BULK_DELETE: "/admin/live/bulk-delete",
  },
  
  // Routines
  ROUTINES: {
    LIST: "/admin/routine/list",
    GET_BY_COURSE: (courseId: number) => `/admin/routine/course/${courseId}`,
    GET_BY_ID: (id: number) => `/admin/routine/get/${id}`,
    CREATE: (courseId: number) => `/admin/routine/create/${courseId}`,
    UPDATE: (id: number) => `/admin/routine/update/${id}`,
    DELETE: (id: number) => `/admin/routine/delete/${id}`,
    TOGGLE_ACTIVE: (id: number) => `/admin/routine/toggle-active/${id}`,
  },
  
  // Feedback
  FEEDBACK: {
    // Course Feedback
    COURSE_LIST: "/admin/feedback",
    COURSE_STATS: "/admin/feedback/stats",
    COURSE_EXPORT: "/admin/feedback/export",
    COURSE_DELETE: (id: string) => `/admin/feedback/${id}`,
    // Module Feedback
    MODULE_LIST: "/admin/module-feedback",
    MODULE_STATS: (moduleId: number) => `/admin/module-feedback/stats/${moduleId}`,
    MODULE_COURSE_REPORT: (courseId: number) => `/admin/module-feedback/course/${courseId}/report`,
    MODULE_EXPORT: "/admin/module-feedback/export",
  },
  
  // Analytics
  ANALYTICS: {
    REVENUE_DETAILED: "/admin/revenue/detailed",
    REVENUE_DETAILED_BY_COURSE: (courseId: number) => `/admin/revenue/detailed/${courseId}`,
    REVENUE_TOP: (limit?: number) => limit ? `/admin/revenue/top?limit=${limit}` : "/admin/revenue/top",
    REVENUE_TIMEFRAME: (period: string) => `/admin/revenue/timeframe?period=${period}`,
    USER_ENGAGEMENT: "/admin/analytics/user-engagement",
    USER_GROWTH: (period: string) => `/admin/analytics/user-growth?period=${period}`,
    COURSE_ENGAGEMENT: (limit?: number) => limit ? `/admin/analytics/course-engagement?limit=${limit}` : "/admin/analytics/course-engagement",
    MODULE_COMPLETION: (limit?: number) => limit ? `/admin/analytics/module-completion?limit=${limit}` : "/admin/analytics/module-completion",
    MODULE_COMPLETION_BY_COURSE: (courseId: number, limit?: number) => limit ? `/admin/analytics/module-completion/${courseId}?limit=${limit}` : `/admin/analytics/module-completion/${courseId}`,
    DISCUSSION_ACTIVITY: "/admin/analytics/discussion-activity",
    DISCUSSION_ACTIVITY_BY_COURSE: (courseId: number) => `/admin/analytics/discussion-activity/${courseId}`,
    CERTIFICATE_STATS: "/admin/analytics/certificate-stats",
  },

  // Course Access Management
  COURSE_ACCESS: {
    ASSIGN: "/admin/course-access",
    REMOVE: (courseId: number, userId: number) => `/admin/course-access/${courseId}/${userId}`,
    GET_COURSE_USERS: (courseId: number) => `/admin/course-access/courses/${courseId}/users`,
    GET_USER_COURSES: (userId: number) => `/admin/course-access/users/${userId}/courses`,
  },
} as const;
