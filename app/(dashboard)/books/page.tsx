"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faBook } from "@fortawesome/free-solid-svg-icons";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { BookList } from "@/components/books/BookList";
import { BookForm } from "@/components/books/BookForm";
import { CourseBookManager } from "@/components/books/CourseBookManager";
import { BookOrders } from "@/components/books/BookOrders";
import type { Book } from "@/services/book.service";

type View = "catalogue" | "course-attachments" | "orders";

const VIEWS: { id: View; label: string }[] = [
  { id: "catalogue", label: "Catalogue" },
  { id: "course-attachments", label: "Course attachments" },
  { id: "orders", label: "Orders" },
];

export default function BooksPage() {
  const [view, setView] = useState<View>("catalogue");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleCreate = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  return (
    <PageContainer className="py-8">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Books"
          eyebrowIcon={faBook}
          title="Book management"
          description="Maintain the book catalogue, attach books to courses, and fulfill orders."
          action={
            view === "catalogue" ? (
              <Button
                size="default"
                onClick={handleCreate}
                className="h-11 rounded-full px-5 font-semibold shadow-sm shadow-primary/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add book
              </Button>
            ) : undefined
          }
        />

        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-5 inline-flex rounded-full border border-border/80 bg-muted/30 p-1 text-sm">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  className={cn(
                    "relative px-4 h-9 rounded-full transition-colors",
                    view === v.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {view === v.id && (
                    <span className="absolute inset-0 rounded-full bg-background shadow-sm" />
                  )}
                  <span className="relative z-10 font-medium">{v.label}</span>
                </button>
              ))}
            </div>

            {view === "catalogue" ? (
              <BookList onCreate={handleCreate} onEdit={handleEdit} />
            ) : view === "course-attachments" ? (
              <CourseBookManager />
            ) : (
              <BookOrders />
            )}
          </CardContent>
        </Card>
      </div>

      <BookForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBook(null);
        }}
        book={editingBook}
      />
    </PageContainer>
  );
}
