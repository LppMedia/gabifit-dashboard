"use client";

import { ElementType, useEffect, useState } from "react";
import {
  CalendarCheck, Play, Loader2, TrendingUp, Heart, MessageCircle, Eye,
  Zap, Target, ChevronRight, RefreshCw, CheckCircle2, Lightbulb, Star,
  Video, LayoutGrid, BookOpen, BarChart2, Instagram, AlertCircle,
  Sparkles, Users, TrendingDown, Minus, ExternalLink, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeeklyPost {
  id: string;
  shortCode: string;
  url: string;
  type: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  timestamp: string;
  displayUrl: string;
  videoUrl: string;
}

interface PostAnalysis {
  shortCode: string;
  performanceScore: number;
  tier: "viral" | "good" | "avg" | "low";
  why: string;
  whatToRepeat: string;
}

interface ContentPiece {
  day: string; format: string; topic: string;
  hook: string; cta: string; notes: string;
}

interface WeeklyAnalysis {
  weekSummary: {
    totalPosts: number; totalLikes: number; totalComments: number;
    totalViews: number; avgEngagement: string; bestPerformingType: string;
    topPost: { caption: string; likes: number; why: string } | null;
  };
  postAnalyses: PostAnalysis[];
  voiceAnalysis: {
    strengths: string[]; opportunities: string[];
    toneScore: number; consistencyScore: number;
  };
  topicsThisWeek: string[];
  audienceAlignment: { score: number; notes: string; emotionalHooks: string[] };
  competitorInsights: string;
  nextWeekPlan: {
    theme: string; contentPieces: ContentPiece[];
    hashtags: string[]; keyMessage: string;
  };
  actionItems: string[];
  generatedAt: string;
  postsAnalyzed: number;
}

interface MonthlyEntry {
  week: string;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  avgEngagement: string;
}

type Step = "idle" | "scraping" | "transcribing" | "analyzing" | "saving" | "done" | "error";

// ─── Demo posts ───────────────────────────────────────────────────────────────
const DEMO_POSTS: WeeklyPost[] = [
  { id: "d1", shortCode: "d1", url: "https://instagram.com/gabifitrd", type: "Video",
    caption: "3 ejercicios para la diastasis postparto que NADIE te dice 💪 #postparto",
    likesCount: 1247, commentsCount: 89, videoViewCount: 15420,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), displayUrl: "", videoUrl: "" },
  { id: "d2", shortCode: "d2", url: "https://instagram.com/gabifitrd", type: "Image",
    caption: "¿Cuándo puedes volver al gym después del parto? La respuesta real 🤱",
    likesCount: 892, commentsCount: 156, videoViewCount: 0,
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), displayUrl: "", videoUrl: "" },
  { id: "d3", shortCode: "d3", url: "https://instagram.com/gabifitrd", type: "Video",
    caption: "Rutina de 10 minutos para mamás sin tiempo ⏰ #mamafit",
    likesCount: 2103, commentsCount: 234, videoViewCount: 31200,
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), displayUrl: "", videoUrl: "" },
];

// ─── Format config ────────────────────────────────────────────────────────────
const FORMAT_ICON: Record<string, ElementType> = {
  Reel: Video, Carrusel: LayoutGrid, Story: BookOpen, Post: BarChart2,
};
const FORMAT_COLOR: Record<string, string> = {
  Reel:     "text-lime-400 bg-lime-500/10 border-lime-500/25",
  Carrusel: "text-purple-300 bg-purple-500/10 border-purple-500/25",
  Story:    "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Post:     "text-amber-400 bg-amber-500/10 border-amber-500/25",
};

const TIER_CONFIG = {
  viral: { label: "🔥 Viral",    bg: "bg-lime-500",     text: "text-black"           },
  good:  { label: "✓ Bueno",    bg: "bg-emerald-500/80", text: "text-white"          },
  avg:   { label: "~ Promedio", bg: "bg-amber-500/70",  text: "text-black"           },
  low:   { label: "↓ Bajo",     bg: "bg-red-500/60",    text: "text-white"           },
};

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={cn("h-full rounded-full", color)}
          style={{ width: `${Math.min(100, (score ?? 0) * 10)}%` }} />
      </div>
      <span className="text-[12px] font-bold tabular-nums text-foreground">{score ?? 0}/10</span>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, analysis }: { post: WeeklyPost; analysis?: PostAnalysis }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const isVideo = post.type === "Video" || post.type === "Reel" || !!post.videoUrl;
  const tier    = analysis?.tier ?? (
    post.videoViewCount > 15000 ? "viral" :
    post.videoViewCount > 5000  ? "good"  :
    post.likesCount > 500       ? "good"  :
    post.likesCount > 100       ? "avg"   : "low"
  ) as "viral" | "good" | "avg" | "low";
  const tc = TIER_CONFIG[tier];
  const proxyThumb = post.displayUrl
    ? `/api/proxy-image?url=${encodeURIComponent(post.displayUrl)}`
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Thumbnail / Video */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-purple-900/30 to-pink-900/20 overflow-hidden">
        {videoOpen && post.videoUrl ? (
          <>
            <video
              src={post.videoUrl} autoPlay controls
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setVideoOpen(false)}
            />
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </>
        ) : (
          <>
            {proxyThumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={proxyThumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* Play overlay */}
            {isVideo && (
              <button
                onClick={() => post.videoUrl ? setVideoOpen(true) : window.open(post.url, "_blank")}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm ring-2 ring-white/20">
                  <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                </div>
              </button>
            )}
            {/* Open link */}
            <a
              href={post.url} target="_blank" rel="noopener"
              className={cn(
                "absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white transition-colors",
                isVideo && "hidden"
              )}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}

        {/* Tier badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", tc.bg, tc.text)}>
            {tc.label}
          </span>
        </div>
        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {post.type}
          </span>
        </div>
      </div>

      {/* Stats row */}
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

      {/* Caption */}
      {post.caption && (
        <p className="px-3 pt-1.5 text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
          {post.caption}
        </p>
      )}

      {/* AI insight */}
      {analysis?.why && (
        <div className="mx-3 mt-2 mb-3 rounded-lg bg-lime-500/5 border border-lime-500/15 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-lime-400/60 mb-0.5">
            Por qué {tier === "low" || tier === "avg" ? "no " : ""}funcionó
          </p>
          <p className="text-[11px] text-lime-300/80 leading-relaxed">{analysis.why}</p>
          {analysis.whatToRepeat && (
            <p className="mt-1 text-[10px] text-purple-300/70">
              <span className="text-muted-foreground/40">Repetir: </span>{analysis.whatToRepeat}
            </p>
          )}
        </div>
      )}
      {!analysis?.why && <div className="mb-3" />}
    </div>
  );
}

// ─── Monthly Log ──────────────────────────────────────────────────────────────
function MonthlyLog() {
  const [entries, setEntries] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 py-6 text-[13px] text-muted-foreground/50">
      <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
    </div>
  );
  if (!entries.length) return (
    <p className="py-4 text-[13px] text-muted-foreground/40">
      Aún no hay historial. Corre tu primera Revisión Semanal para empezar el log.
    </p>
  );

  // Max values for bar scaling
  const maxViews = Math.max(...entries.map((e) => e.totalViews), 1);
  const maxLikes = Math.max(...entries.map((e) => e.totalLikes), 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Bars chart */}
      <div className="overflow-x-auto">
        <div className="flex items-end gap-2 min-w-max pb-2">
          {[...entries].reverse().map((e) => (
            <div key={e.week} className="flex flex-col items-center gap-1 w-14">
              <div className="relative w-full flex flex-col items-center gap-0.5" style={{ height: 80 }}>
                <div
                  className="w-4 rounded-t bg-lime-400/70"
                  style={{ height: `${(e.totalViews / maxViews) * 72}px`, minHeight: 4 }}
                  title={`${e.totalViews.toLocaleString()} vistas`}
                />
              </div>
              <span className="text-[9px] text-muted-foreground/50 text-center leading-tight">
                {new Date(e.week + "T12:00:00").toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/30 mt-1">Vistas totales por semana</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/30">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border/30 bg-white/[0.02]">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Semana</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Posts</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Likes</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Vistas</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Engagement</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">Tendencia</th>
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
          {entries.length} revisiones registradas · máx. vistas semana: {maxViews.toLocaleString()} · máx. likes: {maxLikes.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RevisionSemanalPage() {
  const [step, setStep]         = useState<Step>("idle");
  const [stepMsg, setStepMsg]   = useState("");
  const [posts, setPosts]       = useState<WeeklyPost[]>([]);
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [handle]                = useState("gabifitrd");
  const [isDemo, setIsDemo]     = useState(false);

  async function runReview() {
    setStep("scraping");
    setError(null);
    setIsDemo(false);
    setStepMsg("Scrapeando @gabifitrd en Instagram...");

    // 1 — Scrape
    let ownPosts: WeeklyPost[] = [];
    try {
      const res = await fetch("/api/instagram/own-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (res.ok) ownPosts = (await res.json()).posts ?? [];
    } catch { /* continue */ }

    const postsToAnalyze = ownPosts.length > 0 ? ownPosts : DEMO_POSTS;
    if (ownPosts.length === 0) setIsDemo(true);
    setPosts(postsToAnalyze);

    // 2 — Transcribe videos (top 4)
    setStep("transcribing");
    setStepMsg("Transcribiendo videos...");
    const transcripts: Record<string, string> = {};
    for (const p of postsToAnalyze.filter((p) => p.videoUrl || p.type === "Video").slice(0, 4)) {
      try {
        const r = await fetch("/api/competitors/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: p.videoUrl || p.url }),
        });
        if (r.ok) transcripts[p.shortCode] = (await r.json()).transcript ?? "";
      } catch { /* skip */ }
    }

    // 3 — AI analysis
    setStep("analyzing");
    setStepMsg("Analizando con IA...");
    let reviewData: WeeklyAnalysis;
    try {
      const r = await fetch("/api/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: postsToAnalyze, transcripts, handle }),
      });
      if (!r.ok) {
        setError(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Error IA");
        setStep("error");
        return;
      }
      reviewData = await r.json();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setStep("error");
      return;
    }

    // 4 — Save to Supabase
    setStep("saving");
    setStepMsg("Guardando en Supabase...");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const ws = new Date();
        ws.setDate(ws.getDate() - ws.getDay());
        ws.setHours(0, 0, 0, 0);
        await Promise.all([
          supabase.from("weekly_reviews").upsert({
            user_id: user.id,
            week_start_date: ws.toISOString().split("T")[0],
            posts: postsToAnalyze,
            analysis: reviewData,
            scraped_at: new Date().toISOString(),
          }),
          supabase.from("ig_profile_cache").upsert({
            user_id: user.id, handle,
            posts: postsToAnalyze,
            updated_at: new Date().toISOString(),
            source: "weekly_review",
          }),
        ]);
      }
    } catch { /* non-critical */ }

    setAnalysis(reviewData);
    setStep("done");
  }

  // ── Idle ───────────────────────────────────────────────────────────────────
  if (step === "idle") {
    return (
      <div className="flex flex-col gap-8">
        <div className="relative overflow-hidden rounded-2xl border border-lime-500/20 bg-card px-8 py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-lime-500/[0.07] blur-3xl" />
            <div className="absolute -bottom-12 right-8 h-52 w-52 rounded-full bg-purple-500/[0.07] blur-3xl" />
          </div>
          <div className="relative flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-xl shadow-lime-500/25">
                <CalendarCheck className="h-6 w-6 text-black" />
              </div>
              <div>
                <h1 className="font-display text-[28px] font-bold leading-none tracking-tight text-foreground">
                  Revisión Semanal
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground/60">
                  Cada lunes · Analiza la semana, planifica la siguiente
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-2xl">
              {([
                { icon: Instagram, label: "Scraping @gabifitrd", desc: "Últimos 30 días de posts y videos" },
                { icon: Sparkles,  label: "Análisis con IA",     desc: "Por qué funcionó cada post" },
                { icon: Target,    label: "Plan de la semana",   desc: "5 piezas listas para grabar" },
              ] as const).map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-xl border border-border/40 bg-background/40 px-4 py-3">
                  <Icon className="h-4 w-4 text-lime-400 mb-2" />
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground/55 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={runReview}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 px-8 py-4 text-[15px] font-bold text-black shadow-xl shadow-lime-500/30 transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              <Play className="h-5 w-5 fill-black" />
              Iniciar Revisión Semanal
            </button>
            <p className="text-[11px] text-muted-foreground/30 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              2-4 minutos · Apify + IA DeepSeek via kie.ai
            </p>
          </div>
        </div>

        {/* Monthly log shown even on idle */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400" />
          <div className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-lime-400" /> Log Mensual de Analíticas
            </h3>
            <MonthlyLog />
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step !== "done" && step !== "error") {
    const STEPS = [
      { key: "scraping",     label: "Scrapeando Instagram", icon: Instagram    },
      { key: "transcribing", label: "Transcribiendo",       icon: Video        },
      { key: "analyzing",    label: "Analizando con IA",    icon: Sparkles     },
      { key: "saving",       label: "Guardando datos",      icon: CheckCircle2 },
    ] as const;
    const ci = STEPS.findIndex((s) => s.key === step);
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-2xl shadow-lime-500/30">
          <Loader2 className="h-10 w-10 text-black animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground">{stepMsg}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground/50">Esto puede tardar 2-4 minutos</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = i < ci;
            const active = i === ci;
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border",
                  done   ? "border-lime-500/50 bg-lime-500/15 text-lime-400"
                  : active ? "border-lime-400 bg-lime-500/20 text-lime-300 animate-pulse"
                  : "border-border/30 bg-white/[0.03] text-muted-foreground/30")}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn("text-[12px] font-medium hidden sm:block",
                  active ? "text-lime-400" : done ? "text-foreground/60" : "text-muted-foreground/30")}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/25" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-20">
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/30">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Error en la revisión</p>
          <p className="mt-1 text-[13px] text-muted-foreground/60">{error}</p>
        </div>
        <button onClick={() => { setStep("idle"); setError(null); }}
          className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-white/5">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (!analysis) return null;

  const ws           = analysis.weekSummary      ?? {} as WeeklyAnalysis["weekSummary"];
  const va           = analysis.voiceAnalysis    ?? {} as WeeklyAnalysis["voiceAnalysis"];
  const topics       = analysis.topicsThisWeek   ?? [];
  const aa           = analysis.audienceAlignment ?? {} as WeeklyAnalysis["audienceAlignment"];
  const nwp          = analysis.nextWeekPlan      ?? {} as WeeklyAnalysis["nextWeekPlan"];
  const actions      = analysis.actionItems       ?? [];
  const postAnalyses = analysis.postAnalyses      ?? [];

  // Build postAnalysis lookup by shortCode
  const paMap: Record<string, PostAnalysis> = {};
  for (const pa of postAnalyses) if (pa.shortCode) paMap[pa.shortCode] = pa;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 ring-1 ring-lime-500/30">
            <CalendarCheck className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Revisión Semanal</h1>
            <p className="text-[12px] text-muted-foreground/60">
              {analysis.postsAnalyzed ?? posts.length} posts analizados{isDemo && " (modo demo)"} ·{" "}
              {new Date(analysis.generatedAt ?? Date.now()).toLocaleDateString("es-DO", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
          </div>
        </div>
        <button onClick={() => { setStep("idle"); setAnalysis(null); setPosts([]); }}
          className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-4 py-2 text-[12px] font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Nueva Revisión
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Posts",     value: ws.totalPosts ?? 0,                      icon: BarChart2,     color: "text-lime-400",   bg: "bg-lime-500/10" },
          { label: "Likes",     value: (ws.totalLikes ?? 0).toLocaleString(),   icon: Heart,         color: "text-pink-400",   bg: "bg-pink-500/10" },
          { label: "Comentarios", value: (ws.totalComments ?? 0).toLocaleString(), icon: MessageCircle, color: "text-purple-300", bg: "bg-purple-500/10" },
          { label: "Vistas",    value: (ws.totalViews ?? 0).toLocaleString(),   icon: Eye,           color: "text-cyan-400",   bg: "bg-cyan-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <p className={cn("font-display mt-3 text-[28px] font-bold leading-none tabular-nums", color)}>{value}</p>
            <p className="mt-1.5 text-[12px] font-semibold text-foreground/70">{label}</p>
            {label === "Posts" && ws.avgEngagement && (
              <p className="mt-0.5 text-[10px] text-lime-400/70">Avg engagement: {ws.avgEngagement}</p>
            )}
          </div>
        ))}
      </div>

      {/* Top post */}
      {ws.topPost && (
        <div className="rounded-xl border border-lime-500/25 bg-lime-500/5 px-5 py-4 flex items-start gap-3">
          <Star className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-lime-300">Mejor post del período</p>
            <p className="mt-0.5 text-[12px] text-foreground/70 line-clamp-2">{ws.topPost.caption}</p>
            <p className="mt-1 text-[11px] text-muted-foreground/50">{ws.topPost.why}</p>
            <p className="mt-0.5 text-[11px] text-lime-400">{(ws.topPost.likes ?? 0).toLocaleString()} likes</p>
          </div>
        </div>
      )}

      {/* ── Post Grid ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-display text-[15px] font-semibold text-foreground mb-1 flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-400" />
          Posts Analizados
          <span className="ml-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-normal text-muted-foreground/50">
            {posts.length}
          </span>
        </h2>
        <p className="text-[11px] text-muted-foreground/40 mb-4">
          Haz clic en ▶ para reproducir el video directamente
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} analysis={paMap[p.shortCode]} />
          ))}
        </div>
      </div>

      {/* Voice + Audience */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-lime-400 to-emerald-500" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-lime-400" /> Voz de Marca
            </h3>
            <div className="flex flex-col gap-3">
              <div><p className="text-[11px] text-muted-foreground/50 mb-1">Tono</p>
                <ScoreBar score={va.toneScore ?? 0} color="bg-lime-400" /></div>
              <div><p className="text-[11px] text-muted-foreground/50 mb-1">Consistencia</p>
                <ScoreBar score={va.consistencyScore ?? 0} color="bg-purple-400" /></div>
            </div>
            {(va.strengths?.length ?? 0) > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-lime-400/60 mb-2">Fortalezas</p>
                <ul className="flex flex-col gap-1">
                  {va.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                      <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(va.opportunities?.length ?? 0) > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-300/60 mb-2">Oportunidades</p>
                <ul className="flex flex-col gap-1">
                  {va.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                      <Lightbulb className="h-3.5 w-3.5 text-purple-300 mt-0.5 shrink-0" />{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-purple-400 to-pink-400" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-300" /> Alineación con Audiencia
            </h3>
            <ScoreBar score={aa.score ?? 0} color="bg-purple-400" />
            {aa.notes && <p className="text-[12px] text-foreground/70">{aa.notes}</p>}
            {(aa.emotionalHooks?.length ?? 0) > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/40 mb-2">Ganchos Emocionales</p>
                <div className="flex flex-wrap gap-2">
                  {aa.emotionalHooks.map((h, i) => (
                    <span key={i} className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-300">{h}</span>
                  ))}
                </div>
              </div>
            )}
            {topics.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/40 mb-2">Temas del Período</p>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t, i) => (
                    <span key={i} className="rounded-full border border-lime-500/20 bg-lime-500/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-lime-300">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next week plan */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="h-[3px] w-full bg-gradient-to-r from-lime-400 via-emerald-400 to-purple-400" />
        <div className="p-5 flex flex-col gap-5">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-lime-400" /> Plan Próxima Semana
            </h3>
            {nwp.theme && <p className="mt-1 text-[12px] text-muted-foreground/60">
              Tema: <span className="text-lime-300 font-semibold">{nwp.theme}</span>
            </p>}
            {nwp.keyMessage && <p className="mt-0.5 text-[11px] italic text-muted-foreground/40">{nwp.keyMessage}</p>}
          </div>
          <div className="flex flex-col gap-3">
            {(nwp.contentPieces ?? []).map((piece, i) => {
              const Icon = FORMAT_ICON[piece.format] ?? BarChart2;
              const cc   = FORMAT_COLOR[piece.format] ?? "text-lime-400 bg-lime-500/10 border-lime-500/25";
              return (
                <div key={i} className="rounded-xl border border-border/30 bg-background/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", cc)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-foreground">{piece.day}</span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", cc)}>{piece.format}</span>
                      </div>
                      <p className="mt-0.5 text-[13px] font-medium text-foreground/80">{piece.topic}</p>
                      {piece.hook && <p className="mt-1 text-[11px] text-lime-300/80"><span className="text-muted-foreground/40">Hook: </span>{piece.hook}</p>}
                      {piece.cta  && <p className="mt-0.5 text-[11px] text-purple-300/80"><span className="text-muted-foreground/40">CTA: </span>{piece.cta}</p>}
                      {piece.notes && <p className="mt-0.5 text-[10px] text-muted-foreground/40">{piece.notes}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {(nwp.hashtags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {nwp.hashtags.map((t, i) => (
                <span key={i} className="text-[11px] text-muted-foreground/50">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action items */}
      {actions.length > 0 && (
        <div className="rounded-xl border border-lime-500/20 bg-lime-500/5 p-5">
          <h3 className="font-display text-[14px] font-semibold text-lime-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Acciones para Esta Semana
          </h3>
          <ul className="flex flex-col gap-2">
            {actions.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/70">
                <span className="text-lime-400 font-bold shrink-0">{i + 1}.</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitor insights */}
      {analysis.competitorInsights && (
        <div className="rounded-xl border border-border/40 bg-card p-5">
          <h3 className="font-display text-[14px] font-semibold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" /> Insights de Competidores
          </h3>
          <p className="text-[13px] text-foreground/70 leading-relaxed">{analysis.competitorInsights}</p>
        </div>
      )}

      {/* Monthly Log */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="h-[3px] w-full bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400" />
        <div className="p-5">
          <h3 className="font-display text-[15px] font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-lime-400" /> Log Mensual de Analíticas
          </h3>
          <MonthlyLog />
        </div>
      </div>
    </div>
  );
}
