"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { BundleForm } from "@/components/bundles/BundleForm";

export default function EditBundlePage() {
  const params = useParams();
  const comboRef = params?.comboid as string | undefined;

  return (
    <PageContainer className="py-6">
      <BundleForm mode="edit" bundleRef={comboRef} />
    </PageContainer>
  );
}
