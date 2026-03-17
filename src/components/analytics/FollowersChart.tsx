"use client";

import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DailyMetric, toFollowersSeries } from "@/lib/analytics-data";

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

export function FollowersChart({ data }: { data: DailyMetric[] }) {
  const series = toFollowersSeries(data);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={series} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFollowers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
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
        {/* Left axis: total followers */}
        <YAxis
          yAxisId="left"
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)
          }
        />
        {/* Right axis: new followers */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)", paddingTop: 12 }}
        />

        {/* Bar: new followers per day */}
        <Bar
          yAxisId="right"
          dataKey="newFollowers"
          name="New Followers"
          fill="rgba(52,211,153,0.25)"
          radius={[3, 3, 0, 0]}
          maxBarSize={14}
        />

        {/* Area: cumulative followers */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="followers"
          name="Total Followers"
          stroke="#34d399"
          strokeWidth={2.5}
          fill="url(#gradFollowers)"
          dot={false}
          activeDot={{ r: 4, fill: "#34d399", stroke: "#0f172a", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
