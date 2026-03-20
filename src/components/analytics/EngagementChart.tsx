"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

export interface EngagementPoint {
  date: string;
  engagement: number;
  likes: number;
  comments: number;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl shadow-black/30 text-[12px]">
      <p className="mb-1 font-semibold text-muted-foreground">{label}</p>
      <p className="font-bold text-pink-400">{payload[0].value.toFixed(2)}% engagement</p>
    </div>
  );
}

interface Props {
  trend: EngagementPoint[];
}

export function EngagementChart({ trend }: Props) {
  if (!trend.length) return <p className="text-sm text-muted-foreground/50">Sin datos</p>;

  const avg = +(trend.reduce((s, d) => s + d.engagement, 0) / trend.length).toFixed(2);

  // Map to chart-friendly shape
  const series = trend.map((d) => ({ date: d.date, rate: d.engagement }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={series} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f472b6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
          tickFormatter={(v: number) => `${v}%`}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />

        <ReferenceLine
          y={avg}
          stroke="rgba(244,114,182,0.35)"
          strokeDasharray="4 4"
          label={{
            value: `Avg ${avg}%`,
            fill: "rgba(244,114,182,0.6)",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />

        <Line
          type="monotone"
          dataKey="rate"
          name="Engagement Rate"
          stroke="url(#lineGlow)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "#f472b6", stroke: "#0f172a", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
