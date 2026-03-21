"use client";

import { useState } from "react";
import {
  Play, Heart, MessageCircle, Eye, Clock,
  Sparkles, Image as ImageIcon, TrendingUp, Zap,
  Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedPost, VideoAnalysis } from "@/lib/scraped-types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30)  return `hace ${days}d`;
  if (days < 365) return `hace ${Math.floor(days / 30)}m`;
  return `hace ${Math.floor(days / 365)}a`;
}

/** 0-10 viral score combining engagement, views, likes */
function viralScore(post: ScrapedPost): number {
  const eng = post.engagementRate ?? 0;
  const views = post.videoViewCount ?? 0;
  const likes = post.likesCount ?? 0;

  let score = 0;
  // Engagement weight (0-4)
  score += eng >= 10 ? 4 : eng >= 8 ? 3 : eng >= 5 ? 2 : eng >= 2 ? 1 : 0;
  // Views weight (0-3)
  score += views >= 1_000_000 ? 3 : views >= 100_000 ? 2 : views >= 10_000 ? 1 : 0;
  // Likes weight (0-3)
  score += likes >= 50_000 ? 3 : likes >= 10_000 ? 2 : likes >= 1_000 ? 1 : 0;

  return Math.min(10, score);
}

function viralScoreColor(score: number): string {
  if (score >= 8) return "text-rose-400";
  if (score >= 5) return "text-amber-400";
  if (score >= 3) return "text-emerald-400";
  return "text-sky-400";
}

function viralScoreBg(score: number): string {
  if (score >= 8) return "bg-rose-500/20 border-rose-500/30";
  if (score >= 5) return "bg-amber-500/20 border-amber-500/30";
  if (score >= 3) return "bg-emerald-500/20 border-emerald-500/30";
  return "bg-sky-500/20 border-sky-500/30";
}

const HOOK_LABEL: Record<string, string> = {
  curiosidad: "🤔 Curiosidad",
  dolor:      "😤 Dolor",
  promesa:    "✨ Promesa",
  identidad:  "👩 Identidad",
  humor:      "😂 Humor",
  sorpresa:   "😲 Sorpresa",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ScrapedVideoCardProps {
  post:          ScrapedPost;
  competitorId:  string;
  rank?:         number;
  analysis?:     VideoAnalysis | null;
  onOpenAnalysis:(post: ScrapedPost, tab?: "video"|"transcript"|"estructura"|"adaptar") => void;
}

type ImgState = "proxy" | "shortcode" | "failed";

function buildProxyUrl(post: ScrapedPost): string {
  const params = new URLSearchParams();
  if (post.displayUrl) params.set("url", post.displayUrl);
  if (post.shortCode)  params.set("shortCode", post.shortCode);
  return `/api/proxy-image?${params.toString()}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ScrapedVideoCard({
  post, competitorId: _competitorId, rank, analysis, onOpenAnalysis,
}: ScrapedVideoCardProps) {
  const [imgState, setImgState] = useState<ImgState>("proxy");
  const [copied, setCopied] = useState(false);

  const engRate = post.engagementRate ?? 0;
  const score   = viralScore(post);
  const hasAnalysis = !!analysis;
  const hasImageSource = !!post.displayUrl || !!post.shortCode;
  const isVideo = post.type === "Video";
  const typeLabel = isVideo ? "Reel" : post.type === "Sidecar" ? "Carrusel" : "Post";

  function copyHook() {
    if (!analysis?.gabifitAdaptation?.suggestedHook) return;
    navigator.clipboard.writeText(analysis.gabifitAdaptation.suggestedHook).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border/40 bg-card hover:border-violet-500/40 transition-all group cursor-pointer flex flex-col"
      onClick={() => onOpenAnalysis(post)}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: "4/5" }}>
        {hasImageSource && imgState !== "failed" ? (
          <img
            src={
              imgState === "proxy"
                ? buildProxyUrl(post)
                : post.shortCode
                ? `/api/proxy-image?shortCode=${post.shortCode}`
                : post.displayUrl
            }
            alt={post.caption.slice(0, 60) || "Post"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgState((p) => p === "proxy" ? "shortcode" : "failed")}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900/60 to-pink-900/60 flex flex-col items-center justify-center gap-2">
            <ImageIcon className="h-10 w-10 text-white/20" />
            <span className="text-[11px] text-white/30 font-medium">{typeLabel}</span>
          </div>
        )}

        {/* Dark gradient at bottom for stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Stats overlaid on thumbnail - bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
          <span className="flex items-center gap-1 text-[13px] font-bold text-white drop-shadow">
            <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
            {fmt(post.likesCount)}
          </span>
          {post.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-[13px] font-bold text-white drop-shadow">
              <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
              {fmt(post.commentsCount)}
            </span>
          )}
          {post.videoViewCount > 0 && (
            <span className="flex items-center gap-1 text-[13px] font-bold text-white drop-shadow">
              <Eye className="h-3.5 w-3.5 text-violet-300" />
              {fmt(post.videoViewCount)}
            </span>
          )}
          {post.durationSec != null && (
            <span className="flex items-center gap-1 text-[11px] text-white/70 ml-auto">
              <Clock className="h-3 w-3" />{post.durationSec}s
            </span>
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Type */}
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm",
            isVideo
              ? "bg-pink-500/30 border-pink-500/40 text-pink-200"
              : post.type === "Sidecar"
              ? "bg-amber-500/30 border-amber-500/40 text-amber-200"
              : "bg-violet-500/30 border-violet-500/40 text-violet-200"
          )}>
            {typeLabel}
          </span>
          {/* Rank medal */}
          {rank !== undefined && rank <= 3 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full border bg-amber-500/30 border-amber-500/50 text-amber-200 backdrop-blur-sm">
              {rank === 1 ? "🥇 #1" : rank === 2 ? "🥈 #2" : "🥉 #3"}
            </span>
          )}
          {/* Viral badge */}
          {(engRate >= 8 || post.videoViewCount >= 100_000) && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-rose-500/30 border-rose-500/50 text-rose-200 backdrop-blur-sm">
              🔥 VIRAL
            </span>
          )}
          {/* HD badge */}
          {post.videoUrl && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-sky-500/25 border-sky-500/40 text-sky-200 backdrop-blur-sm">
              ▶ HD
            </span>
          )}
        </div>

        {/* Viral score - top right */}
        {score > 0 && (
          <div className={cn(
            "absolute top-2 right-2 flex flex-col items-center justify-center h-10 w-10 rounded-xl border backdrop-blur-sm",
            viralScoreBg(score)
          )}>
            <span className={cn("text-[14px] font-black leading-none", viralScoreColor(score))}>
              {score}
            </span>
            <span className="text-[8px] text-white/50 font-medium leading-none mt-0.5">/10</span>
          </div>
        )}

        {/* Play overlay for videos */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* ── Card Body ─────────────────────────────────────────────────────────── */}
      <div className="p-3 flex flex-col gap-3 flex-1">
        {/* Author + date */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[12px] font-semibold text-foreground/90 truncate">
            @{post.ownerUsername}
          </span>
          <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
            {relativeDate(post.timestamp)}
          </span>
        </div>

        {/* Engagement rate bar */}
        {engRate > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", viralScoreColor(score).replace("text-", "bg-"))}
                style={{ width: `${Math.min(100, engRate * 5)}%` }}
              />
            </div>
            <span className={cn("text-[11px] font-bold flex-shrink-0", viralScoreColor(score))}>
              {engRate.toFixed(1)}% eng
            </span>
          </div>
        )}

        {/* ── Analysis quick view (if available) ── */}
        {hasAnalysis ? (
          <div className="flex flex-col gap-2">
            {/* Hook type */}
            {analysis.hook && (
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3 w-3 text-violet-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">
                    Hook · {HOOK_LABEL[analysis.hook.type] ?? analysis.hook.type}
                  </span>
                </div>
                <p className="text-[12px] text-foreground/80 leading-snug line-clamp-2">
                  {analysis.hook.text}
                </p>
              </div>
            )}

            {/* Why it worked — top tactic */}
            {analysis.tactics?.[0] && (
              <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-amber-500/[0.08] border border-amber-500/20">
                <TrendingUp className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-foreground/75 leading-snug line-clamp-2">
                  {analysis.tactics[0]}
                </p>
              </div>
            )}

            {/* GabiFit hook suggestion */}
            {analysis.gabifitAdaptation?.suggestedHook && (
              <div className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 px-2.5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Tu versión GabiFit:
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyHook(); }}
                    className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-[12px] text-foreground/80 italic leading-snug line-clamp-2">
                  &ldquo;{analysis.gabifitAdaptation.suggestedHook}&rdquo;
                </p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-1.5 mt-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); onOpenAnalysis(post, "estructura"); }}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 hover:bg-violet-500/25 transition-all"
              >
                <TrendingUp className="h-3 w-3" /> Estructura
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenAnalysis(post, "adaptar"); }}
                className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all"
              >
                <Sparkles className="h-3 w-3" /> Replicar
              </button>
            </div>
          </div>
        ) : (
          /* No analysis yet */
          <div className="flex flex-col gap-2">
            {/* Caption preview */}
            {post.caption && (
              <p className="text-[12px] text-foreground/60 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenAnalysis(post); }}
              className="flex items-center justify-center gap-1.5 text-[12px] font-semibold py-2 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 hover:bg-violet-500/25 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Analizar con IA
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
