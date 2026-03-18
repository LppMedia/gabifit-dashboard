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
  Mic2,
  Pencil,
  Paperclip,
  StickyNote,
  Film,
  ImageIcon,
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
  onEdit?:       (post: CalendarPost) => void;
}

const FORMAT_ICONS: Record<string, string> = {
  Reel: "🎬", Video: "📹", Short: "⚡", Post: "📷",
  Story: "⭕", Tweet: "🐦", Thread: "🧵", Carousel: "🃏", Article: "📝",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function PostDetailModal({ post, onOpenChange, onEdit }: PostDetailModalProps) {
  if (!post) return null;

  const platform = PLATFORMS[post.platform];
  const ctype    = CONTENT_TYPES[post.type];

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date(post.date + "T" + post.time));

  return (
    <Dialog open={!!post} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        {/* Gradient accent */}
        <div
          className="h-[3px] w-full shrink-0 rounded-t-xl"
          style={{ background: `linear-gradient(to right, ${platform.dot}, ${ctype.dot})` }}
        />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/30 px-5 py-4">
          <DialogHeader className="gap-0">
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <span>{FORMAT_ICONS[post.format] ?? "📄"}</span>
              <span>{post.format}</span>
              <span className="text-muted-foreground/30">·</span>
              <Badge variant="outline" className={cn("text-[11px]", platform.bg, platform.border, platform.color)}>
                {platform.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[11px]",
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
              {post.status === "published" ? "Publicado" : post.status === "scheduled" ? "Programado" : "Borrador"}
            </span>
          </Badge>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">

            {/* Caption */}
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Caption
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/85">
                {post.caption}
              </p>
            </div>

            {/* Hashtags */}
            {post.hashtags && (
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-pink-400/80">
                <Hash className="h-3 w-3 shrink-0" />
                {post.hashtags}
              </p>
            )}

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-white/[0.02] px-3 py-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />
                <div>
                  <p className="text-[10px] text-muted-foreground/50">Fecha</p>
                  <p className="text-[12px] font-medium capitalize text-foreground/80">
                    {formattedDate.split(",").slice(0, 2).join(",")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-white/[0.02] px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                <div>
                  <p className="text-[10px] text-muted-foreground/50">Hora</p>
                  <p className="text-[12px] font-medium text-foreground/80">{post.time}</p>
                </div>
              </div>
            </div>

            {/* Content type */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn("text-[11px]", ctype.bg, "border-current/30", ctype.color)}>
                {ctype.label}
              </Badge>
            </div>

            {/* ── Script / Guion ──────────────────────────────────────── */}
            <div className="rounded-xl border border-border/30 bg-white/[0.015]">
              <div className="flex items-center gap-2 border-b border-border/20 px-4 py-2.5">
                <Mic2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Guion / Script
                </span>
              </div>
              {post.script ? (
                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap px-4 py-3 font-mono text-[11.5px] leading-relaxed text-foreground/75">
                  {post.script}
                </pre>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                  <Mic2 className="h-6 w-6 text-muted-foreground/15" />
                  <p className="text-[11px] text-muted-foreground/30">
                    No hay guion. Haz clic en <strong>Editar</strong> para añadir uno.
                  </p>
                </div>
              )}
            </div>

            {/* ── Media Files ─────────────────────────────────────────── */}
            {post.mediaFiles && post.mediaFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  <Paperclip className="h-3 w-3" /> Archivos adjuntos
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {post.mediaFiles.map((f) => (
                    <div
                      key={f.id}
                      className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/30 bg-white/[0.03]"
                    >
                      {f.type.startsWith("video/") ? (
                        <Film className="h-5 w-5 text-muted-foreground/30" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                      )}
                      {/* Tooltip on hover */}
                      <div className="absolute inset-x-0 bottom-0 hidden bg-black/70 px-1 py-0.5 text-center group-hover:block">
                        <p className="truncate text-[9px] text-white/70">{f.name}</p>
                        <p className="text-[9px] text-white/40">{formatBytes(f.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/30">
                  Las previsualizaciones requieren re-adjuntar los archivos.
                </p>
              </div>
            )}

            {/* ── Notes ───────────────────────────────────────────────── */}
            {post.notes && (
              <div className="flex flex-col gap-1.5 rounded-xl border border-border/30 bg-amber-500/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">
                  <StickyNote className="h-3 w-3" /> Notas de producción
                </p>
                <p className="whitespace-pre-line text-[12px] leading-relaxed text-foreground/60">
                  {post.notes}
                </p>
              </div>
            )}

            {/* ── Engagement ──────────────────────────────────────────── */}
            {post.engagement && (
              <div className="rounded-xl border border-border/30 bg-white/[0.02] p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  Performance
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Heart,         label: "Likes",     value: post.engagement.likes,    color: "text-pink-400"   },
                    { icon: MessageCircle, label: "Comentarios", value: post.engagement.comments, color: "text-violet-400" },
                    { icon: Share2,        label: "Shares",    value: post.engagement.shares,   color: "text-amber-400"  },
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
        </div>

        {/* Footer */}
        {onEdit && (
          <div className="flex items-center justify-end border-t border-border/30 px-5 py-3">
            <button
              type="button"
              onClick={() => { onOpenChange(false); onEdit(post); }}
              className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-4 py-2 text-[12px] font-semibold text-foreground/70 ring-1 ring-border/40 transition-all hover:bg-white/[0.08] hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar post
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
