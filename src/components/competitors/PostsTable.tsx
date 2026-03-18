"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Eye, Heart, MessageCircle, Share2, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Competitor,
  CompetitorPost,
  PLATFORM_META,
  formatViews,
  formatEngagement,
  getEngagementColor,
} from "@/lib/competitors-data";

type SortKey = "engagementRate" | "views" | "likes" | "publishedAt";
type SortDir = "asc" | "desc";

type Platform = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";

const POST_TYPE_LABELS: Record<string, string> = {
  reel: "Reel",
  video: "Video",
  short: "Short",
  carousel: "Carrusel",
  post: "Post",
  story: "Story",
  tweet: "Tweet",
};

const POST_TYPE_COLORS: Record<string, string> = {
  reel: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  video: "text-red-400 bg-red-500/10 border-red-500/20",
  short: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  carousel: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  post: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  story: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  tweet: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "hoy";
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

interface PostsTableProps {
  posts: CompetitorPost[];
  competitors: Competitor[];
  onAnalyze: (post: CompetitorPost, competitor: Competitor) => void;
}

export function PostsTable({ posts, competitors, onAnalyze }: PostsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("engagementRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [filterCompetitor, setFilterCompetitor] = useState<string>("all");

  const competitorMap = useMemo(
    () => new Map(competitors.map((c) => [c.id, c])),
    [competitors]
  );

  const availablePlatforms = useMemo(() => {
    const set = new Set<Platform>();
    posts.forEach((p) => set.add(p.platform));
    return Array.from(set);
  }, [posts]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filteredSorted = useMemo(() => {
    let result = posts.filter((p) => {
      if (filterPlatform !== "all" && p.platform !== filterPlatform)
        return false;
      if (filterCompetitor !== "all" && p.competitorId !== filterCompetitor)
        return false;
      return true;
    });

    result = result.sort((a, b) => {
      let valA: number;
      let valB: number;
      if (sortKey === "engagementRate") {
        valA = a.engagementRate;
        valB = b.engagementRate;
      } else if (sortKey === "views") {
        valA = a.metrics.views ?? 0;
        valB = b.metrics.views ?? 0;
      } else if (sortKey === "likes") {
        valA = a.metrics.likes;
        valB = b.metrics.likes;
      } else {
        valA = new Date(a.publishedAt).getTime();
        valB = new Date(b.publishedAt).getTime();
      }
      return sortDir === "desc" ? valB - valA : valA - valB;
    });

    return result.slice(0, 20);
  }, [posts, filterPlatform, filterCompetitor, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronDown className="h-3 w-3 text-muted-foreground/30" />;
    return sortDir === "desc" ? (
      <ChevronDown className="h-3 w-3 text-amber-400" />
    ) : (
      <ChevronUp className="h-3 w-3 text-amber-400" />
    );
  }

  function SortableHeader({
    col,
    children,
    className,
  }: {
    col: SortKey;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <th
        className={cn(
          "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
          className
        )}
        onClick={() => toggleSort(col)}
      >
        <div className="flex items-center gap-1">
          {children}
          <SortIcon col={col} />
        </div>
      </th>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Filter row */}
      <div className="px-4 py-3 border-b border-border/30 flex flex-wrap items-center gap-3">
        {/* Platform filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterPlatform("all")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
              filterPlatform === "all"
                ? "bg-white/10 border-white/20 text-foreground"
                : "bg-transparent border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Todas
          </button>
          {availablePlatforms.map((p) => {
            const meta = PLATFORM_META[p];
            const active = filterPlatform === p;
            return (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                  active
                    ? cn(meta.bg, meta.border, meta.color)
                    : "bg-transparent border-border/30 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: meta.dot }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Competitor filter */}
        <div className="ml-auto">
          <select
            value={filterCompetitor}
            onChange={(e) => setFilterCompetitor(e.target.value)}
            className="bg-background border border-border/40 text-muted-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/40 focus:text-foreground"
          >
            <option value="all">Todos los competidores</option>
            {competitors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20 bg-white/[0.02]">
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-8">
                #
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Competidor
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Plataforma
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Post
              </th>
              <SortableHeader col="views">Vistas</SortableHeader>
              <SortableHeader col="likes">Likes</SortableHeader>
              <SortableHeader col="engagementRate">Eng.</SortableHeader>
              <SortableHeader col="publishedAt">Fecha</SortableHeader>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Análisis
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((post, index) => {
              const competitor = competitorMap.get(post.competitorId);
              if (!competitor) return null;
              const platformMeta = PLATFORM_META[post.platform];
              const engColor = getEngagementColor(post.engagementRate);

              return (
                <tr
                  key={post.id}
                  className="border-b border-border/10 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Rank */}
                  <td className="px-3 py-3 text-xs text-muted-foreground font-mono">
                    {index + 1}
                  </td>

                  {/* Competitor */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0",
                          competitor.avatarGradient
                        )}
                      >
                        {competitor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate max-w-[90px]">
                          {competitor.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                          {competitor.handle}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap",
                        platformMeta.bg,
                        platformMeta.border,
                        platformMeta.color
                      )}
                    >
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: platformMeta.dot }}
                      />
                      {platformMeta.label}
                    </span>
                  </td>

                  {/* Post preview */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 min-w-[180px] max-w-[240px]">
                      {/* Thumbnail */}
                      <div
                        className={cn(
                          "h-9 w-9 rounded-lg bg-gradient-to-br flex-shrink-0",
                          post.coverGradient
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] text-foreground line-clamp-1 leading-tight mb-0.5">
                          {post.caption}
                        </p>
                        <span
                          className={cn(
                            "inline-block px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide",
                            POST_TYPE_COLORS[post.postType] ??
                              "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
                          )}
                        >
                          {POST_TYPE_LABELS[post.postType] ?? post.postType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Views */}
                  <td className="px-3 py-3">
                    {post.metrics.views !== undefined ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Eye className="h-3 w-3" />
                        {formatViews(post.metrics.views)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </td>

                  {/* Likes | Comments | Shares */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-2.5 w-2.5" />
                        {formatViews(post.metrics.likes)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="h-2.5 w-2.5" />
                        {formatViews(post.metrics.comments)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Share2 className="h-2.5 w-2.5" />
                        {formatViews(post.metrics.shares)}
                      </span>
                    </div>
                  </td>

                  {/* Engagement */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border",
                        engColor,
                        post.engagementRate >= 15
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : post.engagementRate >= 8
                          ? "bg-cyan-500/10 border-cyan-500/20"
                          : post.engagementRate >= 5
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-zinc-500/10 border-zinc-500/20"
                      )}
                    >
                      {formatEngagement(post.engagementRate)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDate(post.publishedAt)}
                  </td>

                  {/* Analyze button */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onAnalyze(post, competitor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all whitespace-nowrap"
                    >
                      <BarChart2 className="h-3 w-3" />
                      Ver análisis
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSorted.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No hay posts para los filtros seleccionados
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">
            {filteredSorted.length}
          </span>{" "}
          posts analizados de{" "}
          <span className="text-foreground font-medium">
            {competitors.length}
          </span>{" "}
          competidores
        </p>
        {posts.length > 20 && (
          <p className="text-[11px] text-muted-foreground">
            Mostrando top 20
          </p>
        )}
      </div>
    </div>
  );
}
