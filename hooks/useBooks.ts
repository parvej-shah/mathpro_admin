import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bookService,
  type BookFormData,
  type FulfillmentStatus,
} from "@/services/book.service";
import { toast } from "sonner";

const QUERY_KEYS = {
  all: ["books"] as const,
  lists: () => [...QUERY_KEYS.all, "list"] as const,
  detail: (id: number) => [...QUERY_KEYS.all, "detail", id] as const,
  courseBooks: (courseId: number) =>
    [...QUERY_KEYS.all, "course", courseId] as const,
  orders: (status?: FulfillmentStatus) =>
    [...QUERY_KEYS.all, "orders", status ?? "all"] as const,
};

// ---- catalogue -------------------------------------------------------------

export function useBooks() {
  return useQuery({
    queryKey: QUERY_KEYS.lists(),
    queryFn: () => bookService.getAllBooks(),
  });
}

export function useBook(id: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => bookService.getBook(id!),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookFormData) => bookService.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Book created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create book");
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookFormData }) =>
      bookService.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success("Book updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update book");
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      toast.success("Book deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete book");
    },
  });
}

// ---- course attachment -----------------------------------------------------

export function useCourseBooks(courseId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.courseBooks(courseId!),
    queryFn: () => bookService.getCourseBooks(courseId!),
    enabled: !!courseId,
  });
}

export function useAttachBookToCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, bookId }: { courseId: number; bookId: number }) =>
      bookService.attachBookToCourse(courseId, bookId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseBooks(variables.courseId),
      });
      toast.success("Book attached to course");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to attach book");
    },
  });
}

export function useDetachBookFromCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, bookId }: { courseId: number; bookId: number }) =>
      bookService.detachBookFromCourse(courseId, bookId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.courseBooks(variables.courseId),
      });
      toast.success("Book detached from course");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to detach book");
    },
  });
}

// ---- fulfillment orders ----------------------------------------------------

export function useBookOrders(status?: FulfillmentStatus) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(status),
    queryFn: () => bookService.getOrders(status),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: FulfillmentStatus }) =>
      bookService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.all, "orders"] });
      toast.success("Order status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });
}
