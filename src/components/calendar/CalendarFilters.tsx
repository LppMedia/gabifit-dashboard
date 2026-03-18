"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PLATFORMS,
  CONTENT_TYPES,
  PlatformKey,
  ContentTypeKey,
  MONTH_NAMES,
} from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
  year:          number;
  month:         number;
  onPrev:        () => void;
  onNext:        () => void;
  onToday:       () => void;
  platforms:     PlatformKey[];
  togglePlatform:(key: PlatformKey) => void;
  types:         ContentTypeKey[];
  toggleType:    (key: ContentTypeKey) => void;
}

export function CalendarFilters({
  year, month, onPrev, onNext, onToday,
  platforms, togglePlatform,
  types, toggleType,
}: CalendarFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* ── Top row: navigation + Today ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-card text-muted-foreground transition-all duration-150 hover:border-border/70 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-display min-w-[180px] text-center text-lg font-bold text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={onNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-card text-muted-foreground transition-all duration-150 hover:border-border/70 hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={onToday}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-400 transition-all duration-150 hover:border-emerald-500/60 hover:bg-emerald-500/20"
        >
          Today
        </button>
      </div>

      {/* ── Filter rows ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Platform
          </span>
          {(Object.values(PLATFORMS)).map((p) => {
            const active = platforms.includes(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150",
                  active
                    ? cn(p.bg, p.border, p.color)
                    : "border-border/30 bg-transparent text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border/30" />

        {/* Content type filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
            Tipo
          </span>
          {(Object.values(CONTENT_TYPES)).map((t) => {
            const active = types.includes(t.key);
            return (
              <button
                key={t.key}
                onClick={() => toggleType(t.key)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150",
                  active
                    ? cn(t.bg, "border-current/30", t.color)
                    : "border-border/30 bg-transparent text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground/40">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-muted-foreground/30" style={{ borderStyle: "dashed" }} />
          Draft
        </span>
      </div>
    </div>
  );
}
