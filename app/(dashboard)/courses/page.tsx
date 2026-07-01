"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import apiClient from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faUsers,
  faPlay,
  faMagnifyingGlass,
  faGraduationCap,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { GripVertical, Trash2 } from "lucide-react";
import {
  useCreateFeaturedItem,
  useDeleteFeaturedItem,
  useFeaturedItems,
  useReorderFeaturedItems,
  useUpdateFeaturedItem,
} from "@/hooks/useFeaturedItems";
import { useBundles } from "@/hooks/useBundles";
import type { FeaturedItem, FeaturedItemType } from "@/services/featured-item.service";

interface Course {
  id: number;
  title: string;
  price: number;
  x_price?: number;
  language?: string;
  enrolled?: number;
  short_description?: string;
  intro_video?: string;
  chips?: {
    course_thumbnail_link?: string;
    thumbnails?: {
      course_thumbnail_16_9?: string;
      course_thumbnail_link_16_9?: string;
    };
  };
  total_seats?: number;
}

function formatPrice(price: number | undefined): string {
  if (!price) return "Free";
  return `৳${price.toLocaleString("en-US")}`;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedFeaturedKey, setSelectedFeaturedKey] = useState("");

  const usePermissionCheck = Array.isArray(user?.permissions);
  const canManageAllCourses = usePermissionCheck
    ? hasPermission(user?.permissions, "course.manage.all")
    : true;
  const { data: featuredItemsData, isLoading: featuredItemsLoading } = useFeaturedItems();
  const createFeaturedItem = useCreateFeaturedItem();
  const updateFeaturedItem = useUpdateFeaturedItem();
  const reorderFeaturedItems = useReorderFeaturedItems();
  const deleteFeaturedItem = useDeleteFeaturedItem();

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.LIST);
      return response.data.data as Course[];
    },
  });
  const { data: bundlesResponse } = useBundles();

  const courses = data || [];
  const bundles = useMemo(() => bundlesResponse?.data ?? [], [bundlesResponse]);
  const featuredItems = useMemo(() => featuredItemsData ?? [], [featuredItemsData]);
  const featuredKeys = useMemo(
    () => new Set(featuredItems.map((item) => `${item.item_type}:${item.item_id}`)),
    [featuredItems],
  );
  const orderedFeaturedItems = useMemo(
    () =>
      [...featuredItems].sort(
        (a, b) => a.sort_order - b.sort_order || a.item_id - b.item_id,
      ),
    [featuredItems],
  );
  const nextSortOrder = useMemo(() => {
    if (featuredItems.length === 0) return 1;
    return Math.max(...featuredItems.map((item) => item.sort_order || 0)) + 1;
  }, [featuredItems]);
  const availableItems = useMemo(() => {
    const courseOptions = courses
      .filter((course) => !featuredKeys.has(`course:${course.id}`))
      .map((course) => ({ item_type: "course" as FeaturedItemType, item_id: course.id, title: course.title }));
    const bundleOptions = bundles
      .filter((bundle) => !featuredKeys.has(`bundle:${bundle.id}`))
      .map((bundle) => ({ item_type: "bundle" as FeaturedItemType, item_id: bundle.id!, title: bundle.title }));
    return [...courseOptions, ...bundleOptions];
  }, [courses, bundles, featuredKeys]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      [c.title, c.short_description, c.language]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [courses, search]);

  const [featuredRows, setFeaturedRows] = useState(orderedFeaturedItems);
  const orderedFeaturedItemsSignature = useMemo(
    () =>
      orderedFeaturedItems
        .map((item) => `${item.item_type}:${item.item_id}:${item.sort_order}:${item.is_active ? 1 : 0}`)
        .join("|"),
    [orderedFeaturedItems],
  );

  useEffect(() => {
    setFeaturedRows((currentRows) => {
      const currentSignature = currentRows
        .map((item) => `${item.item_type}:${item.item_id}:${item.sort_order}:${item.is_active ? 1 : 0}`)
        .join("|");
      return currentSignature === orderedFeaturedItemsSignature ? currentRows : orderedFeaturedItems;
    });
  }, [orderedFeaturedItems, orderedFeaturedItemsSignature]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featuredRows.findIndex(
      (item) => `featured-item-${item.item_type}-${item.item_id}` === active.id,
    );
    const newIndex = featuredRows.findIndex(
      (item) => `featured-item-${item.item_type}-${item.item_id}` === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const nextRows = arrayMove(featuredRows, oldIndex, newIndex).map((item, index) => ({
      ...item,
      sort_order: index + 1,
    }));

    const previousRows = featuredRows;
    setFeaturedRows(nextRows);
    try {
      await reorderFeaturedItems.mutateAsync(
        nextRows.map((item) => ({
          item_type: item.item_type,
          item_id: item.item_id,
          sort_order: item.sort_order,
        })),
      );
    } catch {
      setFeaturedRows(previousRows);
    }
  };

  return (
    <PageContainer className="py-8">
      {/* Header */}
      <PageHeader
        eyebrow="Courses"
        eyebrowIcon={faGraduationCap}
        title="Courses"
        description={
          isLoading
            ? "Loading your catalog…"
            : `${courses.length} course${courses.length === 1 ? "" : "s"} in your catalog — explore and manage them all in one place.`
        }
        action={
          canManageAllCourses ? (
            <Button asChild className="h-11 rounded-full px-5 font-semibold shadow-sm">
              <Link href="/courses/new">
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                New Course
              </Link>
            </Button>
          ) : undefined
        }
        className="mb-8"
      />

        <Card className="mb-8 rounded-3xl border-border/70 shadow-sm">
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-primary" />
              Featured rail
          </CardTitle>
          <div className="flex flex-col gap-3 lg:flex-row">
            <Select value={selectedFeaturedKey} onValueChange={setSelectedFeaturedKey}>
              <SelectTrigger className="lg:max-w-xl">
                <SelectValue placeholder="Select a course or combo to feature" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No remaining courses or combos
                  </SelectItem>
                ) : (
                  availableItems.map((item) => (
                    <SelectItem
                      key={`${item.item_type}:${item.item_id}`}
                      value={`${item.item_type}:${item.item_id}`}
                    >
                      {item.title} {item.item_type === "bundle" ? "(Combo)" : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="lg:w-auto"
              disabled={!selectedFeaturedKey || createFeaturedItem.isPending}
              onClick={() => {
                const [itemType, itemIdStr] = selectedFeaturedKey.split(":");
                const itemId = Number(itemIdStr);
                if (!itemType || !itemId) return;
                createFeaturedItem.mutate(
                  {
                    item_type: itemType as FeaturedItemType,
                    item_id: itemId,
                    sort_order: nextSortOrder,
                    is_active: true,
                  },
                  {
                    onSuccess: () => setSelectedFeaturedKey(""),
                  },
                );
              }}
            >
              Add to featured rail
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="w-[68px]"></TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[110px]">Order</TableHead>
                  <TableHead className="w-[120px]">Published</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredItemsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Loading featured rail...
                    </TableCell>
                  </TableRow>
                ) : featuredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No courses or combos selected for the featured rail yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={featuredRows.map((item) => `featured-item-${item.item_type}-${item.item_id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {featuredRows.map((item) => (
                        <SortableFeaturedItemRow
                          key={`${item.item_type}:${item.item_id}`}
                          item={item}
                          sortable={!reorderFeaturedItems.isPending}
                          isReordering={reorderFeaturedItems.isPending}
                          isUpdating={updateFeaturedItem.isPending}
                          onPublishedChange={(checked) =>
                            updateFeaturedItem.mutate({
                              item_type: item.item_type,
                              item_id: item.item_id,
                            is_active: checked,
                          })
                        }
                        onRemove={() => deleteFeaturedItem.mutate({ item_type: item.item_type, item_id: item.item_id })}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="pl-10 h-11 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card overflow-hidden">
              <Skeleton className="aspect-16/10 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          searching={search.trim().length > 0}
          canManage={canManageAllCourses}
        />
      )}
    </PageContainer>
  );
}

function SortableFeaturedItemRow({
  item,
  sortable,
  isReordering,
  isUpdating,
  onPublishedChange,
  onRemove,
}: {
  item: FeaturedItem;
  sortable: boolean;
  isReordering: boolean;
  isUpdating: boolean;
  onPublishedChange: (checked: boolean) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `featured-item-${item.item_type}-${item.item_id}`,
    disabled: !sortable || isReordering,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={cn(isDragging && "z-10 bg-primary/5 shadow-lg")}>
      <TableCell className="font-semibold text-muted-foreground">
        <button
          type="button"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors",
            sortable && !isReordering ? "cursor-grab hover:bg-muted active:cursor-grabbing" : "cursor-default opacity-60",
          )}
          aria-label="Drag to reorder featured item"
          {...attributes}
          {...listeners}
          disabled={!sortable || isReordering}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium">{item.title || `#${item.item_id}`}</p>
          <Badge variant="outline" className="text-xs">
            {item.item_type === "bundle" ? "Combo" : "Course"}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.is_live ? "default" : "secondary"}>
          {item.is_live ? "Live" : "Draft"}
        </Badge>
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

function CourseCard({ course }: { course: Course }) {
  const thumbnail =
    course.chips?.thumbnails?.course_thumbnail_16_9 ||
    course.chips?.course_thumbnail_link ||
    course.chips?.thumbnails?.course_thumbnail_link_16_9;

  const discount =
    course.x_price && course.price && course.x_price > course.price
      ? Math.round(((course.x_price - course.price) / course.x_price) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card overflow-hidden",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Media */}
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/80 to-primary">
            <FontAwesomeIcon
              icon={faGraduationCap}
              className="w-10 h-10 text-primary-foreground/70"
            />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {course.language && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm shadow-sm">
              {course.language}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
              {discount}% off
            </span>
          )}
        </div>

        {/* Intro video */}
        {course.intro_video && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(course.intro_video, "_blank");
            }}
            aria-label="Play intro video"
            className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/95 shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
              <FontAwesomeIcon
                icon={faPlay}
                className="w-4 h-4 text-primary translate-x-px"
              />
            </span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 h-11 font-semibold leading-snug transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        {/* Description — always reserves 2 lines for symmetry */}
        <p className="mt-1.5 line-clamp-2 h-10 text-sm text-muted-foreground">
          {course.short_description || ""}
        </p>

        {/* Stats — fixed-height row so footers align */}
        <div className="mt-3 flex h-5 items-center gap-4 text-xs text-muted-foreground">
          {course.enrolled !== undefined && (
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5" />
              {course.enrolled} enrolled
            </span>
          )}
          {course.total_seats && (
            <span>{course.total_seats} seats</span>
          )}
        </div>

        {/* Footer — pinned to the bottom of every card */}
        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold">
              {formatPrice(course.price)}
            </span>
            {course.x_price && course.x_price > course.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(course.x_price)}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  searching,
  canManage,
}: {
  searching: boolean;
  canManage: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FontAwesomeIcon
          icon={searching ? faMagnifyingGlass : faGraduationCap}
          className="w-7 h-7 text-muted-foreground"
        />
      </div>
      <h3 className="text-lg font-semibold">
        {searching ? "No matches found" : "No courses yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {searching
          ? "Try a different search term to find what you’re looking for."
          : "Get started by creating your first course."}
      </p>
      {!searching && canManage && (
        <Button asChild className="mt-6 rounded-full">
          <Link href="/courses/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2 w-4 h-4" />
            Create Course
          </Link>
        </Button>
      )}
    </div>
  );
}
