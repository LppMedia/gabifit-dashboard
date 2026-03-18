"use client";

import { useState } from "react";
import {
  Mic,
  Sparkles,
  Zap,
  Lightbulb,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  X,
  Play,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedPost, CompetitorScrapedData } from "@/lib/scraped-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function proxyImg(url: string) {
  if (!url) return "";
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface LiveAnalysisModalProps {
  post: ScrapedPost | null;
  competitorId: string | null;
  scrapedData: CompetitorScrapedData | null;
  onClose: () => void;
  onFetchTranscript: (competitorId: string, postUrl: string) => Promise<void>;
  onAnalyze: (
    competitorId: string,
    postUrl: string,
    transcript: string,
    caption: string,
    handle: string
  ) => Promise<void>;
  transcribing: Set<string>;
  analyzing: Set<string>;
  errors: Record<string, string>;
}

type TabId = "video" | "transcript" | "estructura" | "adaptar";

const TABS: { id: TabId; label: string }[] = [
  { id: "video", label: "📹 Video" },
  { id: "transcript", label: "📝 Transcript" },
  { id: "estructura", label: "🏗️ Estructura" },
  { id: "adaptar", label: "✨ Adaptar" },
];

const HOOK_TYPE_COLORS: Record<string, string> = {
  curiosidad: "bg-violet-500/20 border-violet-500/30 text-violet-300",
  dolor: "bg-rose-500/20 border-rose-500/30 text-rose-300",
  promesa: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  identidad: "bg-blue-500/20 border-blue-500/30 text-blue-300",
  humor: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  sorpresa: "bg-pink-500/20 border-pink-500/30 text-pink-300",
};

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepBar({
  hasTranscript,
  hasAnalysis,
  isVideo,
}: {
  hasTranscript: boolean;
  hasAnalysis: boolean;
  isVideo: boolean;
}) {
  const steps = isVideo
    ? [
        { label: "Ver post", done: true },
        { label: "Transcript", done: hasTranscript },
        { label: "Análisis IA", done: hasAnalysis },
        { label: "Adaptar", done: hasAnalysis },
      ]
    : [
        { label: "Ver post", done: true },
        { label: "Análisis IA", done: hasAnalysis },
        { label: "Adaptar", done: hasAnalysis },
      ];

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 bg-white/[0.02] border-b border-border/20 flex-shrink-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all",
              step.done
                ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                : "bg-white/[0.04] border-border/30 text-muted-foreground/50"
            )}
          >
            {step.done ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full border border-current opacity-50" />
            )}
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <span className="text-muted-foreground/30 text-[10px]">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function LiveAnalysisModal({
  post,
  competitorId,
  scrapedData,
  onClose,
  onFetchTranscript,
  onAnalyze,
  transcribing,
  analyzing,
  errors,
}: LiveAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("video");

  const isOpen = post !== null && competitorId !== null;

  const postUrl = post?.url ?? "";
  const transcript = scrapedData?.transcripts[postUrl] ?? null;
  const analysis = scrapedData?.analyses[postUrl] ?? null;

  const isTranscribing = transcribing.has(postUrl);
  const isAnalyzing = analyzing.has(postUrl);
  const transcriptError = errors[`transcript-${postUrl}`] ?? null;
  const analyzeError = errors[`analyze-${postUrl}`] ?? null;

  const isVideoPost = post?.type === "Video";

  function handleClose() {
    setActiveTab("video");
    onClose();
  }

  // Caption-only analysis (for images / carousels that have no audio)
  function handleAnalyzeCaption() {
    if (!post || !competitorId) return;
    onAnalyze(
      competitorId,
      post.url,
      `[Sin audio — análisis basado en caption]\n\n${post.caption}`,
      post.caption,
      post.ownerUsername
    );
  }

  if (!post || !competitorId) return null;

  // ── Tab 1: Video ─────────────────────────────────────────────────────────────
  function renderVideo() {
    if (!post) return null;
    return (
      <div className="flex flex-col gap-4">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-violet-900/40 to-pink-900/40">
          {post.displayUrl && (
            <img
              src={proxyImg(post.displayUrl)}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {post.type === "Video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Eye, label: "Views", value: fmt(post.videoViewCount) },
            { icon: Heart, label: "Likes", value: fmt(post.likesCount) },
            {
              icon: MessageCircle,
              label: "Comments",
              value: fmt(post.commentsCount),
            },
            {
              icon: Clock,
              label: "Duración",
              value: post.durationSec != null ? `${post.durationSec}s` : "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-border/40 bg-white/[0.03] p-3 flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-wide font-medium">
                  {label}
                </span>
              </div>
              <p className="text-base font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Caption */}
        {post.caption && (
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
              Caption
            </p>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-border/30 bg-white/[0.02] p-3">
              <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </p>
            </div>
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Ver en Instagram
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Quick-action: go to transcript or analyze caption */}
          {!analysis && !isAnalyzing && (
            isVideoPost ? (
              <button
                onClick={() => setActiveTab("transcript")}
                className="inline-flex items-center gap-1.5 text-[13px] text-violet-400 hover:text-violet-300 transition-colors font-medium border-l border-border/30 pl-3"
              >
                <Mic className="h-3.5 w-3.5" />
                Obtener transcript →
              </button>
            ) : (
              <button
                onClick={() => {
                  handleAnalyzeCaption();
                  setActiveTab("estructura");
                }}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 text-[13px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium border-l border-border/30 pl-3"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analizar con IA →
              </button>
            )
          )}
          {analysis && (
            <span className="inline-flex items-center gap-1 text-[12px] text-emerald-400 border-l border-border/30 pl-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Análisis listo
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Tab 2: Transcript ─────────────────────────────────────────────────────────
  function renderTranscript() {
    if (!post || !competitorId) return null;

    // Non-video post — no audio, offer caption analysis instead
    if (!isVideoPost) {
      return (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">
                Este post no es un video con audio
              </p>
              <p className="text-[12px] text-amber-200/70 leading-relaxed">
                Es un{" "}
                <strong>
                  {post.type === "Sidecar" ? "carrusel" : "post de imagen"}
                </strong>
                . No hay audio que transcribir, pero podemos analizar su{" "}
                <strong>caption, estructura y copy</strong> con IA para extraer
                las tácticas que usa.
              </p>
            </div>
          </div>

          {/* Show caption preview */}
          {post.caption && (
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
                Caption completo
              </p>
              <pre className="text-[12px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-border/20 rounded-lg p-4 max-h-[250px] overflow-y-auto">
                {post.caption}
              </pre>
            </div>
          )}

          {/* Analyze caption button */}
          {!analysis && !isAnalyzing && (
            <button
              onClick={() => {
                handleAnalyzeCaption();
                setActiveTab("estructura");
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all self-start"
            >
              <Sparkles className="h-4 w-4" />
              Analizar caption con IA →
            </button>
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Analizando con Claude AI...
            </div>
          )}

          {analysis && (
            <p className="text-[12px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Análisis completado — ve a la pestaña &#34;🏗️ Estructura&#34;
            </p>
          )}

          {analyzeError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px]">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {analyzeError}
            </div>
          )}
        </div>
      );
    }

    // Video post transcript flow
    if (isTranscribing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground text-center">
            Obteniendo transcript con IA...
            <br />
            <span className="text-[11px] text-muted-foreground/60">
              Esto puede tomar 1-2 minutos
            </span>
          </p>
        </div>
      );
    }

    if (transcriptError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {transcriptError}
          </div>
          <button
            onClick={() => onFetchTranscript(competitorId, post.url)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-violet-500/15 border border-violet-500/30 text-violet-400 hover:bg-violet-500/25 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      );
    }

    if (!transcript) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Mic className="h-6 w-6 text-violet-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-1">
              Transcribir audio del video
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs">
              Apify convierte el audio del Reel en texto para que puedas
              analizar qué dice exactamente
            </p>
          </div>
          <button
            onClick={() => onFetchTranscript(competitorId, post.url)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all"
          >
            <Mic className="h-4 w-4" />
            Obtener transcript con IA
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-border/40 text-muted-foreground font-medium uppercase tracking-wide">
            {transcript.language}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-medium">
            ✓ Obtenido
          </span>
          <span className="text-[10px] text-muted-foreground/50 ml-auto">
            {new Date(transcript.fetchedAt).toLocaleString("es-ES")}
          </span>
        </div>

        <pre className="text-[12px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-border/20 rounded-lg p-4 max-h-[350px] overflow-y-auto">
          {transcript.transcript}
        </pre>

        {!analysis && !isAnalyzing && (
          <button
            onClick={() => {
              onAnalyze(
                competitorId,
                post.url,
                transcript.transcript,
                post.caption,
                post.ownerUsername
              );
              setActiveTab("estructura");
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all self-start"
          >
            <Sparkles className="h-4 w-4" />
            Analizar estructura con IA →
          </button>
        )}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
            Analizando con Claude AI...
          </div>
        )}
        {analysis && (
          <p className="text-[12px] text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Análisis completado — ve a la pestaña &#34;🏗️ Estructura&#34;
          </p>
        )}
      </div>
    );
  }

  // ── Tab 3: Estructura ─────────────────────────────────────────────────────────
  function renderEstructura() {
    if (!post || !competitorId) return null;

    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground text-center">
            Analizando con Claude AI...
            <br />
            <span className="text-[11px] text-muted-foreground/60">
              Generando hook, estructura, tono y tácticas
            </span>
          </p>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Sparkles className="h-8 w-8 text-violet-400/50" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-1">
              {isVideoPost
                ? "Primero obtén el transcript"
                : "Análisis no generado aún"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {isVideoPost
                ? 'Ve a la pestaña "📝 Transcript" y transcribe el audio'
                : 'Ve a "📝 Transcript" y haz clic en "Analizar caption con IA"'}
            </p>
          </div>
          {analyzeError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px]">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {analyzeError}
            </div>
          )}
          {/* Quick action button */}
          {!isVideoPost && !isAnalyzing && (
            <button
              onClick={() => handleAnalyzeCaption()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Analizar caption con IA
            </button>
          )}
          {isVideoPost && (
            <button
              onClick={() => setActiveTab("transcript")}
              className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
            >
              Ir a Transcript →
            </button>
          )}
        </div>
      );
    }

    const hookColorClass =
      HOOK_TYPE_COLORS[analysis.hook.type] ??
      "bg-violet-500/20 border-violet-500/30 text-violet-300";

    return (
      <div className="flex flex-col gap-5">
        {/* Hook card */}
        <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold text-violet-300 uppercase tracking-wide">
              Hook de apertura
            </p>
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                hookColorClass
              )}
            >
              {analysis.hook.type}
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">
            {analysis.hook.text}
          </p>
        </div>

        {/* Structure timeline */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Estructura del contenido
          </p>
          <div className="flex flex-col gap-2">
            {analysis.structure.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/15 border border-sky-500/25 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap">
                  {item.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground leading-tight">
                    {item.section}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Tono
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold text-foreground px-2.5 py-1 rounded-lg bg-white/[0.06] border border-border/40">
              {analysis.tone.main}
            </span>
            {analysis.tone.attributes.map((attr) => (
              <span
                key={attr}
                className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/[0.04] border border-border/30"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>

        {/* Tactics */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Tácticas de retención
          </p>
          <div className="flex flex-col gap-2">
            {analysis.tactics.map((tactic, i) => (
              <div key={i} className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/80 leading-relaxed">
                  {tactic}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Go to Adaptar */}
        <button
          onClick={() => setActiveTab("adaptar")}
          className="flex items-center gap-2 text-[12px] text-violet-400 hover:text-violet-300 transition-colors self-start"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ver cómo adaptar para GabiFit →
        </button>
      </div>
    );
  }

  // ── Tab 4: Adaptar ────────────────────────────────────────────────────────────
  function renderAdaptar() {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Generando adaptación para GabiFit...
          </p>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Sparkles className="h-8 w-8 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-1">
              Primero genera el análisis
            </p>
            <p className="text-[12px] text-muted-foreground">
              {isVideoPost
                ? 'Ve a "📝 Transcript" → transcribe → analiza'
                : 'Ve a "📝 Transcript" → "Analizar caption con IA"'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("transcript")}
            className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
          >
            Ir a Transcript →
          </button>
        </div>
      );
    }

    const { gabifitAdaptation } = analysis;

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {gabifitAdaptation.title}
          </p>
        </div>

        {/* Tips */}
        <div className="flex flex-col gap-3">
          {gabifitAdaptation.tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-3"
            >
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400 mt-0.5">
                {i + 1}
              </div>
              <div className="flex items-start gap-2 flex-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/85 leading-relaxed">
                  {tip}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Hook */}
        <div className="rounded-lg border-l-[3px] border-emerald-500 bg-emerald-500/[0.06] border border-emerald-500/20 pl-4 pr-3 py-3">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-1.5">
            Hook sugerido para GabiFit:
          </p>
          <p className="text-[13px] text-foreground/85 italic leading-relaxed">
            &ldquo;{gabifitAdaptation.suggestedHook}&rdquo;
          </p>
        </div>

        {/* Suggested CTA */}
        <div className="rounded-lg border-l-[3px] border-violet-500 bg-violet-500/[0.06] border border-violet-500/20 pl-4 pr-3 py-3">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide mb-1.5">
            CTA sugerido para GabiFit:
          </p>
          <p className="text-[13px] text-foreground/85 italic leading-relaxed">
            &ldquo;{gabifitAdaptation.suggestedCTA}&rdquo;
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-card border-border/50">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-sm font-semibold text-foreground leading-tight">
              <span className="text-muted-foreground font-normal">
                @{post.ownerUsername} ·{" "}
              </span>
              {post.type === "Video"
                ? "Reel"
                : post.type === "Sidecar"
                ? "Carrusel"
                : "Post"}{" "}
              —{" "}
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-0.5"
              >
                {post.shortCode}
                <ExternalLink className="h-3 w-3 inline ml-0.5" />
              </a>
            </DialogTitle>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Step progress bar */}
        <StepBar
          hasTranscript={!!transcript || !isVideoPost}
          hasAnalysis={!!analysis}
          isVideo={isVideoPost}
        />

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-5 pt-3 pb-0 flex-shrink-0 border-b border-border/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all",
                activeTab === tab.id
                  ? "border-violet-400 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "video" && renderVideo()}
          {activeTab === "transcript" && renderTranscript()}
          {activeTab === "estructura" && renderEstructura()}
          {activeTab === "adaptar" && renderAdaptar()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
