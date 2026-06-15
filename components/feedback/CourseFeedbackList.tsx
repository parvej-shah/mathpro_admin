"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCourseFeedbackList, useDeleteCourseFeedback } from "@/hooks/useFeedback";
import { useCoursesList } from "@/hooks/useCourse";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEye,
  faRefresh,
  faStar,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import type {
  CourseFeedback,
  CourseFeedbackCategory,
  CourseFeedbackListParams,
} from "@/types/feedback.types";
import { FEEDBACK_CATEGORIES, RATING_LABELS } from "@/types/feedback.types";

interface CourseFeedbackListProps {
  onExport?: () => void;
}

export function CourseFeedbackList({ onExport }: CourseFeedbackListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFeedback, setSelectedFeedback] = useState<CourseFeedback | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const params: CourseFeedbackListParams = {
    page,
    limit,
    courseId: courseFilter !== "all" ? courseFilter : undefined,
    rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
    category:
      categoryFilter !== "all"
        ? (categoryFilter as CourseFeedbackCategory)
        : undefined,
    sortBy,
    order: sortOrder,
  };

  const { data, isLoading, refetch } = useCourseFeedbackList(params);
  const { data: courses, isLoading: coursesLoading } = useCoursesList();
  const deleteFeedback = useDeleteCourseFeedback();

  const feedbacks = data?.feedbacks || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Create a memoized map of course IDs to course names for fast lookup
  const courseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (courses) {
      courses.forEach((course) => {
        // Store by both string and number ID to handle type mismatches
        map.set(String(course.id), course.title);
        map.set(course.id.toString(), course.title);
      });
    }
    return map;
  }, [courses]);

  // Helper to get course name - use course_name from API, or look up from courses map
  const getCourseName = (feedback: CourseFeedback): string => {
    const courseId = String(feedback.course_id);
    
    // First try course_name from API response
    // But only if it's not just a number (API might return course_id as course_name)
    if (feedback.course_name && feedback.course_name.trim()) {
      const trimmedName = feedback.course_name.trim();
      // Check if course_name is NOT just the course_id (avoid showing ID as name)
      if (trimmedName !== courseId && !/^\d+$/.test(trimmedName)) {
        return trimmedName;
      }
    }
    
    // Look up from courses map
    const courseName = courseNameMap.get(courseId);
    if (courseName) {
      return courseName;
    }
    
    // If courses are still loading, show loading indicator
    if (coursesLoading) {
      return "Loading...";
    }
    
    // Fallback - try one more lookup with different ID formats
    const altName = courseNameMap.get(feedback.course_id?.toString() || "");
    if (altName) {
      return altName;
    }
    
    return `Course #${feedback.course_id}`;
  };

  const handleDelete = () => {
    if (selectedFeedback) {
      deleteFeedback.mutate(selectedFeedback.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedFeedback(null);
        },
      });
    }
  };

  const handleSort = (field: "createdAt" | "rating") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getCategoryBadgeVariant = (category: CourseFeedbackCategory) => {
    switch (category) {
      case "content":
        return "default";
      case "instructor":
        return "secondary";
      case "platform":
        return "outline";
      default:
        return "secondary";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={`text-xs ${
              star <= rating ? "text-warning" : "text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  const SortIcon = ({ field }: { field: "createdAt" | "rating" }) => {
    if (sortBy !== field) {
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-muted-foreground" />;
    }
    return (
      <FontAwesomeIcon
        icon={sortOrder === "asc" ? faSortUp : faSortDown}
        className="ml-1"
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={courseFilter}
                onValueChange={(value) => {
                  setCourseFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={ratingFilter}
                onValueChange={(value) => {
                  setRatingFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={String(rating)}>
                      {rating} Star{rating > 1 ? "s" : ""} - {RATING_LABELS[rating]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as "createdAt" | "rating");
                  setPage(1);
                }}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="w-full"
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FontAwesomeIcon
                icon={faStar}
                className="h-12 w-12 text-muted-foreground mb-4"
              />
              <p className="text-lg font-medium">No feedback found</p>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50"
                      onClick={() => handleSort("rating")}
                    >
                      Rating <SortIcon field="rating" />
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="max-w-[300px]">Comment</TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted/50"
                      onClick={() => handleSort("createdAt")}
                    >
                      Date <SortIcon field="createdAt" />
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{feedback.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {feedback.user_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium truncate max-w-[200px]">
                          {getCourseName(feedback)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {renderStars(feedback.rating)}
                          <p className="text-xs text-muted-foreground">
                            {RATING_LABELS[feedback.rating]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadgeVariant(feedback.category)}>
                          {FEEDBACK_CATEGORIES.find(
                            (c) => c.value === feedback.category
                          )?.label || feedback.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm">
                          {feedback.comment || (
                            <span className="text-muted-foreground italic">
                              No comment
                            </span>
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {format(new Date(feedback.created_at), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(feedback.created_at), "HH:mm")}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowDetailModal(true);
                            }}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete Feedback"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-destructive"
                            />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {feedbacks.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback from{" "}
              <strong>{selectedFeedback?.user_name}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteFeedback.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFeedback.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {selectedFeedback &&
                format(
                  new Date(selectedFeedback.created_at),
                  "MMMM dd, yyyy 'at' HH:mm"
                )}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedFeedback.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFeedback.user_email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Course</Label>
                  <p className="font-medium">{getCourseName(selectedFeedback)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Rating</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(selectedFeedback.rating)}
                    <span className="text-sm font-medium">
                      ({RATING_LABELS[selectedFeedback.rating]})
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="mt-1">
                    <Badge
                      variant={getCategoryBadgeVariant(selectedFeedback.category)}
                    >
                      {FEEDBACK_CATEGORIES.find(
                        (c) => c.value === selectedFeedback.category
                      )?.label || selectedFeedback.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Comment</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedFeedback.comment || (
                      <span className="italic text-muted-foreground">
                        No comment provided
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete Feedback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

