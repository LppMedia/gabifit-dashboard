"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DailyMetric } from "@/lib/analytics-data";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl shadow-black/30 text-[12px]">
      <p className="mb-2 font-semibold text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-muted-foreground/80">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-bold tabular-nums" style={{ color: p.color }}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────
interface ImpressionsChartProps {
  data: DailyMetric[];
  compact?: boolean;
}

export function ImpressionsChart({ data, compact }: ImpressionsChartProps) {
  // For 30+ days show weekly buckets; for 7 days show daily
  const chartData =
    data.length > 14
      ? (() => {
          const buckets: { date: string; Impressions: number; Reach: number }[] = [];
          for (let i = 0; i < data.length; i += 7) {
            const slice = data.slice(i, i + 7);
            buckets.push({
              date: slice[0].date.slice(5),
              Impressions: slice.reduce((s, d) => s + d.impressions, 0),
              Reach:       slice.reduce((s, d) => s + d.reach,       0),
            });
          }
          return buckets;
        })()
      : data.map((d) => ({
          date: d.date.slice(5),
          Impressions: d.impressions,
          Reach: d.reach,
        }));

  return (
    <ResponsiveContainer width="100%" height={compact ? 180 : 260}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}   />
          </linearGradient>
          <linearGradient id="gradReach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)", paddingTop: 12 }}
        />

        <Area
          type="monotone"
          dataKey="Impressions"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#gradImpressions)"
          dot={false}
          activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0f172a", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="Reach"
          stroke="#a78bfa"
          strokeWidth={2}
          fill="url(#gradReach)"
          dot={false}
          activeDot={{ r: 4, fill: "#a78bfa", stroke: "#0f172a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
