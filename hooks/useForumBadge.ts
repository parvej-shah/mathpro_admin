import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { forumService } from "@/services/forum.service";
import { hasNewIssues } from "@/lib/forumBadge";

/**
 * Hook to check if there are new forum issues
 * This is used to show the red badge on the sidebar
 * Badge should not show when user is on the forum page
 */
export function useForumBadge() {
  const pathname = usePathname();
  const isOnForumPage = pathname === "/forum";

  const { data } = useQuery({
    queryKey: ["forum", "issues", "badge-check"],
    queryFn: () => forumService.getAllPendingIssues(),
    // Only refetch when window is focused, not continuously
    refetchOnWindowFocus: false,
    // Don't refetch if user is on the forum page (they'll see updates there)
    enabled: !isOnForumPage,
  });

  const issues = (() => {
    if (!data?.data) return [];
    const responseData = data.data as
      | Array<{ timestamp: number }>
      | { data?: Array<{ timestamp: number }> };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  // Don't show badge if user is on forum page
  const hasNew = !isOnForumPage && hasNewIssues(issues);

  return { hasNew, isLoading: !data };
}
