"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { MessageList } from "@/components/after-messages/MessageList";
import { MessageForm } from "@/components/after-messages/MessageForm";
import { MessageStats } from "@/components/after-messages/MessageStats";
import { Button } from "@/components/ui/button";
import {
  useAfterMessages,
  useCreateAfterMessage,
  useUpdateAfterMessage,
  useDeleteAfterMessage,
} from "@/hooks/useAfterMessages";
import { useCourses } from "@/hooks/useAnnouncements";
import { useBundles } from "@/hooks/useBundles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { AfterMessage } from "@/services/after-message.service";
import type { CreateAfterMessageData } from "@/services/after-message.service";

interface Course {
  id: number;
  title: string;
}

interface Bundle {
  id: number;
  title: string;
}

export default function AfterPurchaseMessagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<AfterMessage | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogMessageId, setDeleteDialogMessageId] = useState<
    number | null
  >(null);

  const { data: messagesData, isLoading } = useAfterMessages();
  const { data: coursesData } = useCourses();
  const { data: bundlesData } = useBundles();
  const createMessage = useCreateAfterMessage();
  const updateMessage = useUpdateAfterMessage();
  const deleteMessage = useDeleteAfterMessage();

  const messages: AfterMessage[] = (() => {
    if (!messagesData?.data) return [];
    const responseData = messagesData.data as
      | AfterMessage[]
      | { data?: AfterMessage[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const courses: Course[] = (() => {
    if (!coursesData?.data) return [];
    const responseData = coursesData.data as Course[] | { data?: Course[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const bundles: Bundle[] = (() => {
    if (!bundlesData?.data) return [];
    const responseData = bundlesData.data as Bundle[] | { data?: Bundle[] };
    if (Array.isArray(responseData)) return responseData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    return [];
  })();

  const handleCreate = () => {
    setEditingMessage(null);
    setDialogOpen(true);
  };

  const handleEdit = (message: AfterMessage) => {
    setEditingMessage(message);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateAfterMessageData) => {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({
          id: editingMessage.id,
          data,
        });
      } else {
        await createMessage.mutateAsync(data);
      }
      setDialogOpen(false);
      setEditingMessage(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = (id: number) => {
    setDeleteDialogMessageId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogMessageId) return;
    try {
      await deleteMessage.mutateAsync(deleteDialogMessageId);
      setDeleteDialogOpen(false);
      setDeleteDialogMessageId(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">After-Purchase Messages</h1>
            <p className="text-muted-foreground">
              Manage messages shown to users after they purchase courses or
              bundles
            </p>
          </div>
          <Button onClick={handleCreate}>
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Create Message
          </Button>
        </div>

        {/* Stats */}
        <MessageStats messages={messages} />

        {/* Messages List */}
        <MessageList
          messages={messages}
          courses={courses}
          bundles={bundles}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteDialogOpen={deleteDialogOpen}
          deleteDialogMessageId={deleteDialogMessageId}
          onDeleteDialogOpenChange={setDeleteDialogOpen}
          onConfirmDelete={handleConfirmDelete}
        />

        {/* Create/Edit Form */}
        <MessageForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
          editingMessage={editingMessage}
          courses={courses}
          bundles={bundles}
          loading={createMessage.isPending || updateMessage.isPending}
        />
      </div>
    </PageContainer>
  );
}
