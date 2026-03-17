"use client";

import { Heart, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TOP_POSTS, formatNumber, ContentType } from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

const TYPE_STYLE: Record<ContentType, string> = {
  reel:     "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  carousel: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  post:     "bg-pink-500/15 text-pink-400 border-pink-500/30",
  story:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export function TopPostsTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border/30">
            {["Post", "Type", "Impressions", "Reach", "Likes", "Comments", "Shares", "Saves", "Eng. Rate"].map(
              (h) => (
                <th
                  key={h}
                  className="py-2.5 px-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50 first:pl-0 last:text-right"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {TOP_POSTS.map((post, i) => (
            <tr
              key={post.id}
              className="group border-b border-border/20 transition-colors duration-150 hover:bg-white/[0.025] last:border-0"
            >
              {/* Post preview */}
              <td className="py-3 pl-0 pr-3">
                <div className="flex items-center gap-3">
                  {/* Colour thumbnail */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white/80",
                      post.coverColor
                    )}
                  >
                    #{i + 1}
                  </div>
                  <p className="line-clamp-2 max-w-[220px] text-[12px] leading-relaxed text-foreground/80">
                    {post.caption}
                  </p>
                </div>
              </td>

              {/* Type badge */}
              <td className="py-3 px-3">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] capitalize", TYPE_STYLE[post.type])}
                >
                  {post.type}
                </Badge>
              </td>

              {/* Numeric cols */}
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 font-semibold tabular-nums text-cyan-400">
                  <Eye className="h-3 w-3 shrink-0" />
                  {formatNumber(post.impressions)}
                </span>
              </td>
              <td className="py-3 px-3 tabular-nums text-muted-foreground/70">
                {formatNumber(post.reach)}
              </td>
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 tabular-nums text-pink-400">
                  <Heart className="h-3 w-3 shrink-0" />
                  {formatNumber(post.likes)}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 tabular-nums text-violet-400">
                  <MessageCircle className="h-3 w-3 shrink-0" />
                  {formatNumber(post.comments)}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 tabular-nums text-amber-400">
                  <Share2 className="h-3 w-3 shrink-0" />
                  {formatNumber(post.shares)}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className="flex items-center gap-1 tabular-nums text-emerald-400">
                  <Bookmark className="h-3 w-3 shrink-0" />
                  {formatNumber(post.saves)}
                </span>
              </td>

              {/* Engagement rate */}
              <td className="py-3 pl-3 text-right">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
                    post.engagementRate >= 15
                      ? "bg-emerald-500/15 text-emerald-400"
                      : post.engagementRate >= 10
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "bg-zinc-500/15 text-zinc-400"
                  )}
                >
                  {post.engagementRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
