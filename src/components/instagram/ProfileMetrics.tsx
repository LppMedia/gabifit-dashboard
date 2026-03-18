"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Heart, MessageCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IgPost } from "@/lib/instagram-profile-store";

interface Analytics {
  avgLikes: number;
  avgComments: number;
  avgEngagementRate: number;
  totalViews: number;
  typeCount: Record<string, number>;
  bestPostingHour: number | null;
  engagementTrend: {
    date: string;
    engagement: number;
    likes: number;
    comments: number;
  }[];
  topPost: IgPost | null;
  postsAnalyzed: number;
}

interface ProfileMetricsProps {
  analytics: Analytics;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const TYPE_LABELS: Record<string, string> = {
  Video: "Reels",
  Image: "Posts",
  Sidecar: "Carruseles",
};

const TYPE_COLORS: Record<string, { bar: string; text: string; bg: string }> =
  {
    Video: {
      bar: "bg-pink-400",
      text: "text-pink-400",
      bg: "bg-pink-400/20",
    },
    Image: {
      bar: "bg-violet-400",
      text: "text-violet-400",
      bg: "bg-violet-400/20",
    },
    Sidecar: {
      bar: "bg-amber-400",
      text: "text-amber-400",
      bg: "bg-amber-400/20",
    },
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map(
        (entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        )
      )}
    </div>
  );
}

export function ProfileMetrics({ analytics }: ProfileMetricsProps) {
  const totalPosts = Object.values(analytics.typeCount).reduce(
    (s, v) => s + v,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ── Section 1: Metric cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Avg Likes */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-pink-400" />
            <span>Likes promedio</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
            {fmt(analytics.avgLikes)}
          </p>
        </div>

        {/* Avg Comments */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
            <span>Comentarios prom.</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
            {fmt(analytics.avgComments)}
          </p>
        </div>

        {/* Avg Engagement */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Engagement prom.</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
            {analytics.avgEngagementRate}%
          </p>
        </div>

        {/* Best posting hour */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Mejor hora</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">
            {analytics.bestPostingHour != null
              ? `${analytics.bestPostingHour}h`
              : "—"}
          </p>
        </div>
      </div>

      {/* ── Section 2: Engagement trend chart ── */}
      {analytics.engagementTrend.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Tendencia de Engagement (últimas publicaciones)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={analytics.engagementTrend}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar
                dataKey="engagement"
                name="Engagement"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Section 3: Content type breakdown ── */}
      {totalPosts > 0 && Object.keys(analytics.typeCount).length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Tipos de contenido
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.typeCount).map(([type, count]) => {
              const pct = Math.round((count / totalPosts) * 100);
              const colors = TYPE_COLORS[type] ?? {
                bar: "bg-zinc-400",
                text: "text-zinc-400",
                bg: "bg-zinc-400/20",
              };
              const label = TYPE_LABELS[type] ?? type;
              return (
                <div key={type} className="flex items-center gap-3">
                  {/* Pill label */}
                  <span
                    className={cn(
                      "w-20 shrink-0 rounded-full px-2.5 py-0.5 text-center text-[11px] font-medium",
                      colors.bg,
                      colors.text
                    )}
                  >
                    {label}
                  </span>
                  {/* Bar */}
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", colors.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {/* Count + % */}
                  <div className="flex w-16 items-center justify-end gap-1.5 shrink-0">
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      {count}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
