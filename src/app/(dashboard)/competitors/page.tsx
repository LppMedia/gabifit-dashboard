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
  Instagram,
  AlertCircle,
  CheckCircle2,
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
import { useScrapedData } from "@/lib/scraped-store";
import { ScrapedVideoCard } from "@/components/competitors/ScrapedVideoCard";
import { LiveAnalysisModal } from "@/components/competitors/LiveAnalysisModal";
import { UrlDropAnalyzer } from "@/components/competitors/UrlDropAnalyzer";
import { ScrapedPost, VideoAnalysis } from "@/lib/scraped-types";
import { useCalendarPosts } from "@/lib/calendar-store";

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
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
          iconBg
        )}
      >
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
    updateFollowers,
    refreshCompetitor,
    refreshAll,
  } = useCompetitors();

  const {
    data: scrapedDataMap,
    scraping,
    transcribing,
    analyzing,
    errors: scrapedErrors,
    scrapeCompetitor,
    fetchTranscript,
    analyzePost,
  } = useScrapedData();

  const { addPost: addCalendarPost } = useCalendarPosts();

  const [selectedPost, setSelectedPost] = useState<CompetitorPost | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<Competitor | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [livePost, setLivePost] = useState<ScrapedPost | null>(null);
  const [liveCompetitorId, setLiveCompetitorId] = useState<string | null>(null);
  const [liveInitialTab, setLiveInitialTab] = useState<"video"|"transcript"|"estructura"|"adaptar">("video");
  const [calendarBanner, setCalendarBanner] = useState(false);

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

  function handleSendToCalendar(post: ScrapedPost, analysis: VideoAnalysis) {
    const today = new Date();
    const caption = [
      analysis.gabifitAdaptation.suggestedHook,
      "",
      ...analysis.gabifitAdaptation.tips.map((t, i) => `${i + 1}. ${t}`),
      "",
      analysis.gabifitAdaptation.suggestedCTA,
    ].join("\n");

    addCalendarPost({
      date:     today.toISOString().split("T")[0],
      time:     "10:00",
      platform: "instagram",
      type:     "viralidad",
      status:   "draft",
      caption,
      format:   post.type === "Video" ? "Reel" : post.type === "Sidecar" ? "Carrusel" : "Post",
      hashtags: post.caption.match(/#\w+/g)?.slice(0, 5).join(" ") ?? "",
      notes:    `Inspirado en @${post.ownerUsername} · ${post.url}\n\nHook original: ${analysis.hook.text}`,
      script:   analysis.structure.map((s) => `[${s.time}] ${s.section}: ${s.description}`).join("\n"),
    });

    setLivePost(null);
    setLiveCompetitorId(null);
    setCalendarBanner(true);
    setTimeout(() => setCalendarBanner(false), 3500);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Calendar success banner ─────────────────────────────────────────── */}
      {calendarBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4" />
          Adaptación enviada al Calendario como borrador ✨
        </div>
      )}

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
                  PLATFORM_META[fastestGrowing.platform]?.label ??
                  fastestGrowing.platform
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

      {/* ── Live Instagram Scraping ─────────────────────────────────────────────── */}
      {hydrated && competitors.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-400" />
              Top 10 Contenido del Último Mes — Instagram
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/25 text-pink-400 font-medium">
              Powered by Apify
            </span>
          </div>

          {/* Per-competitor scrape sections */}
          <div className="flex flex-col gap-6">
            {competitors
              .filter((c) => c.platforms.includes("instagram"))
              .map((competitor) => {
                const scraped = scrapedDataMap[competitor.id];
                const isScraping = scraping.has(competitor.id);
                const err = scrapedErrors[competitor.id];
                const igHandle = competitor.handle;

                return (
                  <div
                    key={competitor.id}
                    className="rounded-xl border border-border/40 bg-card/50 p-4"
                  >
                    {/* Competitor header row */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar with gradient */}
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                            competitor.avatarGradient
                          )}
                        >
                          {competitor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {competitor.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {igHandle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {scraped && (
                          <span className="text-[10px] text-muted-foreground/50">
                            {new Date(scraped.scrapedAt).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" }
                            )}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            scrapeCompetitor(competitor.id, igHandle, (followers) =>
                              updateFollowers(competitor.id, followers)
                            )
                          }
                          disabled={isScraping}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                            isScraping
                              ? "bg-pink-500/10 border-pink-500/25 text-pink-400/50 cursor-not-allowed"
                              : "bg-pink-500/15 border-pink-500/30 text-pink-400 hover:bg-pink-500/25"
                          )}
                        >
                          {isScraping ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Scrapeando...
                            </>
                          ) : (
                            <>
                              <Instagram className="h-3 w-3" />
                              {scraped
                                ? "Re-scrapear"
                                : "Scrapear Instagram"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error state */}
                    {err && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] mb-3">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {err}
                      </div>
                    )}

                    {/* Empty state */}
                    {!scraped && !isScraping && !err && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Instagram className="h-6 w-6 text-muted-foreground/30" />
                        <p className="text-[12px] text-muted-foreground/50">
                          Haz clic en &quot;Scrapear Instagram&quot; para obtener los top
                          videos
                        </p>
                      </div>
                    )}

                    {/* Scraping skeleton */}
                    {isScraping && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="rounded-xl overflow-hidden border border-border/30 animate-pulse"
                          >
                            <div className="bg-white/[0.05]" style={{ aspectRatio: "4/5" }} />
                            <div className="p-3 space-y-2">
                              <div className="h-3 bg-white/[0.05] rounded w-3/4" />
                              <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Scraped video grid — top 9 best posts, 3 columns for visual richness */}
                    {scraped && scraped.posts.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scraped.posts.slice(0, 9).map((post, idx) => (
                          <ScrapedVideoCard
                            key={post.id}
                            post={post}
                            rank={idx + 1}
                            competitorId={competitor.id}
                            analysis={scrapedDataMap[competitor.id]?.analyses[post.url] ?? null}
                            onOpenAnalysis={(p, tab) => {
                              setLivePost(p);
                              setLiveCompetitorId(competitor.id);
                              if (tab) setLiveInitialTab(tab);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {scraped && scraped.posts.length === 0 && (
                      <p className="text-[12px] text-muted-foreground/50 text-center py-4">
                        No se encontraron posts públicos
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ── URL Drop Analyzer ─────────────────────────────────────────────────── */}
      {hydrated && (
        <section>
          <UrlDropAnalyzer onSendToCalendar={handleSendToCalendar} />
        </section>
      )}

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
          Los datos simulados se combinan con scraping real vía Apify. Configura
          APIFY_API_TOKEN y ANTHROPIC_API_KEY en .env.local
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

      <LiveAnalysisModal
        post={livePost}
        competitorId={liveCompetitorId}
        initialTab={liveInitialTab}
        scrapedData={
          liveCompetitorId ? (scrapedDataMap[liveCompetitorId] ?? null) : null
        }
        onClose={() => {
          setLivePost(null);
          setLiveCompetitorId(null);
          setLiveInitialTab("video");
        }}
        onFetchTranscript={fetchTranscript}
        onAnalyze={analyzePost}
        onSendToCalendar={handleSendToCalendar}
        transcribing={transcribing}
        analyzing={analyzing}
        errors={scrapedErrors}
      />
    </div>
  );
}
