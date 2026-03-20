"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const TYPE_META: Record<string, { label: string; color: string }> = {
  Video:   { label: "Reels",      color: "#f472b6" },
  Image:   { label: "Posts",      color: "#a78bfa" },
  Sidecar: { label: "Carruseles", color: "#fbbf24" },
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 shadow-xl shadow-black/30 text-[12px]">
      <p className="font-bold" style={{ color: p.color }}>{name}</p>
      <p className="mt-1 text-muted-foreground/70">{value} posts</p>
    </div>
  );
}

interface Props {
  typeCount: Record<string, number>;
}

export function ContentBreakdownChart({ typeCount }: Props) {
  const data = Object.entries(typeCount)
    .map(([type, count]) => ({
      type,
      count,
      label: TYPE_META[type]?.label ?? type,
      color: TYPE_META[type]?.color ?? "#6b7280",
    }))
    .filter((d) => d.count > 0);

  const total = data.reduce((s, d) => s + d.count, 0);

  if (!data.length) return <p className="text-sm text-muted-foreground/50">Sin datos</p>;

  return (
    <div className="flex items-center gap-6">
      <div className="shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={46}
              outerRadius={72}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color} stroke="transparent" opacity={0.9} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((d) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <li key={d.type} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground/80">{d.label}</span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: d.color }}>{pct}%</span>
                </div>
                <div className="mt-0.5 h-1 w-full rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color, opacity: 0.7 }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
