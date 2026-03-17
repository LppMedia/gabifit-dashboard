"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  subValue?: string;
  delta?: number;       // positive = up, negative = down
  deltaLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentColor: string; // used for the top bar gradient
}

export function KpiCard({
  label,
  value,
  subValue,
  delta,
  deltaLabel,
  icon: Icon,
  iconColor,
  iconBg,
  accentColor,
}: KpiCardProps) {
  const isUp      = delta !== undefined && delta > 0;
  const isDown    = delta !== undefined && delta < 0;
  const isNeutral = delta === undefined || delta === 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card transition-all duration-200 hover:border-border/70">
      {/* Accent bar */}
      <div className={cn("h-[3px] w-full bg-gradient-to-r", accentColor)} />

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          {/* Icon */}
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>

          {/* Delta badge */}
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                isUp   && "bg-emerald-500/12 text-emerald-400",
                isDown && "bg-red-500/12 text-red-400",
                isNeutral && "bg-zinc-500/12 text-zinc-400"
              )}
            >
              {isUp   && <TrendingUp   className="h-3 w-3" />}
              {isDown && <TrendingDown className="h-3 w-3" />}
              {isNeutral && <Minus     className="h-3 w-3" />}
              {isUp ? "+" : ""}{delta}%
            </span>
          )}
        </div>

        {/* Value */}
        <p className={cn("font-display mt-4 text-[34px] font-bold leading-none tabular-nums", iconColor)}>
          {value}
        </p>
        {subValue && (
          <p className="mt-1 text-[12px] text-muted-foreground/60">{subValue}</p>
        )}

        {/* Label */}
        <p className="mt-1.5 text-[13px] font-semibold text-foreground/75">{label}</p>
        {deltaLabel && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/45">{deltaLabel}</p>
        )}
      </div>
    </div>
  );
}
