"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ─── Route config ─────────────────────────────────────────────────────────────
const ROUTE_META: Record<string, { title: string; subtitle: string; color: string }> = {
  "/":            { title: "Inicio",             subtitle: "Tu hub de contenido de un vistazo",           color: "text-pink-400"    },
  "/instagram":   { title: "Instagram",          subtitle: "Programa, borra y publica contenido",         color: "text-pink-400"    },
  "/analytics":   { title: "Analytics",          subtitle: "Crecimiento, alcance y engagement real",      color: "text-cyan-400"    },
  "/calendar":    { title: "Calendario",         subtitle: "Planifica tu pipeline de contenido",          color: "text-emerald-400" },
  "/revision":    { title: "Revisión Semanal",   subtitle: "Análisis de contenido + plan para la próxima semana", color: "text-lime-400" },
  "/competitors": { title: "Competidores",       subtitle: "Monitorea creadores y marcas con IA",         color: "text-amber-400"   },
  "/news":        { title: "Noticias",           subtitle: "Noticias del sector con resúmenes de IA",     color: "text-sky-400"     },
};

const FALLBACK = { title: "Dashboard", subtitle: "GabiFit Studio", color: "text-lime-400" };

// ─── Component ────────────────────────────────────────────────────────────────
export function Header() {
  const pathname = usePathname();

  const meta =
    Object.entries(ROUTE_META)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([route]) => pathname === route || pathname.startsWith(route + "/"))?.[1] ??
    FALLBACK;

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/60 px-6 backdrop-blur-md">

      {/* ── Left: page title ──────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col">
        <h1 className={`font-display text-[17px] font-semibold leading-none tracking-tight ${meta.color}`}>
          {meta.title}
        </h1>
        <p className="mt-1 truncate text-[11px] text-muted-foreground/60">
          {meta.subtitle}
        </p>
      </div>

      {/* ── Right: search + actions ───────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search…"
            className="h-8 w-44 rounded-lg border-border/40 bg-white/[0.04] pl-8 text-xs placeholder:text-muted-foreground/40 focus-visible:w-56 focus-visible:border-border/80 transition-all duration-300"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-white/[0.03] text-muted-foreground/60 transition-all duration-150 hover:border-border/60 hover:bg-white/[0.07] hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 p-0 text-[9px] font-bold text-white border-0 shadow-sm shadow-pink-500/40">
            3
          </Badge>
        </button>

        {/* AI quick action */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-lime-500/30 bg-lime-500/10 text-lime-400 transition-all duration-150 hover:border-lime-500/60 hover:bg-lime-500/20"
          aria-label="AI Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>

        {/* Avatar */}
        <div className="relative ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 text-[11px] font-bold text-white shadow-md shadow-lime-500/20 ring-2 ring-border/30 transition-all duration-150 hover:ring-lime-500/40 select-none">
          GF
        </div>
      </div>
    </header>
  );
}
