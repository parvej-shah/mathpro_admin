"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faX, faEye } from "@fortawesome/free-solid-svg-icons";
import type { AfterMessage } from "@/services/after-message.service";
import type { CreateAfterMessageData } from "@/services/after-message.service";

interface MessageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAfterMessageData) => void;
  editingMessage: AfterMessage | null;
  courses: Array<{ id: number; title: string }>;
  bundles: Array<{ id: number; title: string }>;
  loading?: boolean;
}

export function MessageForm({
  open,
  onOpenChange,
  onSubmit,
  editingMessage,
  courses,
  bundles,
  loading = false,
}: MessageFormProps) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<string[]>([""]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editingMessage) {
      const courseIds = editingMessage.course_ids
        ? editingMessage.course_ids
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];
      const bundleIds = editingMessage.bundle_ids
        ? editingMessage.bundle_ids
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [];
      setSelectedCourseIds(courseIds);
      setSelectedBundleIds(bundleIds);
      setMessages(
        editingMessage.messages && editingMessage.messages.length > 0
          ? editingMessage.messages
          : [""]
      );
    } else {
      setSelectedCourseIds([]);
      setSelectedBundleIds([]);
      setMessages([""]);
    }
  }, [editingMessage, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCourseIds.length === 0 && selectedBundleIds.length === 0) {
      return;
    }

    if (messages.filter((msg) => msg.trim()).length === 0) {
      return;
    }

    const data: CreateAfterMessageData = {
      type: "afterPurchaseMessage",
      course_ids:
        selectedCourseIds.length > 0 ? selectedCourseIds.join(",") : null,
      bundle_ids:
        selectedBundleIds.length > 0 ? selectedBundleIds.join(",") : null,
      messages: messages.filter((msg) => msg.trim()),
    };

    onSubmit(data);
  };

  const addMessageField = () => {
    setMessages([...messages, ""]);
  };

  const removeMessageField = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages.length > 0 ? newMessages : [""]);
  };

  const updateMessageField = (index: number, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = value;
    setMessages(newMessages);
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowPreview(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMessage
                ? "Edit After-Purchase Message"
                : "Create After-Purchase Message"}
            </DialogTitle>
            <DialogDescription>
              Select courses and/or bundles that will trigger these messages
              after purchase. At least one course or bundle must be selected.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              <Alert>
                <AlertDescription>
                  Select courses and/or bundles that will trigger these messages
                  after purchase. At least one course or bundle must be
                  selected.
                </AlertDescription>
              </Alert>

              {/* Course Selection */}
              <div className="space-y-2">
                <Label>Select Courses</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No courses available
                    </p>
                  ) : (
                    courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => {
                          if (selectedCourseIds.includes(course.id)) {
                            setSelectedCourseIds(
                              selectedCourseIds.filter((id) => id !== course.id)
                            );
                          } else {
                            setSelectedCourseIds([
                              ...selectedCourseIds,
                              course.id,
                            ]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <Label className="cursor-pointer flex-1">
                          {course.title}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {selectedCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCourseIds.map((courseId) => {
                      const course = courses.find((c) => c.id === courseId);
                      return course ? (
                        <Badge
                          key={courseId}
                          variant="secondary"
                          className="gap-1"
                        >
                          {course.title}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCourseIds(
                                selectedCourseIds.filter(
                                  (id) => id !== courseId
                                )
                              )
                            }
                            className="ml-1"
                          >
                            <FontAwesomeIcon icon={faX} className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Bundle Selection */}
              <div className="space-y-2">
                <Label>Select Bundles</Label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {bundles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No bundles available
                    </p>
                  ) : (
                    bundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => {
                          if (selectedBundleIds.includes(bundle.id)) {
                            setSelectedBundleIds(
                              selectedBundleIds.filter((id) => id !== bundle.id)
                            );
                          } else {
                            setSelectedBundleIds([
                              ...selectedBundleIds,
                              bundle.id,
                            ]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBundleIds.includes(bundle.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <Label className="cursor-pointer flex-1">
                          {bundle.title}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {selectedBundleIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBundleIds.map((bundleId) => {
                      const bundle = bundles.find((b) => b.id === bundleId);
                      return bundle ? (
                        <Badge
                          key={bundleId}
                          variant="secondary"
                          className="gap-1"
                        >
                          {bundle.title}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBundleIds(
                                selectedBundleIds.filter(
                                  (id) => id !== bundleId
                                )
                              )
                            }
                            className="ml-1"
                          >
                            <FontAwesomeIcon icon={faX} className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Messages Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Messages</Label>
                </div>
                {messages.map((message, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) =>
                        updateMessageField(index, e.target.value)
                      }
                      placeholder={`Message ${index + 1} (supports emojis)`}
                      className="flex-1"
                      rows={2}
                    />
                    {messages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMessageField(index)}
                      >
                        <FontAwesomeIcon
                          icon={faX}
                          className="h-4 w-4 text-destructive"
                        />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMessageField}
                  className="w-full"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  Add Another Message
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={
                  loading || messages.filter((m) => m.trim()).length === 0
                }
              >
                <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editingMessage
                    ? "Update Message"
                    : "Create Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
            <DialogDescription>
              This is how the messages will appear to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-lg text-primary-foreground">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h3 className="text-xl font-bold">Purchase Successful! 🎉</h3>
                  <p className="text-sm opacity-90">
                    Thank you for your purchase
                  </p>
                </div>
              </div>
            </div>
            {messages.filter((msg) => msg.trim()).length === 0 ? (
              <Alert>
                <AlertDescription>
                  No messages to preview. Add at least one message.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {messages
                  .filter((msg) => msg.trim())
                  .map((message, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed flex-1 whitespace-pre-wrap">
                            {message}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
            {(selectedCourseIds.length > 0 || selectedBundleIds.length > 0) && (
              <div className="pt-4 border-t space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  These messages will be shown for:
                </p>
                {selectedCourseIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Courses:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourseIds.map((courseId) => {
                        const course = courses.find((c) => c.id === courseId);
                        return course ? (
                          <Badge key={courseId} variant="secondary">
                            {course.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {selectedBundleIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Bundles:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBundleIds.map((bundleId) => {
                        const bundle = bundles.find((b) => b.id === bundleId);
                        return bundle ? (
                          <Badge key={bundleId} variant="secondary">
                            {bundle.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
