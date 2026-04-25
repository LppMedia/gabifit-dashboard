"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, ShoppingCart, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NicheRecommendation } from "@/lib/weekly-review-types";

interface Props {
  recommendations: NicheRecommendation[];
}

const RELACIONADO_CONFIG = {
  curso:    { label: "Curso",   icon: ShoppingCart, color: "text-violet-400 bg-violet-500/10 border-violet-500/25" },
  evento:   { label: "Evento",  icon: MapPin,       color: "text-pink-400 bg-pink-500/10 border-pink-500/25"     },
  comunidad:{ label: "Comunidad",icon: Users,       color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"     },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "¡Copiado!" : "Copiar hook"}
    </button>
  );
}

export function NicheRecommendationsBlock({ recommendations }: Props) {
  if (!recommendations?.length) return null;

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-400" />
          <div>
            <h3 className="font-display text-[15px] font-semibold">Videos Recomendados para tu Nicho</h3>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">Basado en tendencias fitness postparto 2025 — listos para grabar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommendations.map((rec, i) => {
            const rel = RELACIONADO_CONFIG[rec.relacionadoA] ?? RELACIONADO_CONFIG.comunidad;
            const RelIcon = rel.icon;
            return (
              <div key={i} className="flex flex-col gap-2.5 rounded-xl border border-border/30 bg-white/[0.02] p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">{rec.titulo}</p>
                  <span className={cn("shrink-0 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold", rel.color)}>
                    <RelIcon className="h-2.5 w-2.5" />{rel.label}
                  </span>
                </div>

                {/* Hook */}
                <div className="rounded-lg border border-lime-500/20 bg-lime-500/5 px-3 py-2 flex items-start gap-2">
                  <p className="flex-1 text-[12px] italic text-lime-200/80 leading-snug">"{rec.hook}"</p>
                  <CopyButton text={rec.hook} />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5">
                  {rec.angulo && (
                    <p className="text-[11px] text-foreground/60 leading-relaxed">
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/40">Ángulo · </span>
                      {rec.angulo}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-border/30 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                      {rec.formato}
                    </span>
                    {rec.porQueAhora && (
                      <p className="text-right text-[10px] text-amber-400/70 leading-tight max-w-[60%]">{rec.porQueAhora}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
