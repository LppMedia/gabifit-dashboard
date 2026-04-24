"use client";

import { Eye, Heart, MessageCircle, CheckCircle2, Zap, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyReport } from "@/lib/weekly-review-types";

interface Props {
  report: WeeklyReport;
}

const RANK_STYLES = [
  "bg-amber-400 text-black",
  "bg-zinc-300 text-black",
  "bg-orange-700 text-white",
  "bg-zinc-600 text-white",
  "bg-zinc-700 text-white",
];

export function WeeklyReportBlock({ report }: Props) {
  const { resumenSemana, topPosts, insights, estrategia } = report;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Posts esta semana", value: String(resumenSemana.totalPosts),                  color: "text-lime-400"    },
          { label: "Total likes",       value: (resumenSemana.totalLikes ?? 0).toLocaleString(),         color: "text-pink-400"   },
          { label: "Total vistas",      value: (resumenSemana.totalViews ?? 0).toLocaleString(),         color: "text-cyan-400"   },
          { label: "Engagement",        value: `${(resumenSemana.avgEngagementRate ?? 0).toFixed(1)}%`,  color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <p className={cn("font-display text-[28px] font-bold tabular-nums leading-none", color)}>{value}</p>
            <p className="mt-1.5 text-[12px] text-muted-foreground/60">{label}</p>
          </div>
        ))}
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Top Posts — Por qué funcionaron
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topPosts.slice(0, 3).map((post, i) => (
                <div key={post.shortCode} className="flex flex-col rounded-xl border border-border/30 bg-white/[0.02] overflow-hidden">
                  <div className="relative aspect-[4/5] bg-gradient-to-br from-purple-900/30 to-pink-900/20 overflow-hidden">
                    {post.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnailUrl)}`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", RANK_STYLES[i] ?? RANK_STYLES[4])}>
                        #{i + 1}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent px-2.5 pt-6 pb-2 text-[11px] text-white">
                      {post.videoViewCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />{post.videoViewCount.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" />{post.likesCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5 text-white/60">
                        <MessageCircle className="h-3 w-3" />{post.commentsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2.5">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide font-semibold text-lime-400/60 mb-0.5">Por qué funcionó</p>
                      <p className="text-[11px] text-foreground/80 leading-relaxed">{post.porQueFuncionó}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wide font-semibold text-purple-400/60 mb-0.5">Qué repetir</p>
                      <p className="text-[11px] text-purple-200/70 leading-relaxed">{post.queRepetir}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
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

      {/* Estrategia */}
      {estrategia.length > 0 && (
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
