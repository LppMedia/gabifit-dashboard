"use client";

import {
  Calendar,
  Clock,
  Hash,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  CalendarClock,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarPost, PLATFORMS, CONTENT_TYPES } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

interface PostDetailModalProps {
  post:          CalendarPost | null;
  onOpenChange:  (open: boolean) => void;
}

const FORMAT_ICONS: Record<string, string> = {
  Reel:    "🎬", Video: "📹", Post: "📷",
  Story:   "⭕", Tweet: "🐦", Carousel: "🃏",
};

export function PostDetailModal({ post, onOpenChange }: PostDetailModalProps) {
  if (!post) return null;

  const platform = PLATFORMS[post.platform];
  const ctype    = CONTENT_TYPES[post.type];

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date(post.date + "T" + post.time));

  return (
    <Dialog open={!!post} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        {/* Gradient accent */}
        <div
          className="absolute left-0 top-0 h-[3px] w-full rounded-t-xl"
          style={{ background: `linear-gradient(to right, ${platform.dot}, ${ctype.dot})` }}
        />

        <DialogHeader className="pt-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>{FORMAT_ICONS[post.format] ?? "📄"}</span>
            <span>{post.format}</span>
            <span className="text-muted-foreground/30">·</span>
            <Badge variant="outline" className={cn("text-[11px]", platform.bg, platform.border, platform.color)}>
              {platform.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Caption */}
          <p className="text-[13px] leading-relaxed text-foreground/85">
            {post.caption}
          </p>

          {/* Hashtags */}
          {post.hashtags && (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-pink-400/80">
              <Hash className="h-3 w-3 shrink-0" />
              {post.hashtags}
            </p>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-white/[0.02] px-3 py-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
              <div>
                <p className="text-[10px] text-muted-foreground/50">Date</p>
                <p className="text-[12px] font-medium text-foreground/80">{formattedDate.split(",")[0] + "," + formattedDate.split(",")[1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-white/[0.02] px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
              <div>
                <p className="text-[10px] text-muted-foreground/50">Time</p>
                <p className="text-[12px] font-medium text-foreground/80">{post.time}</p>
              </div>
            </div>
          </div>

          {/* Type + Status */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("text-[11px]", ctype.bg, "border-current/30", ctype.color)}>
              {ctype.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px]",
                post.status === "published"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : post.status === "scheduled"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
              )}
            >
              <span className="flex items-center gap-1">
                {post.status === "published"
                  ? <CheckCircle2 className="h-3 w-3" />
                  : post.status === "scheduled"
                  ? <CalendarClock className="h-3 w-3" />
                  : <FileText className="h-3 w-3" />}
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            </Badge>
          </div>

          {/* Engagement (only for published) */}
          {post.engagement && (
            <div className="rounded-xl border border-border/30 bg-white/[0.02] p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Performance
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Heart, label: "Likes",    value: post.engagement.likes,    color: "text-pink-400"   },
                  { icon: MessageCircle, label: "Comments", value: post.engagement.comments, color: "text-violet-400" },
                  { icon: Share2, label: "Shares",   value: post.engagement.shares,   color: "text-amber-400"  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <Icon className={cn("h-4 w-4", color)} />
                    <span className={cn("font-display text-[18px] font-bold tabular-nums", color)}>
                      {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-border/20 pt-2 text-center">
                <span className="text-[11px] text-muted-foreground/50">
                  Engagement rate:{" "}
                  <span className="font-semibold text-emerald-400">
                    {(((post.engagement.likes + post.engagement.comments + post.engagement.shares) /
                      (post.engagement.likes * 8)) * 100).toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
