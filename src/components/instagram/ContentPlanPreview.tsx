"use client";

import { useState } from "react";
import { CalendarCheck, ChevronDown, ChevronUp, Copy, Check, ShoppingCart, MapPin, Users, Instagram, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/lib/calendar-data";
import type { ContentPlan, ContentPlanPost } from "@/lib/weekly-review-types";

interface Props {
  contentPlan: ContentPlan;
  onConfirm: () => void;
}

const PLATFORM_ICON: Record<string, React.ElementType> = {
  instagram: Instagram,
  tiktok:    Video,
  youtube:   Video,
};

const APUNTA_CONFIG = {
  curso:    { label: "Curso",    icon: ShoppingCart, color: "text-violet-400 bg-violet-500/10 border-violet-500/25" },
  evento:   { label: "Evento",   icon: MapPin,       color: "text-pink-400 bg-pink-500/10 border-pink-500/25"     },
  comunidad:{ label: "Comunidad",icon: Users,        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"     },
};

const ENFOQUE_LABELS: Record<string, string> = {
  ventas_curso:      "💰 Ventas — Curso Online",
  evento_presencial: "🎤 Evento Presencial",
  comunidad:         "❤️ Comunidad",
  educativo:         "📚 Educativo",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); copy(); }}
      className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

function PostCard({ post, index }: { post: ContentPlanPost; index: number }) {
  const [open, setOpen] = useState(index === 0);

  const PlatIcon = PLATFORM_ICON[post.plataforma] ?? FileText;
  const platConfig = PLATFORMS[post.plataforma as keyof typeof PLATFORMS];
  const apunta = post.apuntaA ? (APUNTA_CONFIG[post.apuntaA] ?? null) : null;
  const ApuntaIcon = apunta?.icon;

  const dateLabel = (() => {
    try {
      return new Date(post.fecha + "T12:00:00").toLocaleDateString("es-DO", {
        weekday: "long", day: "numeric", month: "short",
      });
    } catch { return post.fecha; }
  })();

  return (
    <div className="rounded-xl border border-border/30 bg-white/[0.02] overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors text-left"
      >
        {/* Date badge */}
        <div className="shrink-0 flex flex-col items-center justify-center rounded-lg bg-white/[0.04] border border-border/30 px-2.5 py-1.5 min-w-[52px]">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/40">
            {new Date(post.fecha + "T12:00:00").toLocaleDateString("es-DO", { weekday: "short" })}
          </span>
          <span className="text-[16px] font-bold text-foreground tabular-nums leading-tight">
            {new Date(post.fecha + "T12:00:00").getDate()}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: platConfig?.color ?? "#fff", borderColor: `${platConfig?.color ?? "#fff"}40`, backgroundColor: `${platConfig?.color ?? "#fff"}10` }}
            >
              <PlatIcon className="h-2.5 w-2.5" style={{ color: platConfig?.color }} />
              {post.plataforma}
            </span>
            <span className="rounded-full border border-border/30 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60">
              {post.formato}
            </span>
            {apunta && ApuntaIcon && (
              <span className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold", apunta.color)}>
                <ApuntaIcon className="h-2.5 w-2.5" />{apunta.label}
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold text-foreground leading-snug truncate">{post.tema}</p>
          <p className="text-[10px] text-muted-foreground/40">{dateLabel}</p>
        </div>

        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/20">
          {/* Hook */}
          {post.hook && (
            <div className="mt-3 rounded-lg border border-lime-500/25 bg-lime-500/5 px-3 py-2.5 flex items-start gap-2">
              <div className="flex-1">
                <p className="text-[9px] uppercase tracking-wide font-semibold text-lime-400/70 mb-1">Hook de apertura</p>
                <p className="text-[13px] font-semibold text-lime-200/90 italic leading-snug">"{post.hook}"</p>
              </div>
              <CopyButton text={post.hook} />
            </div>
          )}

          {/* Full script */}
          {post.guion && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] uppercase tracking-wide font-semibold text-violet-400/70">Guion completo</p>
                <CopyButton text={post.guion} />
              </div>
              <pre className="text-[11px] text-violet-100/75 leading-relaxed whitespace-pre-wrap font-sans">
                {post.guion}
              </pre>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <div className="rounded-lg border border-border/25 bg-white/[0.02] px-3 py-2 flex items-start gap-2">
              <div className="flex-1">
                <p className="text-[9px] uppercase tracking-wide font-semibold text-muted-foreground/40 mb-1">Caption</p>
                <p className="text-[12px] text-foreground/70 leading-relaxed">{post.caption}</p>
              </div>
              <CopyButton text={post.caption} />
            </div>
          )}

          {/* Production notes */}
          {post.notasProduccion && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wide font-semibold text-amber-400/70 mb-1">Notas de producción</p>
              <p className="text-[11px] text-amber-100/70 leading-relaxed">{post.notasProduccion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContentPlanPreview({ contentPlan, onConfirm }: Props) {
  const allPosts = contentPlan.semanas.flatMap((s) => s.posts);
  const igCount  = allPosts.filter((p) => p.plataforma === "instagram").length;
  const ttCount  = allPosts.filter((p) => p.plataforma === "tiktok").length;
  const ytCount  = allPosts.filter((p) => p.plataforma === "youtube").length;

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500" />
      <div className="p-5 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-lime-400" />
            <div>
              <h3 className="font-display text-[15px] font-semibold">
                Calendario IA — {contentPlan.scope === "month" ? "Este Mes" : "Esta Semana"}
              </h3>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                {allPosts.length} posts con guiones listos · Revisa y confirma para llenar el calendario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {igCount > 0 && <span className="rounded-full border border-pink-500/25 bg-pink-500/8 px-2.5 py-1 text-[10px] font-semibold text-pink-400">IG ×{igCount}</span>}
            {ttCount > 0 && <span className="rounded-full border border-cyan-500/25 bg-cyan-500/8 px-2.5 py-1 text-[10px] font-semibold text-cyan-400">TK ×{ttCount}</span>}
            {ytCount > 0 && <span className="rounded-full border border-red-500/25 bg-red-500/8 px-2.5 py-1 text-[10px] font-semibold text-red-400">YT ×{ytCount}</span>}
          </div>
        </div>

        {/* Week blocks */}
        {contentPlan.semanas.map((semana, si) => (
          <div key={si} className="flex flex-col gap-3">
            {contentPlan.semanas.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/40">Semana {si + 1}</span>
                <div className="flex-1 h-px bg-border/30" />
                {semana.enfoqueSemana && (
                  <span className="text-[10px] font-semibold text-foreground/50">
                    {ENFOQUE_LABELS[semana.enfoqueSemana] ?? semana.enfoqueSemana}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {semana.posts.map((post, pi) => (
                <PostCard key={`${si}-${pi}`} post={post} index={pi} />
              ))}
            </div>
          </div>
        ))}

        {/* Confirm CTA */}
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 py-3 text-[14px] font-semibold text-black shadow-lg shadow-lime-500/25 hover:opacity-90 transition-opacity"
        >
          <CalendarCheck className="h-4 w-4" />
          Confirmar y llenar calendario →
        </button>
      </div>
    </div>
  );
}
