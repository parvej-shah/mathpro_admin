import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export type FulfillmentStatus = "pending" | "shipped" | "delivered" | "cancelled";

export const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

export interface Book {
  id: number;
  title: string;
  image_url?: string | null;
  description?: string | null;
  class_levels?: string[] | null;
  tags?: string[] | null;
  price: number;
  is_active: boolean;
  created_by?: number | null;
  created_at?: number | null;
  updated_at?: number | null;
}

/** Book row as exposed in the course-attachment list (subset of fields). */
export interface AttachedBook {
  id: number;
  title: string;
  image_url?: string | null;
  description?: string | null;
  class_levels?: string[] | null;
  tags?: string[] | null;
  price: number;
  is_active?: boolean;
}

export interface BookFormData {
  title: string;
  image_url?: string;
  description?: string;
  class_levels?: string[];
  tags?: string[];
  price: number;
  is_active?: boolean;
}

export interface BookOrder {
  id: number;
  user_id: number;
  course_id?: number | null;
  bundle_id?: number | null;
  book_id: number;
  amount_paid?: number | null;
  transaction_id?: string | null;
  ship_name?: string | null;
  ship_phone?: string | null;
  ship_address?: string | null;
  ship_city?: string | null;
  ship_postcode?: string | null;
  fulfillment_status: FulfillmentStatus;
  timestamp?: number | null;
  book_title: string;
  book_image_url?: string | null;
  user_name?: string | null;
  user_login?: string | null;
}

/**
 * The backend returns single entities wrapped in an array (e.g. create/get/update
 * respond with `data: [ {...} ]`). Normalize to the first element so callers can
 * treat them as a single object.
 */
function firstOf<T>(data: T[] | T | undefined): T | undefined {
  if (Array.isArray(data)) return data[0];
  return data;
}

export const bookService = {
  // ---- catalogue CRUD ------------------------------------------------------

  getAllBooks: async (): Promise<Book[]> => {
    const res = await apiClient.get<ApiResponse<Book[]>>(API_ENDPOINTS.BOOKS.LIST);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  getBook: async (id: number): Promise<Book | undefined> => {
    const res = await apiClient.get<ApiResponse<Book[] | Book>>(
      API_ENDPOINTS.BOOKS.GET(id)
    );
    return firstOf(res.data?.data);
  },

  createBook: async (data: BookFormData): Promise<Book | undefined> => {
    const res = await apiClient.post<ApiResponse<Book[] | Book>>(
      API_ENDPOINTS.BOOKS.CREATE,
      data
    );
    return firstOf(res.data?.data);
  },

  updateBook: async (
    id: number,
    data: BookFormData
  ): Promise<Book | undefined> => {
    const res = await apiClient.put<ApiResponse<Book[] | Book>>(
      API_ENDPOINTS.BOOKS.UPDATE(id),
      data
    );
    return firstOf(res.data?.data);
  },

  deleteBook: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.BOOKS.DELETE(id)
    );
    return res.data;
  },

  // ---- course attachment ---------------------------------------------------

  getCourseBooks: async (courseId: number): Promise<AttachedBook[]> => {
    const res = await apiClient.get<ApiResponse<AttachedBook[]>>(
      API_ENDPOINTS.BOOKS.COURSE_BOOKS(courseId)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  attachBookToCourse: async (
    courseId: number,
    bookId: number
  ): Promise<ApiResponse<void>> => {
    const res = await apiClient.post<ApiResponse<void>>(
      API_ENDPOINTS.BOOKS.ATTACH_TO_COURSE(courseId),
      { book_id: bookId }
    );
    return res.data;
  },

  detachBookFromCourse: async (
    courseId: number,
    bookId: number
  ): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.BOOKS.DETACH_FROM_COURSE(courseId, bookId)
    );
    return res.data;
  },

  // ---- fulfillment orders --------------------------------------------------

  getOrders: async (status?: FulfillmentStatus): Promise<BookOrder[]> => {
    const res = await apiClient.get<ApiResponse<BookOrder[]>>(
      API_ENDPOINTS.BOOKS.ORDERS(status)
    );
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  updateOrderStatus: async (
    id: number,
    status: FulfillmentStatus
  ): Promise<ApiResponse<unknown>> => {
    const res = await apiClient.put<ApiResponse<unknown>>(
      API_ENDPOINTS.BOOKS.UPDATE_ORDER_STATUS(id),
      { fulfillment_status: status }
    );
    return res.data;
  },
};
