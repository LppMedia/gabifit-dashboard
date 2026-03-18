"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CalendarPost } from "@/lib/calendar-data";
import { ContentChip } from "./ContentChip";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 3;

interface DayCellProps {
  dateStr:      string;
  isCurrentMonth: boolean;
  isToday:      boolean;
  posts:        CalendarPost[];
  onChipClick:  (post: CalendarPost) => void;
  onDayClick:   (date: string) => void;
}

export function DayCell({
  dateStr, isCurrentMonth, isToday, posts, onChipClick, onDayClick,
}: DayCellProps) {
  const [showAll, setShowAll] = useState(false);
  const day = parseInt(dateStr.split("-")[2], 10);
  const overflow = posts.length - MAX_VISIBLE;
  const visible  = showAll ? posts : posts.slice(0, MAX_VISIBLE);

  return (
    <div
      onClick={() => onDayClick(dateStr)}
      className={cn(
        "group relative flex min-h-[110px] flex-col gap-1.5 rounded-xl border p-2 transition-all duration-150",
        isCurrentMonth
          ? "border-border/30 bg-card/40 hover:border-border/60 hover:bg-card/80"
          : "border-border/15 bg-background/30 opacity-40",
        isToday && "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold leading-none",
            isToday
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
              : isCurrentMonth
              ? "text-foreground/80"
              : "text-muted-foreground/30"
          )}
        >
          {day}
        </span>

        {/* Add button (hover) */}
        {isCurrentMonth && (
          <button
            onClick={(e) => { e.stopPropagation(); onDayClick(dateStr); }}
            className="hidden h-5 w-5 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-white/10 hover:text-muted-foreground group-hover:flex"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Content chips */}
      <div className="flex flex-col gap-1">
        {visible.map((post) => (
          <ContentChip key={post.id} post={post} onClick={onChipClick} />
        ))}

        {/* +N more */}
        {!showAll && overflow > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
            className="w-full rounded-md px-2 py-0.5 text-center text-[10px] font-semibold text-muted-foreground/50 transition-all duration-150 hover:bg-white/5 hover:text-muted-foreground"
          >
            +{overflow} more
          </button>
        )}
        {showAll && posts.length > MAX_VISIBLE && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(false); }}
            className="w-full rounded-md px-2 py-0.5 text-center text-[10px] font-semibold text-muted-foreground/40 transition-all duration-150 hover:bg-white/5 hover:text-muted-foreground"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
