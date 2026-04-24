"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Instagram,
  BarChart2,
  CalendarDays,
  CalendarCheck,
  Swords,
  Newspaper,
  LayoutDashboard,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/components/providers/SessionProvider";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Inicio",
    href: "/",
    icon: LayoutDashboard,
    color: "text-pink-400",
    bar: "bg-pink-400",
    bg: "bg-pink-500/10",
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
    label: "Calendario",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bar: "bg-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Revisión Semanal",
    href: "/revision",
    icon: CalendarCheck,
    color: "text-lime-400",
    bar: "bg-lime-400",
    bg: "bg-lime-500/10",
  },
  {
    label: "Competidores",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bar: "bg-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Noticias",
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
  const { profile, signOut } = useSession();

  const displayName = profile?.full_name || "Gabi Fit";
  const displayRole = profile?.role || "Content Manager";
  const initials = profile?.avatar_initials ||
    displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GF";

  return (
    <aside className="relative flex h-screen w-60 flex-col overflow-hidden border-r border-border/50 bg-sidebar">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-lime-500/8 blur-3xl" />

      {/* ── Logo / Brand ──────────────────────────────────────────────── */}
      <div className="relative flex h-16 items-center px-5">
        <img
          src="https://res.cloudinary.com/dmkx2uowd/image/upload/q_auto/f_auto/v1775404908/GABIFIT_LOGO_VARIANTES_GABIFIT_copy_3_1_kjjzmf.png"
          alt="GabiFit"
          style={{ width: "auto", height: "32px", objectFit: "contain" }}
        />
      </div>

      <Separator className="opacity-40" />

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Workspace GabiFit
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
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 text-[11px] font-bold text-white shadow-md shadow-lime-500/20">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[2px] border-sidebar bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-none text-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground/60">
              {displayRole}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Cerrar sesión"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-white/5 hover:text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2.5 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground/25">
          v1.0
        </p>
      </div>
    </aside>
  );
}
