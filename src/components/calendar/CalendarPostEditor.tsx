"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText, Clock, CalendarDays, Hash, Mic2, Paperclip,
  StickyNote, Save, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label }    from "@/components/ui/label";
import { Badge }    from "@/components/ui/badge";
import {
  CalendarPost,
  MediaFile,
  PlatformKey,
  ContentTypeKey,
  PostStatusKey,
  PLATFORMS,
  CONTENT_TYPES,
  FORMATS,
} from "@/lib/calendar-data";
import { MediaUploadZone } from "./MediaUploadZone";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  open:       boolean;
  onClose:    () => void;
  editPost?:  CalendarPost | null;   // if present → edit mode
  defaultDate?: string;              // pre-fill date when creating from a day cell
  onSave:     (post: Omit<CalendarPost, "id"> | CalendarPost) => void;
  onDelete?:  (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLATFORM_KEYS = Object.keys(PLATFORMS) as PlatformKey[];
const TYPE_KEYS     = Object.keys(CONTENT_TYPES) as ContentTypeKey[];

const STATUS_OPTIONS: { value: PostStatusKey; label: string; color: string }[] = [
  { value: "scheduled", label: "Programado",  color: "text-amber-400"   },
  { value: "draft",     label: "Borrador",    color: "text-zinc-400"    },
  { value: "published", label: "Publicado",   color: "text-emerald-400" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function CalendarPostEditor({
  open, onClose, editPost, defaultDate, onSave, onDelete,
}: Props) {
  // ── Form state ───────────────────────────────────────────────────────────
  const [platform,   setPlatform]   = useState<PlatformKey>("instagram");
  const [type,       setType]       = useState<ContentTypeKey>("informativo");
  const [format,     setFormat]     = useState<string>("Reel");
  const [status,     setStatus]     = useState<PostStatusKey>("scheduled");
  const [date,       setDate]       = useState("");
  const [time,       setTime]       = useState("18:00");
  const [caption,    setCaption]    = useState("");
  const [script,     setScript]     = useState("");
  const [hashtags,   setHashtags]   = useState("");
  const [notes,      setNotes]      = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Object URLs — session only, revoked on unmount
  const [objUrls, setObjUrls] = useState<Record<string, string>>({});
  const objUrlsRef             = useRef<Record<string, string>>({});

  // UI state
  const [showNotes, setShowNotes] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  // ── Populate on open ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (editPost) {
      setPlatform(editPost.platform);
      setType(editPost.type);
      setFormat(editPost.format);
      setStatus(editPost.status);
      setDate(editPost.date);
      setTime(editPost.time);
      setCaption(editPost.caption);
      setScript(editPost.script ?? "");
      setHashtags(editPost.hashtags ?? "");
      setNotes(editPost.notes ?? "");
      setMediaFiles(editPost.mediaFiles ?? []);
      setShowNotes(!!(editPost.notes));
    } else {
      // Reset to defaults for new post
      setPlatform("instagram");
      setType("informativo");
      setFormat("Reel");
      setStatus("scheduled");
      setDate(defaultDate ?? "");
      setTime("18:00");
      setCaption("");
      setScript("");
      setHashtags("");
      setNotes("");
      setMediaFiles([]);
      setShowNotes(false);
    }
    setErrors({});
  }, [open, editPost, defaultDate]);

  // ── Revoke all object URLs on unmount ────────────────────────────────────
  useEffect(() => {
    objUrlsRef.current = objUrls;
  }, [objUrls]);
  useEffect(() => {
    return () => {
      Object.values(objUrlsRef.current).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // ── Media helpers ────────────────────────────────────────────────────────
  const handleAddUrl = useCallback((id: string, url: string) => {
    setObjUrls((prev) => ({ ...prev, [id]: url }));
  }, []);

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.id !== id));
    setObjUrls((prev) => {
      if (prev[id]) URL.revokeObjectURL(prev[id]);
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!date)    errs.date    = "Selecciona una fecha";
    if (!caption.trim()) errs.caption = "La caption es obligatoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!validate()) return;
    const payload: Omit<CalendarPost, "id"> = {
      platform,
      type,
      format,
      status,
      date,
      time,
      caption:    caption.trim(),
      script:     script.trim() || undefined,
      hashtags:   hashtags.trim() || undefined,
      notes:      notes.trim() || undefined,
      // Strip session-only object URLs before persisting
      mediaFiles: mediaFiles.length > 0
        ? mediaFiles.map(({ url: _url, ...rest }) => rest)
        : undefined,
      engagement: editPost?.engagement,
    };
    if (editPost) {
      onSave({ ...payload, id: editPost.id });
    } else {
      onSave(payload);
    }
    onClose();
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const activePlatform = PLATFORMS[platform];
  const activeType     = CONTENT_TYPES[type];
  const isEdit         = !!editPost;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        {/* Gradient accent bar */}
        <div
          className="h-[3px] w-full shrink-0 rounded-t-xl"
          style={{
            background: `linear-gradient(to right, ${activePlatform.dot}, ${activeType.dot})`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
          <DialogHeader className="gap-0">
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <FileText className="h-4 w-4 text-muted-foreground/60" />
              {isEdit ? "Editar Post" : "Nuevo Post"}
            </DialogTitle>
          </DialogHeader>

          {/* Status badge */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatusKey)}
            className="rounded-lg border border-border/40 bg-card px-2 py-1 text-[11px] font-semibold text-muted-foreground focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">

            {/* ── Platform ────────────────────────────────────────────── */}
            <section className="flex flex-col gap-2">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Plataforma
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_KEYS.map((pk) => {
                  const p = PLATFORMS[pk];
                  return (
                    <button
                      key={pk}
                      type="button"
                      onClick={() => setPlatform(pk)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
                        platform === pk
                          ? `${p.bg} ${p.border} ${p.color}`
                          : "border-border/30 bg-transparent text-muted-foreground/50 hover:border-border/60 hover:text-foreground/70"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Content Type ─────────────────────────────────────────── */}
            <section className="flex flex-col gap-2">
              <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                Tipo de contenido
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_KEYS.map((tk) => {
                  const t = CONTENT_TYPES[tk];
                  return (
                    <button
                      key={tk}
                      type="button"
                      onClick={() => setType(tk)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
                        type === tk
                          ? `${t.bg} border-current/30 ${t.color}`
                          : "border-border/30 bg-transparent text-muted-foreground/50 hover:border-border/60 hover:text-foreground/70"
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Format + Date + Time ─────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Formato
                </Label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="h-9 rounded-lg border border-border/40 bg-card px-3 text-[12px] text-foreground/80 focus:outline-none focus:ring-1 focus:ring-border/60"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="post-date"
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
                >
                  <CalendarDays className="h-3 w-3" /> Fecha
                </Label>
                <Input
                  id="post-date"
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: "" })); }}
                  className={cn("h-9 text-[12px] [color-scheme:dark]", errors.date && "border-red-500/60")}
                />
                {errors.date && <p className="text-[10px] text-red-400">{errors.date}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="post-time"
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
                >
                  <Clock className="h-3 w-3" /> Hora
                </Label>
                <Input
                  id="post-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-9 text-[12px] [color-scheme:dark]"
                />
              </div>
            </div>

            {/* ── Caption ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="post-caption"
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
              >
                <FileText className="h-3 w-3" /> Caption
              </Label>
              <Textarea
                id="post-caption"
                value={caption}
                onChange={(e) => { setCaption(e.target.value); setErrors((p) => ({ ...p, caption: "" })); }}
                placeholder="Escribe la caption del post…"
                rows={3}
                className={cn("resize-none text-[13px]", errors.caption && "border-red-500/60")}
              />
              {errors.caption && <p className="text-[10px] text-red-400">{errors.caption}</p>}
            </div>

            {/* ── Guion / Script ────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="post-script"
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
              >
                <Mic2 className="h-3 w-3 text-emerald-400" />
                <span>Guion / Script</span>
                <Badge
                  variant="outline"
                  className="ml-0.5 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-bold text-emerald-400"
                >
                  NUEVO
                </Badge>
              </Label>
              <Textarea
                id="post-script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder={`Escribe el guion completo aquí…

Ejemplo:
[HOOK — 0s]
Tu primera frase gancho…

[DESARROLLO — 5s]
El contenido principal…

[CTA — 55s]
Llamada a la acción final.`}
                rows={9}
                className="resize-y font-mono text-[12px] leading-relaxed"
              />
              <p className="text-[10px] text-muted-foreground/30">
                Usa secciones [HOOK], [DESARROLLO], [CTA] para organizar tu guion.
              </p>
            </div>

            {/* ── Hashtags ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="post-hashtags"
                className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
              >
                <Hash className="h-3 w-3" /> Hashtags
              </Label>
              <Input
                id="post-hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#fitness #gabifit #workout"
                className="text-[12px]"
              />
            </div>

            {/* ── Media Upload ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                <Paperclip className="h-3 w-3" /> Archivos
              </Label>
              <MediaUploadZone
                files={mediaFiles}
                onChange={setMediaFiles}
                urls={objUrls}
                onAddUrl={handleAddUrl}
                onRemove={handleRemoveMedia}
              />
            </div>

            {/* ── Notes (collapsible) ──────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
              >
                <StickyNote className="h-3 w-3" />
                Notas de producción
                {showNotes
                  ? <ChevronUp className="h-3 w-3" />
                  : <ChevronDown className="h-3 w-3" />}
              </button>
              {showNotes && (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas internas: equipos, personas, locación, recordatorios…"
                  rows={3}
                  className="resize-none text-[12px] text-muted-foreground/70"
                />
              )}
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border/30 px-5 py-3">
          <div>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(editPost!.id); onClose(); }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-red-400/70 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border/40 px-4 py-1.5 text-[12px] font-medium text-muted-foreground/60 transition-all hover:border-border/70 hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-4 py-1.5 text-[12px] font-semibold text-emerald-400 ring-1 ring-emerald-500/30 transition-all hover:bg-emerald-500/30"
            >
              <Save className="h-3.5 w-3.5" />
              {isEdit ? "Guardar cambios" : "Crear post"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
