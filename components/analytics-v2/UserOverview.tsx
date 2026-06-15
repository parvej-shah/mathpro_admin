"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatStripCard } from "@/components/shared/StatStripCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserGroup,
  faUserTie,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { useUserOverview, useAllMetadata } from "@/hooks/useAnalyticsV2";
import { formatPercentage } from "@/lib/analytics-v2.utils";
import { getMetadata } from "@/lib/analytics-v2-metadata.utils";
import type { UserOverviewParams } from "@/types/analytics-v2.types";

interface UserOverviewProps {
  params?: UserOverviewParams;
}

export function UserOverview({ params }: UserOverviewProps) {
  const { data, isLoading, error } = useUserOverview(params);
  const { data: metadataResponse } = useAllMetadata();
  const metadata = metadataResponse?.success
    ? (metadataResponse.data as any)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error ? "Failed to load user data" : "No user data available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const userData = data.data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatStripCard
          title="Total Users"
          value={userData.total_users}
          subtitle={`${userData.regular_users} regular, ${userData.admins} admins`}
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "users", "total_users")}
        />
        <StatStripCard
          title="Paying Users"
          value={userData.paying_users}
          subtitle={`${formatPercentage(userData.conversion_rate)} conversion rate`}
          icon={
            <FontAwesomeIcon
              icon={faUserGroup}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "users", "paying_users")}
        />
        <StatStripCard
          title="Active Users (7d)"
          value={userData.active_users_7d}
          subtitle="Recently active"
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "users", "active_users_7d")}
        />
        <StatStripCard
          title="Active Users (30d)"
          value={userData.active_users_30d}
          subtitle="Monthly active"
          icon={
            <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
          }
          metadata={getMetadata(metadata, "users", "active_users_30d")}
        />
        <StatStripCard
          title="New Users Today"
          value={userData.new_users_today}
          subtitle="Registered today"
          icon={
            <FontAwesomeIcon
              icon={faArrowUp}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "users", "new_users_today")}
        />
        <StatStripCard
          title="New Users This Month"
          value={userData.new_users_this_month}
          subtitle="This month"
          icon={
            <FontAwesomeIcon
              icon={faArrowUp}
              className="h-5 w-5"
            />
          }
          metadata={getMetadata(metadata, "users", "new_users_this_month")}
        />
      </div>

      {/* User Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userData.regular_users}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {formatPercentage(
                (userData.regular_users / userData.total_users) * 100
              )}{" "}
              of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userData.admins}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {formatPercentage((userData.admins / userData.total_users) * 100)}{" "}
              of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPercentage(userData.conversion_rate)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {userData.paying_users} paying out of {userData.total_users} total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
