import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { threadService } from "@/services/thread.service";
import { hasNewThreads } from "@/lib/threadBadge";

/**
 * Hook to check if there are new threads
 * This is used to show the red badge on the sidebar
 * Badge should not show when user is on the threads page
 */
export function useThreadBadge() {
  const pathname = usePathname();
  const isOnThreadsPage =
    pathname === "/threads" || pathname.startsWith("/threads/");

  const { data } = useQuery({
    queryKey: ["threads", "badge-check"],
    queryFn: () => threadService.getAllThreads(10, 0),
    // Only refetch when window is focused, not continuously
    refetchOnWindowFocus: false,
    // Don't refetch if user is on the threads page (they'll see updates there)
    enabled: !isOnThreadsPage,
  });

  const threads = (() => {
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

  // Don't show badge if user is on threads page
  const hasNew = !isOnThreadsPage && hasNewThreads(threads);

  return { hasNew, isLoading: !data };
}

