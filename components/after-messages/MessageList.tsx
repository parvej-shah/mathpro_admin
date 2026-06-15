"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faBook,
  faBox,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import type { AfterMessage } from "@/services/after-message.service";

interface MessageListProps {
  messages: AfterMessage[];
  courses: Array<{ id: number; title: string }>;
  bundles: Array<{ id: number; title: string }>;
  loading: boolean;
  onEdit: (message: AfterMessage) => void;
  onDelete: (id: number) => void;
  deleteDialogOpen: boolean;
  deleteDialogMessageId: number | null;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

export function MessageList({
  messages,
  courses,
  bundles,
  loading,
  onEdit,
  onDelete,
  deleteDialogOpen,
  deleteDialogMessageId,
  onDeleteDialogOpenChange,
  onConfirmDelete,
}: MessageListProps) {
  const getCourseNames = (courseIds: string | null | undefined): string => {
    if (!courseIds) return "None";
    const ids = courseIds.split(",").map((id) => parseInt(id.trim(), 10));
    const names = courses.filter((c) => ids.includes(c.id)).map((c) => c.title);
    return names.length > 0 ? names.join(", ") : `${ids.length} course(s)`;
  };

  const getBundleNames = (bundleIds: string | null | undefined): string => {
    if (!bundleIds) return "None";
    const ids = bundleIds.split(",").map((id) => parseInt(id.trim(), 10));
    const names = bundles.filter((b) => ids.includes(b.id)).map((b) => b.title);
    return names.length > 0 ? names.join(", ") : `${ids.length} bundle(s)`;
  };

  const getMessagePreview = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
      const candidate = (value as { text?: unknown; message?: unknown });
      if (typeof candidate.text === "string") return candidate.text;
      if (typeof candidate.message === "string") return candidate.message;
      try {
        return JSON.stringify(value);
      } catch {
        return "";
      }
    }

    return String(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FontAwesomeIcon
            icon={faMessage}
            className="h-16 w-16 text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground text-lg">
            No messages found. Create your first after-purchase message!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Bundles</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <Badge variant="secondary">#{message.id}</Badge>
                  </TableCell>
                  <TableCell>
                    {message.course_ids ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="gap-1">
                          <FontAwesomeIcon icon={faBook} className="h-3 w-3" />
                          {message.course_ids.split(",").length} course(s)
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {getCourseNames(message.course_ids)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {message.bundle_ids ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className="gap-1">
                          <FontAwesomeIcon icon={faBox} className="h-3 w-3" />
                          {message.bundle_ids.split(",").length} bundle(s)
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {getBundleNames(message.bundle_ids)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {(() => {
                        const messageItems = Array.isArray(message.messages)
                          ? message.messages
                          : [];
                        const firstMessagePreview = getMessagePreview(
                          messageItems[0]
                        );

                        return (
                          <>
                            <Badge variant="secondary">
                              {messageItems.length} message(s)
                            </Badge>
                            {firstMessagePreview && (
                              <p className="text-xs text-muted-foreground max-w-[300px] truncate">
                                {firstMessagePreview.substring(0, 50)}
                                {firstMessagePreview.length > 50 ? "..." : ""}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.created_at && (
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(message.created_at), "PPP")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "p")}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(message)}
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(message.id)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="h-4 w-4 text-destructive"
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
