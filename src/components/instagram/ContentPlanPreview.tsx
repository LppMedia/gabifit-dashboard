"use client";

import { ShoppingCart, MapPin, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentPlan, ContentPlanPost } from "@/lib/weekly-review-types";
import { PLATFORMS } from "@/lib/calendar-data";

interface Props {
  contentPlan: ContentPlan;
  onConfirm: () => void;
}

const FOCUS_LABELS: Record<string, { label: string; color: string }> = {
  ventas_curso:      { label: "Ventas — Curso",   color: "text-amber-400 bg-amber-500/10 border-amber-500/25"       },
  evento_presencial: { label: "Evento Presencial", color: "text-pink-400 bg-pink-500/10 border-pink-500/25"         },
  comunidad:         { label: "Comunidad",         color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
  educativo:         { label: "Educativo",         color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"         },
};

function CtaIcon({ apuntaA }: { apuntaA: ContentPlanPost["apuntaA"] }) {
  if (apuntaA === "curso")  return <span title="Apunta al curso" className="inline-flex shrink-0"><ShoppingCart className="h-3 w-3 text-amber-400 shrink-0" /></span>;
  if (apuntaA === "evento") return <span title="Apunta al evento" className="inline-flex shrink-0"><MapPin className="h-3 w-3 text-pink-400 shrink-0" /></span>;
  return null;
}

export function ContentPlanPreview({ contentPlan, onConfirm }: Props) {
  const totalPosts = contentPlan.semanas.reduce((s, w) => s + w.posts.length, 0);
  const byPlatform = { instagram: 0, tiktok: 0, youtube: 0 };
  contentPlan.semanas.forEach((w) =>
    w.posts.forEach((p) => {
      if (p.plataforma in byPlatform) byPlatform[p.plataforma as keyof typeof byPlatform]++;
    })
  );

  const platformSummaryParts: string[] = [];
  if (byPlatform.instagram > 0) platformSummaryParts.push(`${byPlatform.instagram} en Instagram`);
  if (byPlatform.tiktok > 0)    platformSummaryParts.push(`${byPlatform.tiktok} en TikTok`);
  if (byPlatform.youtube > 0)   platformSummaryParts.push(`${byPlatform.youtube} en YouTube`);

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div>
          <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-violet-400" />
            {contentPlan.scope === "week" ? "Plan Semanal" : "Plan Mensual"} — {totalPosts} posts listos
          </h3>
          <p className="text-[12px] text-muted-foreground/50 mt-0.5">{platformSummaryParts.join(" · ")}</p>
        </div>

        {/* Weeks */}
        {contentPlan.semanas.map((semana, wi) => {
          const focus = FOCUS_LABELS[semana.enfoqueSemana] ?? FOCUS_LABELS.comunidad;
          return (
            <div key={wi} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-wide">
                  Semana {wi + 1}
                </span>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", focus.color)}>
                  {focus.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {semana.posts.map((post, pi) => {
                  const platform = PLATFORMS[post.plataforma as keyof typeof PLATFORMS];
                  return (
                    <div
                      key={pi}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium cursor-default",
                        platform?.bg ?? "bg-white/5",
                        platform?.border ?? "border-white/10",
                        platform?.color ?? "text-white"
                      )}
                      title={`${post.fecha} — ${post.hook}`}
                    >
                      <span className="font-semibold">{platform?.abbr ?? "IG"}</span>
                      <span className="text-foreground/30">·</span>
                      <span>{post.formato}</span>
                      <span className="text-foreground/30">·</span>
                      <span className="max-w-[72px] truncate text-foreground/80">{post.tema}</span>
                      <CtaIcon apuntaA={post.apuntaA} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Confirm button */}
        <button
          onClick={onConfirm}
          className="mt-1 w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:opacity-90 active:opacity-80 transition-opacity"
        >
          Confirmar y llenar calendario →
        </button>
      </div>
    </div>
  );
}
