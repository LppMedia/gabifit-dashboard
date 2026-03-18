"use client";

import { Play, Heart, MessageCircle, Eye, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedPost } from "@/lib/scraped-types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days}d`;
  if (days < 365) return `hace ${Math.floor(days / 30)}m`;
  return `hace ${Math.floor(days / 365)}a`;
}

function extractHashtags(caption: string): string[] {
  return (caption.match(/#\w+/g) ?? []).slice(0, 2);
}

function engColor(rate: number): string {
  if (rate >= 5) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
  if (rate >= 2) return "text-amber-400 bg-amber-500/20 border-amber-500/30";
  return "text-sky-400 bg-sky-500/20 border-sky-500/30";
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ScrapedVideoCardProps {
  post: ScrapedPost;
  competitorId: string;
  onOpenAnalysis: (post: ScrapedPost) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ScrapedVideoCard({
  post,
  competitorId: _competitorId,
  onOpenAnalysis,
}: ScrapedVideoCardProps) {
  const hashtags = extractHashtags(post.caption);
  const engRate = post.engagementRate ?? 0;

  const typeLabel =
    post.type === "Video" ? "Reel" : post.type === "Sidecar" ? "Carousel" : "Post";
  const typePillClass =
    post.type === "Video"
      ? "bg-pink-500/20 border-pink-500/30 text-pink-300"
      : post.type === "Sidecar"
      ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
      : "bg-violet-500/20 border-violet-500/30 text-violet-300";

  return (
    <div
      onClick={() => onOpenAnalysis(post)}
      className="rounded-xl overflow-hidden border border-border/40 bg-card hover:border-border/70 transition-all group cursor-pointer"
    >
      {/* ── Thumbnail ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden">
        {post.displayUrl ? (
          <img
            src={post.displayUrl}
            alt={post.caption.slice(0, 60) || "Post de Instagram"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-pink-900/40" />
        )}

        {/* Play button overlay — videos only */}
        {post.type === "Video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="h-4 w-4 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Post type badge — top left */}
        <div className="absolute top-2 left-2">
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
              typePillClass
            )}
          >
            {typeLabel}
          </span>
        </div>

        {/* Engagement rate badge — top right */}
        {engRate > 0 && (
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                engColor(engRate)
              )}
            >
              {engRate.toFixed(1)}%
            </span>
          </div>
        )}

        {/* Bottom metrics overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-0.5 text-[10px] text-white/90">
              <Heart className="h-2.5 w-2.5" />
              {fmt(post.likesCount)}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-white/90">
              <MessageCircle className="h-2.5 w-2.5" />
              {fmt(post.commentsCount)}
            </span>
            {post.videoViewCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-white/90">
                <Eye className="h-2.5 w-2.5" />
                {fmt(post.videoViewCount)}
              </span>
            )}
            {post.durationSec != null && (
              <span className="flex items-center gap-0.5 text-[10px] text-white/90">
                <Clock className="h-2.5 w-2.5" />
                {post.durationSec}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col gap-2">
        {/* Username + date */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            @{post.ownerUsername}
          </span>
          <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
            {relativeDate(post.timestamp)}
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-[13px] text-foreground/80 line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        )}

        {/* Bottom row: hashtags + CTA */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 truncate max-w-[80px]"
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAnalysis(post);
            }}
            className="flex items-center gap-1 text-[12px] text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0 font-medium"
          >
            <Sparkles className="h-3 w-3" />
            Ver análisis
          </button>
        </div>
      </div>
    </div>
  );
}
