"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faQuoteLeft,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { GripVertical, Plus, Search, Trash2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, useReorderTestimonials, useCreateManualReview } from "@/hooks/useTestimonials";
import { ManualReviewDialog } from "@/components/testimonials/ManualReviewDialog";
import { useCourseFeedbackList } from "@/hooks/useFeedback";
import { useCoursesList } from "@/hooks/useCourse";
import type { CourseFeedbackCategory } from "@/types/feedback.types";
import type { FeaturedTestimonial } from "@/services/testimonial.service";
import { cn } from "@/lib/utils";

const FEEDBACK_CATEGORY_OPTIONS: Array<{ value: "all" | CourseFeedbackCategory; label: string }> = [
  { value: "all", label: "All categories" },
  { value: "course", label: "Course" },
  { value: "content", label: "Content" },
  { value: "instructor", label: "Instructor" },
  { value: "platform", label: "Platform" },
  { value: "other", label: "Other" },
];

function clampExcerpt(value: string, limit = 140) {
  return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
}

function getFeaturedRowsSignature(items: Array<Pick<FeaturedTestimonial, "feedback_id" | "sort_order" | "is_active">>) {
  return items
    .map((item) => `${item.feedback_id}:${item.sort_order}:${item.is_active ? 1 : 0}`)
    .join("|");
}

export default function TestimonialManagementPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CourseFeedbackCategory>("all");
  const [isManualReviewOpen, setIsManualReviewOpen] = useState(false);

  const { data: testimonialsData, isLoading: testimonialsLoading } = useTestimonials();
  const { data: coursesData } = useCoursesList();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();
  const reorderTestimonials = useReorderTestimonials();
  const createManualReview = useCreateManualReview();

  const testimonials = useMemo(() => testimonialsData ?? [], [testimonialsData]);
  const courses = useMemo(() => coursesData ?? [], [coursesData]);

  const { data: feedbackData, isLoading: feedbackLoading } = useCourseFeedbackList({
    page,
    limit,
    courseId: courseFilter !== "all" ? courseFilter : undefined,
    rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    sortBy: "createdAt",
    order: "desc",
  });

  const featuredIds = useMemo(
    () => new Set(testimonials.map((item) => item.feedback_id)),
    [testimonials],
  );

  const orderedTestimonials = useMemo(
    () => [...testimonials].sort((a, b) => a.sort_order - b.sort_order || a.feedback_id.localeCompare(b.feedback_id)),
    [testimonials],
  );

  const nextSortOrder = useMemo(() => {
    if (testimonials.length === 0) return 1;
    return Math.max(...testimonials.map((item) => item.sort_order || 0)) + 1;
  }, [testimonials]);

  const candidateFeedbacks = useMemo(() => {
    const source = (feedbackData?.feedbacks || []).filter((feedback) => feedback.comment?.trim());
    if (!searchQuery.trim()) return source;
    const query = searchQuery.toLowerCase();
    return source.filter((feedback) =>
      feedback.comment.toLowerCase().includes(query) ||
      feedback.user_name.toLowerCase().includes(query) ||
      feedback.course_name.toLowerCase().includes(query),
    );
  }, [feedbackData?.feedbacks, searchQuery]);

  const [featuredRows, setFeaturedRows] = useState(orderedTestimonials);
  const orderedTestimonialsSignature = useMemo(
    () => getFeaturedRowsSignature(orderedTestimonials),
    [orderedTestimonials],
  );

  useEffect(() => {
    setFeaturedRows((currentRows) =>
      getFeaturedRowsSignature(currentRows) === orderedTestimonialsSignature
        ? currentRows
        : orderedTestimonials,
    );
  }, [orderedTestimonials, orderedTestimonialsSignature]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featuredRows.findIndex((item) => `testimonial-${item.feedback_id}` === active.id);
    const newIndex = featuredRows.findIndex((item) => `testimonial-${item.feedback_id}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextRows = arrayMove(featuredRows, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    const previousRows = featuredRows;
    setFeaturedRows(nextRows);
    try {
      await reorderTestimonials.mutateAsync(nextRows.map((item) => item.feedback_id));
    } catch {
      setFeaturedRows(previousRows);
    }
  };

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Engagement"
          eyebrowIcon={faQuoteLeft}
          title="Testimonial Management"
          description="Select existing course feedbacks to feature on the public site testimonial section."
          action={
            <Button onClick={() => setIsManualReviewOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
          }
        />

        <ManualReviewDialog
          isOpen={isManualReviewOpen}
          onClose={() => setIsManualReviewOpen(false)}
          onSubmit={(data) =>
            createManualReview.mutate(data, {
              onSuccess: () => setIsManualReviewOpen(false),
            })
          }
          courses={courses}
          isSubmitting={createManualReview.isPending}
        />

        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faComments} />
              Featured selection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="w-[68px]"></TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-[90px]">Rating</TableHead>
                  <TableHead className="w-[200px]">Video URL</TableHead>
                  <TableHead className="w-[110px]">Order</TableHead>
                  <TableHead className="w-[120px]">Published</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonialsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      Loading featured testimonials...
                    </TableCell>
                  </TableRow>
                ) : testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                      No testimonials selected yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={featuredRows.map((item) => `testimonial-${item.feedback_id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {featuredRows.map((item) => {
                      return (
                        <SortableTestimonialRow
                          key={item.feedback_id}
                          item={item}
                          sortable={!reorderTestimonials.isPending}
                          isReordering={reorderTestimonials.isPending}
                          isUpdating={updateTestimonial.isPending}
                          onPublishedChange={(checked) =>
                            updateTestimonial.mutate({
                              feedback_id: item.feedback_id,
                              is_active: checked,
                            })
                          }
                          onVideoUrlChange={(videoUrl) =>
                            updateTestimonial.mutate({
                              feedback_id: item.feedback_id,
                              video_url: videoUrl || null,
                            })
                          }
                          onRemove={() => deleteTestimonial.mutate(item.feedback_id)}
                        />
                      );
                    })}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
            </DndContext>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardHeader className="space-y-4">
            <CardTitle>Review library</CardTitle>
            <div className="grid gap-3 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comment, user, or course"
                  className="pl-9"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={String(rating)}>
                        {rating} stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) =>
                    setCategoryFilter(value as "all" | CourseFeedbackCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead>Review</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-[90px]">Rating</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading feedback library...
                    </TableCell>
                  </TableRow>
                ) : candidateFeedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No review comments found for the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  candidateFeedbacks.map((feedback) => {
                    const isSelected = featuredIds.has(feedback.id);
                    return (
                      <TableRow key={feedback.id}>
                        <TableCell className="max-w-md">
                          <p className="font-medium line-clamp-2">{clampExcerpt(feedback.comment)}</p>
                        </TableCell>
                        <TableCell>{feedback.user_name}</TableCell>
                        <TableCell>{feedback.course_name || `Course #${feedback.course_id}`}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <FontAwesomeIcon icon={faStar} className="mr-1 text-warning" />
                            {feedback.rating}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {feedback.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant={isSelected ? "outline" : "default"}
                              disabled={isSelected || createTestimonial.isPending}
                              onClick={() =>
                                createTestimonial.mutate({
                                  feedback_id: feedback.id,
                                  sort_order: nextSortOrder,
                                  is_active: true,
                                })
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {isSelected ? "Selected" : "Feature"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
              <span>Page {page}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={(feedbackData?.feedbacks?.length || 0) < limit}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function SortableTestimonialRow({
  item,
  sortable,
  isReordering,
  isUpdating,
  onPublishedChange,
  onVideoUrlChange,
  onRemove,
}: {
  item: {
    feedback_id: string;
    sort_order: number;
    is_active: boolean;
    video_url?: string | null;
    comment: string;
    user_name: string;
    course_name?: string;
    course_id: string;
    rating: number;
  };
  sortable: boolean;
  isReordering: boolean;
  isUpdating: boolean;
  onPublishedChange: (checked: boolean) => void;
  onVideoUrlChange: (videoUrl: string) => void;
  onRemove: () => void;
}) {
  const [videoUrl, setVideoUrl] = useState(item.video_url || "");

  useEffect(() => {
    setVideoUrl(item.video_url || "");
  }, [item.video_url]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `testimonial-${item.feedback_id}`,
    disabled: !sortable || isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10 bg-primary/5 shadow-lg")}
    >
      <TableCell className="font-semibold text-muted-foreground">
        <button
          type="button"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors",
            sortable && !isReordering ? "cursor-grab hover:bg-muted active:cursor-grabbing" : "cursor-default opacity-60",
          )}
          aria-label="Drag to reorder testimonial"
          {...attributes}
          {...listeners}
          disabled={!sortable || isReordering}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="max-w-0">
        <TooltipText text={item.comment} className="max-w-[340px] font-medium" />
      </TableCell>
      <TableCell className="max-w-0">
        <TooltipText text={item.user_name} className="max-w-[150px]" />
      </TableCell>
      <TableCell className="max-w-0">
        <TooltipText
          text={item.course_name || `Course #${item.course_id}`}
          className="max-w-[250px]"
        />
      </TableCell>
      <TableCell>
        <Badge variant="secondary">
          <FontAwesomeIcon icon={faStar} className="mr-1 text-warning" />
          {item.rating}
        </Badge>
      </TableCell>
      <TableCell>
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onBlur={() => {
            if (videoUrl !== (item.video_url || "")) {
              onVideoUrlChange(videoUrl.trim());
            }
          }}
          placeholder="YouTube link"
          className="h-8 text-xs"
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline">{item.sort_order}</Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={item.is_active}
          disabled={isUpdating}
          onCheckedChange={onPublishedChange}
        />
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TooltipText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className={cn("truncate whitespace-nowrap", className)}>{text}</p>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm whitespace-normal break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
