"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicFaq } from "@/services/faq.service";

interface FaqTableProps {
  faqs: PublicFaq[];
  loading?: boolean;
  sortable?: boolean;
  isReordering?: boolean;
  onEdit: (faq: PublicFaq) => void;
  onDelete: (faq: PublicFaq) => void;
  onReorder?: (faqs: PublicFaq[]) => Promise<unknown> | unknown;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function FaqTable({
  faqs,
  loading = false,
  sortable = false,
  isReordering = false,
  onEdit,
  onDelete,
  onReorder,
}: FaqTableProps) {
  const [rows, setRows] = useState(faqs);

  useEffect(() => {
    setRows(faqs);
  }, [faqs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const rowIds = useMemo(() => rows.map((faq) => `faq-${faq.id}`), [rows]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!sortable || !onReorder) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((faq) => `faq-${faq.id}` === active.id);
    const newIndex = rows.findIndex((faq) => `faq-${faq.id}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextRows = arrayMove(rows, oldIndex, newIndex).map((faq, index) => ({
      ...faq,
      sort_order: index + 1,
    }));

    const previousRows = rows;
    setRows(nextRows);
    try {
      await onReorder(nextRows);
    } catch {
      setRows(previousRows);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border-border/70">
        <CardContent className="p-0">
          <div className="space-y-3 p-6">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardContent className="p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="w-[86px]">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="hidden lg:table-cell">Answer</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No FAQs found</p>
                      <p className="text-sm text-muted-foreground">
                        Create a shared FAQ to publish it across the public site.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                  {rows.map((faq) => (
                    <SortableFaqRow
                      key={faq.id}
                      faq={faq}
                      sortable={sortable}
                      isReordering={isReordering}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </CardContent>
    </Card>
  );
}

function SortableFaqRow({
  faq,
  sortable,
  isReordering,
  onEdit,
  onDelete,
}: {
  faq: PublicFaq;
  sortable: boolean;
  isReordering: boolean;
  onEdit: (faq: PublicFaq) => void;
  onDelete: (faq: PublicFaq) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `faq-${faq.id}`, disabled: !sortable || isReordering });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "z-10 bg-primary/5 shadow-lg",
        sortable && "transition-colors",
      )}
    >
      <TableCell className="font-semibold text-muted-foreground">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors",
              sortable && !isReordering ? "cursor-grab hover:bg-muted active:cursor-grabbing" : "cursor-default opacity-60",
            )}
            aria-label="Drag to reorder FAQ"
            {...attributes}
            {...listeners}
            disabled={!sortable || isReordering}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span>{faq.sort_order}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-0">
        <TooltipText text={faq.question} className="max-w-[320px] font-medium text-foreground" />
      </TableCell>
      <TableCell className="hidden max-w-0 lg:table-cell">
        <TooltipText
          text={stripHtml(faq.answer)}
          className="max-w-[520px] text-sm text-muted-foreground"
        />
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">
          {faq.category ?? "general"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={faq.is_active ? "default" : "outline"}>
          {faq.is_active ? "Active" : "Hidden"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => onEdit(faq)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(faq)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TooltipText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className={cn("truncate whitespace-nowrap", className)}>{text}</p>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm whitespace-normal break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
