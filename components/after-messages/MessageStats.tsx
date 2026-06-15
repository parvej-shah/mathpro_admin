"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faBook, faBox } from "@fortawesome/free-solid-svg-icons";
import type { AfterMessage } from "@/services/after-message.service";

interface MessageStatsProps {
  messages: AfterMessage[];
}

export function MessageStats({ messages }: MessageStatsProps) {
  const courseMessages = messages.filter((m) => m.course_ids).length;
  const bundleMessages = messages.filter((m) => m.bundle_ids).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faMessage}
                className="h-6 w-6 text-primary"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Messages
              </p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBook}
                className="h-6 w-6 text-success"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Course Messages
              </p>
              <p className="text-2xl font-bold">{courseMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faBox}
                className="h-6 w-6 text-warning"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Bundle Messages
              </p>
              <p className="text-2xl font-bold">{bundleMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
