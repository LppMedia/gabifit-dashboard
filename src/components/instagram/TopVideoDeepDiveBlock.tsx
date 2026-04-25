"use client";

import { useState } from "react";
import { Eye, Heart, MessageCircle, ChevronDown, ChevronUp, Zap, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopVideoDeepDive } from "@/lib/weekly-review-types";

interface Props {
  video: TopVideoDeepDive;
  rank: number;
}

const RANK_STYLES = [
  "bg-amber-400 text-black",
  "bg-zinc-300 text-black",
  "bg-orange-700 text-white",
];

const ANGLE_COLORS = [
  "border-violet-500/30 bg-violet-500/5 text-violet-300",
  "border-pink-500/30 bg-pink-500/5 text-pink-300",
  "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
  "border-lime-500/30 bg-lime-500/5 text-lime-300",
  "border-amber-500/30 bg-amber-500/5 text-amber-300",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      className="ml-auto shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
}

export function TopVideoDeepDiveBlock({ video, rank }: Props) {
  const [estruturaOpen, setEstructuraOpen] = useState(false);
  const [angulosOpen, setAngulosOpen]      = useState(false);

  const proxyThumb = video.thumbnailUrl
    ? `/api/proxy-image?url=${encodeURIComponent(video.thumbnailUrl)}`
    : null;

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Rank accent bar */}
      <div className={cn("h-[3px]",
        rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-300" :
        rank === 2 ? "bg-gradient-to-r from-zinc-300 to-zinc-400" :
                    "bg-gradient-to-r from-orange-700 to-orange-500"
      )} />

      <div className="p-5 flex flex-col gap-4">
        {/* ── Header row: thumbnail + metrics + diagnosis ─────────────── */}
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-24 shrink-0 rounded-xl overflow-hidden aspect-[9/16] bg-gradient-to-br from-purple-900/30 to-pink-900/20">
            {proxyThumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proxyThumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute top-1.5 left-1.5">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", RANK_STYLES[rank - 1] ?? RANK_STYLES[2])}>
                #{rank}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1.5 pt-4 text-[10px] text-white">
              {video.videoViewCount > 0 && (
                <span className="flex items-center gap-0.5 text-cyan-300">
                  <Eye className="h-2.5 w-2.5" />{video.videoViewCount.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-pink-300">
                <Heart className="h-2.5 w-2.5" />{video.likesCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5 text-white/50">
                <MessageCircle className="h-2.5 w-2.5" />{video.commentsCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right: diagnosis + caption */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold text-lime-400/70 mb-0.5">Por qué funcionó</p>
              <p className="text-[12px] text-foreground/80 leading-relaxed">{video.porQueFuncionó}</p>
            </div>
            {video.caption && (
              <div className="rounded-lg border border-border/30 bg-white/[0.02] px-2.5 py-2">
                <p className="text-[9px] uppercase tracking-wide font-semibold text-muted-foreground/40 mb-0.5">Contenido original</p>
                <p className="text-[11px] text-foreground/60 line-clamp-3 leading-relaxed">{video.caption}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Content structure (expandable) ──────────────────────────── */}
        {video.estructura && (
          <div className="rounded-xl border border-border/30 bg-white/[0.015] overflow-hidden">
            <button
              onClick={() => setEstructuraOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Estructura del contenido
              </span>
              {estruturaOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground/40" />}
            </button>

            {estruturaOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/20">
                {[
                  { label: "Hook (apertura)", value: video.estructura.hook,          color: "text-lime-400" },
                  { label: "Problema",        value: video.estructura.problema,      color: "text-red-400"  },
                  { label: "Solución",        value: video.estructura.solucion,      color: "text-emerald-400" },
                  { label: "CTA",             value: video.estructura.cta,           color: "text-violet-400" },
                  { label: "Ritmo",           value: video.estructura.ritmo,         color: "text-cyan-400" },
                  { label: "Por qué funciona",value: video.estructura.porQueFunciona,color: "text-amber-400" },
                ].map(({ label, value, color }) => value && (
                  <div key={label} className="flex flex-col gap-0.5 pt-2 first:pt-0">
                    <p className={cn("text-[9px] uppercase tracking-wide font-semibold", color, "opacity-70")}>{label}</p>
                    <p className="text-[12px] text-foreground/75 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 5 angle variations (expandable) ─────────────────────────── */}
        {video.angulos?.length > 0 && (
          <div className="rounded-xl border border-border/30 bg-white/[0.015] overflow-hidden">
            <button
              onClick={() => setAngulosOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">5</span>
                Ángulos para replicar
              </span>
              {angulosOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground/40" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground/40" />}
            </button>

            {angulosOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/20 pt-3">
                {video.angulos.map((angle, i) => (
                  <div key={i} className={cn(
                    "rounded-xl border p-3 flex flex-col gap-2",
                    ANGLE_COLORS[i] ?? ANGLE_COLORS[4]
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold leading-tight">{angle.titulo}</p>
                      <span className="shrink-0 text-[9px] font-bold opacity-60 mt-0.5">{angle.numero}/5</span>
                    </div>
                    <p className="text-[11px] opacity-75 leading-relaxed">{angle.angulo}</p>
                    <div className="rounded-lg bg-black/20 px-3 py-2 flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-wide font-semibold opacity-60 mb-0.5">Hook listo para grabar</p>
                        <p className="text-[12px] font-medium leading-snug italic">"{angle.hook}"</p>
                      </div>
                      <CopyButton text={angle.hook} />
                    </div>
                    {angle.diferenciador && (
                      <p className="text-[10px] opacity-60 leading-relaxed">
                        <span className="font-semibold">Diferenciador: </span>{angle.diferenciador}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
