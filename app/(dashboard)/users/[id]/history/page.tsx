"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";

export default function UserHistoryRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const userId = Number(params?.id);

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    router.replace(`/users/${userId}`);
  }, [router, userId]);

  return (
    <PageContainer className="py-6">
      <Card>
        <CardContent className="py-6">
          {Number.isFinite(userId)
            ? "Redirecting to user profile..."
            : "Invalid user ID."}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
