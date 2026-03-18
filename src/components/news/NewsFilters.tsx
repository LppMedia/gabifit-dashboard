"use client";

import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEWS_CATEGORIES, NewsCategoryKey } from "@/lib/news-data";

interface NewsFiltersProps {
  activeCategory: NewsCategoryKey | "all" | "bookmarks";
  onChange: (cat: NewsCategoryKey | "all" | "bookmarks") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalBookmarks: number;
  articlesCount: number;
  refreshing: boolean;
  onRefresh: () => void;
  daysSinceRefresh: number;
}

export default function NewsFilters({
  activeCategory,
  onChange,
  searchQuery,
  onSearchChange,
  totalBookmarks,
  articlesCount,
  refreshing,
  onRefresh,
  daysSinceRefresh,
}: NewsFiltersProps) {
  const categories = Object.values(NEWS_CATEGORIES);

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: search + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar artículos o temas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 text-sm rounded-lg",
              "bg-white/[0.04] border border-border/40",
              "text-foreground placeholder:text-muted-foreground/40",
              "focus:outline-none focus:border-border/70 focus:bg-white/[0.06]",
              "transition-all"
            )}
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            "border border-border/40 bg-white/[0.04]",
            "text-muted-foreground hover:text-foreground hover:bg-white/[0.07]",
            "transition-all disabled:opacity-60 disabled:cursor-not-allowed",
            "whitespace-nowrap"
          )}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
          />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Filter pills row */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All pill */}
        <button
          onClick={() => onChange("all")}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            activeCategory === "all"
              ? "bg-white/10 text-foreground border-border/60"
              : "bg-white/[0.03] text-muted-foreground/50 border-border/30 hover:text-muted-foreground hover:bg-white/[0.06]"
          )}
        >
          Todos
        </button>

        {/* Category pills */}
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              activeCategory === cat.key
                ? cn(cat.bg, cat.color, cat.border)
                : "bg-white/[0.03] text-muted-foreground/50 border-border/30 hover:text-muted-foreground hover:bg-white/[0.06]"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}

        {/* Bookmarks pill */}
        <button
          onClick={() => onChange("bookmarks")}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
            activeCategory === "bookmarks"
              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
              : "bg-white/[0.03] text-muted-foreground/50 border-border/30 hover:text-muted-foreground hover:bg-white/[0.06]"
          )}
        >
          <span>🔖</span>
          <span>Guardados</span>
          {totalBookmarks > 0 && (
            <span
              className={cn(
                "ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center",
                "rounded-full text-[10px] font-semibold px-1",
                activeCategory === "bookmarks"
                  ? "bg-sky-400/20 text-sky-300"
                  : "bg-white/10 text-muted-foreground/60"
              )}
            >
              {totalBookmarks}
            </span>
          )}
        </button>
      </div>

      {/* Meta text */}
      <p className="text-[11px] text-muted-foreground/35 pl-0.5">
        {daysSinceRefresh === 0
          ? "Actualizado hoy"
          : daysSinceRefresh === 1
          ? "Actualizado hace 1 día"
          : `Actualizado hace ${daysSinceRefresh} días`}
        {" · "}
        {articlesCount} artículo{articlesCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
