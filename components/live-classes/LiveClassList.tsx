"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPlayCircle,
  faCalendar,
  faClock,
  faVideo,
  faEdit,
  faTrash,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import type { LiveClass } from "@/services/live-class.service";
import type { ViewMode } from "./ViewToggle";

interface LiveClassListProps {
  liveClasses: LiveClass[];
  loading: boolean;
  onCreateClick: () => void;
  onClassClick: (classId: number) => void;
  onEditClick?: (classId: number) => void;
  onDeleteClick?: (liveClass: LiveClass) => void;
  viewMode?: ViewMode;
  // Selection props for bulk operations
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  selectionEnabled?: boolean;
}

interface GroupedClasses {
  [courseId: string]: {
    title: string;
    classes: LiveClass[];
  };
}

function groupClassesByCourse(classes: LiveClass[]): GroupedClasses {
  return classes.reduce((acc, cls) => {
    const courseId = String(cls.course_id || "unknown");
    if (!acc[courseId]) {
      acc[courseId] = {
        title: cls.course_title || "Unknown Course",
        classes: [],
      };
    }
    acc[courseId].classes.push(cls);
    return acc;
  }, {} as GroupedClasses);
}

function isUpcoming(scheduledAt: number): boolean {
  return new Date(scheduledAt * 1000) > new Date();
}

function formatAMPM(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? "0" + minutes : String(minutes);
  return `${hours}:${minutesStr} ${ampm}`;
}

export function LiveClassList({
  liveClasses,
  loading,
  onCreateClick,
  onClassClick,
  onEditClick,
  onDeleteClick,
  viewMode = "thumbnail",
  selectedIds = [],
  onSelectionChange,
  selectionEnabled = false,
}: LiveClassListProps) {
  const groupedClasses = useMemo(
    () => groupClassesByCourse(liveClasses),
    [liveClasses]
  );

  const allIds = useMemo(
    () => liveClasses.map((lc) => lc.id),
    [liveClasses]
  );

  const isAllSelected =
    allIds.length > 0 && selectedIds.length === allIds.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? allIds : []);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      }
    }
  };

  if (loading) {
    if (viewMode === "list") {
      return (
        <div className="space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-24" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <Card key={j}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (liveClasses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-4xl mb-4">📹</div>
          <p className="text-muted-foreground font-medium">
            No live classes found
          </p>
          <p className="text-sm text-muted-foreground mt-2 text-center mb-4 max-w-md">
            There are currently no live classes scheduled. Create your first
            live class to get started.
          </p>
          <Button onClick={onCreateClick}>
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create First Live Class
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderThumbnailView = () => (
    <div className="space-y-8">
      {Object.entries(groupedClasses).map(([courseId, courseData]) => (
        <div key={courseId} className="space-y-4">
          {/* Course Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{courseData.title}</h2>
              <Badge variant="outline" className="text-sm">
                {courseData.classes.length} Class
                {courseData.classes.length !== 1 ? "es" : ""}
              </Badge>
            </div>
          </div>

          {/* Live Classes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Add New Class Card (only for first course) */}
            {courseId === Object.keys(groupedClasses)[0] && (
              <Card
                className="cursor-pointer border-2 border-dashed hover:border-primary transition-all bg-gradient-to-br from-primary/5 to-primary/10"
                onClick={onCreateClick}
              >
                <CardContent className="flex flex-col items-center justify-center h-[320px] p-6 text-center">
                  <div className="bg-primary/10 rounded-full p-6 mb-4">
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="h-8 w-8 text-primary"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Add Live Class</h3>
                  <p className="text-sm text-muted-foreground">
                    Schedule a new live learning session
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Live Class Cards */}
            {courseData.classes.map((liveClass) => {
              const upcoming = isUpcoming(liveClass.scheduled_at);
              const scheduledDate = new Date(liveClass.scheduled_at * 1000);
              const isSelected = selectedIds.includes(liveClass.id);

              return (
                <Card
                  key={liveClass.id}
                  className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer h-[320px] flex flex-col relative ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onClassClick(liveClass.id)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Selection Checkbox & Actions Dropdown */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
                      {selectionEnabled && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="bg-background/80 backdrop-blur rounded p-1"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectOne(liveClass.id, !!checked)
                            }
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <Badge
                          variant={upcoming ? "default" : "secondary"}
                          className={
                            upcoming
                              ? "bg-success hover:bg-success/90"
                              : "bg-gray-500"
                          }
                        >
                          {upcoming ? "Upcoming" : "Past Class"}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-background/80 backdrop-blur"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                className="h-3 w-3"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onClassClick(liveClass.id);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faPlayCircle}
                                className="mr-2 h-4 w-4"
                              />
                              View Details
                            </DropdownMenuItem>
                            {onEditClick && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(liveClass.id);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  className="mr-2 h-4 w-4"
                                />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDeleteClick && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClick(liveClass);
                                }}
                                className="text-destructive"
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="mr-2 h-4 w-4"
                                />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {liveClass.thumbnail && (
                      <div className="relative w-full h-40 overflow-hidden">
                        <img
                          src={liveClass.thumbnail}
                          alt={liveClass.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {liveClass.title}
                      </h3>

                      <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-1">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="h-3 w-3"
                          />
                          <span>{format(scheduledDate, "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                          <span>{formatAMPM(liveClass.scheduled_at)}</span>
                        </div>
                        {liveClass.duration && (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faVideo}
                              className="h-3 w-3"
                            />
                            <span>{liveClass.duration}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClassClick(liveClass.id);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPlayCircle}
                            className="mr-2 h-3 w-3"
                          />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-8">
      {Object.entries(groupedClasses).map(([courseId, courseData]) => (
        <div key={courseId} className="space-y-4">
          {/* Course Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{courseData.title}</h2>
              <Badge variant="outline" className="text-sm">
                {courseData.classes.length} Class
                {courseData.classes.length !== 1 ? "es" : ""}
              </Badge>
            </div>
          </div>

          {/* List View Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectionEnabled && (
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) {
                              (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isSomeSelected;
                            }
                          }}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                      </TableHead>
                    )}
                    <TableHead className="w-[120px] hidden sm:table-cell">
                      Thumbnail
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Date & Time
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Duration
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseId === Object.keys(groupedClasses)[0] && (
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={onCreateClick}
                    >
                      <TableCell
                        colSpan={selectionEnabled ? 7 : 6}
                        className="text-center py-8"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-primary/10 rounded-full p-4">
                            <FontAwesomeIcon
                              icon={faPlus}
                              className="h-6 w-6 text-primary"
                            />
                          </div>
                          <p className="font-semibold">Add Live Class</p>
                          <p className="text-sm text-muted-foreground">
                            Schedule a new live learning session
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {courseData.classes.map((liveClass) => {
                    const upcoming = isUpcoming(liveClass.scheduled_at);
                    const scheduledDate = new Date(
                      liveClass.scheduled_at * 1000
                    );
                    const isSelected = selectedIds.includes(liveClass.id);

                    return (
                      <TableRow
                        key={liveClass.id}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                        onClick={() => onClassClick(liveClass.id)}
                      >
                        {selectionEnabled && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleSelectOne(liveClass.id, !!checked)
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell className="hidden sm:table-cell">
                          {liveClass.thumbnail ? (
                            <div className="relative w-20 h-14 overflow-hidden rounded-md">
                              <img
                                src={liveClass.thumbnail}
                                alt={liveClass.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-14 bg-muted rounded-md flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faVideo}
                                className="h-5 w-5 text-muted-foreground"
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold">{liveClass.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="h-3 w-3"
                              />
                              <span>
                                {format(scheduledDate, "MMM d, yyyy")}
                              </span>
                              <span>•</span>
                              <span>{formatAMPM(liveClass.scheduled_at)}</span>
                            </div>
                            <div className="sm:hidden">
                              <Badge
                                variant={upcoming ? "default" : "secondary"}
                                className={
                                  upcoming
                                    ? "bg-success hover:bg-success/90 text-xs"
                                    : "bg-gray-500 text-xs"
                                }
                              >
                                {upcoming ? "Upcoming" : "Past"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="h-3 w-3 text-muted-foreground"
                              />
                              <span>{format(scheduledDate, "PPP")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="h-3 w-3"
                              />
                              <span>{formatAMPM(liveClass.scheduled_at)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {liveClass.duration ? (
                            <div className="flex items-center gap-2 text-sm">
                              <FontAwesomeIcon
                                icon={faVideo}
                                className="h-3 w-3 text-muted-foreground"
                              />
                              <span>{liveClass.duration}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              N/A
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={upcoming ? "default" : "secondary"}
                            className={
                              upcoming
                                ? "bg-success hover:bg-success/90"
                                : "bg-gray-500"
                            }
                          >
                            {upcoming ? "Upcoming" : "Past Class"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClassClick(liveClass.id);
                              }}
                              title="View"
                            >
                              <FontAwesomeIcon
                                icon={faPlayCircle}
                                className="h-4 w-4"
                              />
                            </Button>
                            {onEditClick && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditClick(liveClass.id);
                                }}
                                title="Edit"
                              >
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  className="h-4 w-4"
                                />
                              </Button>
                            )}
                            {onDeleteClick && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClick(liveClass);
                                }}
                                title="Delete"
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="h-4 w-4"
                                />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );

  return viewMode === "thumbnail" ? renderThumbnailView() : renderListView();
}
