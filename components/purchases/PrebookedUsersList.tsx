"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrebookedUserCard } from "./PrebookedUserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faDownload,
  faLayerGroup,
  faReceipt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import type { PrebookedUser } from "@/services/purchase.service";

interface Course {
  id: number;
  title: string;
}

interface Bundle {
  id: number;
  title: string;
}

interface PrebookedUsersListProps {
  coursePrebookings: PrebookedUser[];
  bundlePrebookings: PrebookedUser[];
  courses: Course[];
  bundles: Bundle[];
  courseLoading: boolean;
  bundleLoading: boolean;
  activeCourse: string;
  activeBundle: string;
  onCourseChange: (courseId: string) => void;
  onBundleChange: (bundleId: string) => void;
  onUserClick?: (userId: number) => void;
  onExportCourseCSV?: () => void;
  onExportBundleCSV?: () => void;
  canViewBundleTab?: boolean;
}

export function PrebookedUsersList({
  coursePrebookings,
  bundlePrebookings,
  courses,
  bundles,
  courseLoading,
  bundleLoading,
  activeCourse,
  activeBundle,
  onCourseChange,
  onBundleChange,
  onUserClick,
  onExportCourseCSV,
  onExportBundleCSV,
  canViewBundleTab = true,
}: PrebookedUsersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"course" | "bundle">("course");

  const withUniqueKeys = (users: PrebookedUser[]): (PrebookedUser & { __key: string })[] => {
    const seen = new Map<string, number>();
    return users.map((user, index) => {
      const base =
        user.id !== undefined && user.id !== null
          ? `id-${user.id}`
          : `uid-${user.user_id}-${index}`;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return { ...user, __key: count === 0 ? base : `${base}-${count}` };
    });
  };

  const filteredCoursePrebookings = useMemo(() => {
    const list = searchQuery.trim()
      ? coursePrebookings.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.includes(searchQuery)
        )
      : coursePrebookings;
    return withUniqueKeys(list);
  }, [coursePrebookings, searchQuery]);

  const filteredBundlePrebookings = useMemo(() => {
    const list = searchQuery.trim()
      ? bundlePrebookings.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.includes(searchQuery)
        )
      : bundlePrebookings;
    return withUniqueKeys(list);
  }, [bundlePrebookings, searchQuery]);

  const isCourseTab = activeTab === "course";
  const activePrebookings = isCourseTab
    ? filteredCoursePrebookings
    : filteredBundlePrebookings;
  const activeLoading = isCourseTab ? courseLoading : bundleLoading;
  const exportHandler = isCourseTab ? onExportCourseCSV : onExportBundleCSV;

  const emptyTitle = isCourseTab
    ? "No course prebookings found"
    : "No bundle prebookings found";

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-3">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "course" | "bundle")}
          className="space-y-3"
        >
          <div className="grid gap-2 xl:grid-cols-[auto_minmax(220px,1fr)_minmax(260px,1.2fr)_auto_auto] xl:items-center">
            <TabsList
              className={`grid h-9 gap-1 rounded-xl bg-background/60 p-1 ${
                canViewBundleTab ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <TabsTrigger
                value="course"
                className="gap-1.5 rounded-lg px-3 text-xs transition-all hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FontAwesomeIcon icon={faBookOpen} className="h-3.5 w-3.5" />
                Courses
              </TabsTrigger>
              {canViewBundleTab && (
                <TabsTrigger
                  value="bundle"
                  className="gap-1.5 rounded-lg px-3 text-xs transition-all hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <FontAwesomeIcon icon={faLayerGroup} className="h-3.5 w-3.5" />
                  Bundles
                </TabsTrigger>
              )}
            </TabsList>

            <Select
              value={isCourseTab ? activeCourse : activeBundle}
              onValueChange={isCourseTab ? onCourseChange : onBundleChange}
            >
              <SelectTrigger className="h-9 rounded-xl border-border/70 bg-background/55 text-xs">
                <SelectValue
                  placeholder={isCourseTab ? "Select course" : "Select bundle"}
                />
              </SelectTrigger>
              <SelectContent>
                {(isCourseTab ? courses : bundles).map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-xl border-border/70 bg-background/55 pl-9 text-xs shadow-none focus-visible:ring-primary/25"
              />
            </div>

            <div className="whitespace-nowrap rounded-xl border border-border/60 bg-background/45 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {activePrebookings.length.toLocaleString()}
              </span>{" "}
              users prebooked
            </div>

            {exportHandler && (
              <Button
                variant="outline"
                onClick={exportHandler}
                className="h-9 rounded-xl border-border/70 px-3 text-xs transition-all hover:border-primary/35 hover:bg-primary/10"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2 h-3.5 w-3.5" />
                CSV
              </Button>
            )}
          </div>

          <TabsContent value="course" className="mt-0 space-y-1.5">
            {activeLoading ? (
              <PurchaseSkeleton />
            ) : filteredCoursePrebookings.length === 0 ? (
              <EmptyState title={emptyTitle} />
            ) : (
              filteredCoursePrebookings.map((user) => (
                <PrebookedUserCard
                  key={`course-${user.__key}`}
                  user={user}
                  type="course"
                  onUserClick={onUserClick}
                />
              ))
            )}
          </TabsContent>

          {canViewBundleTab && (
            <TabsContent value="bundle" className="mt-0 space-y-1.5">
              {activeLoading ? (
                <PurchaseSkeleton />
              ) : filteredBundlePrebookings.length === 0 ? (
                <EmptyState title={emptyTitle} />
              ) : (
                filteredBundlePrebookings.map((user) => (
                  <PrebookedUserCard
                    key={`bundle-${user.__key}`}
                    user={user}
                    type="bundle"
                    onUserClick={onUserClick}
                  />
                ))
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PurchaseSkeleton() {
  return (
    <div className="space-y-1.5">
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} className="h-12 rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/35 py-10 text-center">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FontAwesomeIcon icon={faReceipt} className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try another filter or clear the search.
      </p>
    </div>
  );
}
