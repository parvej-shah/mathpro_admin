"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { StudentDetails } from "@/components/students/StudentDetails";
import { StudentCourses } from "@/components/students/StudentCourses";
import { ModuleProgressModal } from "@/components/students/ModuleProgressModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentProfile } from "@/hooks/useStudent";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faBook,
  faChartLine,
  faCog,
  faEnvelope,
  faGraduationCap,
  faLayerGroup,
  faLocationDot,
  faPhone,
  faReceipt,
  faShieldHalved,
  faStar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {
  userService,
  type StudentAccessType,
  type StudentBundleAccessItem,
  type StudentCourseAccessItem,
} from "@/services/user.service";
import { getCoursesList } from "@/services/course.service";
import { bundleService, type Bundle } from "@/services/bundle.service";
import type { Course } from "@/types";

const HISTORY_LIMIT = 40;

const toDate = (value?: number | string | null) => {
  if (value === null || value === undefined) return "-";
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getInitials = (name?: string) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: IconDefinition;
  tone?: "primary" | "info" | "success" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/20 text-warning-foreground",
  }[tone];

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="flex items-center justify-between p-4 xl:p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <span className={cn("grid h-10 w-10 place-items-center rounded-2xl", toneClass)}>
          <FontAwesomeIcon icon={icon} />
        </span>
      </CardContent>
    </Card>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentProfilePage({ params }: PageProps) {
  // Use React 19's use() hook to resolve params (Next.js 16 pattern)
  const { id: studentIdParam } = use(params);
  const studentId = studentIdParam;
  const studentIdNum = studentId ? parseInt(studentId, 10) : null;

  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [accessType, setAccessType] = useState<StudentAccessType>("course");
  const [selectedEntityId, setSelectedEntityId] = useState("");

  const handleCourseClick = (courseId: number) => {
    setSelectedCourseId(courseId);
    setIsModuleModalOpen(true);
  };

  const { data, isLoading } = useStudentProfile(studentIdNum);

  const historyQuery = useQuery({
    queryKey: ["user-history", studentIdNum],
    queryFn: () => userService.getUserHistory(Number(studentIdNum)),
    enabled: Number.isFinite(studentIdNum),
  });

  const accessQuery = useQuery({
    queryKey: ["user-access", studentIdNum, accessType],
    queryFn: () => userService.getUserAccess(Number(studentIdNum), accessType),
    enabled: Number.isFinite(studentIdNum),
  });

  const coursesQuery = useQuery({
    queryKey: ["courses-list-for-user-access"],
    queryFn: getCoursesList,
    staleTime: 5 * 60 * 1000,
  });

  const bundlesQuery = useQuery({
    queryKey: ["bundles-list-for-user-access"],
    queryFn: async () => {
      const response = await bundleService.getAllBundles();
      const payload = response?.data as unknown;
      if (Array.isArray(payload)) return payload as Bundle[];
      if (
        payload &&
        typeof payload === "object" &&
        "bundles" in payload &&
        Array.isArray((payload as { bundles?: unknown }).bundles)
      ) {
        return (payload as { bundles: Bundle[] }).bundles;
      }
      return [] as Bundle[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const grantMutation = useMutation({
    mutationFn: (entityId: number) =>
      userService.grantUserAccess(
        Number(studentIdNum),
        accessType === "course"
          ? { type: "course", courseId: entityId }
          : { type: "bundle", bundleId: entityId }
      ),
    onSuccess: () => {
      toast.success("Access granted successfully");
      setSelectedEntityId("");
      queryClient.invalidateQueries({ queryKey: ["user-access", studentIdNum] });
      queryClient.invalidateQueries({ queryKey: ["user-history", studentIdNum] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to grant access"),
  });

  const revokeMutation = useMutation({
    mutationFn: (entityId: number) =>
      userService.revokeUserAccess(
        Number(studentIdNum),
        accessType === "course"
          ? { type: "course", courseId: entityId }
          : { type: "bundle", bundleId: entityId }
      ),
    onSuccess: () => {
      toast.success("Access revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["user-access", studentIdNum] });
      queryClient.invalidateQueries({ queryKey: ["user-history", studentIdNum] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to revoke access"),
  });

  useEffect(() => {
    setSelectedEntityId("");
  }, [accessType]);

  const profile = (() => {
    if (!data?.data) return null;
    const responseData = data.data as
      | { basicInfo?: unknown; enrolledCourses?: unknown[] }
      | { data?: { basicInfo?: unknown; enrolledCourses?: unknown[] } };
    if ("basicInfo" in responseData) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return responseData.data || null;
    }
    return null;
  })();

  const history = historyQuery.data?.data;
  const purchases = useMemo(() => history?.purchases?.slice(0, HISTORY_LIMIT) ?? [], [history?.purchases]);
  const progress = useMemo(() => history?.progress?.slice(0, HISTORY_LIMIT) ?? [], [history?.progress]);
  const feedbacks = history?.feedbacks ?? [];
  const moduleFeedbacks = history?.module_feedbacks ?? [];

  const accessList = (accessQuery.data?.data ?? []) as
    | StudentCourseAccessItem[]
    | StudentBundleAccessItem[];

  const existingAccessIds = useMemo(() => {
    const ids = new Set<number>();
    for (const entry of accessList) {
      if (accessType === "course") {
        ids.add((entry as StudentCourseAccessItem).course_id);
      } else {
        ids.add((entry as StudentBundleAccessItem).bundle_id);
      }
    }
    return ids;
  }, [accessList, accessType]);

  const courseOptions = useMemo(() => {
    const courses = (coursesQuery.data ?? []) as Course[];
    return courses
      .filter((course) => course.is_live !== false)
      .map((course) => ({ id: course.id, title: course.title || `Course #${course.id}` }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [coursesQuery.data]);

  const bundleOptions = useMemo(() => {
    const bundles = (bundlesQuery.data ?? []) as Bundle[];
    return bundles
      .map((bundle) => ({ id: bundle.id, title: bundle.title || `Bundle #${bundle.id}` }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [bundlesQuery.data]);

  const activeOptions = accessType === "course" ? courseOptions : bundleOptions;
  const availableOptions = useMemo(() => {
    return activeOptions.filter((option) => !existingAccessIds.has(option.id));
  }, [activeOptions, existingAccessIds]);
  const optionsLoading = accessType === "course" ? coursesQuery.isLoading : bundlesQuery.isLoading;

  useEffect(() => {
    if (!selectedEntityId) return;
    const id = Number(selectedEntityId);
    if (!Number.isFinite(id)) {
      setSelectedEntityId("");
      return;
    }
    const stillAvailable = availableOptions.some((option) => option.id === id);
    if (!stillAvailable) setSelectedEntityId("");
  }, [availableOptions, selectedEntityId]);

  const handleGrant = () => {
    const entityId = Number(selectedEntityId);
    if (!Number.isFinite(entityId) || entityId <= 0) {
      toast.error(accessType === "course" ? "Select a course" : "Select a bundle");
      return;
    }
    grantMutation.mutate(entityId);
  };

  const handleRevokeFromRow = (entityId: number) => {
    revokeMutation.mutate(entityId);
  };

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer className="py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Student not found</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const basicInfo = (profile.basicInfo || {}) as {
    name?: string;
    email?: string;
    phone?: string;
    currentInstitution?: string;
    currentAcademicLevel?: string;
    districtName?: string;
    subDistrict?: string;
    interestedTopic?: string;
    skills?: Array<{ skillName: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  const enrolledCourses = (profile.enrolledCourses || []) as Array<{
    id: number;
    title: string;
    [key: string]: unknown;
  }>;

  return (
    <PageContainer className="py-4">
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/users")}
          className="h-9 rounded-full px-3 text-muted-foreground hover:text-foreground"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3.5 w-3.5" />
          Back to users
        </Button>

        <Card className="relative overflow-hidden rounded-[2rem] border-border/70 bg-gradient-to-br from-card via-card to-primary/10 shadow-sm">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20 rounded-3xl border border-border/70 shadow-sm">
                  <AvatarFallback className="rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15 text-3xl font-bold text-foreground">
                    {getInitials(basicInfo.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="mb-2 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
                    User #{studentId}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {basicInfo.name || "Unnamed User"}
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                    A focused profile for contact details, learning progress,
                    purchases, feedback, and access control.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[380px]">
                {([
                  [faEnvelope, basicInfo.email || "No email"],
                  [faPhone, basicInfo.phone || "No phone"],
                  [
                    faGraduationCap,
                    basicInfo.currentInstitution || basicInfo.currentAcademicLevel || "No institution",
                  ],
                  [
                    faLocationDot,
                    basicInfo.districtName
                      ? `${basicInfo.districtName}${basicInfo.subDistrict ? `, ${basicInfo.subDistrict}` : ""}`
                      : "No location",
                  ],
                ] as Array<[IconDefinition, string]>).map(([icon, value], index) => (
                  <div
                    key={index}
                    className="flex min-w-0 items-center gap-2 rounded-2xl border border-border/70 bg-background/45 px-3 py-2"
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className="h-3.5 w-3.5 shrink-0 text-primary"
                    />
                    <span className="truncate text-muted-foreground">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {basicInfo.currentAcademicLevel && (
                <Badge variant="outline" className="rounded-full bg-background/50 px-3 py-1">
                  {basicInfo.currentAcademicLevel}
                </Badge>
              )}
              {basicInfo.interestedTopic && (
                <Badge variant="outline" className="rounded-full bg-background/50 px-3 py-1">
                  {basicInfo.interestedTopic}
                </Badge>
              )}
              {basicInfo.skills?.slice(0, 4).map((skill, index) => (
                <Badge
                  key={`${skill.skillName}-${index}`}
                  variant="secondary"
                  className="rounded-full px-3 py-1"
                >
                  {String(skill.skillName)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {historyQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-3xl" />
            ))
          ) : (
            <>
              <MetricCard
                label="Courses"
                value={enrolledCourses.length}
                icon={faBook}
                tone="primary"
              />
              <MetricCard
                label="Purchases"
                value={history?.summary?.purchases ?? 0}
                icon={faReceipt}
                tone="success"
              />
              <MetricCard
                label="Progress"
                value={history?.summary?.progress_entries ?? 0}
                icon={faChartLine}
                tone="info"
              />
              <MetricCard
                label="Feedback"
                value={
                  (history?.summary?.feedbacks ?? 0) +
                  (history?.summary?.module_feedbacks ?? 0)
                }
                icon={faStar}
                tone="warning"
              />
            </>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-card/95 via-card/85 to-muted/30 p-1.5 shadow-sm sm:grid-cols-3 xl:grid-cols-6">
            <TabsTrigger
              value="details"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faBook} className="mr-2 h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faStar} className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faReceipt} className="mr-2 h-4 w-4" />
              Purchases
            </TabsTrigger>
            <TabsTrigger
              value="engagement"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faChartLine} className="mr-2 h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="administration"
              className="group rounded-2xl border border-transparent py-2.5 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/10 hover:text-foreground hover:shadow-sm data-[state=active]:border-primary/25 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
            >
              <FontAwesomeIcon icon={faCog} className="mr-2 h-4 w-4" />
              Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <StudentDetails basicInfo={basicInfo} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <StudentCourses
              courses={enrolledCourses}
              onCourseClick={handleCourseClick}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
                <CardHeader>
                  <CardTitle>Course Feedback</CardTitle>
                  <CardDescription>{feedbacks.length} total entries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {feedbacks.length === 0 && <EmptyState message="No course feedback yet." />}
                  {feedbacks.slice(0, 20).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="font-medium">{item.course_title || item.course_id}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          Rating: {item.rating}
                        </Badge>
                      </div>
                      <p className="mt-2 text-muted-foreground">{item.comment || "No comment"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
                <CardHeader>
                  <CardTitle>Module Feedback</CardTitle>
                  <CardDescription>{moduleFeedbacks.length} total entries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {moduleFeedbacks.length === 0 && <EmptyState message="No module feedback yet." />}
                  {moduleFeedbacks.slice(0, 20).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                      <p className="font-medium">{item.course_title || "-"}</p>
                      <p className="text-muted-foreground">{item.module_title || `Module #${item.module_id}`}</p>
                      <Badge variant="outline" className="mt-2 rounded-full">
                        Reaction: {item.reaction}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/70">
                <CardTitle>Purchases</CardTitle>
                <CardDescription>Showing latest {HISTORY_LIMIT} entries</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {purchases.length === 0 ? (
                  <div className="p-4 sm:p-6">
                    <EmptyState message="No purchases found." />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((entry, idx) => (
                      <TableRow key={`${entry.item_type}-${entry.item_id}-${idx}`}>
                        <TableCell><Badge variant="outline">{entry.item_type}</Badge></TableCell>
                        <TableCell>{entry.course_title || entry.bundle_title || "-"}</TableCell>
                        <TableCell>{entry.amount ?? "-"}</TableCell>
                        <TableCell>{entry.transaction_id || "-"}</TableCell>
                        <TableCell>{toDate(entry.purchased_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/70">
                <CardTitle>Progress</CardTitle>
                <CardDescription>Showing latest {HISTORY_LIMIT} entries</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {progress.length === 0 ? (
                  <div className="p-4 sm:p-6">
                    <EmptyState message="No progress entries found." />
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Point</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progress.map((entry, idx) => (
                      <TableRow key={`${entry.module_id}-${entry.timestamp}-${idx}`}>
                        <TableCell>{entry.course_title || "-"}</TableCell>
                        <TableCell>{entry.chapter_title || "-"}</TableCell>
                        <TableCell>{entry.module_title || "-"}</TableCell>
                        <TableCell>{entry.point ?? "-"}</TableCell>
                        <TableCell>{toDate(entry.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="administration">
            <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/70">
                <CardTitle>Access Management</CardTitle>
                <CardDescription>Grant or revoke course/bundle access for this student.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[180px_1fr_auto]">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={accessType} onValueChange={(v) => setAccessType(v as StudentAccessType)}>
                      <SelectTrigger className="rounded-2xl bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{accessType === "course" ? "Select Course" : "Select Bundle"}</Label>
                    <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                      <SelectTrigger className="rounded-2xl bg-background">
                        <SelectValue
                          placeholder={optionsLoading
                            ? `Loading ${accessType}s...`
                            : accessType === "course"
                              ? "Choose a course"
                              : "Choose a bundle"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOptions.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            {optionsLoading
                              ? `Loading ${accessType}s...`
                              : `No available ${accessType} found`}
                          </SelectItem>
                        ) : (
                          availableOptions.map((option) => (
                            <SelectItem key={option.id} value={String(option.id)}>
                              {option.title} (ID: {option.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleGrant}
                      disabled={grantMutation.isPending || !selectedEntityId}
                      className="h-10 rounded-2xl px-5"
                    >
                      Grant
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-border/70">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{accessType === "course" ? "Course ID" : "Bundle ID"}</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Granted At</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessQuery.isLoading && (
                      <TableRow>
                        <TableCell colSpan={5}>Loading access...</TableCell>
                      </TableRow>
                    )}

                    {!accessQuery.isLoading && accessList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No {accessType} access found.
                        </TableCell>
                      </TableRow>
                    )}

                    {!accessQuery.isLoading &&
                      accessList.map((entry, idx) => {
                        const id = accessType === "course"
                          ? (entry as StudentCourseAccessItem).course_id
                          : (entry as StudentBundleAccessItem).bundle_id;
                        const title = accessType === "course"
                          ? (entry as StudentCourseAccessItem).course_title
                          : (entry as StudentBundleAccessItem).bundle_title;

                        return (
                          <TableRow key={`${accessType}-${id}-${idx}`}>
                            <TableCell>{id}</TableCell>
                            <TableCell>{title || "-"}</TableCell>
                            <TableCell>{entry.amount ?? "-"}</TableCell>
                            <TableCell>{toDate(entry.enrolled_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokeFromRow(id)}
                                disabled={revokeMutation.isPending}
                                className="rounded-full"
                              >
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {studentIdNum && selectedCourseId && (
          <ModuleProgressModal
            open={isModuleModalOpen}
            onOpenChange={setIsModuleModalOpen}
            studentId={studentIdNum}
            courseId={selectedCourseId}
          />
        )}
      </div>
    </PageContainer>
  );
}
