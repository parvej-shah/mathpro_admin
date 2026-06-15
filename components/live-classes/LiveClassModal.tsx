"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LiveClassForm } from "./LiveClassForm";

interface LiveClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId?: number | null;
  onSuccess?: () => void;
}

export function LiveClassModal({
  open,
  onOpenChange,
  classId,
  onSuccess,
}: LiveClassModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl">
            {classId ? "Edit Live Class" : "Create New Live Class"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6">
          <div className="py-6">
            <LiveClassForm classId={classId} onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
