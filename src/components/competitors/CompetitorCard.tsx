"use client";

import { useState } from "react";
import { RefreshCw, X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Competitor,
  PLATFORM_META,
  formatFollowers,
  formatEngagement,
  getEngagementColor,
  getGrowthColor,
  getTotalFollowers,
} from "@/lib/competitors-data";

interface CompetitorCardProps {
  competitor: Competitor;
  onRemove: (id: string) => void;
  isRefreshing: boolean;
  onRefresh: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function CompetitorCard({
  competitor,
  onRemove,
  isRefreshing,
  onRefresh,
}: CompetitorCardProps) {
  const [hovered, setHovered] = useState(false);

  const initials = competitor.name.slice(0, 2).toUpperCase();
  const totalFollowers = getTotalFollowers(competitor);

  // Pick top 2 platforms by follower count
  const platformEntries = Object.entries(competitor.metrics)
    .filter(([, m]) => m !== undefined)
    .sort((a, b) => (b[1]?.followers ?? 0) - (a[1]?.followers ?? 0))
    .slice(0, 2) as [string, NonNullable<(typeof competitor.metrics)[keyof typeof competitor.metrics]>][];

  return (
    <div
      className="relative rounded-xl border border-border/40 bg-card overflow-hidden flex flex-col transition-all duration-200 hover:border-border/70 hover:shadow-lg hover:shadow-black/20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient top bar */}
      <div
        className={cn(
          "h-[3px] w-full bg-gradient-to-r",
          competitor.avatarGradient
        )}
      />

      {/* Remove button */}
      <button
        onClick={() => onRemove(competitor.id)}
        className={cn(
          "absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all z-10",
          hovered ? "opacity-100" : "opacity-0"
        )}
        aria-label="Eliminar competidor"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: avatar + name + handle */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-11 w-11 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
              competitor.avatarGradient
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {competitor.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {competitor.handle}
            </p>
          </div>
        </div>

        {/* Platform badges */}
        <div className="flex flex-wrap gap-1">
          {competitor.platforms.map((p) => {
            const meta = PLATFORM_META[p];
            return (
              <span
                key={p}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                  meta.bg,
                  meta.border,
                  meta.color
                )}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: meta.dot }}
                />
                {meta.label}
              </span>
            );
          })}
        </div>

        {/* Niche */}
        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-1">
          {competitor.niche}
        </p>

        {/* Platform metrics */}
        <div className="space-y-2">
          {platformEntries.map(([platform, metrics]) => {
            const meta = PLATFORM_META[platform];
            const growthPositive = metrics.followersGrowth >= 0;
            return (
              <div
                key={platform}
                className="rounded-lg bg-white/[0.03] border border-border/20 p-2.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wide", meta.color)}>
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {metrics.postsPerWeek}×/sem
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {formatFollowers(metrics.followers)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">seguidores</p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-bold flex items-center gap-0.5",
                        getGrowthColor(metrics.followersGrowth)
                      )}
                    >
                      {growthPositive ? (
                        <TrendingUp className="h-2.5 w-2.5" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5" />
                      )}
                      {metrics.followersGrowth.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">30 días</p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-bold",
                        getEngagementColor(metrics.avgEngagementRate)
                      )}
                    >
                      {formatEngagement(metrics.avgEngagementRate)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">eng.</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total followers summary */}
        {platformEntries.length > 1 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-muted-foreground">
              Total seguidores
            </span>
            <span className="text-xs font-bold text-foreground">
              {formatFollowers(totalFollowers)}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Actualizado {timeAgo(competitor.lastRefreshed)}</span>
        </div>
        <button
          onClick={() => onRefresh(competitor.id)}
          disabled={isRefreshing}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all",
            isRefreshing && "cursor-not-allowed"
          )}
          aria-label="Actualizar datos"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
          />
        </button>
      </div>
    </div>
  );
}
