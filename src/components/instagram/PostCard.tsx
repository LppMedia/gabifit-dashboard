"use client";

import {
  Calendar,
  Clock,
  Hash,
  MoreHorizontal,
  Trash2,
  Edit3,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  InstagramPost,
  PostStatus,
  POST_TYPE_LABELS,
  POST_TYPE_COLORS,
  STATUS_COLORS,
  formatScheduledDate,
} from "@/lib/instagram-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status move map ──────────────────────────────────────────────────────────
const NEXT_STATUS: Partial<Record<PostStatus, PostStatus>> = {
  backlog:   "draft",
  draft:     "scheduled",
  scheduled: "published",
};

const NEXT_LABEL: Partial<Record<PostStatus, string>> = {
  backlog:   "Move to Draft",
  draft:     "Mark as Scheduled",
  scheduled: "Mark as Published",
};

// ─── Component ────────────────────────────────────────────────────────────────
interface PostCardProps {
  post: InstagramPost;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PostStatus) => void;
  onEdit: (post: InstagramPost) => void;
}

export function PostCard({ post, onDelete, onStatusChange, onEdit }: PostCardProps) {
  const nextStatus = NEXT_STATUS[post.status];
  const nextLabel  = NEXT_LABEL[post.status];

  return (
    <Card className="group relative flex flex-col gap-0 overflow-hidden border-border/50 bg-card p-0 transition-all duration-200 hover:border-border/80 hover:shadow-xl hover:shadow-black/25">

      {/* ── Gradient accent banner ────────────────────────────────────── */}
      <div className={cn("h-[3px] w-full bg-gradient-to-r", post.coverColor)} />

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-5">

        {/* Header row: badges + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={cn("rounded-lg text-[11px] font-semibold", POST_TYPE_COLORS[post.type])}
            >
              {POST_TYPE_LABELS[post.type]}
            </Badge>
            <Badge
              variant="outline"
              className={cn("rounded-lg text-[11px] font-medium", STATUS_COLORS[post.status])}
            >
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
          </div>

          {/* Overflow menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent opacity-0 transition-all duration-150 hover:border-border/60 hover:bg-muted group-hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(post)}>
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                Edit post
              </DropdownMenuItem>
              {nextStatus && (
                <DropdownMenuItem onClick={() => onStatusChange(post.id, nextStatus)}>
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  {nextLabel}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Caption */}
        <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/85">
          {post.caption}
        </p>

        {/* Hashtags */}
        {post.hashtags && (
          <p className="flex items-center gap-1.5 truncate text-[11px] font-medium text-pink-400/75">
            <Hash className="h-3 w-3 shrink-0" />
            <span className="truncate">{post.hashtags}</span>
          </p>
        )}

        {/* Footer */}
        <div className="mt-1 flex items-center justify-between border-t border-border/30 pt-3">
          {post.scheduledDate ? (
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Calendar className="h-3 w-3 text-emerald-400" />
              {formatScheduledDate(post.scheduledDate)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
              <Clock className="h-3 w-3" />
              No date set
            </span>
          )}

          {nextStatus && (
            <button
              onClick={() => onStatusChange(post.id, nextStatus)}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/50 transition-colors duration-150 hover:text-foreground/80"
            >
              {nextLabel}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
