"use client";

import { useState, useEffect } from "react";
import {
  Newspaper,
  BookmarkCheck,
  TrendingUp,
  Zap,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNews } from "@/lib/news-store";
import { useCalendarPosts } from "@/lib/calendar-store";
import NewsFilters from "@/components/news/NewsFilters";
import NewsCard from "@/components/news/NewsCard";
import UseAsIdeaDialog from "@/components/news/UseAsIdeaDialog";
import { NewsCategoryKey, NewsArticle } from "@/lib/news-data";
import { CalendarPost } from "@/lib/calendar-data";

export default function NewsPage() {
  const {
    hydrated,
    activeArticles,
    bookmarkedArticles,
    bookmarks,
    readArticles,
    toggleBookmark,
    markRead,
    refresh,
    refreshing,
    hasNewArticles,
    daysSinceRefresh,
    totalBookmarks,
  } = useNews();

  const { addPost } = useCalendarPosts();

  const [activeCategory, setActiveCategory] = useState<
    NewsCategoryKey | "all" | "bookmarks"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ideaArticle, setIdeaArticle] = useState<NewsArticle | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  // Dismiss success banner after 3 seconds
  useEffect(() => {
    if (!successBanner) return;
    const timer = setTimeout(() => setSuccessBanner(false), 3000);
    return () => clearTimeout(timer);
  }, [successBanner]);

  // Compute filtered articles
  const sourceArticles =
    activeCategory === "bookmarks" ? bookmarkedArticles : activeArticles;

  const filteredArticles = sourceArticles
    .filter((article) => {
      if (activeCategory !== "all" && activeCategory !== "bookmarks") {
        if (article.category !== activeCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = article.title.toLowerCase().includes(q);
        const inTags = article.tags.some((t) => t.toLowerCase().includes(q));
        const inSummary = article.summary.toLowerCase().includes(q);
        if (!inTitle && !inTags && !inSummary) return false;
      }
      return true;
    })
    .sort((a, b) => b.trendScore - a.trendScore);

  const trendingCount = activeArticles.filter((a) => a.trendScore > 80).length;

  const handleSaveIdea = (post: Omit<CalendarPost, "id">) => {
    addPost(post);
    setIdeaArticle(null);
    setSuccessBanner(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Success banner */}
      {successBanner && (
        <div
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2 px-5 py-3 rounded-xl",
            "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400",
            "text-sm font-medium shadow-xl backdrop-blur-sm",
            "animate-in fade-in slide-in-from-top-2 duration-300"
          )}
        >
          ✅ Post agregado al calendario como borrador
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/25">
              <Newspaper className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                News Consolidator
              </h1>
              <p className="text-sm text-muted-foreground/60">
                Artículos curados con resúmenes AI para GabiFit
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border/30 text-[12px] text-muted-foreground/60">
              <Newspaper className="h-3 w-3" />
              <span>{activeArticles.length} artículos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border/30 text-[12px] text-muted-foreground/60">
              <BookmarkCheck className="h-3 w-3 text-amber-400" />
              <span>{totalBookmarks} guardados</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border/30 text-[12px] text-muted-foreground/60">
              <TrendingUp className="h-3 w-3 text-pink-400" />
              <span>{trendingCount} trending</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-border/30 text-[12px] text-muted-foreground/60">
              <Zap className="h-3 w-3 text-violet-400" />
              <span>5 categorías</span>
            </div>
          </div>
        </div>

        {/* New articles banner */}
        {hasNewArticles && (
          <div
            className={cn(
              "flex items-center justify-between gap-3 px-4 py-3 rounded-xl",
              "bg-amber-500/10 border border-amber-500/25"
            )}
          >
            <p className="text-sm text-amber-400">
              ✨ Hay artículos nuevos disponibles — última actualización hace{" "}
              {daysSinceRefresh} días
            </p>
            <button
              onClick={refresh}
              disabled={refreshing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium",
                "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                "hover:bg-amber-500/30 transition-all disabled:opacity-60"
              )}
            >
              <RefreshCw
                className={cn("h-3 w-3", refreshing && "animate-spin")}
              />
              {refreshing ? "Actualizando..." : "Actualizar ahora"}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <NewsFilters
        activeCategory={activeCategory}
        onChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalBookmarks={totalBookmarks}
        articlesCount={filteredArticles.length}
        refreshing={refreshing}
        onRefresh={refresh}
        daysSinceRefresh={daysSinceRefresh}
      />

      {/* Content area */}
      {!hydrated ? (
        /* Loading skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/40 bg-card p-4 flex flex-col gap-3 animate-pulse"
            >
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
                <div className="h-5 w-16 rounded-full bg-white/[0.04]" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-white/[0.06]" />
                <div className="h-4 w-4/5 rounded bg-white/[0.04]" />
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-border/20 p-3 space-y-1.5">
                <div className="h-3 w-full rounded bg-white/[0.04]" />
                <div className="h-3 w-3/4 rounded bg-white/[0.03]" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-white/[0.04]" />
                <div className="h-3 w-5/6 rounded bg-white/[0.03]" />
                <div className="h-3 w-4/5 rounded bg-white/[0.03]" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 w-16 rounded bg-white/[0.04]" />
                ))}
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-white/[0.04]" />
                <div className="h-6 w-28 rounded-md bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-border/30">
            <Newspaper className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <p className="text-foreground/60 font-medium">
              {activeCategory === "bookmarks"
                ? "No tienes artículos guardados"
                : "No se encontraron artículos"}
            </p>
            <p className="text-sm text-muted-foreground/40 mt-1">
              {activeCategory === "bookmarks"
                ? "Guarda artículos con el ícono 🔖 para verlos aquí"
                : searchQuery
                ? `Sin resultados para "${searchQuery}"`
                : "Prueba con otra categoría o actualiza el feed"}
            </p>
          </div>
          {activeCategory !== "bookmarks" && searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        /* Article grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              isBookmarked={bookmarks.includes(article.id)}
              isRead={readArticles.includes(article.id)}
              onBookmark={toggleBookmark}
              onRead={markRead}
              onUseAsIdea={setIdeaArticle}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[11px] text-muted-foreground/25 pt-4 border-t border-border/20">
        News Consolidator · Artículos actualizados semanalmente · Powered by
        GabiFit AI
      </p>

      {/* Dialog */}
      <UseAsIdeaDialog
        article={ideaArticle}
        onClose={() => setIdeaArticle(null)}
        onSave={handleSaveIdea}
      />
    </div>
  );
}
