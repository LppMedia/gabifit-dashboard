"use client";

import { Heart, MessageCircle, Eye, ExternalLink, Play, Images, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IgPost } from "@/lib/instagram-profile-store";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d}d`;
  if (d < 365) return `hace ${Math.floor(d / 30)}m`;
  return `hace ${Math.floor(d / 365)}a`;
}

const TYPE_STYLE = {
  Video:   { cls: "bg-pink-500/15 text-pink-400 border-pink-500/30",     icon: Play,   label: "Reel"      },
  Sidecar: { cls: "bg-violet-500/15 text-violet-400 border-violet-500/30", icon: Images, label: "Carrusel"  },
  Image:   { cls: "bg-sky-500/15 text-sky-400 border-sky-500/30",        icon: Image,  label: "Post"      },
} as const;

function engColor(rate: number) {
  if (rate >= 5)  return "bg-emerald-500/15 text-emerald-400";
  if (rate >= 2)  return "bg-amber-500/15 text-amber-400";
  return "bg-zinc-500/15 text-zinc-400";
}

interface Props {
  posts: IgPost[];
}

export function TopPostsTable({ posts }: Props) {
  if (!posts.length) return null;

  // Sort by engagement rate desc, take top 10
  const sorted = [...posts]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border/30">
            {["Post", "Tipo", "Likes", "Comentarios", "Vistas", "Eng. Rate", "Fecha"].map((h) => (
              <th
                key={h}
                className="py-2.5 px-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50 first:pl-0 last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((post, i) => {
            const ts = TYPE_STYLE[post.type] ?? TYPE_STYLE.Image;
            const TypeIcon = ts.icon;

            return (
              <tr
                key={post.id}
                className="group border-b border-border/20 transition-colors duration-150 hover:bg-white/[0.025] last:border-0"
              >
                {/* Thumbnail + caption */}
                <td className="py-3 pl-0 pr-3">
                  <div className="flex items-center gap-3">
                    {/* Rank + thumbnail */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-violet-900/40 to-pink-900/40">
                      {post.displayUrl ? (
                        <img
                          src={`/api/proxy-image?url=${encodeURIComponent(post.displayUrl)}`}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/60 bg-black/30">
                        #{i + 1}
                      </span>
                    </div>
                    <p className="line-clamp-2 max-w-[200px] text-[12px] leading-relaxed text-foreground/80">
                      {post.caption || "Sin caption"}
                    </p>
                  </div>
                </td>

                {/* Type */}
                <td className="py-3 px-3">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", ts.cls)}>
                    <TypeIcon className="h-2.5 w-2.5" />
                    {ts.label}
                  </span>
                </td>

                {/* Likes */}
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1 tabular-nums text-pink-400 font-medium">
                    <Heart className="h-3 w-3 shrink-0" />
                    {fmt(post.likesCount)}
                  </span>
                </td>

                {/* Comments */}
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1 tabular-nums text-violet-400 font-medium">
                    <MessageCircle className="h-3 w-3 shrink-0" />
                    {fmt(post.commentsCount)}
                  </span>
                </td>

                {/* Views */}
                <td className="py-3 px-3">
                  {post.videoViewCount > 0 ? (
                    <span className="flex items-center gap-1 tabular-nums text-cyan-400 font-medium">
                      <Eye className="h-3 w-3 shrink-0" />
                      {fmt(post.videoViewCount)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>

                {/* Engagement rate */}
                <td className="py-3 px-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums", engColor(post.engagementRate))}>
                    {post.engagementRate.toFixed(2)}%
                  </span>
                </td>

                {/* Date + link */}
                <td className="py-3 pl-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                      {relDate(post.timestamp)}
                    </span>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-0.5 text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      IG
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
