"use client";

import { ElementType, useEffect, useMemo, useState } from "react";
import {
  Instagram, BarChart2, CalendarCheck, CalendarClock, FileText,
  CheckCircle2, Archive, Search, TrendingUp, TrendingDown, Minus,
  Loader2, RefreshCw, Play, X, Eye, Heart, MessageCircle, Zap,
  Target, Sparkles, Video, LayoutGrid, BookOpen, Star, Lightbulb,
  Users, ExternalLink, Plus, Rocket, FlameKindling, Brain, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// Instagram management components
import { PostCard as MgmtPostCard } from "@/components/instagram/PostCard";
import { NewPostDialog } from "@/components/instagram/NewPostDialog";
import { AccountConnect } from "@/components/instagram/AccountConnect";
// Analytics components
import { KpiCard }               from "@/components/analytics/KpiCard";
import { EngagementChart }       from "@/components/analytics/EngagementChart";
import { ContentBreakdownChart } from "@/components/analytics/ContentBreakdownChart";
import { TopPostsTable }         from "@/components/analytics/TopPostsTable";
// Data stores
import { useInstagramPosts, InstagramPost, PostStatus } from "@/lib/instagram-store";
import { useIgProfile, computeAnalytics } from "@/lib/instagram-profile-store";
import { formatNumber } from "@/lib/analytics-data";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { WeeklyReport, ContentPlan } from "@/lib/weekly-review-types";
import { WeeklyReportBlock } from "@/components/instagram/WeeklyReportBlock";
import { ContentPlanPreview } from "@/components/instagram/ContentPlanPreview";
import { CalendarFillModal } from "@/components/instagram/CalendarFillModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeeklyPost {
  id: string; shortCode: string; url: string; type: string; caption: string;
  likesCount: number; commentsCount: number; videoViewCount: number;
  timestamp: string; displayUrl: string; videoUrl: string;
}
interface PostAnalysis {
  shortCode: string; performanceScore: number;
  tier: "viral" | "good" | "avg" | "low"; why: string; whatToRepeat: string;
}
interface ContentPiece {
  day: string; format: string; topic: string; hook: string; cta: string; notes: string;
}
interface ContentPillar {
  pillar: string; why: string; frequency: string; exampleHook: string;
}
interface WeeklyAnalysis {
  weekSummary: {
    totalPosts: number; totalLikes: number; totalComments: number;
    totalViews: number; avgEngagement: string; bestPerformingType: string;
    topPost: { caption: string; likes: number; why: string } | null;
  };
  postAnalyses: PostAnalysis[];
  voiceAnalysis: { strengths: string[]; opportunities: string[]; toneScore: number; consistencyScore: number; };
  topicsThisWeek: string[];
  audienceAlignment: { score: number; notes: string; emotionalHooks: string[]; };
  trendInsights: {
    topFormatsNow: string[];
    viralHooksToTest: string[];
    contentGaps: string[];
    algorithmTips: string[];
  };
  growthStrategy: {
    mainBottleneck: string;
    quickWins: string[];
    contentPillars: ContentPillar[];
  };
  competitorInsights: string;
  nextWeekPlan: { theme: string; contentPieces: ContentPiece[]; hashtags: string[]; keyMessage: string; };
  actionItems: string[];
  generatedAt?: string;
}
interface MonthlyEntry {
  week: string; totalPosts: number; totalLikes: number; totalViews: number; avgEngagement: string;
}
type PlanStep = "idle" | "analyzing" | "saving" | "done" | "error";

// ─── Tier + format config ─────────────────────────────────────────────────────
const TIER_CONFIG = {
  viral: { label: "🔥 Viral",    bg: "bg-lime-500",      text: "text-black" },
  good:  { label: "✓ Bueno",    bg: "bg-emerald-500/80", text: "text-white" },
  avg:   { label: "~ Promedio", bg: "bg-amber-500/70",   text: "text-black" },
  low:   { label: "↓ Bajo",     bg: "bg-red-500/60",     text: "text-white" },
};
const FORMAT_ICON: Record<string, ElementType> = {
  Reel: Video, Carrusel: LayoutGrid, Story: BookOpen, Post: BarChart2,
};
const FORMAT_COLOR: Record<string, string> = {
  Reel:     "text-lime-400 bg-lime-500/10 border-lime-500/25",
  Carrusel: "text-purple-300 bg-purple-500/10 border-purple-500/25",
  Story:    "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Post:     "text-amber-400 bg-amber-500/10 border-amber-500/25",
};

// ─── Mgmt tabs ────────────────────────────────────────────────────────────────
const MGMT_TABS: {
  value: PostStatus; label: string; icon: ElementType; iconColor: string; emptyText: string;
}[] = [
  { value: "scheduled", label: "Programados", icon: CalendarClock, iconColor: "text-emerald-400", emptyText: "Nada programado. ¡Planifica tu semana!" },
  { value: "draft",     label: "Borradores",  icon: FileText,      iconColor: "text-zinc-400",    emptyText: "Sin borradores. ¡Empieza una idea!" },
  { value: "published", label: "Publicados",  icon: CheckCircle2,  iconColor: "text-blue-400",    emptyText: "Nada publicado aún." },
  { value: "backlog",   label: "Backlog",     icon: Archive,       iconColor: "text-orange-400",  emptyText: "El backlog está vacío." },
];

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(100, (score ?? 0) * 10)}%` }} />
      </div>
      <span className="text-[12px] font-bold tabular-nums text-foreground">{score ?? 0}/10</span>
    </div>
  );
}

// ─── FeedPostCard ─────────────────────────────────────────────────────────────
function FeedPostCard({ post, analysis }: { post: WeeklyPost; analysis?: PostAnalysis }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const isVideo = post.type === "Video" || post.type === "Reel" || !!post.videoUrl;
  const tier = (analysis?.tier ?? (
    post.videoViewCount > 15000 ? "viral" :
    post.videoViewCount > 5000  ? "good"  :
    post.likesCount > 500       ? "good"  :
    post.likesCount > 100       ? "avg"   : "low"
  )) as "viral" | "good" | "avg" | "low";
  const tc = TIER_CONFIG[tier];
  const proxyThumb = post.displayUrl
    ? `/api/proxy-image?url=${encodeURIComponent(post.displayUrl)}`
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="relative aspect-[4/5] bg-gradient-to-br from-purple-900/30 to-pink-900/20 overflow-hidden">
        {videoOpen && post.videoUrl ? (
          <>
            <video src={post.videoUrl} autoPlay controls
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setVideoOpen(false)} />
            <button onClick={() => setVideoOpen(false)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </>
        ) : (
          <>
            {proxyThumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proxyThumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {isVideo && (
              <button
                onClick={() => post.videoUrl ? setVideoOpen(true) : window.open(post.url, "_blank")}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm ring-2 ring-white/20">
                  <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                </div>
              </button>
            )}
            <a href={post.url} target="_blank" rel="noopener"
              className={cn("absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white transition-colors",
                isVideo && "hidden")}>
              <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
        <div className="absolute top-2 left-2 z-10">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", tc.bg, tc.text)}>
            {tc.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 z-10">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {post.type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 pt-2.5 text-[12px]">
        {post.videoViewCount > 0 && (
          <span className="flex items-center gap-1 text-cyan-400">
            <Eye className="h-3 w-3" />{post.videoViewCount.toLocaleString()}
          </span>
        )}
        <span className="flex items-center gap-1 text-pink-400">
          <Heart className="h-3 w-3" />{post.likesCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground/60">
          <MessageCircle className="h-3 w-3" />{post.commentsCount.toLocaleString()}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/40">
          {new Date(post.timestamp).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
        </span>
      </div>

      {post.caption && (
        <p className="px-3 pt-1.5 text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
          {post.caption}
        </p>
      )}

      {analysis?.why ? (
        <div className="mx-3 mt-2 mb-3 rounded-lg bg-lime-500/5 border border-lime-500/15 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400/60 mb-0.5">
            {tier === "low" || tier === "avg" ? "Por qué no funcionó" : "Por qué funcionó"}
          </p>
          <p className="text-[11px] text-lime-300/80 leading-relaxed">{analysis.why}</p>
          {analysis.whatToRepeat && (
            <p className="mt-1 text-[10px] text-purple-300/70">
              <span className="text-muted-foreground/40">Repetir: </span>{analysis.whatToRepeat}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-3" />
      )}
    </div>
  );
}

// ─── LikesCommentsChart ───────────────────────────────────────────────────────
function LikesCommentsChart({ posts }: { posts: { date: string; likes: number; comments: number }[] }) {
  if (!posts.length) return null;
  const maxVal = Math.max(...posts.map((p) => p.likes), 1);
  return (
    <div className="flex flex-col gap-2">
      {posts.slice(0, 8).map((p, i) => (
        <div key={i} className="flex items-center gap-3 text-[11px]">
          <span className="w-12 text-right text-muted-foreground/50 shrink-0 tabular-nums">{p.date}</span>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-pink-400/70 transition-all duration-500"
                style={{ width: `${(p.likes / maxVal) * 100}%` }} />
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-violet-400/60 transition-all duration-500"
                style={{ width: `${(p.comments / maxVal) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-pink-400 tabular-nums">{formatNumber(p.likes)}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-violet-400 tabular-nums">{formatNumber(p.comments)}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/50">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-400/70" />Likes</div>
        <div className="flex items-center gap-1.5"><span className="h-1.5 w-2 rounded-full bg-violet-400/60" />Comentarios</div>
      </div>
    </div>
  );
}

// ─── MonthlyLog ───────────────────────────────────────────────────────────────
function MonthlyLog({ refreshKey }: { refreshKey: number }) {
  const [entries, setEntries] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data } = await supabase
          .from("weekly_reviews")
          .select("week_start_date, analysis")
          .eq("user_id", user.id)
          .order("week_start_date", { ascending: false })
          .limit(12);
        if (data?.length) {
          setEntries(data.map((r) => ({
            week:          r.week_start_date,
            totalPosts:    r.analysis?.weekSummary?.totalPosts    ?? 0,
            totalLikes:    r.analysis?.weekSummary?.totalLikes    ?? 0,
            totalViews:    r.analysis?.weekSummary?.totalViews    ?? 0,
            avgEngagement: r.analysis?.weekSummary?.avgEngagement ?? "0%",
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 text-[13px] text-muted-foreground/50">
      <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
    </div>
  );
  if (!entries.length) return (
    <p className="py-4 text-[13px] text-muted-foreground/40">
      Aún no hay historial. Genera tu primer Plan Semanal para comenzar el log.
    </p>
  );

  const maxViews = Math.max(...entries.map((e) => e.totalViews), 1);
  const maxLikes = Math.max(...entries.map((e) => e.totalLikes), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div className="flex items-end gap-2 min-w-max pb-2">
          {[...entries].reverse().map((e) => (
            <div key={e.week} className="flex flex-col items-center gap-1 w-14">
              <div className="relative w-full flex flex-col items-center gap-0.5" style={{ height: 80 }}>
                <div className="w-4 rounded-t bg-lime-400/70"
                  style={{ height: `${(e.totalViews / maxViews) * 72}px`, minHeight: 4 }}
                  title={`${e.totalViews.toLocaleString()} vistas`} />
              </div>
              <span className="text-[9px] text-muted-foreground/50 text-center leading-tight">
                {new Date(e.week + "T12:00:00").toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/30 mt-1">Vistas totales por semana</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/30">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border/30 bg-white/[0.02]">
              {["Semana","Posts","Likes","Vistas","Engagement","Tendencia"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40 first:text-left [&:not(:first-child)]:text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const prev = entries[i + 1];
              const viewDelta = prev ? e.totalViews - prev.totalViews : 0;
              return (
                <tr key={e.week} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground/80">
                    {new Date(e.week + "T12:00:00").toLocaleDateString("es-DO", { day: "numeric", month: "long" })}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-foreground/70">{e.totalPosts}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-pink-400">{e.totalLikes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-cyan-400">{e.totalViews.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-lime-400">{e.avgEngagement}</td>
                  <td className="px-4 py-3 text-right">
                    {i === entries.length - 1 ? (
                      <span className="text-muted-foreground/30">—</span>
                    ) : viewDelta > 0 ? (
                      <span className="flex items-center justify-end gap-1 text-emerald-400">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-[10px]">+{((viewDelta / Math.max(prev!.totalViews, 1)) * 100).toFixed(0)}%</span>
                      </span>
                    ) : viewDelta < 0 ? (
                      <span className="flex items-center justify-end gap-1 text-red-400">
                        <TrendingDown className="h-3 w-3" />
                        <span className="text-[10px]">{((viewDelta / Math.max(prev!.totalViews, 1)) * 100).toFixed(0)}%</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-muted-foreground/40">
                        <Minus className="h-3 w-3" /><span className="text-[10px]">0%</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2 text-[10px] text-muted-foreground/25 border-t border-border/20">
          {entries.length} semanas registradas · máx. vistas: {maxViews.toLocaleString()} · máx. likes: {maxLikes.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ─── StatCard (post management) ───────────────────────────────────────────────
function StatCard({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className="relative overflow-hidden flex flex-col gap-0 rounded-xl border border-border/40 bg-card px-5 py-4">
      <div className={cn("pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-30", bg)} />
      <span className={cn("font-display text-[32px] font-bold leading-none tabular-nums", color)}>{count}</span>
      <span className="mt-1.5 text-[12px] font-medium text-muted-foreground/70">{label}</span>
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, accentClass, children }: { title: string; accentClass: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card">
      <div className={`h-[3px] w-full bg-gradient-to-r ${accentClass}`} />
      <div className="flex flex-col gap-4 p-5">
        <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InstagramPage() {
  const [activeTab, setActiveTab]           = useState("feed");
  const [pendingHandle, setPendingHandle]   = useState("");
  const [planStep, setPlanStep]             = useState<PlanStep>("idle");
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [planError, setPlanError]           = useState<string | null>(null);
  const [paMap, setPaMap]                   = useState<Record<string, PostAnalysis>>({});
  const [logRefreshKey, setLogRefreshKey]   = useState(0);
  const [planLoadedAt, setPlanLoadedAt]     = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editPost, setEditPost]             = useState<InstagramPost | null>(null);
  const [planScope, setPlanScope]         = useState<"week" | "month">("week");
  const [planMonth, setPlanMonth]         = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
  });
  const [weeklyReport, setWeeklyReport]   = useState<WeeklyReport | null>(null);
  const [contentPlan,  setContentPlan]    = useState<ContentPlan  | null>(null);
  const [fillModalOpen, setFillModalOpen] = useState(false);

  // Load latest saved plan from Supabase on mount so it persists after refresh
  useEffect(() => {
    async function loadSavedPlan() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("weekly_reviews")
          .select("analysis, scraped_at")
          .eq("user_id", user.id)
          .order("week_start_date", { ascending: false })
          .limit(1)
          .single();
        if (data?.analysis?.postAnalyses?.length) {
          const savedAnalysis = data.analysis as WeeklyAnalysis;
          setWeeklyAnalysis(savedAnalysis);
          const map: Record<string, PostAnalysis> = {};
          (savedAnalysis.postAnalyses ?? []).forEach((pa) => { map[pa.shortCode] = pa; });
          setPaMap(map);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wr = (savedAnalysis as any).weeklyReport;
          if (wr?.resumenSemana && Array.isArray(wr.topPosts)) setWeeklyReport(wr);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cp = (savedAnalysis as any).contentPlan;
          if (cp?.scope && Array.isArray(cp.semanas)) setContentPlan(cp);
          setPlanStep("done");
          setPlanLoadedAt(data.scraped_at ?? null);
        }
      } catch { /* non-critical */ }
    }
    loadSavedPlan();
  }, []);

  const { profile, loading: profileLoading, error: profileError, scrapeProfile, clearProfile } = useIgProfile();
  const analytics = useMemo(() => profile ? computeAnalytics(profile.posts) : null, [profile]);
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

  const { hydrated, addPost, updatePost, deletePost, byStatus } = useInstagramPosts();

  const handleConnect = (handle: string) => {
    setPendingHandle(handle);
    scrapeProfile(handle);
  };

  const filterMgmt = (status: PostStatus) => {
    const q = search.toLowerCase().trim();
    return byStatus(status).filter(
      (p) => !q || p.caption.toLowerCase().includes(q) || p.hashtags.toLowerCase().includes(q)
    );
  };

  const handleSave = (data: Omit<InstagramPost, "id" | "createdAt">) => {
    if (editPost) { updatePost(editPost.id, data); setEditPost(null); }
    else { addPost(data); }
  };

  async function generatePlan() {
    if (!profile?.posts.length) return;
    setPlanStep("analyzing");
    setPlanError(null);
    try {
      const r = await fetch("/api/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts:  profile.posts,
          handle: profile.username,
          scope:  planScope,
          month:  planMonth,
        }),
      });
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Error IA");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: WeeklyAnalysis & Record<string, any> = await r.json();

      const map: Record<string, PostAnalysis> = {};
      (data.postAnalyses ?? []).forEach((pa) => { map[pa.shortCode] = pa; });
      setPaMap(map);

      if (data.weeklyReport) setWeeklyReport(data.weeklyReport as WeeklyReport);
      if (data.contentPlan)  setContentPlan(data.contentPlan  as ContentPlan);

      setPlanStep("saving");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ws = new Date();
        ws.setDate(ws.getDate() - ws.getDay());
        ws.setHours(0, 0, 0, 0);
        await supabase.from("weekly_reviews").upsert({
          user_id:         user.id,
          week_start_date: ws.toISOString().split("T")[0],
          posts:           profile.posts,
          analysis:        data,
          scraped_at:      new Date().toISOString(),
        });
      }

      setWeeklyAnalysis(data);
      setLogRefreshKey((k) => k + 1);
      setPlanStep("done");
    } catch (e) {
      setPlanError(e instanceof Error ? e.message : "Error de red");
      setPlanStep("error");
    }
  }

  const wa = weeklyAnalysis;
  const ws = wa?.weekSummary;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 ring-1 ring-pink-500/30">
              <Instagram className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Instagram Studio</h1>
              <p className="text-[12px] text-muted-foreground/60">Feed · Analytics · Plan Semanal · Gestión</p>
            </div>
          </div>
          {profile && !profileLoading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-pink-500/25 bg-pink-500/8 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-pink-400">@{profile.username}</span>
                <span className="text-[10px] text-muted-foreground/40">
                  · {new Date(profile.scrapedAt).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => scrapeProfile(profile.username)}
                disabled={profileLoading} className="gap-2 text-[12px]">
                <RefreshCw className="h-3.5 w-3.5" />
                Sincronizar
              </Button>
            </div>
          )}
        </div>

        {/* ── Account connect (when not connected) ────────────────────── */}
        {!profile && !profileLoading && (
          <AccountConnect
            loading={false} currentHandle={null} error={profileError}
            onConnect={handleConnect} onDisconnect={clearProfile} scrapedAt={null}
          />
        )}
        {profileLoading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border/40 bg-card py-10">
            <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
            <p className="text-sm text-muted-foreground">
              Analizando @{pendingHandle || profile?.username}… esto puede tomar 1–2 minutos
            </p>
          </div>
        )}

        {/* ── Main tabs ───────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-1 h-auto gap-1 bg-card p-1 flex-wrap">
            <TabsTrigger value="feed" className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background">
              <Instagram className="h-3.5 w-3.5 text-pink-400" />Feed
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background">
              <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />Analytics
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background">
              <CalendarCheck className="h-3.5 w-3.5 text-lime-400" />Plan Semanal
            </TabsTrigger>
            <TabsTrigger value="gestion" className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background">
              <CalendarClock className="h-3.5 w-3.5 text-emerald-400" />Gestión
            </TabsTrigger>
          </TabsList>

          {/* ══════════════ TAB 1: FEED ══════════════ */}
          <TabsContent value="feed" className="mt-4">
            {!profile ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/40 py-16">
                <Instagram className="h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">Conecta tu cuenta arriba para ver el feed</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-[13px] text-muted-foreground/60">
                    {profile.posts.length} posts · últimos 30 días
                    {Object.keys(paMap).length > 0 && (
                      <span className="ml-2 text-lime-400/70">· con análisis IA ✓</span>
                    )}
                  </p>
                  <Button
                    onClick={() => { setActiveTab("plan"); generatePlan(); }}
                    disabled={planStep === "analyzing" || planStep === "saving"}
                    className="gap-2 bg-lime-600 hover:bg-lime-500 text-black font-semibold shadow-md shadow-lime-900/30"
                  >
                    {planStep === "analyzing" || planStep === "saving" ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Generando...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" />Generar Plan IA</>
                    )}
                  </Button>
                </div>

                {planStep === "done" && (
                  <div className="rounded-xl border border-lime-500/25 bg-lime-500/5 px-4 py-3 text-[13px] text-lime-300">
                    Plan generado y guardado ✓ — ve al tab <strong>Plan Semanal</strong> para verlo completo.
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {(profile.posts as unknown as WeeklyPost[]).map((post) => (
                    <FeedPostCard
                      key={post.shortCode || post.id}
                      post={post}
                      analysis={paMap[post.shortCode]}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ══════════════ TAB 2: ANALYTICS ══════════════ */}
          <TabsContent value="analytics" className="mt-4">
            {!profile ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/40 py-16">
                <BarChart2 className="h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/60">Conecta tu cuenta para ver analytics</p>
              </div>
            ) : !analytics ? null : (
              <div className="flex flex-col gap-6">
                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <KpiCard label="Seguidores" value={formatNumber(profile.followersCount)}
                    subValue={`${formatNumber(profile.followsCount ?? 0)} siguiendo`}
                    icon={Users} iconColor="text-emerald-400" iconBg="bg-emerald-500/10"
                    accentColor="from-emerald-500 to-teal-400" />
                  <KpiCard label="Likes promedio" value={formatNumber(analytics.avgLikes)}
                    subValue="por publicación"
                    icon={Heart} iconColor="text-pink-400" iconBg="bg-pink-500/10"
                    accentColor="from-pink-500 to-rose-400" />
                  <KpiCard label="Engagement" value={`${analytics.avgEngagementRate}%`}
                    subValue={`${formatNumber(analytics.avgComments)} comentarios avg`}
                    icon={TrendingUp} iconColor="text-violet-400" iconBg="bg-violet-500/10"
                    accentColor="from-violet-500 to-purple-500" />
                  <KpiCard label="Vistas totales" value={formatNumber(analytics.totalViews)}
                    subValue={analytics.bestPostingHour != null ? `mejor hora: ${analytics.bestPostingHour}h` : "—"}
                    icon={Eye} iconColor="text-cyan-400" iconBg="bg-cyan-500/10"
                    accentColor="from-cyan-500 to-blue-500" />
                </div>

                {analytics.engagementTrend.length > 0 && (
                  <ChartCard title="Tendencia de Engagement" accentClass="from-pink-500 to-violet-500">
                    <EngagementChart trend={analytics.engagementTrend} />
                  </ChartCard>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  {Object.keys(analytics.typeCount).length > 0 && (
                    <ChartCard title="Mix de Contenido" accentClass="from-violet-500 to-pink-400">
                      <ContentBreakdownChart typeCount={analytics.typeCount} />
                    </ChartCard>
                  )}
                  {likesCommentsSeries.length > 0 && (
                    <ChartCard title="Likes vs Comentarios" accentClass="from-pink-500 to-rose-400">
                      <LikesCommentsChart posts={likesCommentsSeries} />
                    </ChartCard>
                  )}
                </div>

                {profile.posts.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
                    <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
                    <div className="p-5">
                      <h3 className="font-display text-[15px] font-semibold mb-4">Top Posts por Engagement</h3>
                      <TopPostsTable posts={profile.posts} />
                    </div>
                  </div>
                )}

                <p className="flex items-center justify-center gap-2 pb-2 text-[11px] text-muted-foreground/25">
                  <Instagram className="h-3 w-3" />
                  Datos scrapeados vía Apify · Impresiones y alcance requieren la API oficial de Meta Business
                </p>
              </div>
            )}
          </TabsContent>

          {/* ══════════════ TAB 3: PLAN SEMANAL ══════════════ */}
          <TabsContent value="plan" className="mt-4">
            <div className="flex flex-col gap-6">
              {/* Scope selector */}
              <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-card p-1 w-fit">
                {(["week", "month"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlanScope(s)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors",
                      planScope === s
                        ? "bg-lime-600 text-black shadow-sm"
                        : "text-muted-foreground/60 hover:text-foreground"
                    )}
                  >
                    {s === "week" ? "Esta semana (7 días)" : "Este mes (4 semanas)"}
                  </button>
                ))}
              </div>

              {/* Hero / generate section */}
              {planStep !== "done" && (
                <div className="relative overflow-hidden rounded-2xl border border-lime-500/20 bg-card px-8 py-8">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-lime-500/[0.07] blur-3xl" />
                    <div className="absolute -bottom-12 right-8 h-52 w-52 rounded-full bg-purple-500/[0.07] blur-3xl" />
                  </div>
                  <div className="relative flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500">
                        <CalendarCheck className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h2 className="font-display text-[20px] font-bold">Plan Semanal IA</h2>
                        <p className="text-[12px] text-muted-foreground/60">
                          Análisis de posts + contenido listo para grabar la próxima semana
                        </p>
                      </div>
                    </div>
                    {!profile ? (
                      <p className="text-[13px] text-muted-foreground/50">
                        Primero conecta tu cuenta en el tab <strong className="text-foreground/60">Feed</strong>.
                      </p>
                    ) : planStep === "analyzing" || planStep === "saving" ? (
                      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-lime-400" />
                        {planStep === "analyzing" ? "Analizando con IA... (30-60 seg)" : "Guardando análisis..."}
                      </div>
                    ) : planStep === "error" ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-[13px] text-red-300">{planError}</p>
                        <Button onClick={generatePlan} className="w-fit gap-2 bg-lime-600 hover:bg-lime-500 text-black">
                          <RefreshCw className="h-4 w-4" />Reintentar
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={generatePlan}
                        className="w-fit gap-2 bg-gradient-to-r from-lime-500 to-emerald-500 text-black font-semibold shadow-lg shadow-lime-500/25 hover:opacity-90">
                        <Sparkles className="h-4 w-4" />Generar Reporte + Plan
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Analysis results */}
              {wa && planStep === "done" && (
                <div className="flex flex-col gap-5">
                  {/* Bloque 1 — Weekly Report */}
                  {weeklyReport && <WeeklyReportBlock report={weeklyReport} />}

                  {/* Bloque 2 — Content Plan Preview */}
                  {contentPlan && (
                    <ContentPlanPreview
                      contentPlan={contentPlan}
                      onConfirm={() => setFillModalOpen(true)}
                    />
                  )}

                  {/* KPI row */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                      { label: "Posts",        value: ws?.totalPosts ?? 0,                        color: "text-lime-400"   },
                      { label: "Likes",        value: (ws?.totalLikes    ?? 0).toLocaleString(),  color: "text-pink-400"  },
                      { label: "Comentarios",  value: (ws?.totalComments ?? 0).toLocaleString(),  color: "text-violet-400"},
                      { label: "Vistas",       value: (ws?.totalViews    ?? 0).toLocaleString(),  color: "text-cyan-400"  },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
                        <p className={cn("font-display text-[28px] font-bold tabular-nums", color)}>{value}</p>
                        <p className="mt-1 text-[12px] text-muted-foreground/60">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Voice analysis */}
                  {wa.voiceAnalysis && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-lime-500 to-emerald-500" />
                      <div className="p-5 flex flex-col gap-4">
                        <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                          <Zap className="h-4 w-4 text-lime-400" />Voz de Marca
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/40 mb-1">Tono</p>
                            <ScoreBar score={wa.voiceAnalysis.toneScore ?? 0} color="bg-lime-400" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/40 mb-1">Consistencia</p>
                            <ScoreBar score={wa.voiceAnalysis.consistencyScore ?? 0} color="bg-emerald-400" />
                          </div>
                        </div>
                        {(wa.voiceAnalysis.strengths ?? []).length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/40">Fortalezas</p>
                            {(wa.voiceAnalysis.strengths ?? []).map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-foreground/80">
                                <Star className="h-3.5 w-3.5 mt-0.5 text-lime-400 shrink-0" />{s}
                              </div>
                            ))}
                          </div>
                        )}
                        {(wa.voiceAnalysis.opportunities ?? []).length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/40">Oportunidades</p>
                            {(wa.voiceAnalysis.opportunities ?? []).map((o, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-foreground/80">
                                <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-amber-400 shrink-0" />{o}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Audience alignment */}
                  {wa.audienceAlignment && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-purple-500 to-pink-500" />
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-400" />Alineación con Audiencia
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[22px] font-bold text-purple-400 tabular-nums">{wa.audienceAlignment.score ?? 0}</span>
                            <span className="text-[13px] text-muted-foreground/40">/10</span>
                          </div>
                        </div>
                        {wa.audienceAlignment.notes && (
                          <p className="text-[13px] text-foreground/70 leading-relaxed">{wa.audienceAlignment.notes}</p>
                        )}
                        {(wa.audienceAlignment.emotionalHooks ?? []).length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground/40">Hooks Emocionales</p>
                            {(wa.audienceAlignment.emotionalHooks ?? []).map((h, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-foreground/80">
                                <Target className="h-3.5 w-3.5 mt-0.5 text-purple-400 shrink-0" />{h}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Next week plan */}
                  {(wa.nextWeekPlan?.contentPieces ?? []).length > 0 && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-cyan-500 to-lime-500" />
                      <div className="p-5 flex flex-col gap-4">
                        <div>
                          <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-cyan-400" />Plan Próxima Semana
                          </h3>
                          {wa.nextWeekPlan.theme && (
                            <p className="mt-1 text-[13px] text-muted-foreground/60">{wa.nextWeekPlan.theme}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-3">
                          {(wa.nextWeekPlan.contentPieces ?? []).map((cp, i) => {
                            const FmtIcon = FORMAT_ICON[cp.format] ?? Video;
                            const fmtColor = FORMAT_COLOR[cp.format] ?? "text-lime-400 bg-lime-500/10 border-lime-500/25";
                            return (
                              <div key={i} className="rounded-xl border border-border/30 bg-white/[0.02] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[11px] font-semibold text-muted-foreground/50 w-16">{cp.day}</span>
                                  <span className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", fmtColor)}>
                                    <FmtIcon className="h-2.5 w-2.5" />{cp.format}
                                  </span>
                                </div>
                                <p className="text-[13px] font-semibold text-foreground mb-1">{cp.topic}</p>
                                {cp.hook && (
                                  <p className="text-[12px] text-lime-300/80 italic mb-2">"{cp.hook}"</p>
                                )}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground/50">
                                  {cp.cta   && <span><span className="text-muted-foreground/30">CTA: </span>{cp.cta}</span>}
                                  {cp.notes && <span>{cp.notes}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {(wa.nextWeekPlan.hashtags ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(wa.nextWeekPlan.hashtags ?? []).map((h, i) => (
                              <span key={i} className="rounded-full border border-lime-500/25 bg-lime-500/8 px-2.5 py-0.5 text-[11px] font-medium text-lime-400">
                                #{h}
                              </span>
                            ))}
                          </div>
                        )}
                        {wa.nextWeekPlan.keyMessage && (
                          <div className="rounded-xl border border-lime-500/20 bg-lime-500/5 px-4 py-3">
                            <p className="text-[11px] uppercase tracking-wide text-lime-400/60 mb-1">Mensaje clave</p>
                            <p className="text-[13px] text-lime-300/90">{wa.nextWeekPlan.keyMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action items */}
                  {(wa.actionItems ?? []).length > 0 && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-amber-500 to-orange-400" />
                      <div className="p-5 flex flex-col gap-3">
                        <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-amber-400" />Acciones Esta Semana
                        </h3>
                        {(wa.actionItems ?? []).map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-[10px] font-bold text-amber-400">
                              {i + 1}
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tendencias 2025 */}
                  {wa.trendInsights && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-violet-500 to-pink-500" />
                      <div className="p-5 flex flex-col gap-4">
                        <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                          <FlameKindling className="h-4 w-4 text-violet-400" />Tendencias 2025 — Tu Nicho
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {(wa.trendInsights.topFormatsNow ?? []).length > 0 && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-violet-400/70">Formatos que están explotando ahora</p>
                              {wa.trendInsights.topFormatsNow.map((f, i) => (
                                <div key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                                  <FlameKindling className="h-3 w-3 mt-0.5 shrink-0 text-violet-400" />{f}
                                </div>
                              ))}
                            </div>
                          )}
                          {(wa.trendInsights.viralHooksToTest ?? []).length > 0 && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-pink-400/70">Hooks virales listos para grabar</p>
                              {wa.trendInsights.viralHooksToTest.map((h, i) => (
                                <div key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                                  <Zap className="h-3 w-3 mt-0.5 shrink-0 text-pink-400" />
                                  <span className="italic text-pink-200/80">"{h}"</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {(wa.trendInsights.contentGaps ?? []).length > 0 && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-400/70">Gaps vs competencia</p>
                              {wa.trendInsights.contentGaps.map((g, i) => (
                                <div key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                                  <AlertCircle className="h-3 w-3 mt-0.5 shrink-0 text-amber-400" />{g}
                                </div>
                              ))}
                            </div>
                          )}
                          {(wa.trendInsights.algorithmTips ?? []).length > 0 && (
                            <div className="flex flex-col gap-2">
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-cyan-400/70">Tips de algoritmo</p>
                              {wa.trendInsights.algorithmTips.map((t, i) => (
                                <div key={i} className="flex items-start gap-2 text-[12px] text-foreground/80">
                                  <Brain className="h-3 w-3 mt-0.5 shrink-0 text-cyan-400" />{t}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Estrategia de Crecimiento */}
                  {wa.growthStrategy && (
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-cyan-400" />
                      <div className="p-5 flex flex-col gap-4">
                        <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                          <Rocket className="h-4 w-4 text-emerald-400" />Estrategia de Crecimiento
                        </h3>
                        {wa.growthStrategy.mainBottleneck && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 flex items-start gap-2.5">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                            <div>
                              <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-400/70 mb-0.5">Freno #1 al crecimiento</p>
                              <p className="text-[13px] text-foreground/90">{wa.growthStrategy.mainBottleneck}</p>
                            </div>
                          </div>
                        )}
                        {(wa.growthStrategy.quickWins ?? []).length > 0 && (
                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-400/70">Quick wins esta semana</p>
                            {wa.growthStrategy.quickWins.map((w, i) => (
                              <div key={i} className="flex items-start gap-2 text-[13px] text-foreground/80">
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                                  {i + 1}
                                </div>
                                {w}
                              </div>
                            ))}
                          </div>
                        )}
                        {(wa.growthStrategy.contentPillars ?? []).length > 0 && (
                          <div className="flex flex-col gap-3">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-cyan-400/70">Pilares de contenido</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {wa.growthStrategy.contentPillars.map((cp, i) => (
                                <div key={i} className="rounded-xl border border-border/30 bg-white/[0.02] p-3 flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[13px] font-semibold text-foreground">{cp.pillar}</p>
                                    <span className="text-[10px] text-cyan-400 font-medium">{cp.frequency}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground/60">{cp.why}</p>
                                  {cp.exampleHook && (
                                    <p className="text-[11px] italic text-lime-300/70">"{cp.exampleHook}"</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {planLoadedAt && (
                      <p className="text-[10px] text-muted-foreground/40">
                        Generado {new Date(planLoadedAt).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                    <div className="ml-auto">
                      <Button variant="outline" onClick={() => { setPlanStep("idle"); setWeeklyAnalysis(null); setPaMap({}); setWeeklyReport(null); setContentPlan(null); }}
                        className="gap-2 text-[12px]">
                        <RefreshCw className="h-3.5 w-3.5" />Nueva Revisión
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly log — always visible */}
              <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                <div className="h-[3px] bg-gradient-to-r from-cyan-500 via-lime-500 to-purple-500" />
                <div className="p-5 flex flex-col gap-4">
                  <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-lime-400" />Log Mensual de Analíticas
                  </h3>
                  <MonthlyLog refreshKey={logRefreshKey} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════ TAB 4: GESTIÓN ══════════════ */}
          <TabsContent value="gestion" className="mt-4">
            <div className="flex flex-col gap-5">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Programados" count={byStatus("scheduled").length} color="text-emerald-400" bg="bg-emerald-400" />
                <StatCard label="Borradores"  count={byStatus("draft").length}     color="text-zinc-300"   bg="bg-zinc-400"    />
                <StatCard label="Publicados"  count={byStatus("published").length} color="text-blue-400"   bg="bg-blue-400"    />
                <StatCard label="Backlog"     count={byStatus("backlog").length}    color="text-orange-400" bg="bg-orange-400"  />
              </div>

              {/* Search + new post */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar captions o hashtags…" className="pl-9"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button onClick={() => { setEditPost(null); setDialogOpen(true); }}
                  className="gap-2 bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-900/30">
                  <Plus className="h-4 w-4" />Nuevo Post
                </Button>
              </div>

              {/* Status tabs */}
              <Tabs defaultValue="scheduled" className="w-full">
                <TabsList className="mb-1 h-auto gap-1 bg-card p-1">
                  {MGMT_TABS.map(({ value, label, icon: Icon, iconColor }) => {
                    const count = filterMgmt(value).length;
                    return (
                      <TabsTrigger key={value} value={value}
                        className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background">
                        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                        {label}
                        <Badge variant="secondary" className="h-4 min-w-4 rounded-full px-1.5 text-[10px] leading-none">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {MGMT_TABS.map(({ value, emptyText }) => {
                  const tabPosts = filterMgmt(value);
                  return (
                    <TabsContent key={value} value={value} className="mt-4">
                      {!hydrated ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {[...Array(3)].map((_, i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-card" />)}
                        </div>
                      ) : tabPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 py-16 text-center">
                          <Instagram className="h-8 w-8 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">{emptyText}</p>
                          {value !== "published" && (
                            <Button size="sm" variant="outline"
                              onClick={() => { setEditPost(null); setDialogOpen(true); }}
                              className="mt-1 gap-1.5">
                              <Plus className="h-3.5 w-3.5" />Añadir Post
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {tabPosts.map((post) => (
                            <MgmtPostCard key={post.id} post={post}
                              onDelete={deletePost}
                              onStatusChange={(id, status) => updatePost(id, { status })}
                              onEdit={(p) => { setEditPost(p); setDialogOpen(true); }} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewPostDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditPost(null); }}
        editPost={editPost}
        onSave={handleSave}
      />

      {contentPlan && (
        <CalendarFillModal
          open={fillModalOpen}
          onOpenChange={setFillModalOpen}
          contentPlan={contentPlan}
        />
      )}
    </>
  );
}
