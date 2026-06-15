"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ classId: string }>;
}

/**
 * This route is deprecated - live classes now use modal system.
 * Redirect to main live-classes page.
 */
export default function LiveClassDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { classId } = use(params);

  useEffect(() => {
    // Redirect to main live-classes page
    // The modal will be opened from the main page if needed
    router.replace("/live-classes");
  }, [router]);

  return null;
}
