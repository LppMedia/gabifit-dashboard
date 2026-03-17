import { LayoutDashboard, Instagram, BarChart2, CalendarDays, Swords, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const SECTIONS = [
  {
    label: "Instagram",
    href: "/instagram",
    icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    description: "Manage posts, stories & reels",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    description: "Track growth & engagement",
  },
  {
    label: "Content Calendar",
    href: "/calendar",
    icon: CalendarDays,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    description: "Plan & schedule content",
  },
  {
    label: "Competitors",
    href: "/competitors",
    icon: Swords,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    description: "Monitor competitor activity",
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    description: "Stay on top of industry news",
  },
] as const;

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-xl border border-border bg-card px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Welcome back to GabiFit Studio
            </h2>
            <p className="text-sm text-muted-foreground">
              Your content management hub — everything in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Quick nav grid */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sections
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ label, href, icon: Icon, color, bg, description }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full bg-card border-border transition-colors duration-150 group-hover:border-primary/40 group-hover:bg-accent/30">
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
