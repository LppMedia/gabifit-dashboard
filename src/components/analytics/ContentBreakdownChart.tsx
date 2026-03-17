"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CONTENT_BREAKDOWN, formatNumber } from "@/lib/analytics-data";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { impressions: number; color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl shadow-black/30 text-[12px]">
      <p className="font-bold" style={{ color: p.color }}>{name}</p>
      <p className="mt-1 text-muted-foreground/70">{value} posts</p>
      <p className="text-muted-foreground/70">{formatNumber(p.impressions)} impressions</p>
    </div>
  );
}

export function ContentBreakdownChart() {
  const total = CONTENT_BREAKDOWN.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={CONTENT_BREAKDOWN}
              dataKey="count"
              nameKey="type"
              innerRadius={46}
              outerRadius={72}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
            >
              {CONTENT_BREAKDOWN.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={entry.color}
                  stroke="transparent"
                  opacity={0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <ul className="flex-1 space-y-2.5">
        {CONTENT_BREAKDOWN.map((d) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <li key={d.type} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: d.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground/80">
                    {d.type}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: d.color }}>
                    {pct}%
                  </span>
                </div>
                {/* Mini bar */}
                <div className="mt-0.5 h-1 w-full rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: d.color, opacity: 0.7 }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
