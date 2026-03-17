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
  },
  {
    label: "Instagram",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    color: "text-cyan-400",
  },
  {
    label: "Content Calendar",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
  },
  {
    label: "Competitors",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    color: "text-sky-400",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-foreground">
          GabiFit&nbsp;
          <span className="font-normal text-muted-foreground">Studio</span>
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Main
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon, color }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? color : "text-muted-foreground"
                    )}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="px-5 py-4">
        <p className="text-[10px] text-muted-foreground">
          Content Dashboard&nbsp;·&nbsp;v0.1
        </p>
      </div>
    </aside>
  );
}
