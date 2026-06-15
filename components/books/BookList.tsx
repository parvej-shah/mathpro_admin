"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useBooks, useDeleteBook, useUpdateBook } from "@/hooks/useBooks";
import type { Book } from "@/services/book.service";

interface BookListProps {
  onCreate: () => void;
  onEdit: (book: Book) => void;
}

export function BookList({ onCreate, onEdit }: BookListProps) {
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: books, isLoading } = useBooks();
  const deleteBook = useDeleteBook();
  const updateBook = useUpdateBook();

  const filtered = useMemo(() => {
    const list = books ?? [];
    if (!search) return list;
    const term = search.toLowerCase();
    return list.filter(
      (b) =>
        b.title?.toLowerCase().includes(term) ||
        (b.tags ?? []).some((t) => t.toLowerCase().includes(term)) ||
        (b.class_levels ?? []).some((c) => c.toLowerCase().includes(term))
    );
  }, [books, search]);

  const handleDelete = () => {
    if (selectedBook) {
      deleteBook.mutate(selectedBook.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedBook(null);
        },
      });
    }
  };

  const toggleActive = (book: Book, value: boolean) => {
    updateBook.mutate({
      id: book.id,
      data: {
        title: book.title,
        image_url: book.image_url ?? "",
        description: book.description ?? "",
        class_levels: book.class_levels ?? [],
        tags: book.tags ?? [],
        price: book.price,
        is_active: value,
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, tag, or class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full border-border/70 bg-background/60 pl-9 pr-4"
          />
        </div>
        <Button
          type="button"
          onClick={onCreate}
          className="h-10 rounded-full px-5 font-semibold shadow-sm shadow-primary/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add book
        </Button>
      </div>

      {isLoading ? (
        <BookGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              No books yet
            </p>
            <p className="text-sm text-muted-foreground">
              Add your first book to the catalogue.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => onEdit(book)}
              onDelete={() => {
                setSelectedBook(book);
                setShowDeleteDialog(true);
              }}
              onToggleActive={(value) => toggleActive(book, value)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {selectedBook?.title}
              </span>{" "}
              from the catalogue and detach it from any courses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete book
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BookCard({
  book,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  book: Book;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (value: boolean) => void;
}) {
  return (
    <Card className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="relative h-40 w-full bg-muted/40">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-10 w-10" />
          </div>
        )}
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
            book.is_active
              ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400"
              : "bg-muted text-muted-foreground ring-1 ring-border/70"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              book.is_active ? "bg-emerald-500" : "bg-muted-foreground/60"
            )}
          />
          {book.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
            {book.title}
          </h3>
          {book.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {book.description}
            </p>
          ) : null}
        </div>

        {(book.class_levels?.length || book.tags?.length) ? (
          <div className="flex flex-wrap gap-1.5">
            {(book.class_levels ?? []).map((level) => (
              <span
                key={level}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
              >
                {level}
              </span>
            ))}
            {(book.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3">
          <p className="text-lg font-bold tracking-tight text-foreground">
            ৳{Number(book.price ?? 0).toLocaleString("en-US")}
          </p>
          <div className="flex items-center gap-1">
            <Switch
              checked={book.is_active}
              onCheckedChange={onToggleActive}
              aria-label="Toggle active"
            />
            <IconAction onClick={onEdit} label="Edit">
              <Pencil className="h-4 w-4" />
            </IconAction>
            <IconAction onClick={onDelete} label="Delete" className="hover:text-destructive!">
              <Trash2 className="h-4 w-4" />
            </IconAction>
          </div>
        </div>
      </div>
    </Card>
  );
}

function IconAction({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function BookGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card p-0"
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
