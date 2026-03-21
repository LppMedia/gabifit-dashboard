"use client";

import { useState, useCallback } from "react";
import {
  Link2, Loader2, AlertCircle, CheckCircle2,
  Play, Mic, Sparkles, Copy, Check, Download,
  CalendarPlus, ExternalLink, RefreshCw, Zap,
  Clock, Heart, MessageCircle, Eye, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedPost, VideoAnalysis } from "@/lib/scraped-types";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Step = "idle" | "scraping" | "transcribing" | "analyzing" | "done" | "error";

interface AnalyzerState {
  step: Step;
  post: ScrapedPost | null;
  transcript: string | null;
  analysis: VideoAnalysis | null;
  error: string | null;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface UrlDropAnalyzerProps {
  onSendToCalendar?: (post: ScrapedPost, analysis: VideoAnalysis) => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function proxyImg(url: string, shortCode?: string): string {
  const params = new URLSearchParams();
  if (url)       params.set("url", url);
  if (shortCode) params.set("shortCode", shortCode);
  return `/api/proxy-image?${params.toString()}`;
}

const HOOK_TYPE_COLORS: Record<string, string> = {
  curiosidad: "bg-violet-500/20 border-violet-500/30 text-violet-300",
  dolor:      "bg-rose-500/20 border-rose-500/30 text-rose-300",
  promesa:    "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
  identidad:  "bg-blue-500/20 border-blue-500/30 text-blue-300",
  humor:      "bg-amber-500/20 border-amber-500/30 text-amber-300",
  sorpresa:   "bg-pink-500/20 border-pink-500/30 text-pink-300",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function UrlDropAnalyzer({ onSendToCalendar }: UrlDropAnalyzerProps) {
  const [url, setUrl]     = useState("");
  const [state, setState] = useState<AnalyzerState>({
    step: "idle", post: null, transcript: null, analysis: null, error: null,
  });
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function downloadTxt(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  const reset = useCallback(() => {
    setUrl("");
    setState({ step: "idle", post: null, transcript: null, analysis: null, error: null });
  }, []);

  const run = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed || !trimmed.includes("instagram.com")) {
      setState((s) => ({ ...s, step: "error", error: "Pega una URL válida de Instagram" }));
      return;
    }

    // ── Step 1: Scrape post metadata ─────────────────────────────────────────
    setState({ step: "scraping", post: null, transcript: null, analysis: null, error: null });

    let post: ScrapedPost | null = null;
    try {
      const res = await fetch("/api/competitors/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postUrl: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const { posts } = await res.json();
      post = posts?.[0] ?? null;
      if (!post) throw new Error("No se pudo obtener la información del post");
    } catch (err: unknown) {
      setState((s) => ({
        ...s, step: "error",
        error: err instanceof Error ? err.message : "Error al obtener el post",
      }));
      return;
    }

    // ── Step 2: Transcribe (videos only) ──────────────────────────────────────
    setState((s) => ({ ...s, step: "transcribing", post }));

    let transcriptText: string | null = null;

    if (post.type === "Video") {
      const urlForTranscript = post.videoUrl ?? post.url;
      try {
        const res = await fetch("/api/competitors/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl: urlForTranscript }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error" }));
          // Transcription failure is non-fatal — fall back to caption-only analysis
          console.warn("[UrlDropAnalyzer] transcript failed:", err.error);
          transcriptText = null;
        } else {
          const data = await res.json();
          transcriptText = data.transcript ?? null;
        }
      } catch {
        transcriptText = null;
      }
    }

    // ── Step 3: AI Analysis ───────────────────────────────────────────────────
    setState((s) => ({ ...s, step: "analyzing", transcript: transcriptText }));

    const transcriptForAI = transcriptText
      ?? `[Sin audio — análisis basado en caption]\n\n${post.caption}`;

    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postUrl:    post.url,
          transcript: transcriptForAI,
          caption:    post.caption,
          handle:     post.ownerUsername,
          mode:       "full_script",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const analysis: VideoAnalysis = await res.json();
      setState((s) => ({ ...s, step: "done", analysis }));
    } catch (err: unknown) {
      setState((s) => ({
        ...s, step: "error",
        error: err instanceof Error ? err.message : "Error en análisis IA",
      }));
    }
  }, [url]);

  const { step, post, transcript, analysis, error } = state;
  const isBusy = step === "scraping" || step === "transcribing" || step === "analyzing";

  const proxyVideoUrl = post?.videoUrl
    ? `/api/proxy-video?url=${encodeURIComponent(post.videoUrl)}`
    : null;

  // ── Render helpers ─────────────────────────────────────────────────────────

  function renderProgress() {
    const stepLabels: Record<string, string> = {
      scraping:     "Obteniendo post...",
      transcribing: "Transcribiendo audio...",
      analyzing:    "Analizando con Claude AI...",
    };
    const stepSub: Record<string, string> = {
      scraping:     "Conectando con Apify para extraer el post de Instagram",
      transcribing: "Convirtiendo audio a texto (puede tardar 1-2 min)",
      analyzing:    "Generando estructura, hook, tácticas y guion completo",
    };
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{stepLabels[step]}</p>
          <p className="text-[12px] text-muted-foreground/70 mt-1">{stepSub[step]}</p>
        </div>
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mt-2">
          {(["scraping", "transcribing", "analyzing"] as Step[]).map((s, i) => {
            const idx = ["scraping", "transcribing", "analyzing"].indexOf(step);
            const done = i < idx;
            const active = s === step;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={cn(
                  "h-6 px-2 rounded-full text-[10px] font-medium flex items-center gap-1 border transition-all",
                  done   ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                         : active ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                         : "bg-white/[0.04] border-border/30 text-muted-foreground/40"
                )}>
                  {done ? <CheckCircle2 className="h-2.5 w-2.5" /> : <span className="h-2 w-2 rounded-full bg-current opacity-60" />}
                  {["Scrape", "Guion", "IA"][i]}
                </div>
                {i < 2 && <span className="text-muted-foreground/30 text-[10px]">→</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderResults() {
    if (!post || !analysis) return null;
    const hookColorClass = HOOK_TYPE_COLORS[analysis.hook.type] ?? HOOK_TYPE_COLORS.curiosidad;

    const fullScriptText = analysis.gabifitScript
      ? analysis.gabifitScript.map(
          (s) => `${s.emoji} ${s.label.toUpperCase()} (${s.durationHint})\n${s.script}\n[📸 ${s.visualNotes}]`
        ).join("\n\n")
      : null;

    return (
      <div className="flex flex-col gap-5">
        {/* ── Post header ─── */}
        <div className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-white/[0.025]">
          {/* Thumbnail */}
          <div className="h-16 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-violet-900/50 to-pink-900/50">
            {(post.displayUrl || post.shortCode) && (
              <img
                src={proxyImg(post.displayUrl, post.shortCode)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">@{post.ownerUsername}</span>
              <a href={post.url} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5">
                {post.shortCode}<ExternalLink className="h-2.5 w-2.5 inline ml-0.5" />
              </a>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                <Heart className="h-3 w-3" />{fmt(post.likesCount)}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                <MessageCircle className="h-3 w-3" />{fmt(post.commentsCount)}
              </span>
              {post.videoViewCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-violet-400 font-semibold">
                  <Eye className="h-3 w-3" />{fmt(post.videoViewCount)}
                </span>
              )}
              {post.durationSec != null && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" />{post.durationSec}s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Video player ─── */}
        {proxyVideoUrl && (
          <div className="rounded-lg overflow-hidden bg-black border border-border/30" style={{ maxHeight: 320 }}>
            <video
              src={proxyVideoUrl}
              controls
              playsInline
              preload="metadata"
              poster={post.displayUrl ? proxyImg(post.displayUrl, post.shortCode) : undefined}
              className="w-full h-full object-contain"
              style={{ maxHeight: 320 }}
            />
          </div>
        )}

        {/* ── Transcript ─── */}
        {transcript && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Mic className="h-3 w-3" />Guion original
              </p>
              <button onClick={() => copy(transcript, "trans")}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                {copied === "trans" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied === "trans" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="text-[12px] text-muted-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] border border-border/20 rounded-lg p-3 max-h-[180px] overflow-y-auto">
              {transcript}
            </pre>
          </div>
        )}

        {/* ── Hook ─── */}
        <div className="rounded-lg border border-violet-500/25 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold text-violet-300 uppercase tracking-wide">Hook de apertura</p>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", hookColorClass)}>
              {analysis.hook.type}
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">{analysis.hook.text}</p>
          {proxyVideoUrl && (
            <div className="mt-3 flex gap-2">
              <a 
                href={`${proxyVideoUrl}&download=true`} 
                download="instagram_video.mp4"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-lg"
              >
                <Download className="h-3 w-3" />
                Descargar Video MP4
              </a>
            </div>
          )}
        </div>

        {/* ── Structure timeline ─── */}
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

        {/* ── Tactics ─── */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tácticas de retención</p>
          <div className="flex flex-col gap-1.5">
            {analysis.tactics.map((tactic, i) => (
              <div key={i} className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/80 leading-relaxed">{tactic}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── GabiFit Adaptation ─── */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold text-foreground">{analysis.gabifitAdaptation.title}</p>
          </div>
          <div className="flex flex-col gap-2">
            {analysis.gabifitAdaptation.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-foreground/85 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border-l-[3px] border-emerald-500 bg-black/20 pl-3 pr-2 py-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Hook sugerido:</p>
              <button onClick={() => copy(analysis.gabifitAdaptation.suggestedHook, "sug-hook")}
                className="text-emerald-400/60 hover:text-emerald-400 transition-colors">
                {copied === "sug-hook" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <p className="text-[13px] text-foreground/85 italic">&ldquo;{analysis.gabifitAdaptation.suggestedHook}&rdquo;</p>
          </div>
          <div className="rounded-lg border-l-[3px] border-violet-500 bg-black/20 pl-3 pr-2 py-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">CTA sugerido:</p>
              <button onClick={() => copy(analysis.gabifitAdaptation.suggestedCTA, "sug-cta")}
                className="text-violet-400/60 hover:text-violet-400 transition-colors">
                {copied === "sug-cta" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <p className="text-[13px] text-foreground/85 italic">&ldquo;{analysis.gabifitAdaptation.suggestedCTA}&rdquo;</p>
          </div>
        </div>

        {/* ── Full GabiFit Script ─── */}
        {analysis.gabifitScript && analysis.gabifitScript.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                Guion GabiFit listo para grabar
              </p>
              <div className="flex items-center gap-2">
                {fullScriptText && (
                  <button onClick={() => copy(fullScriptText, "full")}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    {copied === "full" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied === "full" ? "Copiado" : "Copiar"}
                  </button>
                )}
                {fullScriptText && (
                  <button onClick={() => downloadTxt(`guion_gabifit_${post.shortCode}.txt`, fullScriptText)}
                    className="flex items-center gap-1 text-[11px] text-violet-400/60 hover:text-violet-400 transition-colors">
                    <Download className="h-3 w-3" />
                    Descargar
                  </button>
                )}
              </div>
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
                      <span className="flex-shrink-0">📸</span>{section.visualNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ─── */}
        <div className="flex flex-col gap-2 pt-1">
          {onSendToCalendar && (
            <button
              onClick={() => onSendToCalendar(post, analysis)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600/80 to-pink-600/80 border border-violet-500/40 text-white hover:from-violet-600 hover:to-pink-600 transition-all shadow-md shadow-violet-900/20"
            >
              <CalendarPlus className="h-4 w-4" />
              Enviar adaptación al Calendario
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] border border-border/40 text-muted-foreground hover:text-foreground hover:bg-white/[0.07] transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Analizar otro video
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 p-5 flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Link2 className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">URL Drop Analyzer</p>
          <p className="text-[11px] text-muted-foreground/70">
            Pega cualquier URL de Instagram — obtén transcript, estructura y guion GabiFit listo para grabar
          </p>
        </div>
      </div>

      {/* URL input — only when idle or error */}
      {(step === "idle" || step === "error") && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") run(); }}
              placeholder="https://www.instagram.com/p/..."
              className="flex-1 rounded-lg border border-border/40 bg-white/[0.04] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <button
              onClick={run}
              disabled={!url.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Analizar
            </button>
          </div>
          {step === "error" && error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px]">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {/* Quick tips */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-border/20">
            <Play className="h-3.5 w-3.5 text-violet-400/60 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              Soporta Reels, posts de imagen y carruseles. Para Reels se transcribe el audio automáticamente.
              El análisis genera hook, estructura, tácticas y un guion completo en la voz de GabiFit.
            </p>
          </div>
        </div>
      )}

      {/* Progress state */}
      {isBusy && renderProgress()}

      {/* Results */}
      {step === "done" && renderResults()}
    </div>
  );
}
