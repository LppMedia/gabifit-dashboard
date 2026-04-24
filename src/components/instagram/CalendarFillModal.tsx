"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { ContentPlan, ContentPlanPost } from "@/lib/weekly-review-types";
import { createClient } from "@/lib/supabase/client";
import { PLATFORMS } from "@/lib/calendar-data";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentPlan: ContentPlan;
}

interface PostRow extends ContentPlanPost {
  conflict: boolean;
  selected: boolean;
}

function makeId() {
  return crypto.randomUUID();
}

export function CalendarFillModal({ open, onOpenChange, contentPlan }: Props) {
  const router = useRouter();
  const [rows,    setRows]    = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filling, setFilling] = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setToast(null);

    async function detectConflicts() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { setLoading(false); return; }

      const allPlanPosts = contentPlan.semanas.flatMap((w) => w.posts);
      if (!allPlanPosts.length) {
        if (!cancelled) { setRows([]); setLoading(false); }
        return;
      }

      const dates      = allPlanPosts.map((p) => p.fecha);
      const rangeStart = dates.reduce((a, b) => (a < b ? a : b));
      const rangeEnd   = dates.reduce((a, b) => (a > b ? a : b));

      const { data: existing } = await supabase
        .from("calendar_posts")
        .select("date, platform")
        .gte("date", rangeStart)
        .lte("date", rangeEnd)
        .eq("user_id", user.id);

      if (cancelled) return;

      const occupiedSlots = new Set<string>(
        (existing ?? []).map((r) => `${r.date as string}:${r.platform as string}`)
      );

      setRows(
        allPlanPosts.map((post) => {
          const slot = `${post.fecha}:${post.plataforma}`;
          return {
            ...post,
            conflict: occupiedSlots.has(slot),
            selected: !occupiedSlots.has(slot),
          };
        })
      );
      setLoading(false);
    }

    detectConflicts();
    return () => { cancelled = true; };
  }, [open, contentPlan]);

  function toggleRow(index: number) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  }

  async function handleFill() {
    setFilling(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const selected = rows.filter((r) => r.selected);
      if (!selected.length) return;

      const toInsert = selected.map((p) => ({
        id:          makeId(),
        user_id:     user.id,
        date:        p.fecha,
        time:        "09:00",
        platform:    p.plataforma,
        type:        p.tipo,
        status:      "scheduled",
        caption:     p.caption,
        format:      p.formato,
        hashtags:    null,
        script:      null,
        notes:       p.hook ? `Hook: ${p.hook}\nCTA: ${p.cta}` : null,
        media_files: null,
        engagement:  null,
      }));

      const { error } = await supabase.from("calendar_posts").insert(toInsert);

      if (error) {
        setToast(`Error al guardar: ${error.message}`);
        return;
      }

      setToast(`${toInsert.length} posts agregados al calendario ✓`);
      setTimeout(() => {
        onOpenChange(false);
        router.push("/calendar");
      }, 1400);
    } catch (e) {
      setToast(`Error de red: ${e instanceof Error ? e.message : "intenta de nuevo"}`);
    } finally {
      setFilling(false);
    }
  }

  if (!open) return null;

  const selectedCount = rows.filter((r) => r.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border/50 bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
          <div>
            <h2 className="font-display text-[16px] font-semibold">Revisar antes de llenar el calendario</h2>
            <p className="text-[12px] text-muted-foreground/50 mt-0.5">{selectedCount} posts seleccionados</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-14 text-[13px] text-muted-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detectando conflictos con el calendario...
            </div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted-foreground/40">
              El plan no tiene posts para agregar.
            </p>
          ) : (
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-background/95 backdrop-blur border-b border-border/20">
                <tr>
                  {["", "Fecha", "Plataforma", "Tema", "Estado"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const platform = PLATFORMS[row.plataforma as keyof typeof PLATFORMS];
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/15 transition-colors",
                        row.selected ? "hover:bg-white/[0.02]" : "opacity-50"
                      )}
                    >
                      <td className="pl-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(i)}
                          className="h-3.5 w-3.5 rounded accent-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground/80 tabular-nums whitespace-nowrap">
                        {new Date(row.fecha + "T12:00:00").toLocaleDateString("es-DO", {
                          weekday: "short", day: "numeric", month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("font-semibold", platform?.color ?? "text-white")}>{platform?.abbr ?? row.plataforma}</span>
                        <span className="ml-1 text-muted-foreground/40">{row.formato}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 max-w-[180px] truncate">{row.tema}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.conflict ? (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400">
                            <AlertTriangle className="h-3 w-3" />Conflicto
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />Libre
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border/30 bg-background shrink-0">
          {toast ? (
            <p className={cn(
              "text-[13px] font-medium",
              toast.startsWith("Error") ? "text-red-400" : "text-emerald-400"
            )}>{toast}</p>
          ) : (
            <p className="text-[12px] text-muted-foreground/50">
              {selectedCount} de {rows.length} posts serán creados en el calendario
            </p>
          )}
          <button
            onClick={handleFill}
            disabled={filling || selectedCount === 0 || !!toast}
            className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {filling
              ? <><Loader2 className="h-4 w-4 animate-spin" />Llenando...</>
              : <>Llenar calendario</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
