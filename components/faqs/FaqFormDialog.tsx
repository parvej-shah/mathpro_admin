"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FAQ_CATEGORIES,
  type CreateFaqData,
  type FaqCategory,
  type PublicFaq,
} from "@/services/faq.service";

interface FaqFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFaqData) => void;
  faq?: PublicFaq | null;
  isSubmitting?: boolean;
}

const defaultState: CreateFaqData = {
  question: "",
  answer: "",
  category: "courses",
  sort_order: 0,
  is_active: true,
};

function formatCategoryLabel(category: FaqCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function FaqFormDialog({
  isOpen,
  onClose,
  onSubmit,
  faq,
  isSubmitting = false,
}: FaqFormDialogProps) {
  const [form, setForm] = useState<CreateFaqData>(defaultState);

  useEffect(() => {
    if (!isOpen) return;

    if (faq) {
      setForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category ?? "courses",
        sort_order: faq.sort_order ?? 0,
        is_active: faq.is_active,
      });
      return;
    }

    setForm(defaultState);
  }, [faq, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{faq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
          <DialogDescription>
            Manage the shared FAQ content used on the homepage, courses page, and course detail page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="faq-question">Question</Label>
            <Input
              id="faq-question"
              value={form.question}
              onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="Write the FAQ question"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-answer">Answer</Label>
            <Textarea
              id="faq-answer"
              value={form.answer}
              onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
              placeholder="Write the FAQ answer"
              rows={7}
              required
            />
            <p className="text-xs text-muted-foreground">
              Plain text works, and HTML is also supported by the public site renderer.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category ?? "courses"}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as FaqCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faq-sort-order">Sort order</Label>
              <Input
                id="faq-sort-order"
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))
                }
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Published on public pages</p>
              <p className="text-xs text-muted-foreground">
                Turn this off to hide the FAQ without deleting it.
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !form.question.trim() || !form.answer.trim()
              }
            >
              {isSubmitting ? "Saving..." : faq ? "Save changes" : "Create FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
