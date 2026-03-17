"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart2,
  CalendarDays,
  Swords,
  Newspaper,
  LayoutDashboard,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
    color: "text-violet-400",
    bar: "bg-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Instagram",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
    bar: "bg-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    color: "text-cyan-400",
    bar: "bg-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    label: "Content Calendar",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bar: "bg-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Competitors",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bar: "bg-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    color: "text-sky-400",
    bar: "bg-sky-400",
    bg: "bg-sky-500/10",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen w-60 flex-col overflow-hidden border-r border-border/50 bg-sidebar">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-violet-600/8 blur-3xl" />

      {/* ── Logo / Brand ──────────────────────────────────────────────── */}
      <div className="relative flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/25">
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            GabiFit
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
            Studio
          </span>
        </div>
      </div>

      <Separator className="opacity-40" />

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, color, bar, bg }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/70 text-foreground"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground/90"
                  )}
                >
                  {/* Active left bar indicator */}
                  {isActive && (
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full",
                        bar
                      )}
                    />
                  )}

                  {/* Icon */}
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                      isActive ? bg : "group-hover:bg-white/5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 transition-colors duration-200",
                        isActive
                          ? color
                          : "text-muted-foreground/60 group-hover:text-muted-foreground"
                      )}
                    />
                  </span>

                  <span className="flex-1 truncate">{label}</span>

                  {isActive && (
                    <ChevronRight className={cn("h-3 w-3 shrink-0 opacity-60", color)} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="opacity-40" />

      {/* ── Profile card ──────────────────────────────────────────────── */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-white/[0.03] px-3 py-2.5 backdrop-blur-sm">
          {/* Avatar with online indicator */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-[11px] font-bold text-white shadow-md shadow-pink-500/20">
            GF
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[2px] border-sidebar bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-none text-foreground">
              Gabi Fit
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground/60">
              Content Manager
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground/25">
          v0.1
        </p>
      </div>
    </aside>
  );
}
