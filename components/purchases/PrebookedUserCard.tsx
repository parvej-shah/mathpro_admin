"use client";

import type { KeyboardEvent } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faPhone,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import type { PrebookedUser } from "@/services/purchase.service";

interface PrebookedUserCardProps {
  user: PrebookedUser;
  type: "course" | "bundle";
  onUserClick?: (userId: number) => void;
}

export function PrebookedUserCard({
  user,
  type, // Unused mostly for layout, but can be for context
  onUserClick,
}: PrebookedUserCardProps) {
  const handleClick = () => {
    if (onUserClick && user.user_id) {
      onUserClick(user.user_id);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onUserClick || !user.user_id) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  const prebookedAt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(user.timestamp * 1000));

  const contact = user.email || user.phone || "No contact";
  const contactIcon = user.email ? faEnvelope : faPhone;

  return (
    <div
      role={onUserClick ? "button" : undefined}
      tabIndex={onUserClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group grid min-h-12 gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm transition-all duration-150",
        "md:grid-cols-[minmax(180px,1.2fr)_minmax(150px,1fr)_minmax(130px,0.8fr)_auto] md:items-center",
        onUserClick &&
          "cursor-pointer hover:border-primary/35 hover:bg-primary/5 hover:shadow-sm"
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="h-7 w-7 shrink-0 rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary/15 text-[10px] font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight group-hover:text-primary">
            {user.name || "Unnamed user"}
          </p>
          <p className="text-[11px] text-muted-foreground">{prebookedAt}</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <FontAwesomeIcon icon={contactIcon} className="h-3 w-3 text-primary" />
        <span className="truncate">{contact}</span>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {user.utm ? (
          <Badge
            variant="outline"
            className="h-6 rounded-lg border-primary/20 bg-primary/5 px-2 text-[11px] text-primary space-x-1.5"
          >
            <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
            <span className="truncate">{user.utm}</span>
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No UTM</span>
        )}
      </div>

      {onUserClick && (
        <div className="hidden justify-self-end text-muted-foreground transition-colors group-hover:text-primary md:block">
          <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
