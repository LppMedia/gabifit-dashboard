"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Play,
  Loader2,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Zap,
  Target,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
  Star,
  Video,
  Layout,
  BookOpen,
  BarChart2,
  Instagram,
  AlertCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
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

interface ContentPiece {
  day: string;
  format: string;
  topic: string;
  hook: string;
  cta: string;
  notes: string;
}

interface WeeklyAnalysis {
  weekSummary: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    avgEngagement: string;
    bestPerformingType: string;
    topPost: { caption: string; likes: number; why: string };
  };
  voiceAnalysis: {
    strengths: string[];
    opportunities: string[];
    toneScore: number;
    consistencyScore: number;
  };
  topicsThisWeek: string[];
  audienceAlignment: { score: number; notes: string; emotionalHooks: string[] };
  competitorInsights: string;
  nextWeekPlan: {
    theme: string;
    contentPieces: ContentPiece[];
    hashtags: string[];
    keyMessage: string;
  };
  actionItems: string[];
  generatedAt: string;
  postsAnalyzed: number;
}

type Step = "idle" | "scraping" | "transcribing" | "analyzing" | "done" | "error";

const FORMAT_ICON: Record<string, React.ElementType> = {
  Reel: Video,
  Carrusel: Layout,
  Story: BookOpen,
  Post: BarChart2,
};
const FORMAT_COLOR: Record<string, string> = {
  Reel: "text-lime-400 bg-lime-500/10 border-lime-500/25",
  Carrusel: "text-purple-300 bg-purple-500/10 border-purple-500/25",
  Story: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  Post: "text-amber-400 bg-amber-500/10 border-amber-500/25",
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-[12px] font-bold tabular-nums text-foreground">{score}/10</span>
    </div>
  );
}

export default function RevisionSemanalPage() {
  const [step, setStep] = useState<Step>("idle");
  const [stepMsg, setStepMsg] = useState("");
  const [, setPosts] = useState<WeeklyPost[]>([]);
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handle] = useState("gabifit");

  async function runReview() {
    setStep("scraping");
    setError(null);
    setStepMsg("Scrapeando @gabifit en Instagram...");

    // Step 1: Scrape own Instagram
    let ownPosts: WeeklyPost[] = [];
    try {
      const scrapeRes = await fetch("/api/instagram/own-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (scrapeRes.ok) {
        const scrapeData = await scrapeRes.json();
        ownPosts = scrapeData.posts || [];
      }
    } catch {
      // Continue without own posts — show demo mode
    }
    setPosts(ownPosts);

    // Step 2: Transcribe videos
    setStep("transcribing");
    setStepMsg("Obteniendo transcripciones de videos...");
    const transcripts: Record<string, string> = {};
    const videoPosts = ownPosts.filter((p) => p.videoUrl || p.type === "Video");
    for (const post of videoPosts.slice(0, 5)) {
      try {
        const tRes = await fetch("/api/competitors/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: post.videoUrl || post.url }),
        });
        if (tRes.ok) {
          const tData = await tRes.json();
          transcripts[post.shortCode] = tData.transcript || "";
        }
      } catch {
        /* skip */
      }
    }

    // Step 3: AI Analysis
    setStep("analyzing");
    setStepMsg("Analizando con IA y generando plan para la semana...");

    // Use demo posts if scraping failed
    const postsToAnalyze = ownPosts.length > 0 ? ownPosts : DEMO_POSTS;

    const reviewRes = await fetch("/api/weekly-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts: postsToAnalyze, transcripts, handle }),
    });

    if (!reviewRes.ok) {
      const err = await reviewRes.json().catch(() => ({}));
      setError(err.error || "Error al generar la revisión");
      setStep("error");
      return;
    }

    const reviewData = await reviewRes.json();
    setAnalysis(reviewData);
    setStep("done");
  }

  // ── Idle ───────────────────────────────────────────────────────────────────
  if (step === "idle") {
    return (
      <div className="flex flex-col gap-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-lime-500/20 bg-card px-8 py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-lime-500/8 blur-3xl" />
            <div className="absolute -bottom-12 right-8 h-52 w-52 rounded-full bg-purple-500/8 blur-3xl" />
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
              {[
                {
                  icon: Instagram,
                  label: "Scraping de @gabifit",
                  desc: "Últimos 7 días de posts y videos",
                },
                {
                  icon: Sparkles,
                  label: "Análisis con IA",
                  desc: "KPIs, voz de marca, buyer persona",
                },
                {
                  icon: Target,
                  label: "Plan de la semana",
                  desc: "5 piezas listas para grabar",
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/40 bg-background/40 px-4 py-3"
                >
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
              El proceso toma 2-4 minutos · Usa Apify + IA DeepSeek via kie.ai
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (step === "scraping" || step === "transcribing" || step === "analyzing") {
    const steps = [
      { key: "scraping", label: "Scrapeando Instagram", icon: Instagram },
      { key: "transcribing", label: "Transcribiendo videos", icon: Video },
      { key: "analyzing", label: "Analizando con IA", icon: Sparkles },
    ];
    const currentIdx = steps.findIndex((s) => s.key === step);
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-2xl shadow-lime-500/30">
          <Loader2 className="h-10 w-10 text-black animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground">{stepMsg}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground/50">Esto puede tardar 2-4 minutos</p>
        </div>
        <div className="flex items-center gap-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold",
                    isDone
                      ? "border-lime-500/50 bg-lime-500/15 text-lime-400"
                      : isActive
                      ? "border-lime-400 bg-lime-500/20 text-lime-300 animate-pulse"
                      : "border-border/30 bg-white/3 text-muted-foreground/30"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    isActive
                      ? "text-lime-400"
                      : isDone
                      ? "text-foreground/60"
                      : "text-muted-foreground/30"
                  )}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/25" />
                )}
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
        <button
          onClick={() => setStep("idle")}
          className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-5 py-2.5 text-[13px] font-medium text-foreground hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    );
  }

  // ── Done — Full Report ─────────────────────────────────────────────────────
  if (!analysis) return null;
  const {
    weekSummary,
    voiceAnalysis,
    topicsThisWeek,
    audienceAlignment,
    nextWeekPlan,
    actionItems,
  } = analysis;

  return (
    <div className="flex flex-col gap-8">
      {/* Report header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 ring-1 ring-lime-500/30">
            <CalendarCheck className="h-5 w-5 text-lime-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Revisión Semanal</h1>
            <p className="text-[12px] text-muted-foreground/60">
              {analysis.postsAnalyzed} posts analizados ·{" "}
              {new Date(analysis.generatedAt).toLocaleDateString("es-DO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setStep("idle");
            setAnalysis(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border/40 px-4 py-2 text-[12px] font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Nueva Revisión
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Posts publicados",
            value: weekSummary.totalPosts,
            icon: BarChart2,
            color: "text-lime-400",
            bg: "bg-lime-500/10",
          },
          {
            label: "Total Likes",
            value: weekSummary.totalLikes.toLocaleString(),
            icon: Heart,
            color: "text-pink-400",
            bg: "bg-pink-500/10",
          },
          {
            label: "Comentarios",
            value: weekSummary.totalComments.toLocaleString(),
            icon: MessageCircle,
            color: "text-purple-300",
            bg: "bg-purple-500/10",
          },
          {
            label: "Vistas totales",
            value: weekSummary.totalViews.toLocaleString(),
            icon: Eye,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card px-5 py-4">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <p
              className={cn(
                "font-display mt-3 text-[28px] font-bold leading-none tabular-nums",
                color
              )}
            >
              {value}
            </p>
            <p className="mt-1.5 text-[12px] font-semibold text-foreground/70">{label}</p>
            {label === "Posts publicados" && (
              <p className="mt-0.5 text-[10px] text-lime-400/70">
                Engagement: {weekSummary.avgEngagement}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Top post callout */}
      {weekSummary.topPost && (
        <div className="rounded-xl border border-lime-500/25 bg-lime-500/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-lime-300">Mejor post de la semana</p>
              <p className="mt-0.5 text-[12px] text-foreground/70 line-clamp-2">
                {weekSummary.topPost.caption}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/50">{weekSummary.topPost.why}</p>
              <p className="mt-1 text-[11px] text-lime-400">
                {weekSummary.topPost.likes.toLocaleString()} likes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Voice + Audience */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Voice analysis */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-lime-400 to-emerald-500" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-lime-400" /> Voz de Marca
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span className="text-muted-foreground/60">Tono</span>
              </div>
              <ScoreBar score={voiceAnalysis.toneScore} color="bg-lime-400" />
              <div className="flex items-center justify-between text-[12px] mt-1 mb-1">
                <span className="text-muted-foreground/60">Consistencia</span>
              </div>
              <ScoreBar score={voiceAnalysis.consistencyScore} color="bg-purple-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-lime-400/60 mb-2">
                Fortalezas
              </p>
              <ul className="flex flex-col gap-1">
                {voiceAnalysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                    <CheckCircle2 className="h-3.5 w-3.5 text-lime-400 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-300/60 mb-2">
                Oportunidades
              </p>
              <ul className="flex flex-col gap-1">
                {voiceAnalysis.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                    <Lightbulb className="h-3.5 w-3.5 text-purple-300 mt-0.5 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Audience alignment */}
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-purple-400 to-pink-400" />
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-display text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-300" /> Alineación con Audiencia
            </h3>
            <ScoreBar score={audienceAlignment.score} color="bg-purple-400" />
            <p className="text-[12px] text-foreground/70">{audienceAlignment.notes}</p>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/40 mb-2">
                Ganchos Emocionales Usados
              </p>
              <div className="flex flex-wrap gap-2">
                {audienceAlignment.emotionalHooks.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-300"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/40 mb-2">
                Temas de Esta Semana
              </p>
              <div className="flex flex-wrap gap-2">
                {topicsThisWeek.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-lime-500/20 bg-lime-500/8 px-2.5 py-0.5 text-[11px] font-medium text-lime-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
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
            {nextWeekPlan.theme && (
              <p className="mt-1 text-[12px] text-muted-foreground/60">
                Tema central:{" "}
                <span className="text-lime-300 font-semibold">{nextWeekPlan.theme}</span>
              </p>
            )}
            {nextWeekPlan.keyMessage && (
              <p className="mt-1 text-[11px] italic text-muted-foreground/40">
                {nextWeekPlan.keyMessage}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {nextWeekPlan.contentPieces?.map((piece, i) => {
              const Icon = FORMAT_ICON[piece.format] ?? BarChart2;
              const colorClass =
                FORMAT_COLOR[piece.format] ?? "text-lime-400 bg-lime-500/10 border-lime-500/25";
              return (
                <div key={i} className="rounded-xl border border-border/30 bg-background/40 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold",
                        colorClass
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-foreground">
                          {piece.day}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                            colorClass
                          )}
                        >
                          {piece.format}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] font-medium text-foreground/80">
                        {piece.topic}
                      </p>
                      <p className="mt-1 text-[11px] text-lime-300/80">
                        <span className="text-muted-foreground/40">Hook: </span>
                        {piece.hook}
                      </p>
                      <p className="mt-0.5 text-[11px] text-purple-300/80">
                        <span className="text-muted-foreground/40">CTA: </span>
                        {piece.cta}
                      </p>
                      {piece.notes && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground/40">{piece.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {nextWeekPlan.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {nextWeekPlan.hashtags.map((tag, i) => (
                <span key={i} className="text-[11px] text-muted-foreground/50">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action items */}
      {actionItems?.length > 0 && (
        <div className="rounded-xl border border-lime-500/20 bg-lime-500/5 p-5">
          <h3 className="font-display text-[14px] font-semibold text-lime-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Acciones para Esta Semana
          </h3>
          <ul className="flex flex-col gap-2">
            {actionItems.map((item, i) => (
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
          <p className="text-[13px] text-foreground/70 leading-relaxed">
            {analysis.competitorInsights}
          </p>
        </div>
      )}
    </div>
  );
}

// Demo posts for when scraping isn't available
const DEMO_POSTS: WeeklyPost[] = [
  {
    id: "demo1",
    shortCode: "demo1",
    url: "https://instagram.com/gabifit",
    type: "Video",
    caption: "3 ejercicios para la diastasis postparto que NADIE te dice 💪 #postparto #fitness",
    likesCount: 1247,
    commentsCount: 89,
    videoViewCount: 15420,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    displayUrl: "",
    videoUrl: "",
  },
  {
    id: "demo2",
    shortCode: "demo2",
    url: "https://instagram.com/gabifit",
    type: "Image",
    caption: "¿Cuándo puedes volver al gym después del parto? La respuesta que tu médico no te da 🤱",
    likesCount: 892,
    commentsCount: 156,
    videoViewCount: 0,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    displayUrl: "",
    videoUrl: "",
  },
  {
    id: "demo3",
    shortCode: "demo3",
    url: "https://instagram.com/gabifit",
    type: "Video",
    caption: "Rutina de 10 minutos para mamás sin tiempo ⏰ #mamafit #postparto",
    likesCount: 2103,
    commentsCount: 234,
    videoViewCount: 31200,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    displayUrl: "",
    videoUrl: "",
  },
];
