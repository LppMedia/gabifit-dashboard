"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CalendarPost,
  PlatformKey,
  ContentTypeKey,
  PLATFORMS,
  CONTENT_TYPES,
  FORMATS,
} from "@/lib/calendar-data";
import { NewsArticle, NEWS_CATEGORIES } from "@/lib/news-data";

interface UseAsIdeaDialogProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSave: (post: Omit<CalendarPost, "id">) => void;
}

function todayPlusThree(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

export default function UseAsIdeaDialog({
  article,
  onClose,
  onSave,
}: UseAsIdeaDialogProps) {
  const [platform, setPlatform] = useState<PlatformKey>("instagram");
  const [format, setFormat] = useState<string>("Carousel");
  const [date, setDate] = useState<string>(todayPlusThree());
  const [time, setTime] = useState<string>("10:00");
  const [caption, setCaption] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [type, setType] = useState<ContentTypeKey>("informativo");

  // Re-populate fields whenever the article changes
  useEffect(() => {
    if (article) {
      setCaption(`${article.title}\n\n${article.keyInsight}`);
      setNotes(`Fuente: ${article.source} · ${article.sourceUrl}`);
      setPlatform("instagram");
      setFormat("Carousel");
      setDate(todayPlusThree());
      setTime("10:00");
      setType("informativo");
    }
  }, [article]);

  if (!article) return null;

  const cat = NEWS_CATEGORIES[article.category];
  const platforms = Object.values(PLATFORMS);
  const contentTypes = Object.values(CONTENT_TYPES);

  const handleSave = () => {
    onSave({
      date,
      time,
      platform,
      type,
      status: "draft",
      caption,
      format,
      notes,
    });
  };

  return (
    <Dialog open={!!article} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden bg-card border-border/50">
        {/* Gradient top bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(to right, ${cat.dot}, ${cat.dot}88)`,
          }}
        />

        <div className="p-6 flex flex-col gap-5">
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-foreground">
                Convertir en idea de contenido
              </DialogTitle>
              {/* Category badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border flex-shrink-0",
                  cat.bg,
                  cat.color,
                  cat.border
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </span>
            </div>

            {/* Article title preview */}
            <p className="text-[12px] text-muted-foreground/50 line-clamp-2 leading-snug">
              {article.title}
            </p>
          </DialogHeader>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Caption */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-muted-foreground/70">
                Caption / Idea inicial
              </label>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm resize-none",
                  "bg-white/[0.03] border border-border/40",
                  "text-foreground placeholder:text-muted-foreground/30",
                  "focus:outline-none focus:border-border/70 transition-colors"
                )}
              />
            </div>

            {/* Platform + Format row */}
            <div className="flex gap-3">
              {/* Platform toggles */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-muted-foreground/70">
                  Plataforma
                </label>
                <div className="flex gap-1 flex-wrap">
                  {platforms.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPlatform(p.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all",
                        platform === p.key
                          ? cn(p.bg, p.color, p.border)
                          : "bg-white/[0.03] text-muted-foreground/40 border-border/30 hover:text-muted-foreground/60"
                      )}
                    >
                      {p.abbr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/70">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm",
                    "bg-white/[0.03] border border-border/40",
                    "text-foreground focus:outline-none focus:border-border/70 transition-colors"
                  )}
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f} className="bg-card">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type + Date + Time row */}
            <div className="flex gap-3 flex-wrap">
              {/* Content type toggles */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/70">
                  Tipo
                </label>
                <div className="flex gap-1">
                  {contentTypes.map((ct) => (
                    <button
                      key={ct.key}
                      onClick={() => setType(ct.key)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all",
                        type === ct.key
                          ? cn(ct.bg, ct.color, "border-current/30")
                          : "bg-white/[0.03] text-muted-foreground/40 border-border/30 hover:text-muted-foreground/60"
                      )}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/70">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm",
                    "bg-white/[0.03] border border-border/40",
                    "text-foreground focus:outline-none focus:border-border/70 transition-colors"
                  )}
                />
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/70">
                  Hora
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm",
                    "bg-white/[0.03] border border-border/40",
                    "text-foreground focus:outline-none focus:border-border/70 transition-colors"
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-muted-foreground/70">
                Notas / Fuente
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm resize-none",
                  "bg-white/[0.03] border border-border/40",
                  "text-foreground placeholder:text-muted-foreground/30",
                  "focus:outline-none focus:border-border/70 transition-colors"
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "border border-border/40 bg-white/[0.03]",
                "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]",
                "transition-all"
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                "hover:bg-emerald-500/30 hover:border-emerald-500/50",
                "transition-all"
              )}
            >
              Agregar al Calendario
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
