"use client";

import { CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyReport } from "@/lib/weekly-review-types";
import { TopVideoDeepDiveBlock } from "./TopVideoDeepDiveBlock";
import { NicheRecommendationsBlock } from "./NicheRecommendationsBlock";

interface Props {
  report: WeeklyReport;
}

export function WeeklyReportBlock({ report }: Props) {
  const { resumenSemana, topVideos, insights, videosRecomendados, estrategia } = report;

  return (
    <div className="flex flex-col gap-5">

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Posts esta semana", value: String(resumenSemana.totalPosts),                          color: "text-lime-400"    },
          { label: "Total likes",       value: (resumenSemana.totalLikes  ?? 0).toLocaleString(),          color: "text-pink-400"   },
          { label: "Total vistas",      value: (resumenSemana.totalViews  ?? 0).toLocaleString(),          color: "text-cyan-400"   },
          { label: "Engagement",        value: `${(resumenSemana.avgEngagementRate ?? 0).toFixed(1)}%`,    color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <p className={cn("font-display text-[28px] font-bold tabular-nums leading-none", color)}>{value}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/60">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Top 3 videos deep-dive ──────────────────────────────────────── */}
      {Array.isArray(topVideos) && topVideos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <h3 className="font-display text-[15px] font-semibold">Top 3 Videos — Análisis Profundo</h3>
          </div>
          {topVideos.slice(0, 3).map((video, i) => (
            <TopVideoDeepDiveBlock key={video.shortCode ?? i} video={video} rank={i + 1} />
          ))}
        </div>
      )}

      {/* ── Insights ────────────────────────────────────────────────────── */}
      {insights && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="p-5 flex flex-col gap-2">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-cyan-400" />Insights de la Semana
            </h3>
            <p className="text-[13px] text-foreground/70 leading-relaxed">{insights}</p>
          </div>
        </div>
      )}

      {/* ── Niche recommendations ────────────────────────────────────────── */}
      {Array.isArray(videosRecomendados) && videosRecomendados.length > 0 && (
        <NicheRecommendationsBlock recommendations={videosRecomendados} />
      )}

      {/* ── Estrategia ───────────────────────────────────────────────────── */}
      {Array.isArray(estrategia) && estrategia.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-lime-400" />
          <div className="p-5 flex flex-col gap-3">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />Estrategia: 3 Acciones Esta Semana
            </h3>
            {estrategia.slice(0, 3).map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                  {i + 1}
                </div>
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
