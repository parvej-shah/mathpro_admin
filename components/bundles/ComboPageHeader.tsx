"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { faBoxesStacked } from "@fortawesome/free-solid-svg-icons";

interface ComboPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ComboPageHeader({
  title,
  description,
  action,
  className,
}: ComboPageHeaderProps) {
  return (
    <PageHeader
      eyebrow="Combos"
      eyebrowIcon={faBoxesStacked}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
