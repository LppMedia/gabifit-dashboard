"use client";

import { useMemo } from "react";
import {
  Eye, TrendingUp, Users, Heart, BarChart2,
  RefreshCw, Instagram, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { KpiCard }               from "@/components/analytics/KpiCard";
import { EngagementChart }       from "@/components/analytics/EngagementChart";
import { ContentBreakdownChart } from "@/components/analytics/ContentBreakdownChart";
import { TopPostsTable }         from "@/components/analytics/TopPostsTable";
import { useIgProfile, computeAnalytics } from "@/lib/instagram-profile-store";
import { formatNumber }           from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title, subtitle, accentClass, children,
}: {
  title: string; subtitle?: string; accentClass: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card">
      <div className={`h-[3px] w-full bg-gradient-to-r ${accentClass}`} />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground/50">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Likes vs Comments bar chart (custom, no recharts for simplicity) ─────────
function LikesCommentsChart({ posts }: { posts: { date: string; likes: number; comments: number }[] }) {
  if (!posts.length) return null;
  const maxVal = Math.max(...posts.map((p) => p.likes));
  if (maxVal === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {posts.slice(0, 8).map((p, i) => (
        <div key={i} className="flex items-center gap-3 text-[11px]">
          <span className="w-12 text-right text-muted-foreground/50 shrink-0 tabular-nums">{p.date}</span>
          <div className="flex-1 flex flex-col gap-0.5">
            {/* Likes bar */}
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-pink-400/70 transition-all duration-500"
                style={{ width: `${(p.likes / maxVal) * 100}%` }}
              />
            </div>
            {/* Comments bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-400/60 transition-all duration-500"
                style={{ width: `${(p.comments / maxVal) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-pink-400 tabular-nums">{formatNumber(p.likes)}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-violet-400 tabular-nums">{formatNumber(p.comments)}</span>
          </div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/50">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-400/70" />Likes</div>
        <div className="flex items-center gap-1.5"><span className="h-1.5 w-2 rounded-full bg-violet-400/60" />Comentarios</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { profile, loading, scrapeProfile } = useIgProfile();

  const analytics = useMemo(
    () => (profile ? computeAnalytics(profile.posts) : null),
    [profile]
  );

  // Likes vs comments per post (last 8 sorted by date)
  const likesCommentsSeries = useMemo(() => {
    if (!profile?.posts.length) return [];
    return [...profile.posts]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-8)
      .map((p) => ({
        date: new Date(p.timestamp).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        likes: p.likesCount,
        comments: p.commentsCount,
      }));
  }, [profile]);

  // ── No account connected ────────────────────────────────────────────────────
  if (!profile && !loading) {
    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Analytics</h1>
            <p className="text-[12px] text-muted-foreground/60">Métricas reales de tu cuenta de Instagram</p>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border/40 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-600/20 ring-1 ring-pink-500/20">
            <Instagram className="h-7 w-7 text-pink-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Ninguna cuenta conectada</p>
            <p className="mt-1 text-sm text-muted-foreground/60 max-w-xs mx-auto">
              Ve a Instagram Manager, conecta tu cuenta y vuelve aquí para ver tus métricas reales.
            </p>
          </div>
          <Link
            href="/instagram"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white",
              "bg-gradient-to-r from-pink-600 to-violet-600 shadow-md shadow-pink-900/30",
              "transition-opacity hover:opacity-90"
            )}
          >
            <Instagram className="h-4 w-4" />
            Ir a Instagram Manager
          </Link>
          <p className="flex items-center gap-1.5 text-[11px] text-amber-400/70">
            <AlertCircle className="h-3 w-3" />
            El análisis puede tomar 1–2 minutos vía Apify
          </p>
        </div>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin text-pink-400" />
        <p className="text-sm">Cargando análisis de @{profile?.username}…</p>
      </div>
    );
  }

  if (!analytics || !profile) return null;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Analytics</h1>
            <p className="text-[12px] text-muted-foreground/60">
              Datos reales vía{" "}
              <span className="font-semibold text-cyan-400">Apify · Instagram</span>
            </p>
          </div>
        </div>

        {/* Connected badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-pink-500/25 bg-pink-500/8 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-pink-400">
              @{profile.username}
            </span>
            {profile.isVerified && <span className="text-[10px] text-sky-400">✓ verificado</span>}
          </div>
          <p className="text-[11px] text-muted-foreground/40">
            {analytics.postsAnalyzed} posts analizados ·{" "}
            {new Date(profile.scrapedAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Seguidores"
          value={formatNumber(profile.followersCount)}
          subValue={`${formatNumber(profile.followsCount)} siguiendo`}
          icon={Users}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          accentColor="from-emerald-500 to-teal-400"
        />
        <KpiCard
          label="Likes promedio"
          value={formatNumber(analytics.avgLikes)}
          subValue={`por publicación`}
          icon={Heart}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/10"
          accentColor="from-pink-500 to-rose-400"
        />
        <KpiCard
          label="Engagement promedio"
          value={`${analytics.avgEngagementRate}%`}
          subValue={`${formatNumber(analytics.avgComments)} comentarios avg`}
          icon={TrendingUp}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
          accentColor="from-violet-500 to-purple-500"
        />
        <KpiCard
          label="Vistas totales"
          value={formatNumber(analytics.totalViews)}
          subValue={`mejor hora: ${analytics.bestPostingHour != null ? `${analytics.bestPostingHour}h` : "—"}`}
          icon={Eye}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          accentColor="from-cyan-500 to-blue-500"
        />
      </div>

      {/* ── Engagement trend (full width) ────────────────────────────────── */}
      {analytics.engagementTrend.length > 0 && (
        <ChartCard
          title="Tendencia de Engagement"
          subtitle={`Últimos ${analytics.engagementTrend.length} posts · engagement = (likes + comentarios) / seguidores`}
          accentClass="from-pink-500 to-violet-500"
        >
          <EngagementChart trend={analytics.engagementTrend} />
        </ChartCard>
      )}

      {/* ── Content mix + Likes vs Comments ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.keys(analytics.typeCount).length > 0 && (
          <ChartCard
            title="Mix de Contenido"
            subtitle={`${analytics.postsAnalyzed} posts analizados`}
            accentClass="from-violet-500 to-pink-400"
          >
            <ContentBreakdownChart typeCount={analytics.typeCount} />
          </ChartCard>
        )}

        {likesCommentsSeries.length > 0 && (
          <ChartCard
            title="Likes vs Comentarios"
            subtitle="Últimas 8 publicaciones · orden cronológico"
            accentClass="from-pink-500 to-rose-400"
          >
            <LikesCommentsChart posts={likesCommentsSeries} />
          </ChartCard>
        )}
      </div>

      {/* ── Top performing posts ─────────────────────────────────────────── */}
      {profile.posts.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
          <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
          <div className="p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display text-[15px] font-semibold text-foreground">
                  Top Posts por Engagement
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                  Ordenados por tasa de engagement · datos reales de Instagram
                </p>
              </div>
            </div>
            <TopPostsTable posts={profile.posts} />
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <p className="flex items-center justify-center gap-2 pb-2 text-[11px] text-muted-foreground/25">
        <Instagram className="h-3 w-3" />
        Datos scrapeados vía Apify · Impresiones y alcance requieren la API oficial de Meta Business
      </p>
    </div>
  );
}
