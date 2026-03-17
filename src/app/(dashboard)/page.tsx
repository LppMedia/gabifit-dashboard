import {
  LayoutDashboard,
  Instagram,
  BarChart2,
  CalendarDays,
  Swords,
  Newspaper,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Section nav cards ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    label: "Instagram",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    hover: "hover:border-pink-500/45 hover:shadow-pink-500/8",
    bar: "from-pink-500 to-rose-400",
    description: "Manage posts, stories & reels",
    stat: "10 posts ready",
    statColor: "text-pink-400",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    hover: "hover:border-cyan-500/45 hover:shadow-cyan-500/8",
    bar: "from-cyan-500 to-blue-400",
    description: "Track growth & engagement",
    stat: "Coming soon",
    statColor: "text-muted-foreground/50",
  },
  {
    label: "Content Calendar",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hover: "hover:border-emerald-500/45 hover:shadow-emerald-500/8",
    bar: "from-emerald-500 to-teal-400",
    description: "Plan & schedule content",
    stat: "Coming soon",
    statColor: "text-muted-foreground/50",
  },
  {
    label: "Competitors",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hover: "hover:border-amber-500/45 hover:shadow-amber-500/8",
    bar: "from-amber-500 to-orange-400",
    description: "Monitor competitor activity",
    stat: "Coming soon",
    statColor: "text-muted-foreground/50",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    hover: "hover:border-sky-500/45 hover:shadow-sky-500/8",
    bar: "from-sky-500 to-indigo-400",
    description: "Stay on top of industry news",
    stat: "Coming soon",
    statColor: "text-muted-foreground/50",
  },
] as const;

// ─── KPI stat cards ───────────────────────────────────────────────────────────
const KPI = [
  {
    label: "Total Posts",
    value: "10",
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    delta: "+10 this week",
  },
  {
    label: "Scheduled",
    value: "3",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    delta: "Next: Mar 19",
  },
  {
    label: "Published",
    value: "2",
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    delta: "Last: Mar 10",
  },
  {
    label: "Drafts",
    value: "5",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    delta: "Ready to edit",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card px-7 py-8">
        {/* Mesh gradients */}
        <div className="pointer-events-none absolute inset-0 select-none">
          <div className="absolute -left-16 -top-16 h-60 w-60 rounded-full bg-violet-600/8 blur-3xl" />
          <div className="absolute -bottom-10 right-10 h-44 w-44 rounded-full bg-pink-600/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div>
            {/* Pill badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1">
              <Zap className="h-3 w-3 text-violet-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-400">
                GabiFit Studio
              </span>
            </div>

            <h2 className="font-display text-[32px] font-bold leading-none tracking-tight text-foreground">
              {greeting}, Gabi
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Your content dashboard is ready.{" "}
              <span className="text-foreground/60">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-xl shadow-violet-500/20 sm:flex">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* CTAs */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link
            href="/instagram"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-pink-500/20 transition-all duration-200 hover:opacity-90 hover:shadow-pink-500/30"
          >
            <Instagram className="h-4 w-4" />
            Create Post
          </Link>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-border/40 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:border-border/70 hover:bg-white/[0.07] hover:text-foreground"
          >
            <BarChart2 className="h-4 w-4" />
            View Analytics
          </Link>
        </div>
      </div>

      {/* ── KPI stats ─────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          At a Glance
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

      {/* ── Sections grid ─────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Sections
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(
            ({ label, href, icon: Icon, color, bg, border, hover, bar, description, stat, statColor }) => (
              <Link key={href} href={href} className="group block">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-xl",
                    border,
                    hover
                  )}
                >
                  {/* Gradient accent stripe */}
                  <div className={cn("h-[3px] w-full bg-gradient-to-r", bar)} />

                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                        <Icon className={cn("h-4 w-4", color)} />
                      </div>
                      <ArrowRight className="h-4 w-4 translate-x-0 text-muted-foreground/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/60" />
                    </div>

                    <p className="font-display mt-3 text-[15px] font-semibold tracking-tight text-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground/60">
                      {description}
                    </p>

                    <div className="mt-4 border-t border-border/25 pt-3">
                      <span className={cn("text-[11px] font-semibold", statColor)}>
                        {stat}
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
