"use client";

import {
  LayoutDashboard,
  Instagram,
  BarChart2,
  CalendarDays,
  CalendarCheck,
  Swords,
  Newspaper,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Bot,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Módulos del dashboard ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    label: "Instagram Studio",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    hover: "hover:border-pink-500/45 hover:shadow-pink-500/10",
    bar: "from-pink-500 to-rose-400",
    description: "Feed, analytics, plan semanal IA y gestión de posts",
    badge: "IA activa",
    badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
  {
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hover: "hover:border-emerald-500/45 hover:shadow-emerald-500/10",
    bar: "from-emerald-500 to-teal-400",
    description: "Planifica y agenda tu contenido",
    badge: "Activo",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
  {
    label: "Competidores",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hover: "hover:border-amber-500/45 hover:shadow-amber-500/10",
    bar: "from-amber-500 to-orange-400",
    description: "Monitorea creadores y marcas con IA",
    badge: "IA activa",
    badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  },
  {
    label: "Noticias",
    href: "/news",
    icon: Newspaper,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    hover: "hover:border-sky-500/45 hover:shadow-sky-500/10",
    bar: "from-sky-500 to-indigo-400",
    description: "Noticias del sector con resúmenes IA",
    badge: "Activo",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
] as const;

// ─── KPIs ──────────────────────────────────────────────────────────────────────
const KPI = [
  {
    label: "Posts Totales",
    value: "10",
    icon: FileText,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    delta: "+10 esta semana",
  },
  {
    label: "Programados",
    value: "3",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    delta: "Próximos listos",
  },
  {
    label: "Publicados",
    value: "2",
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    delta: "Último: Mar 10",
  },
  {
    label: "Borradores",
    value: "5",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    delta: "Listos para editar",
  },
];

// ─── Accesos rápidos IA ────────────────────────────────────────────────────────
const AI_TOOLS = [
  {
    label: "Instagram Studio",
    desc: "Feed, analytics y plan semanal IA",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    label: "Competidores",
    desc: "Monitorea creadores y marcas con IA",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    label: "Calendario",
    desc: "Planifica y agenda tu contenido",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

// ─── Página ────────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-lime-500/15 bg-card px-7 py-8">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-lime-600/8 blur-3xl" />
          <div className="absolute -bottom-10 right-8 h-52 w-52 rounded-full bg-emerald-600/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            {/* Pill */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1">
              <Zap className="h-3 w-3 text-lime-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-lime-400">
                GabiFit Studio
              </span>
            </div>

            <h2 className="font-display text-[32px] font-bold leading-none tracking-tight text-foreground">
              {greeting}, Gabi
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Tu dashboard de contenido está listo.{" "}
              <span className="text-foreground/60">
                {new Date().toLocaleDateString("es-CO", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-xl shadow-lime-500/25 sm:flex">
            <LayoutDashboard className="h-7 w-7 text-black" />
          </div>
        </div>

        {/* CTAs */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link
            href="/instagram"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 px-5 py-2.5 text-[13px] font-semibold text-black shadow-lg shadow-lime-500/25 transition-all hover:opacity-90 hover:shadow-lime-500/35"
          >
            <Instagram className="h-4 w-4" />
            Instagram Studio
          </Link>
          <Link
            href="/competitors"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-[13px] font-medium text-amber-300 transition-all hover:border-amber-500/55 hover:bg-amber-500/20 hover:text-amber-200"
          >
            <Bot className="h-4 w-4" />
            Analizar Competidores
          </Link>
        </div>
      </div>

      {/* ── KPI stats ─────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Resumen
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPI.map(({ label, value, icon: Icon, color, bg, delta }) => (
            <div
              key={label}
              className="rounded-xl border border-border/40 bg-card px-5 py-4 transition-all duration-200 hover:border-border/60"
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <p className={cn("font-display mt-3 text-[32px] font-bold leading-none tabular-nums", color)}>
                {value}
              </p>
              <p className="mt-1.5 text-[13px] font-semibold text-foreground/80">{label}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/50">{delta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Accesos IA ────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          <Sparkles className="h-3 w-3" />
          Accesos Rápidos IA
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AI_TOOLS.map(({ label, desc, href, icon: Icon, color, bg, border }) => (
            <Link key={href} href={href} className="group">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 transition-all duration-200 hover:bg-accent/20",
                  border
                )}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground/55">{desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/25 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Módulos ───────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Módulos
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(
            ({ label, href, icon: Icon, color, bg, border, hover, bar, description, badge, badgeColor }) => (
              <Link key={href} href={href} className="group block">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-xl",
                    border,
                    hover
                  )}
                >
                  {/* Color stripe */}
                  <div className={cn("h-[3px] w-full bg-gradient-to-r", bar)} />

                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                        <Icon className={cn("h-4 w-4", color)} />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                    </div>

                    <p className="font-display mt-3 text-[15px] font-semibold tracking-tight text-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground/60">
                      {description}
                    </p>

                    <div className="mt-4 border-t border-border/25 pt-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
                          badgeColor
                        )}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
