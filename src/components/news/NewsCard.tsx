"use client";

import { Bookmark, Clock, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsArticle, NEWS_CATEGORIES } from "@/lib/news-data";

interface NewsCardProps {
  article: NewsArticle;
  isBookmarked: boolean;
  isRead: boolean;
  onBookmark: (id: string) => void;
  onRead: (id: string) => void;
  onUseAsIdea: (article: NewsArticle) => void;
}

function relativeDate(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "hace 1 día";
  if (diffDays < 30) return `hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "hace 1 mes";
  return `hace ${diffMonths} meses`;
}

export default function NewsCard({
  article,
  isBookmarked,
  isRead,
  onBookmark,
  onRead,
  onUseAsIdea,
}: NewsCardProps) {
  const cat = NEWS_CATEGORIES[article.category];

  const handleCardClick = () => {
    onRead(article.id);
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRead(article.id);
    window.open(article.sourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark(article.id);
  };

  const handleUseAsIdea = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUseAsIdea(article);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-3",
        "transition-all hover:border-border/60 hover:bg-card/80 cursor-pointer",
        isRead && "opacity-70"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
              cat.bg,
              cat.color,
              cat.border
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>

          {/* Trending badge */}
          {article.trendScore > 75 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-pink-500/15 text-pink-400 border border-pink-500/30">
              🔥 Trending
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Source */}
          <span className="text-[11px] text-muted-foreground/40 hidden sm:block truncate max-w-[100px]">
            {article.source}
          </span>

          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            className={cn(
              "p-1 rounded-md transition-colors",
              isBookmarked
                ? "text-amber-400 hover:text-amber-300"
                : "text-muted-foreground/30 hover:text-muted-foreground/60"
            )}
          >
            <Bookmark
              className={cn("h-3.5 w-3.5", isBookmarked && "fill-amber-400")}
            />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-semibold text-foreground/90 leading-snug line-clamp-2">
        {article.title}
      </h3>

      {/* Key insight */}
      <div className="rounded-lg bg-white/[0.03] border border-border/30 px-3 py-2">
        <p className="text-[12px] text-muted-foreground/70 italic leading-relaxed">
          {article.keyInsight}
        </p>
      </div>

      {/* AI Summary */}
      <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-3">
        {article.summary}
      </p>

      {/* Tags */}
      <div className="flex gap-1 flex-wrap">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="bg-white/5 text-muted-foreground/40 text-[10px] px-1.5 py-0.5 rounded border border-border/20"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Left: read time + date */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/40">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTimeMin} min
          </span>
          <span>{relativeDate(article.publishedAt)}</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseAsIdea}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium",
              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              "hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all"
            )}
          >
            <Lightbulb className="h-3 w-3" />
            Usar como idea
          </button>

          <button
            onClick={handleReadMore}
            className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-medium"
          >
            Leer más →
          </button>
        </div>
      </div>
    </div>
  );
}
