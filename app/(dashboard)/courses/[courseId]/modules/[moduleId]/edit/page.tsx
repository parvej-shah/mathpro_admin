"use client";

import { useParams } from "next/navigation";
import { ModuleEditorPage } from "@/components/course/ModuleEditor/ModuleEditorPage";

export default function EditModulePage() {
  const params = useParams();
  const moduleId = params?.moduleId ? parseInt(params.moduleId as string) : null;

  return <ModuleEditorPage moduleId={moduleId} />;
}
