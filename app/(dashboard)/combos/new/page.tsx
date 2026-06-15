"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { BundleForm } from "@/components/bundles/BundleForm";

export default function NewBundlePage() {
  return (
    <PageContainer className="py-6">
      <BundleForm mode="create" />
    </PageContainer>
  );
}
