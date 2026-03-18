"use client";

import { useState, FormEvent } from "react";
import { Instagram, Loader2, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountConnectProps {
  loading: boolean;
  currentHandle: string | null;
  error: string | null;
  onConnect: (handle: string) => void;
  onDisconnect: () => void;
  scrapedAt: string | null;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "justo ahora";
  if (mins < 60) return `hace ${mins} minuto${mins !== 1 ? "s" : ""}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} hora${hrs !== 1 ? "s" : ""}`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}

export function AccountConnect({
  loading,
  currentHandle,
  error,
  onConnect,
  onDisconnect,
  scrapedAt,
}: AccountConnectProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = inputValue.replace(/^@/, "").trim();
    if (cleaned) {
      onConnect(cleaned);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        {/* Instagram gradient icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg shadow-pink-900/30">
          <Instagram className="h-5 w-5 text-white" />
        </div>

        {/* Center content */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {currentHandle ? (
            /* ── Connected state ── */
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  @{currentHandle}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Conectado
                </span>
              </div>
              {scrapedAt && (
                <span className="text-xs text-muted-foreground">
                  Actualizado {relativeTime(scrapedAt)}
                </span>
              )}
            </div>
          ) : (
            /* ── Disconnected state ── */
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-foreground">
                Conecta tu cuenta de Instagram
              </p>
              <p className="text-xs text-muted-foreground">
                Ingresa tu @ para analizar tus métricas reales
              </p>
            </div>
          )}

          {/* Input / action */}
          {currentHandle ? (
            <button
              type="button"
              onClick={onDisconnect}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5",
                "text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <RefreshCw className="h-3 w-3" />
              Cambiar cuenta
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="@tu_usuario"
                disabled={loading}
                className={cn(
                  "h-9 w-48 rounded-lg border border-border/50 bg-background/60 px-3 text-sm",
                  "text-foreground placeholder:text-muted-foreground/60",
                  "outline-none ring-0 transition-colors",
                  "focus:border-pink-500/60 focus:bg-background",
                  "disabled:opacity-50"
                )}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white",
                  "bg-gradient-to-r from-pink-600 to-violet-600",
                  "shadow-md shadow-pink-900/30",
                  "transition-opacity hover:opacity-90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  "Analizar cuenta"
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-400 ring-1 ring-red-500/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
