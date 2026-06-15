"use client";

import { useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  CourseFeedbackStats,
  CourseFeedbackList,
} from "@/components/feedback";
import { useExportCourseFeedback } from "@/hooks/useFeedback";
import { useCoursesList } from "@/hooks/useCourse";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faCalendar,
  faChartLine,
  faListAlt,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

export default function FeedbackManagementPage() {
  const [courseViewMode, setCourseViewMode] = useState<"stats" | "list">("stats");

  // Export filters
  const [exportCourseId, setExportCourseId] = useState<string>("all");
  const [exportStartDate, setExportStartDate] = useState<Date | undefined>();
  const [exportEndDate, setExportEndDate] = useState<Date | undefined>();
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

  // Stats filter
  const [statsCourseId, setStatsCourseId] = useState<string>("all");

  const { data: courses } = useCoursesList();
  const courseOptions = Array.isArray(courses) ? courses : [];
  const exportCourseFeedback = useExportCourseFeedback();

  const handleExportCourseFeedback = () => {
    exportCourseFeedback.mutate({
      courseId: exportCourseId !== "all" ? exportCourseId : undefined,
      startDate: exportStartDate ? format(exportStartDate, "yyyy-MM-dd") : undefined,
      endDate: exportEndDate ? format(exportEndDate, "yyyy-MM-dd") : undefined,
      format: exportFormat,
    });
  };

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          eyebrow="Feedback"
          eyebrowIcon={faCommentDots}
          title="Feedback Management"
          description="Monitor, analyze and manage student feedback for your courses."
          action={
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-5 font-semibold shadow-sm"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Export Course Feedback</h4>

                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={exportCourseId}
                      onValueChange={setExportCourseId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courseOptions.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <FontAwesomeIcon icon={faCalendar} className="mr-2 h-4 w-4" />
                            {exportStartDate ? format(exportStartDate, "MMM dd") : "Pick"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={exportStartDate}
                            onSelect={setExportStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <FontAwesomeIcon icon={faCalendar} className="mr-2 h-4 w-4" />
                            {exportEndDate ? format(exportEndDate, "MMM dd") : "Pick"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={exportEndDate}
                            onSelect={setExportEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={exportFormat}
                      onValueChange={(v) => setExportFormat(v as "csv" | "json")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleExportCourseFeedback}
                    disabled={exportCourseFeedback.isPending}
                  >
                    {exportCourseFeedback.isPending ? "Exporting..." : "Download"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          }
        />

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* View Toggle & Course Filter */}
          <div className="flex items-center gap-2">
            <Button
              variant={courseViewMode === "stats" ? "default" : "outline"}
              size="sm"
              onClick={() => setCourseViewMode("stats")}
            >
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Statistics
            </Button>
            <Button
              variant={courseViewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setCourseViewMode("list")}
            >
              <FontAwesomeIcon icon={faListAlt} className="mr-2" />
              All Feedback
            </Button>
          </div>

          {courseViewMode === "stats" && (
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Course:</Label>
              <Select
                value={statsCourseId}
                onValueChange={setStatsCourseId}
              >
                <SelectTrigger className="w-200px">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Course Feedback Content */}
        {courseViewMode === "stats" ? (
          <CourseFeedbackStats
            courseId={statsCourseId !== "all" ? statsCourseId : undefined}
          />
        ) : (
          <CourseFeedbackList />
        )}
      </div>
    </PageContainer>
  );
}

