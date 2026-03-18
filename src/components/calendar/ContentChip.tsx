"use client";

import { CalendarPost, PLATFORMS, CONTENT_TYPES } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

interface ContentChipProps {
  post: CalendarPost;
  onClick: (post: CalendarPost) => void;
  compact?: boolean;
}

export function ContentChip({ post, onClick, compact }: ContentChipProps) {
  const platform = PLATFORMS[post.platform];
  const ctype    = CONTENT_TYPES[post.type];
  const isDraft  = post.status === "draft";
  const isPublished = post.status === "published";

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(post); }}
      className={cn(
        "group relative flex w-full items-center gap-1.5 overflow-hidden rounded-md border px-2 py-1 text-left transition-all duration-150",
        "hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]",
        platform.bg,
        platform.border,
        isDraft && "opacity-60 border-dashed",
      )}
    >
      {/* Platform left bar */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-md"
        style={{ background: platform.dot }}
      />

      {/* Platform abbr */}
      <span
        className={cn("ml-1 shrink-0 text-[9px] font-black uppercase tracking-wide", platform.color)}
      >
        {platform.abbr}
      </span>

      {/* Content type dot */}
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: ctype.dot }}
        title={ctype.label}
      />

      {!compact && (
        <span className="flex-1 truncate text-[10px] font-medium leading-none text-foreground/80">
          {post.caption.length > 28 ? post.caption.slice(0, 28) + "…" : post.caption}
        </span>
      )}

      {/* Status dot */}
      {isPublished && (
        <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-80" />
      )}
      {post.status === "scheduled" && (
        <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400 opacity-80" />
      )}
    </button>
  );
}
