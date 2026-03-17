import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCard {
  label: string;
  value: string;
  note?: string;
}

interface PlaceholderSectionProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  badge?: string;
  stats: StatCard[];
  features: string[];
}

export function PlaceholderSection({
  icon: Icon,
  iconColor,
  title,
  description,
  badge = "Coming soon",
  stats,
  features,
}: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      {/* Hero row */}
      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent ${iconColor}`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              {s.note && (
                <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Planned Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Under construction banner */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          🚧 This section is under active development. Check back soon!
        </p>
      </div>
    </div>
  );
}
