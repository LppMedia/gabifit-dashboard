"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarDays, LayoutGrid, List, Zap } from "lucide-react";
import { CalendarFilters }  from "@/components/calendar/CalendarFilters";
import { DayCell }          from "@/components/calendar/DayCell";
import { PostDetailModal }  from "@/components/calendar/PostDetailModal";
import {
  CALENDAR_POSTS,
  buildCalendarGrid,
  DAY_NAMES,
  PlatformKey,
  ContentTypeKey,
  CalendarPost,
  PLATFORMS,
  CONTENT_TYPES,
} from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

// ─── Mini list view ──────────────────────────────────────────────────────────
function ListView({
  posts,
  onSelect,
}: {
  posts: CalendarPost[];
  onSelect: (p: CalendarPost) => void;
}) {
  const grouped: Record<string, CalendarPost[]> = {};
  posts.forEach((p) => {
    grouped[p.date] = grouped[p.date] ? [...grouped[p.date], p] : [p];
  });

  const sortedDates = Object.keys(grouped).sort();
  if (!sortedDates.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/40 py-20">
        <CalendarDays className="h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/40">No posts match current filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sortedDates.map((date) => {
        const dateObj = new Date(date + "T12:00:00");
        const label   = dateObj.toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric",
        });
        const isToday = date === new Date().toISOString().slice(0, 10);
        return (
          <div key={date} className="flex gap-4">
            <div
              className={cn(
                "flex w-24 shrink-0 flex-col items-end pt-1 text-right",
                isToday && "text-emerald-400"
              )}
            >
              <span className={cn("text-[13px] font-semibold", isToday ? "text-emerald-400" : "text-foreground/70")}>
                {label.split(",")[0]}
              </span>
              <span className="text-[11px] text-muted-foreground/50">{label.split(",")[1]}</span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 border-l border-border/30 pl-4">
              {grouped[date].map((post) => {
                const platform = PLATFORMS[post.platform];
                const ctype    = CONTENT_TYPES[post.type];
                return (
                  <button
                    key={post.id}
                    onClick={() => onSelect(post)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all duration-150 hover:brightness-110",
                      platform.bg, platform.border
                    )}
                  >
                    <span
                      className="h-full min-h-[36px] w-[3px] shrink-0 rounded-full"
                      style={{ background: platform.dot }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-black uppercase", platform.color)}>
                          {platform.abbr}
                        </span>
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: ctype.dot }}
                        />
                        <span className={cn("text-[10px] font-semibold", ctype.color)}>
                          {ctype.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">{post.format}</span>
                      </div>
                      <p className="truncate text-[12px] text-foreground/75">{post.caption}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground/50">{post.time}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        post.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : post.status === "scheduled"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-zinc-500/15 text-zinc-400"
                      )}
                    >
                      {post.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today      = new Date();
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(3); // default to March 2026 (data month)

  const [activePlatforms, setActivePlatforms] = useState<PlatformKey[]>(
    Object.keys(PLATFORMS) as PlatformKey[]
  );
  const [activeTypes, setActiveTypes] = useState<ContentTypeKey[]>(
    Object.keys(CONTENT_TYPES) as ContentTypeKey[]
  );
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Navigation
  const goToPrev  = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const goToNext  = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  // Filter toggles
  const togglePlatform = useCallback((key: PlatformKey) => {
    setActivePlatforms((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    );
  }, []);

  const toggleType = useCallback((key: ContentTypeKey) => {
    setActiveTypes((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    );
  }, []);

  // Filtered posts for this month
  const filteredPosts = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return CALENDAR_POSTS.filter(
      (p) =>
        p.date.startsWith(prefix) &&
        activePlatforms.includes(p.platform) &&
        activeTypes.includes(p.type)
    );
  }, [year, month, activePlatforms, activeTypes]);

  // Posts keyed by date
  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};
    filteredPosts.forEach((p) => {
      map[p.date] = map[p.date] ? [...map[p.date], p] : [p];
    });
    return map;
  }, [filteredPosts]);

  const grid    = useMemo(() => buildCalendarGrid(year, month), [year, month]);
  const todayStr = today.toISOString().slice(0, 10);

  // Stats for current view
  const scheduled  = filteredPosts.filter((p) => p.status === "scheduled").length;
  const published  = filteredPosts.filter((p) => p.status === "published").length;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Content Calendar
              </h1>
              <p className="text-[12px] text-muted-foreground/60">
                <span className="font-semibold text-emerald-400">{published}</span> published ·{" "}
                <span className="font-semibold text-amber-400">{scheduled}</span> scheduled this month
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-card p-1">
            {([
              { mode: "grid" as const, icon: LayoutGrid },
              { mode: "list" as const, icon: List },
            ]).map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
                  viewMode === mode
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Filters + navigation ─────────────────────────────────────── */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <CalendarFilters
            year={year}
            month={month}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            platforms={activePlatforms}
            togglePlatform={togglePlatform}
            types={activeTypes}
            toggleType={toggleType}
          />
        </div>

        {/* ── Calendar grid ────────────────────────────────────────────── */}
        {viewMode === "grid" ? (
          <div className="flex flex-col gap-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar rows */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((dateStr, i) => {
                if (!dateStr) return <div key={i} />;
                const cellMonth = parseInt(dateStr.split("-")[1], 10);
                const isCurrent = cellMonth === month;
                return (
                  <DayCell
                    key={dateStr}
                    dateStr={dateStr}
                    isCurrentMonth={isCurrent}
                    isToday={dateStr === todayStr}
                    posts={postsByDate[dateStr] ?? []}
                    onChipClick={setSelectedPost}
                    onDayClick={(_date) => {/* future: open new post drawer */}}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <ListView posts={filteredPosts} onSelect={setSelectedPost} />
        )}

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 pb-2 text-[11px] text-muted-foreground/25">
          <Zap className="h-3 w-3" />
          <span>Content calendar · Click any chip to view post details</span>
        </div>
      </div>

      {/* ── Post detail modal ─────────────────────────────────────────── */}
      <PostDetailModal
        post={selectedPost}
        onOpenChange={(open) => { if (!open) setSelectedPost(null); }}
      />
    </>
  );
}
