"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { CourseAccessTable } from "@/components/course-access/CourseAccessTable";
import { UserCoursesTable } from "@/components/course-access/UserCoursesTable";
import { AssignAccessDialog } from "@/components/course-access/AssignAccessDialog";
import { RemoveAccessDialog } from "@/components/course-access/RemoveAccessDialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  useCourseUsers,
  useUserCourses,
  useAssignCourseAccess,
  useRemoveCourseAccess,
} from "@/hooks/useCourseAccess";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLock } from "@fortawesome/free-solid-svg-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type {
  CourseAccessUser,
  UserCourseAccess,
  AssignCourseAccessData,
} from "@/types/course-access.types";
import type { User, Course } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getCoursesList } from "@/services/course.service";
import apiClient from "@/lib/api";

export default function CourseAccessManagementPage() {
  const [activeTab, setActiveTab] = useState<"by-course" | "by-user">(
    "by-course"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<
    CourseAccessUser | UserCourseAccess | null
  >(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.type === USER_TYPES.ADMIN;

  // Fetch courses
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCoursesList,
  });

  const courses: Course[] = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, [coursesData]);

  // Fetch managerial users (type 1)
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: User[];
      }>("/admin/admins");
      return response.data.data || [];
    },
  });

  const adminUsers: User[] = useMemo(() => {
    return Array.isArray(usersData) ? usersData : [];
  }, [usersData]);

  // Course access queries
  const courseId = selectedCourseId ? parseInt(selectedCourseId, 10) : null;
  const userId = selectedUserId ? parseInt(selectedUserId, 10) : null;

  const {
    data: courseUsersData,
    isLoading: isLoadingCourseUsers,
    isError: isCourseUsersError,
    error: courseUsersError,
  } = useCourseUsers(courseId);

  const {
    data: userCoursesData,
    isLoading: isLoadingUserCourses,
    isError: isUserCoursesError,
    error: userCoursesError,
  } = useUserCourses(userId);

  const assignAccess = useAssignCourseAccess();
  const removeAccess = useRemoveCourseAccess();

  const courseUsers: CourseAccessUser[] = useMemo(() => {
    return courseUsersData?.data || [];
  }, [courseUsersData]);

  const userCourses: UserCourseAccess[] = useMemo(() => {
    return userCoursesData?.data || [];
  }, [userCoursesData]);

  // Filter course users by search
  const filteredCourseUsers = useMemo(() => {
    if (!searchQuery.trim()) return courseUsers;
    const q = searchQuery.toLowerCase();
    return courseUsers.filter(
      (access) =>
        access.user_name?.toLowerCase().includes(q) ||
        access.user_email?.toLowerCase().includes(q)
    );
  }, [courseUsers, searchQuery]);

  // Filter user courses by search
  const filteredUserCourses = useMemo(() => {
    if (!searchQuery.trim()) return userCourses;
    const q = searchQuery.toLowerCase();
    return userCourses.filter(
      (course) =>
        course.course_title?.toLowerCase().includes(q) ||
        course.course_description?.toLowerCase().includes(q)
    );
  }, [userCourses, searchQuery]);

  const handleAssign = () => {
    setIsAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (data: AssignCourseAccessData) => {
    const { userId, courseId, additionalUserIds = [] } = data;
    const allUserIds = [userId, ...additionalUserIds];
    
    // Track successes and failures
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Assign access for each user sequentially
    for (const uid of allUserIds) {
      try {
        await assignAccess.mutateAsync({ userId: uid, courseId });
        successCount++;
      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`User ID ${uid}: ${errorMessage}`);
      }
    }

    // Show summary toast
    if (successCount > 0 && failureCount === 0) {
      toast.success(`Successfully assigned access to ${successCount} user${successCount > 1 ? 's' : ''}`);
      setIsAssignDialogOpen(false);
    } else if (successCount > 0 && failureCount > 0) {
      toast.warning(`Assigned ${successCount} user${successCount > 1 ? 's' : ''}, but ${failureCount} failed. Check console for details.`);
      console.error('Assignment errors:', errors);
      setIsAssignDialogOpen(false);
    } else {
      toast.error(`Failed to assign access. ${errors[0] || 'Please try again.'}`);
    }
  };

  const handleRemove = (access: CourseAccessUser | UserCourseAccess) => {
    setSelectedAccess(access);
    setRemoveError(null);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!selectedAccess) return;
    setRemoveError(null);

    removeAccess.mutate(
      {
        courseId: selectedAccess.course_id,
        userId: selectedAccess.user_id,
      },
      {
        onSuccess: () => {
          setIsRemoveDialogOpen(false);
          setSelectedAccess(null);
        },
        onError: (err: Error) => {
          setRemoveError(err.message || "Failed to remove course access");
        },
      }
    );
  };

  const isForbidden =
    (isCourseUsersError &&
      (courseUsersError as { response?: { status?: number } })?.response
        ?.status === 403) ||
    (isUserCoursesError &&
      (userCoursesError as { response?: { status?: number } })?.response
        ?.status === 403);

  if (!isAdmin) {
    return (
      <PageContainer className="py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Alert variant="destructive" className="max-w-md">
            <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              Course Access Management is only available to Admin users with
              role.manage.all permission.
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  if (isForbidden) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive" className="max-w-md">
          <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
          <AlertTitle>Permission denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to manage course access. Contact your
            administrator if you need access.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (isCoursesError || isUsersError) {
    return (
      <PageContainer className="py-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            Failed to load courses or users. Please refresh the page.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const courseOptions = useMemo(() => {
    return courses.map((course) => ({
      label: course.title,
      value: String(course.id),
    }));
  }, [courses]);

  const userOptions = useMemo(() => {
    return adminUsers.map((user) => ({
      label: `${user.name} (${user.email || user.phone || user.login})`,
      value: String(user.id),
    }));
  }, [adminUsers]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedUser = adminUsers.find((u) => u.id === userId);

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Course Access Management
            </h1>
            <p className="text-muted-foreground">
              Assign and manage course-specific access for managerial users
            </p>
          </div>
          <Button
            onClick={handleAssign}
            disabled={assignAccess.isPending}
            className="shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {assignAccess.isPending ? "Assigning…" : "Assign Access"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="by-course">By Course</TabsTrigger>
            <TabsTrigger value="by-user">By User</TabsTrigger>
          </TabsList>

          <TabsContent value="by-course" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Access</CardTitle>
                <CardDescription>
                  View and manage users who have access to a specific course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <Label htmlFor="course-filter">Select Course</Label>
                    <SearchableSelect
                      options={courseOptions}
                      value={selectedCourseId}
                      onChange={setSelectedCourseId}
                      placeholder="Select a course..."
                      searchPlaceholder="Search courses..."
                      emptyText={
                        isLoadingCourses
                          ? "Loading courses..."
                          : "No courses found"
                      }
                      disabled={isLoadingCourses}
                    />
                  </div>
                  {selectedCourseId && (
                    <div className="flex-1 min-w-[250px]">
                      <Label htmlFor="search-users">Search Users</Label>
                      <Input
                        id="search-users"
                        placeholder="Search by name or email…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {selectedCourseId ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      {filteredCourseUsers.length}{" "}
                      {filteredCourseUsers.length === 1 ? "user has" : "users have"}{" "}
                      access to {selectedCourse?.title || "this course"}
                    </div>
                    <CourseAccessTable
                      accessList={filteredCourseUsers}
                      isLoading={isLoadingCourseUsers}
                      emptyState={
                        searchQuery.trim() ? "no-results" : "no-access"
                      }
                      onRemove={handleRemove}
                    />
                  </>
                ) : (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div
                      className="text-6xl mb-4 text-muted-foreground"
                      aria-hidden
                    >
                      📚
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">
                      Select a course to view access
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Choose a course from the dropdown above
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Course Access</CardTitle>
                <CardDescription>
                  View and manage courses a specific user has access to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <Label htmlFor="user-filter">Select User</Label>
                    <SearchableSelect
                      options={userOptions}
                      value={selectedUserId}
                      onChange={setSelectedUserId}
                      placeholder="Select a user..."
                      searchPlaceholder="Search by name or email..."
                      emptyText={
                        isLoadingUsers
                          ? "Loading users..."
                          : "No admin users found"
                      }
                      disabled={isLoadingUsers}
                    />
                  </div>
                  {selectedUserId && (
                    <div className="flex-1 min-w-[250px]">
                      <Label htmlFor="search-courses">Search Courses</Label>
                      <Input
                        id="search-courses"
                        placeholder="Search by title…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {selectedUserId ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser?.name || "This user"} has access to{" "}
                      {filteredUserCourses.length}{" "}
                      {filteredUserCourses.length === 1 ? "course" : "courses"}
                    </div>
                    <UserCoursesTable
                      courses={filteredUserCourses}
                      isLoading={isLoadingUserCourses}
                      emptyState={
                        searchQuery.trim() ? "no-results" : "no-courses"
                      }
                      onRemove={handleRemove}
                    />
                  </>
                ) : (
                  <div className="flex flex-col justify-center items-center py-16">
                    <div
                      className="text-6xl mb-4 text-muted-foreground"
                      aria-hidden
                    >
                      👤
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">
                      Select a user to view access
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Choose a user from the dropdown above
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AssignAccessDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          onSubmit={handleAssignSubmit}
          isSubmitting={assignAccess.isPending}
          adminUsers={adminUsers}
          courses={courses}
          isLoadingUsers={isLoadingUsers}
          isLoadingCourses={isLoadingCourses}
        />

        <RemoveAccessDialog
          isOpen={isRemoveDialogOpen}
          onClose={() => {
            setIsRemoveDialogOpen(false);
            setSelectedAccess(null);
            setRemoveError(null);
          }}
          onConfirm={handleRemoveConfirm}
          isDeleting={removeAccess.isPending}
          userName={
            selectedAccess && "user_name" in selectedAccess
              ? selectedAccess.user_name
              : selectedUser?.name
          }
          courseName={
            selectedAccess && "course_title" in selectedAccess
              ? selectedAccess.course_title
              : selectedCourse?.title
          }
          errorMessage={removeError}
        />
      </div>
    </PageContainer>
  );
}
