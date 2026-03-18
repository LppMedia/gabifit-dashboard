"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IgPost } from "@/lib/instagram-profile-store";

interface RealPostsGridProps {
  posts: IgPost[];
  title?: string;
}

type SortKey = "engagement" | "likes" | "date";

const proxyImg = (url: string) =>
  url ? `/api/proxy-image?url=${encodeURIComponent(url)}` : "";

const TYPE_LABELS: Record<string, string> = {
  Video: "Reel",
  Image: "Post",
  Sidecar: "Carrusel",
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  Video: "bg-pink-500/80 text-white",
  Image: "bg-violet-500/80 text-white",
  Sidecar: "bg-amber-500/80 text-white",
};

function engagementColor(rate: number): string {
  if (rate >= 5) return "bg-emerald-500/80 text-white";
  if (rate >= 2) return "bg-sky-500/80 text-white";
  return "bg-zinc-600/80 text-zinc-200";
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "engagement", label: "Engagement" },
  { value: "likes", label: "Likes" },
  { value: "date", label: "Fecha" },
];

export function RealPostsGrid({
  posts,
  title = "Top Posts por Engagement",
}: RealPostsGridProps) {
  const [sort, setSort] = useState<SortKey>("engagement");

  const sorted = [...posts].sort((a, b) => {
    if (sort === "engagement") return b.engagementRate - a.engagementRate;
    if (sort === "likes") return b.likesCount - a.likesCount;
    // date — newest first
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const visible = sorted.slice(0, 12);
  const hasMore = posts.length > 12;

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>

        {/* Sort toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={cn(
                "rounded-md px-3 py-1 text-[11px] font-medium transition-colors",
                sort === value
                  ? "bg-violet-600/80 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((post) => (
          <PostThumbnail key={post.id} post={post} />
        ))}
      </div>

      {/* See more link */}
      {hasMore && (
        <div className="mt-4 flex justify-end">
          <a
            href={`https://www.instagram.com/${posts[0]?.ownerUsername ?? ""}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Ver más en Instagram
          </a>
        </div>
      )}
    </div>
  );
}

function PostThumbnail({ post }: { post: IgPost }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const typeBadgeColor =
    TYPE_BADGE_COLORS[post.type] ?? "bg-zinc-600/80 text-zinc-200";
  const typeLabel = TYPE_LABELS[post.type] ?? post.type;
  const engColor = engagementColor(post.engagementRate);

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block aspect-square rounded-lg overflow-hidden cursor-pointer",
        "border border-border/30 bg-white/[0.04]",
        "transition-transform duration-200 hover:scale-[1.02]"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      {post.displayUrl && !imgError ? (
        <img
          src={proxyImg(post.displayUrl)}
          alt={post.caption.slice(0, 60) || "Post de Instagram"}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback gradient */
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-violet-600/30" />
      )}

      {/* Type badge top-left */}
      <span
        className={cn(
          "absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
          typeBadgeColor
        )}
      >
        {typeLabel}
      </span>

      {/* Bottom overlay: likes, comments, engagement */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 py-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-[11px] text-white/90">
            <span>❤ {fmt(post.likesCount)}</span>
            <span>💬 {fmt(post.commentsCount)}</span>
          </div>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
              engColor
            )}
          >
            {post.engagementRate}%
          </span>
        </div>
      </div>

      {/* Caption hover overlay */}
      {hovered && post.caption && (
        <div className="absolute inset-x-0 top-0 z-10 h-[80px] overflow-hidden bg-black/80 px-2.5 py-2">
          <p className="line-clamp-3 text-[11px] leading-snug text-white/90">
            {post.caption}
          </p>
        </div>
      )}
    </a>
  );
}
