"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModuleFeedbackList, useModuleStats, useFeedbackReasons } from "@/hooks/useFeedback";
import { useCoursesList } from "@/hooks/useCourse";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faRefresh,
  faThumbsUp,
  faThumbsDown,
  faFilter,
  faChartBar,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import type {
  ModuleFeedback,
  ModuleFeedbackReaction,
  ModuleFeedbackReason,
  ModuleFeedbackListParams,
} from "@/types/feedback.types";
import { DISLIKE_REASONS } from "@/types/feedback.types";

export function ModuleFeedbackList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [reactionFilter, setReactionFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<ModuleFeedback | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModuleStatsModal, setShowModuleStatsModal] = useState(false);

  const params: ModuleFeedbackListParams = {
    page,
    limit,
    courseId: courseFilter !== "all" ? Number(courseFilter) : undefined,
    reaction:
      reactionFilter !== "all"
        ? (reactionFilter as ModuleFeedbackReaction)
        : undefined,
    reason:
      reasonFilter !== "all"
        ? (reasonFilter as ModuleFeedbackReason)
        : undefined,
  };

  const { data, isLoading, refetch } = useModuleFeedbackList(params);
  const { data: courses, isLoading: coursesLoading } = useCoursesList();
  const { data: moduleStats, isLoading: moduleStatsLoading } = useModuleStats(
    selectedModuleId
  );
  const { data: feedbackReasons } = useFeedbackReasons(true); // Get active reasons only

  const feedbacks = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  // Create a memoized map of course IDs to course names for fast lookup
  const courseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (courses) {
      courses.forEach((course) => {
        // Store by both string and number ID to handle type mismatches
        map.set(String(course.id), course.title);
      });
    }
    return map;
  }, [courses]);

  // Helper to get course title - use course_title from API, or look up from courses map
  const getCourseTitle = (feedback: ModuleFeedback): string => {
    const courseId = feedback.course_id ? String(feedback.course_id) : "";
    
    // First try course_title from API response
    // But only if it's not just a number (API might return course_id as course_title)
    if (feedback.course_title && feedback.course_title.trim()) {
      const trimmedTitle = feedback.course_title.trim();
      // Check if course_title is NOT just the course_id (avoid showing ID as name)
      if (trimmedTitle !== courseId && !/^\d+$/.test(trimmedTitle)) {
        return trimmedTitle;
      }
    }
    
    // Look up from courses map using course_id
    if (courseId) {
      const courseName = courseNameMap.get(courseId);
      if (courseName) {
        return courseName;
      }
    }
    
    // If courses are still loading, show loading indicator
    if (coursesLoading) {
      return "Loading...";
    }
    
    // Fallback
    return `Course #${feedback.course_id || "Unknown"}`;
  };

  const getReasonLabel = (reason: string | null) => {
    if (!reason) return null;
    // First try to find in dynamic reasons from API
    const dynamicReason = feedbackReasons?.find((r) => r.reason_key === reason);
    if (dynamicReason) return dynamicReason.reason_label;
    // Fallback to hardcoded reasons for backward compatibility
    return DISLIKE_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  const getReasonBadgeColor = (reason: string | null) => {
    if (!reason) return "secondary";
    switch (reason) {
      case "audio_issue":
      case "video_issue":
        return "destructive";
      case "too_fast":
      case "too_slow":
        return "secondary";
      case "unclear":
      case "outdated":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
            Filters
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
              <Label htmlFor="reaction">Reaction</Label>
              <Select
                value={reactionFilter}
                onValueChange={(value) => {
                  setReactionFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger id="reaction">
                  <SelectValue placeholder="All Reactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reactions</SelectItem>
                  <SelectItem value="like">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        className="text-success"
                      />
                      Likes
                    </span>
                  </SelectItem>
                  <SelectItem value="dislike">
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faThumbsDown}
                        className="text-destructive"
                      />
                      Dislikes
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Dislike Reason</Label>
              <Select
                value={reasonFilter}
                onValueChange={(value) => {
                  setReasonFilter(value);
                  setPage(1);
                }}
                disabled={reactionFilter === "like"}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {/* Show dynamic reasons from API first */}
                  {feedbackReasons
                    ?.filter((r) => r.is_active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((reason) => (
                      <SelectItem key={reason.id} value={reason.reason_key}>
                        {reason.reason_label}
                      </SelectItem>
                    ))}
                  {/* Fallback to hardcoded reasons for backward compatibility */}
                  {(!feedbackReasons || feedbackReasons.length === 0) &&
                    DISLIKE_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
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
                icon={faThumbsUp}
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
                    <TableHead>Module</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Reaction</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="max-w-[200px]">Comment</TableHead>
                    <TableHead>Date</TableHead>
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
                            {feedback.user_login}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-[180px]">
                            {feedback.module_title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {feedback.chapter_title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium truncate max-w-[150px]">
                          {getCourseTitle(feedback)}
                        </p>
                      </TableCell>
                      <TableCell>
                        {feedback.reaction === "like" ? (
                          <Badge className="bg-success/15 text-success border-success/30">
                            <FontAwesomeIcon
                              icon={faThumbsUp}
                              className="mr-1"
                            />
                            Like
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                            <FontAwesomeIcon
                              icon={faThumbsDown}
                              className="mr-1"
                            />
                            Dislike
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {feedback.reason ? (
                          <Badge variant={getReasonBadgeColor(feedback.reason) as "default" | "secondary" | "destructive" | "outline"}>
                            {getReasonLabel(feedback.reason)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
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
                              setSelectedModuleId(feedback.module_id);
                              setShowModuleStatsModal(true);
                            }}
                            title="View Module Stats"
                          >
                            <FontAwesomeIcon icon={faChartBar} />
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
                    {selectedFeedback.user_login}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reaction</Label>
                  <div className="mt-1">
                    {selectedFeedback.reaction === "like" ? (
                      <Badge className="bg-success/15 text-success border-success/30">
                        <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                        Like
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                        <FontAwesomeIcon icon={faThumbsDown} className="mr-1" />
                        Dislike
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Module</Label>
                <p className="font-medium">{selectedFeedback.module_title}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFeedback.chapter_title} • {getCourseTitle(selectedFeedback)}
                </p>
              </div>

              {selectedFeedback.reason && (
                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <div className="mt-1">
                    <Badge variant={getReasonBadgeColor(selectedFeedback.reason) as "default" | "secondary" | "destructive" | "outline"}>
                      {getReasonLabel(selectedFeedback.reason)}
                    </Badge>
                    {(() => {
                      const dynamicReason = feedbackReasons?.find(
                        (r) => r.reason_key === selectedFeedback.reason
                      );
                      const hardcodedReason = DISLIKE_REASONS.find(
                        (r) => r.value === selectedFeedback.reason
                      );
                      const action = dynamicReason?.description || hardcodedReason?.action;
                      return action ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          {dynamicReason ? "Description: " : "Suggested action: "}
                          {action}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Module Stats Modal */}
      <Dialog open={showModuleStatsModal} onOpenChange={setShowModuleStatsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Module Statistics</DialogTitle>
            <DialogDescription>
              Detailed feedback breakdown for this module
            </DialogDescription>
          </DialogHeader>
          {moduleStatsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-32" />
            </div>
          ) : moduleStats ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-success">
                      {moduleStats.likes}
                    </p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-destructive">
                      {moduleStats.dislikes}
                    </p>
                    <p className="text-xs text-muted-foreground">Dislikes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">
                      {moduleStats.like_percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">Approval</p>
                  </CardContent>
                </Card>
              </div>

              {/* Dislike Reasons */}
              {moduleStats.dislike_reasons &&
                moduleStats.dislike_reasons.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">
                      Dislike Reasons
                    </Label>
                    <div className="space-y-2">
                      {moduleStats.dislike_reasons.map((item) => (
                        <div
                          key={item.reason}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="font-medium text-sm">
                            {getReasonLabel(item.reason)}
                          </span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Comments */}
              {moduleStats.recent_comments &&
                moduleStats.recent_comments.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground mb-2 block">
                      Recent Comments
                    </Label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {moduleStats.recent_comments.map((comment, idx) => (
                        <div key={idx} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {comment.user_name}
                            </span>
                            {comment.reaction === "like" ? (
                              <FontAwesomeIcon
                                icon={faThumbsUp}
                                className="text-success text-xs"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faThumbsDown}
                                className="text-destructive text-xs"
                              />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No statistics available
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

