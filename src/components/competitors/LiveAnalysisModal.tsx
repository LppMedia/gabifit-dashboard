"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Mic, Sparkles, Zap, Lightbulb, Clock,
  Heart, MessageCircle, Eye, X, Play,
  ExternalLink, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, FileText, Download, Copy, Check,
  CalendarPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedPost, CompetitorScrapedData, VideoAnalysis } from "@/lib/scraped-types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function proxyImg(url: string) {
  if (!url) return "";
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

/** Download a string as a text file */
function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build the script document content */
function buildScriptDoc(
  post: ScrapedPost,
  transcript: string | null,
  analysis: VideoAnalysis | null
): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`GUION COMPETIDOR — @${post.ownerUsername}`);
  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`Tipo: ${post.type === "Video" ? "Reel" : post.type === "Sidecar" ? "Carrusel" : "Post"}`);
  lines.push(`URL: ${post.url}`);
  lines.push(`Fecha: ${new Date(post.timestamp).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push(`Likes: ${fmt(post.likesCount)}  |  Comentarios: ${fmt(post.commentsCount)}  |  Vistas: ${fmt(post.videoViewCount)}`);
  if (post.engagementRate) lines.push(`Engagement: ${post.engagementRate.toFixed(1)}%`);
  lines.push("");

  lines.push("───────────────── CAPTION ─────────────────");
  lines.push(post.caption || "(sin caption)");
  lines.push("");

  if (transcript) {
    lines.push("───────────────── TRANSCRIPT / GUION ─────────────────");
    lines.push(transcript);
    lines.push("");
  }

  if (analysis) {
    lines.push("───────────────── ANÁLISIS IA ─────────────────");
    lines.push(`Hook (${analysis.hook.type.toUpperCase()}): ${analysis.hook.text}`);
    lines.push("");
    lines.push("ESTRUCTURA:");
    analysis.structure.forEach((s) => {
      lines.push(`  ${s.time}  [${s.section}]  ${s.description}`);
    });
    lines.push("");
    lines.push(`Tono: ${analysis.tone.main} (${analysis.tone.attributes.join(", ")})`);
    lines.push("");
    lines.push("TÁCTICAS:");
    analysis.tactics.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    lines.push("");

    lines.push("───────────────── ADAPTACIÓN PARA GABIFIT ─────────────────");
    lines.push(`Tema: ${analysis.gabifitAdaptation.title}`);
    lines.push("");
    lines.push("Tips:");
    analysis.gabifitAdaptation.tips.forEach((t, i) => lines.push(`  ${i + 1}. ${t}`));
    lines.push("");
    lines.push(`Hook sugerido: "${analysis.gabifitAdaptation.suggestedHook}"`);
    lines.push(`CTA sugerido:  "${analysis.gabifitAdaptation.suggestedCTA}"`);
  }

  lines.push("");
  lines.push("═══════════════════════════════════════════════════════");
  lines.push(`Generado por GabiFit Dashboard · ${new Date().toLocaleString("es-ES")}`);
  return lines.join("\n");
}

// ─── Copy hook ─────────────────────────────────────────────────────────────────

function useCopyText() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);
  return { copy, copied };
}

// ─── Props ─────────────────────────────────────────────────────────────────────

type TabId = "video" | "transcript" | "estructura" | "adaptar";

interface LiveAnalysisModalProps {
  post:           ScrapedPost | null;
  competitorId:   string | null;
  initialTab?:    TabId;
  scrapedData:    CompetitorScrapedData | null;
  onClose:        () => void;
  onFetchTranscript: (competitorId: string, postUrl: string, videoUrl?: string) => Promise<void>;
  onAnalyze:      (competitorId: string, postUrl: string, transcript: string, caption: string, handle: string, mode?: string) => Promise<void>;
  onSendToCalendar?: (post: ScrapedPost, analysis: VideoAnalysis) => void;
  transcribing:   Set<string>;
  analyzing:      Set<string>;
  errors:         Record<string, string>;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "video",      label: "📹 Video"      },
  { id: "transcript", label: "📝 Guion"      },
  { id: "estructura", label: "🏗️ Estructura" },
  { id: "adaptar",    label: "✨ Adaptar"    },
];

const HOOK_TYPE_COLORS: Record<string, string> = {
  curiosidad: "bg-violet-500/20 border-violet-500/30 text-violet-300",
  dolor:      "bg-rose-500/20 border-rose-500/30 text-rose-300",
  promesa:    "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  identidad:  "bg-blue-500/20 border-blue-500/30 text-blue-300",
  humor:      "bg-amber-500/20 border-amber-500/30 text-amber-300",
  sorpresa:   "bg-pink-500/20 border-pink-500/30 text-pink-300",
};

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ hasTranscript, hasAnalysis, isVideo }: {
  hasTranscript: boolean; hasAnalysis: boolean; isVideo: boolean;
}) {
  const steps = isVideo
    ? [
        { label: "Ver post",   done: true           },
        { label: "Guion",      done: hasTranscript  },
        { label: "Análisis",   done: hasAnalysis    },
        { label: "Adaptar",    done: hasAnalysis    },
      ]
    : [
        { label: "Ver post",   done: true           },
        { label: "Análisis",   done: hasAnalysis    },
        { label: "Adaptar",    done: hasAnalysis    },
      ];

  return (
    <div className="flex items-center gap-1.5 px-5 py-2 bg-white/[0.02] border-b border-border/20 flex-shrink-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all",
            step.done
              ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
              : "bg-white/[0.04] border-border/30 text-muted-foreground/50"
          )}>
            {step.done
              ? <CheckCircle2 className="h-2.5 w-2.5" />
              : <span className="h-2.5 w-2.5 rounded-full border border-current opacity-50" />}
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
  post, competitorId, initialTab, scrapedData, onClose,
  onFetchTranscript, onAnalyze, onSendToCalendar,
  transcribing, analyzing, errors,
}: LiveAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? "video");
  const { copy, copied } = useCopyText();

  // When the modal opens for a new post with a specific initialTab, sync the active tab
  useEffect(() => {
    if (post) setActiveTab(initialTab ?? "video");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.url, initialTab]);

  const isOpen    = post !== null && competitorId !== null;
  const postUrl   = post?.url ?? "";
  const transcript = scrapedData?.transcripts[postUrl] ?? null;
  const analysis   = scrapedData?.analyses[postUrl] ?? null;

  const isTranscribing   = transcribing.has(postUrl);
  const isAnalyzing      = analyzing.has(postUrl);
  const transcriptError  = errors[`transcript-${postUrl}`] ?? null;
  const analyzeError     = errors[`analyze-${postUrl}`]    ?? null;
  const isVideoPost      = post?.type === "Video";

  function handleClose() {
    setActiveTab("video");
    onClose();
  }

  function handleAnalyzeCaption() {
    if (!post || !competitorId) return;
    onAnalyze(
      competitorId, post.url,
      `[Sin audio — análisis basado en caption]\n\n${post.caption}`,
      post.caption, post.ownerUsername
    );
  }

  function handleDownload() {
    if (!post) return;
    const doc = buildScriptDoc(post, transcript?.transcript ?? null, analysis);
    const safeName = post.ownerUsername.replace(/[^a-z0-9]/gi, "_");
    downloadTxt(`guion_${safeName}_${post.shortCode}.txt`, doc);
  }

  if (!post || !competitorId) return null;

  const hasContent = !!transcript || !!analysis;

  // ── Tab 1: Video ─────────────────────────────────────────────────────────────
  function renderVideo() {
    if (!post) return null;
    const proxyVideoUrl = post.videoUrl
      ? `/api/proxy-video?url=${encodeURIComponent(post.videoUrl)}`
      : null;

    return (
      <div className="flex flex-col gap-4">
        {/* Video player or thumbnail */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-900/40 to-pink-900/40" style={{ aspectRatio: "4/5", maxHeight: 380 }}>
          {proxyVideoUrl ? (
            <video
              src={proxyVideoUrl}
              controls
              playsInline
              preload="metadata"
              poster={post.displayUrl ? proxyImg(post.displayUrl) : undefined}
              className="w-full h-full object-contain bg-black rounded-lg"
            />
          ) : (
            <>
              {post.displayUrl && (
                <img
                  src={proxyImg(post.displayUrl)}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              {post.type === "Video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Eye,           label: "Vistas",      value: fmt(post.videoViewCount)                                    },
            { icon: Heart,         label: "Likes",       value: fmt(post.likesCount)                                        },
            { icon: MessageCircle, label: "Comentarios", value: fmt(post.commentsCount)                                     },
            { icon: Clock,         label: "Duración",    value: post.durationSec != null ? `${post.durationSec}s` : "—"     },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border border-border/40 bg-white/[0.03] p-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-wide font-medium">{label}</span>
              </div>
              <p className="text-base font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Caption */}
        {post.caption && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Caption</p>
              <button
                onClick={() => copy(post.caption, "caption")}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {copied === "caption" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied === "caption" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-border/30 bg-white/[0.02] p-3">
              <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
            </div>
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={post.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
          >
            Ver en Instagram <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {!analysis && !isAnalyzing && (
            isVideoPost ? (
              <button
                onClick={() => setActiveTab("transcript")}
                className="inline-flex items-center gap-1.5 text-[13px] text-violet-400 hover:text-violet-300 transition-colors font-medium border-l border-border/30 pl-3"
              >
                <Mic className="h-3.5 w-3.5" />
                Obtener guion →
              </button>
            ) : (
              <button
                onClick={() => { handleAnalyzeCaption(); setActiveTab("estructura"); }}
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

  // ── Tab 2: Guion / Transcript ─────────────────────────────────────────────────
  function renderTranscript() {
    if (!post || !competitorId) return null;

    // Non-video post
    if (!isVideoPost) {
      return (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-4 flex items-start gap-3">
            <FileText className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">Este post no es un video con audio</p>
              <p className="text-[12px] text-amber-200/70 leading-relaxed">
                Es un <strong>{post.type === "Sidecar" ? "carrusel" : "post de imagen"}</strong>. No hay audio
                que transcribir, pero podemos analizar su <strong>caption, estructura y copy</strong> con IA.
              </p>
            </div>
          </div>

          {post.caption && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Caption completo</p>
                <button
                  onClick={() => copy(post.caption, "caption-full")}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {copied === "caption-full" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied === "caption-full" ? "Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="text-[12px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-border/20 rounded-lg p-4 max-h-[250px] overflow-y-auto">
                {post.caption}
              </pre>
            </div>
          )}

          {!analysis && !isAnalyzing && (
            <button
              onClick={() => { handleAnalyzeCaption(); setActiveTab("estructura"); }}
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
              Análisis completado — ve a la pestaña &ldquo;🏗️ Estructura&rdquo;
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

    if (isTranscribing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground text-center">
            Obteniendo guion con IA...<br />
            <span className="text-[11px] text-muted-foreground/60">Esto puede tomar 1-2 minutos</span>
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
            onClick={() => onFetchTranscript(competitorId, post.url, post.videoUrl ?? undefined)}
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
            <p className="text-sm font-semibold text-foreground mb-1">Extraer guion del Reel</p>
            <p className="text-[12px] text-muted-foreground max-w-xs">
              Apify convierte el audio del Reel en texto para que puedas ver exactamente qué dice y cómo está estructurado
            </p>
          </div>
          <button
            onClick={() => onFetchTranscript(competitorId, post.url, post.videoUrl ?? undefined)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all"
          >
            <Mic className="h-4 w-4" />
            Obtener guion con IA
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Meta row */}
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

        {/* Transcript text */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Guion completo</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copy(transcript.transcript, "transcript")}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {copied === "transcript" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied === "transcript" ? "Copiado" : "Copiar"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-[11px] text-violet-400/70 hover:text-violet-400 transition-colors"
              >
                <Download className="h-3 w-3" />
                Descargar
              </button>
            </div>
          </div>
          <pre className="text-[12px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-border/20 rounded-lg p-4 max-h-[280px] overflow-y-auto">
            {transcript.transcript}
          </pre>
        </div>

        {!analysis && !isAnalyzing && (
          <button
            onClick={() => {
              onAnalyze(competitorId, post.url, transcript.transcript, post.caption, post.ownerUsername);
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
            Análisis completado — ve a la pestaña &ldquo;🏗️ Estructura&rdquo;
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
            Analizando con Claude AI...<br />
            <span className="text-[11px] text-muted-foreground/60">Generando hook, estructura, tono y tácticas</span>
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
              {isVideoPost ? "Primero obtén el guion" : "Análisis no generado aún"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {isVideoPost
                ? "Ve a la pestaña \"📝 Guion\" y transcribe el audio"
                : "Ve a \"📝 Guion\" y haz clic en \"Analizar caption con IA\""}
            </p>
          </div>
          {analyzeError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px]">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {analyzeError}
            </div>
          )}
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
              Ir a Guion →
            </button>
          )}
        </div>
      );
    }

    const hookColorClass =
      HOOK_TYPE_COLORS[analysis.hook.type] ?? "bg-violet-500/20 border-violet-500/30 text-violet-300";

    // Build full structure text for copy
    const structureText = [
      `Hook (${analysis.hook.type}): ${analysis.hook.text}`,
      "",
      "Estructura:",
      ...analysis.structure.map((s) => `  ${s.time}  [${s.section}]  ${s.description}`),
      "",
      `Tono: ${analysis.tone.main}`,
      "",
      "Tácticas:",
      ...analysis.tactics.map((t, i) => `  ${i + 1}. ${t}`),
    ].join("\n");

    return (
      <div className="flex flex-col gap-5">
        {/* Download + copy bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => copy(structureText, "structure")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] border border-border/40 text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all"
          >
            {copied === "structure" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied === "structure" ? "Copiado" : "Copiar estructura"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] border border-border/40 text-muted-foreground hover:text-violet-400 hover:border-violet-500/30 transition-all"
          >
            <Download className="h-3 w-3" />
            Descargar completo
          </button>
        </div>

        {/* Hook card */}
        <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold text-violet-300 uppercase tracking-wide">Hook de apertura</p>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", hookColorClass)}>
              {analysis.hook.type}
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{analysis.hook.text}</p>
        </div>

        {/* Structure timeline */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Estructura del contenido</p>
          <div className="flex flex-col gap-2">
            {analysis.structure.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/15 border border-sky-500/25 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap">
                  {item.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground leading-tight">{item.section}</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tono</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-semibold text-foreground px-2.5 py-1 rounded-lg bg-white/[0.06] border border-border/40">
              {analysis.tone.main}
            </span>
            {analysis.tone.attributes.map((attr) => (
              <span key={attr} className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/[0.04] border border-border/30">
                {attr}
              </span>
            ))}
          </div>
        </div>

        {/* Tactics */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tácticas de retención</p>
          <div className="flex flex-col gap-2">
            {analysis.tactics.map((tactic, i) => (
              <div key={i} className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/80 leading-relaxed">{tactic}</p>
              </div>
            ))}
          </div>
        </div>

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
          <p className="text-sm text-muted-foreground">Generando adaptación para GabiFit...</p>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Sparkles className="h-8 w-8 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Primero genera el análisis</p>
            <p className="text-[12px] text-muted-foreground">
              {isVideoPost
                ? "Ve a \"📝 Guion\" → transcribe → analiza"
                : "Ve a \"📝 Guion\" → \"Analizar caption con IA\""}
            </p>
          </div>
          <button
            onClick={() => setActiveTab("transcript")}
            className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2"
          >
            Ir a Guion →
          </button>
        </div>
      );
    }

    const { gabifitAdaptation } = analysis;

    const adaptText = [
      `Tema: ${gabifitAdaptation.title}`,
      "",
      "Tips para adaptar:",
      ...gabifitAdaptation.tips.map((t, i) => `${i + 1}. ${t}`),
      "",
      `Hook sugerido: "${gabifitAdaptation.suggestedHook}"`,
      `CTA sugerido: "${gabifitAdaptation.suggestedCTA}"`,
    ].join("\n");

    return (
      <div className="flex flex-col gap-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-foreground">{gabifitAdaptation.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copy(adaptText, "adapt")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] border border-border/40 text-muted-foreground hover:text-foreground transition-all"
            >
              {copied === "adapt" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied === "adapt" ? "Copiado" : "Copiar todo"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.05] border border-border/40 text-muted-foreground hover:text-violet-400 hover:border-violet-500/30 transition-all"
            >
              <Download className="h-3 w-3" />
              Descargar
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="flex flex-col gap-3">
          {gabifitAdaptation.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-3">
              <div className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400 mt-0.5">
                {i + 1}
              </div>
              <div className="flex items-start gap-2 flex-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/85 leading-relaxed">{tip}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Hook */}
        <div className="rounded-lg border-l-[3px] border-emerald-500 bg-emerald-500/[0.06] border border-emerald-500/20 pl-4 pr-3 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Hook sugerido para GabiFit:</p>
            <button
              onClick={() => copy(gabifitAdaptation.suggestedHook, "hook")}
              className="flex items-center gap-1 text-[11px] text-emerald-400/60 hover:text-emerald-400 transition-colors"
            >
              {copied === "hook" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-[13px] text-foreground/85 italic leading-relaxed">
            &ldquo;{gabifitAdaptation.suggestedHook}&rdquo;
          </p>
        </div>

        {/* Suggested CTA */}
        <div className="rounded-lg border-l-[3px] border-violet-500 bg-violet-500/[0.06] border border-violet-500/20 pl-4 pr-3 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">CTA sugerido para GabiFit:</p>
            <button
              onClick={() => copy(gabifitAdaptation.suggestedCTA, "cta")}
              className="flex items-center gap-1 text-[11px] text-violet-400/60 hover:text-violet-400 transition-colors"
            >
              {copied === "cta" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <p className="text-[13px] text-foreground/85 italic leading-relaxed">
            &ldquo;{gabifitAdaptation.suggestedCTA}&rdquo;
          </p>
        </div>

        {/* GabiFit Full Script — shown when available, with button to generate */}
        {analysis.gabifitScript && analysis.gabifitScript.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                Guion completo listo para grabar
              </p>
              <button
                onClick={() => {
                  const scriptText = analysis.gabifitScript!.map(
                    (s) => `${s.emoji} ${s.label.toUpperCase()} (${s.durationHint})\n${s.script}\n[📸 ${s.visualNotes}]`
                  ).join("\n\n");
                  copy(scriptText, "full-script");
                }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {copied === "full-script" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied === "full-script" ? "Copiado" : "Copiar guion"}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {analysis.gabifitScript.map((section, i) => (
                <div key={i} className="rounded-lg border border-border/30 bg-white/[0.025] overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border-b border-border/20">
                    <span className="text-base">{section.emoji}</span>
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">{section.label}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto">{section.durationHint}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <p className="text-[13px] text-foreground/90 leading-relaxed italic">&ldquo;{section.script}&rdquo;</p>
                    <p className="text-[11px] text-muted-foreground/60 flex items-start gap-1">
                      <span className="flex-shrink-0">📸</span>
                      {section.visualNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              if (!post || !competitorId) return;
              const transcriptText = transcript?.transcript
                ?? `[Sin audio — análisis basado en caption]\n\n${post.caption}`;
              onAnalyze(competitorId, post.url, transcriptText, post.caption, post.ownerUsername, "full_script");
            }}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAnalyzing ? "Generando guion..." : "Generar guion completo para GabiFit"}
          </button>
        )}

        {/* Send to Calendar */}
        {onSendToCalendar && (
          <button
            onClick={() => post && onSendToCalendar(post, analysis)}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600/80 to-pink-600/80 border border-violet-500/40 text-white hover:from-violet-600 hover:to-pink-600 transition-all shadow-md shadow-violet-900/20"
          >
            <CalendarPlus className="h-4 w-4" />
            Enviar adaptación al Calendario
          </button>
        )}
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
              <span className="text-muted-foreground font-normal">@{post.ownerUsername} · </span>
              {post.type === "Video" ? "Reel" : post.type === "Sidecar" ? "Carrusel" : "Post"}{" "}—{" "}
              <a
                href={post.url} target="_blank" rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-0.5"
              >
                {post.shortCode}<ExternalLink className="h-3 w-3 inline ml-0.5" />
              </a>
            </DialogTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasContent && (
                <button
                  onClick={handleDownload}
                  title="Descargar guion completo"
                  className="p-1.5 rounded-md text-muted-foreground/60 hover:text-violet-400 hover:bg-white/[0.06] transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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
          {activeTab === "video"      && renderVideo()}
          {activeTab === "transcript" && renderTranscript()}
          {activeTab === "estructura" && renderEstructura()}
          {activeTab === "adaptar"    && renderAdaptar()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
