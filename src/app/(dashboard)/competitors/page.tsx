"use client";

import { useState } from "react";
import {
  Swords,
  RefreshCw,
  Plus,
  Users,
  BarChart2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Competitor,
  CompetitorPost,
  getAllPosts,
  getTotalFollowers,
  formatFollowers,
  formatEngagement,
  getEngagementColor,
  getGrowthColor,
  PLATFORM_META,
} from "@/lib/competitors-data";
import { useCompetitors } from "@/lib/competitors-store";
import { CompetitorCard } from "@/components/competitors/CompetitorCard";
import { PostsTable } from "@/components/competitors/PostsTable";
import { PostAnalysisModal } from "@/components/competitors/PostAnalysisModal";
import { AddCompetitorDialog } from "@/components/competitors/AddCompetitorDialog";

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden animate-pulse">
      <div className="h-[3px] w-full bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-white/10 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 bg-white/10 rounded w-2/3" />
            <div className="h-2.5 bg-white/5 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-5 bg-white/5 rounded-full w-16" />
          <div className="h-5 bg-white/5 rounded-full w-14" />
        </div>
        <div className="h-2.5 bg-white/5 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-16 bg-white/5 rounded-lg" />
          <div className="h-16 bg-white/5 rounded-lg" />
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="h-2.5 bg-white/5 rounded w-24" />
        <div className="h-5 w-5 bg-white/5 rounded" />
      </div>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
  subColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        {sub && (
          <p className={cn("text-[11px] mt-0.5", subColor ?? "text-muted-foreground")}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
  const {
    competitors,
    hydrated,
    refreshing,
    isRefreshingAll,
    addCompetitor,
    removeCompetitor,
    refreshCompetitor,
    refreshAll,
  } = useCompetitors();

  const [selectedPost, setSelectedPost] = useState<CompetitorPost | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<Competitor | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const allPosts = getAllPosts(competitors);

  // Best engagement rate
  const bestPost = allPosts[0];
  const bestEngCompetitor = bestPost
    ? competitors.find((c) => c.id === bestPost.competitorId)
    : undefined;

  // Fastest growing competitor (max growth across all platforms)
  const fastestGrowing = competitors.reduce<{
    competitor: Competitor | null;
    growth: number;
    platform: string;
  }>(
    (best, c) => {
      for (const [platform, metrics] of Object.entries(c.metrics)) {
        if (metrics && metrics.followersGrowth > best.growth) {
          best = {
            competitor: c,
            growth: metrics.followersGrowth,
            platform,
          };
        }
      }
      return best;
    },
    { competitor: null, growth: 0, platform: "" }
  );

  function handleAnalyze(post: CompetitorPost, competitor: Competitor) {
    setSelectedPost(post);
    setSelectedCompetitor(competitor);
  }

  function handleCloseModal() {
    setSelectedPost(null);
    setSelectedCompetitor(null);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
            <Swords className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Competitors Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              {competitors.length} competidores · {allPosts.length} posts
              analizados
              {bestPost && (
                <>
                  {" · "}
                  <span className={cn(getEngagementColor(bestPost.engagementRate))}>
                    mejor eng: {formatEngagement(bestPost.engagementRate)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            disabled={isRefreshingAll || !hydrated}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all",
              isRefreshingAll
                ? "bg-white/5 border-border/30 text-muted-foreground cursor-not-allowed"
                : "bg-white/[0.04] border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshingAll && "animate-spin")}
            />
            Actualizar todo
          </button>
          <button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all"
          >
            <Plus className="h-4 w-4" />
            Agregar competidor
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/15"
          label="Competidores activos"
          value={String(competitors.length)}
          sub="perfiles monitoreados"
        />
        <StatCard
          icon={BarChart2}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/15"
          label="Posts analizados"
          value={String(allPosts.length)}
          sub={`de ${competitors.length} competidores`}
        />
        <StatCard
          icon={Zap}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15"
          label="Mejor eng. rate"
          value={bestPost ? formatEngagement(bestPost.engagementRate) : "—"}
          sub={bestEngCompetitor?.name ?? "—"}
          subColor={
            bestPost ? getEngagementColor(bestPost.engagementRate) : undefined
          }
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15"
          label="Crecimiento más rápido"
          value={
            fastestGrowing.competitor
              ? `+${fastestGrowing.growth.toFixed(1)}%`
              : "—"
          }
          sub={
            fastestGrowing.competitor
              ? `${fastestGrowing.competitor.name} · ${
                  PLATFORM_META[fastestGrowing.platform]?.label ?? fastestGrowing.platform
                }`
              : "—"
          }
          subColor={
            fastestGrowing.growth > 0
              ? getGrowthColor(fastestGrowing.growth)
              : undefined
          }
        />
      </div>

      {/* ── Competitor cards grid ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Competidores
          </h2>
          <span className="text-xs text-muted-foreground">
            {competitors.length} activos ·{" "}
            {formatFollowers(
              competitors.reduce((s, c) => s + getTotalFollowers(c), 0)
            )}{" "}
            seguidores totales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {!hydrated
            ? [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
            : competitors.map((c) => (
                <CompetitorCard
                  key={c.id}
                  competitor={c}
                  onRemove={removeCompetitor}
                  isRefreshing={refreshing.has(c.id)}
                  onRefresh={refreshCompetitor}
                />
              ))}
        </div>

        {hydrated && competitors.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 py-16 text-center">
            <Swords className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No hay competidores aún. Agrega el primero.
            </p>
            <button
              onClick={() => setAddDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition-all"
            >
              <Plus className="h-4 w-4" />
              Agregar competidor
            </button>
          </div>
        )}
      </section>

      {/* ── Posts table ───────────────────────────────────────────────────────── */}
      {hydrated && allPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Top Posts
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] border border-border/40 text-muted-foreground">
                {allPosts.length}
              </span>
            </h2>
          </div>
          <PostsTable
            posts={allPosts}
            competitors={competitors}
            onAnalyze={handleAnalyze}
          />
        </section>
      )}

      {/* ── Footer note ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 pb-2">
        <Zap className="h-3 w-3" />
        <span>
          Los datos son simulados y se actualizan localmente. Conecta la API de
          cada plataforma para datos en tiempo real.
        </span>
      </div>

      {/* ── Dialogs / Modals ──────────────────────────────────────────────────── */}
      <AddCompetitorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={(data) => {
          addCompetitor(data);
          setAddDialogOpen(false);
        }}
      />

      <PostAnalysisModal
        post={selectedPost}
        competitor={selectedCompetitor}
        onClose={handleCloseModal}
      />
    </div>
  );
}
