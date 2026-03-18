"use client";

import { useState } from "react";
import { X, Mic2, Zap, Lightbulb, FileText, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Competitor,
  CompetitorPost,
  PLATFORM_META,
  formatViews,
  formatEngagement,
  getEngagementColor,
} from "@/lib/competitors-data";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Tab = "analisis" | "guion" | "replicar" | "caption";

const POST_TYPE_LABELS: Record<string, string> = {
  reel: "Reel",
  video: "Video",
  short: "Short",
  carousel: "Carrusel",
  post: "Post",
  story: "Story",
  tweet: "Tweet",
};

interface PostAnalysisModalProps {
  post: CompetitorPost | null;
  competitor: Competitor | null;
  onClose: () => void;
}

export function PostAnalysisModal({
  post,
  competitor,
  onClose,
}: PostAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("analisis");
  const [copied, setCopied] = useState(false);

  const open = post !== null && competitor !== null;

  if (!open || !post || !competitor) return null;

  const platformMeta = PLATFORM_META[post.platform];
  const { analysis } = post;
  const engColor = getEngagementColor(post.engagementRate);

  const tabs: { id: Tab; label: string }[] = [
    { id: "analisis", label: "Análisis" },
    { id: "guion", label: "Guion" },
    { id: "replicar", label: "Cómo replicar" },
    { id: "caption", label: "Caption" },
  ];

  function handleCopyCaption() {
    if (!post) return;
    navigator.clipboard.writeText(post.caption).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] bg-card border-border/40 p-0 overflow-hidden flex flex-col">
        {/* Gradient bar */}
        <div
          className={cn(
            "h-1.5 w-full flex-shrink-0 bg-gradient-to-r",
            post.coverGradient
          )}
        />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              <div
                className={cn(
                  "h-12 w-12 rounded-lg bg-gradient-to-br flex-shrink-0",
                  post.coverGradient
                )}
              />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      platformMeta.bg,
                      platformMeta.border,
                      platformMeta.color
                    )}
                  >
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: platformMeta.dot }}
                    />
                    {platformMeta.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border/40 px-2 py-0.5 rounded-full bg-white/[0.03]">
                    {POST_TYPE_LABELS[post.postType] ?? post.postType}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {competitor.handle}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 max-w-[380px]">
                  {post.caption}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Metrics row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {post.metrics.views !== undefined && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {formatViews(post.metrics.views)}
                </span>
                <span>vistas</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatViews(post.metrics.likes)}
              </span>
              <span>likes</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatViews(post.metrics.comments)}
              </span>
              <span>comentarios</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatViews(post.metrics.shares)}
              </span>
              <span>shares</span>
            </div>
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border",
                engColor,
                post.engagementRate >= 15
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : post.engagementRate >= 8
                  ? "bg-cyan-500/10 border-cyan-500/20"
                  : post.engagementRate >= 5
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-zinc-500/10 border-zinc-500/20"
              )}
            >
              {formatEngagement(post.engagementRate)} eng.
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-1 border-b border-border/20 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2",
                activeTab === tab.id
                  ? "text-foreground border-amber-400 bg-white/[0.04]"
                  : "text-muted-foreground/60 border-transparent hover:text-muted-foreground hover:bg-white/[0.02]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {/* ── ANÁLISIS TAB ─────────────────────────────────────────────────── */}
          {activeTab === "analisis" && (
            <>
              {/* Hook card */}
              <div className="rounded-xl border border-border/30 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mic2 className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hook
                  </span>
                  <span className="ml-auto inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {analysis.hookType}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed italic">
                  &ldquo;{analysis.hook}&rdquo;
                </p>
              </div>

              {/* Structure timeline */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Estructura
                </p>
                <div className="space-y-1.5">
                  {analysis.structure.map((item, i) => {
                    const bracketEnd = item.indexOf("]");
                    const timestamp =
                      bracketEnd > 0 ? item.slice(0, bracketEnd + 1) : "";
                    const rest =
                      bracketEnd > 0 ? item.slice(bracketEnd + 1).trim() : item;
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-amber-400/60" />
                          {i < analysis.structure.length - 1 && (
                            <div className="w-px h-3 bg-border/40 mt-1" />
                          )}
                        </div>
                        <div className="pb-1">
                          {timestamp && (
                            <span className="text-[10px] font-mono font-semibold text-amber-400/80 mr-2">
                              {timestamp}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {rest}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tone */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Tono
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">
                  {analysis.tone}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.toneAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-500/10 border border-violet-500/20 text-violet-400"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key tactics */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Tácticas clave
                </p>
                <div className="space-y-2">
                  {analysis.keyTactics.map((tactic, i) => {
                    const dashIdx = tactic.indexOf(" — ");
                    const boldPart =
                      dashIdx > -1 ? tactic.slice(0, dashIdx) : tactic;
                    const restPart =
                      dashIdx > -1 ? tactic.slice(dashIdx) : "";
                    return (
                      <div
                        key={i}
                        className="flex gap-2.5 items-start rounded-lg bg-white/[0.02] border border-border/20 px-3 py-2"
                      >
                        <Zap className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="text-foreground font-medium">
                            {boldPart}
                          </span>
                          {restPart}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── GUION TAB ────────────────────────────────────────────────────── */}
          {activeTab === "guion" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Guion completo
              </p>
              <pre className="text-[12px] font-mono leading-relaxed whitespace-pre-wrap text-muted-foreground bg-white/[0.02] rounded-xl p-4 border border-border/20 max-h-80 overflow-y-auto">
                {analysis.transcript}
              </pre>
            </div>
          )}

          {/* ── CÓMO REPLICAR TAB ────────────────────────────────────────────── */}
          {activeTab === "replicar" && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                Cómo replicar esto
              </p>
              <p className="text-[11px] text-muted-foreground/60 mb-4">
                Basado en las tácticas de{" "}
                <span className="text-amber-400/80">{competitor.name}</span>
              </p>
              <div className="space-y-3">
                {analysis.replicateTips.map((tip, i) => {
                  const dashIdx = tip.indexOf(" — ");
                  const boldPart =
                    dashIdx > -1 ? tip.slice(0, dashIdx) : tip;
                  const restPart = dashIdx > -1 ? tip.slice(dashIdx) : "";
                  return (
                    <div
                      key={i}
                      className="flex gap-3 items-start rounded-xl bg-amber-500/[0.04] border border-amber-500/15 px-4 py-3"
                    >
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="text-amber-300/90 font-medium">
                          {boldPart}
                        </span>
                        {restPart}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CAPTION TAB ──────────────────────────────────────────────────── */}
          {activeTab === "caption" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Caption original
                </p>
                <button
                  onClick={handleCopyCaption}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                    copied
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.04] border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl border border-border/30 bg-white/[0.02] p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.caption}
                </p>
              </div>
              <div className="mt-4 rounded-xl border border-border/20 bg-white/[0.02] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Publicado
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
