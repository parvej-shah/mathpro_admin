"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClock,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { formatTimestamp } from "@/lib/helpers";
import type { EnrolledCourse } from "@/services/student.service";

interface StudentCoursesProps {
  courses: EnrolledCourse[];
  onCourseClick?: (courseId: number) => void;
}

export function StudentCourses({
  courses,
  onCourseClick,
}: StudentCoursesProps) {
  if (courses.length === 0) {
    return (
      <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-primary" />
            Enrolled Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No courses enrolled yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-primary" />
          Learning Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {courses.map((course) => {
            const courseId = course.course_id || course.id || 0;
            const currentSerial = course.current_serial || 0;
            const maxSerial = course.max_serial || 1;
            const lastAccessed = course.last_accessed || 0;
            const enrolled = course.enrolled || 0;

            const progress = Math.ceil((currentSerial / maxSerial) * 100);

            return (
              <Card
                key={courseId}
                className={`cursor-pointer rounded-3xl border-border/70 bg-background/45 transition-all hover:border-primary/40 hover:bg-primary/5 ${
                  onCourseClick ? "hover:shadow-md" : ""
                }`}
                onClick={() => onCourseClick && onCourseClick(courseId)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 rounded-2xl bg-primary/10">
                        <AvatarFallback className="rounded-2xl text-primary">
                          <FontAwesomeIcon icon={faBook} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="mb-1 truncate text-lg font-semibold">
                          {course.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="gap-1 rounded-full">
                            <FontAwesomeIcon
                              icon={faChartLine}
                              className="h-3 w-3"
                            />
                            {progress}% Complete
                          </Badge>
                          {lastAccessed > 0 && (
                            <Badge variant="outline" className="gap-1 rounded-full">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="h-3 w-3"
                              />
                              {formatTimestamp(lastAccessed)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-sm flex-1">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">
                          {currentSerial} / {maxSerial} Modules
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {enrolled > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Enrolled: {formatTimestamp(enrolled)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
