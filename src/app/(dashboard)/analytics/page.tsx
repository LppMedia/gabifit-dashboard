"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  TrendingUp,
  Users,
  Heart,
  BarChart2,
  RefreshCw,
  ExternalLink,
  Zap,
} from "lucide-react";
import { KpiCard }               from "@/components/analytics/KpiCard";
import { DateRangePicker }       from "@/components/analytics/DateRangePicker";
import { ImpressionsChart }      from "@/components/analytics/ImpressionsChart";
import { EngagementChart }       from "@/components/analytics/EngagementChart";
import { FollowersChart }        from "@/components/analytics/FollowersChart";
import { ContentBreakdownChart } from "@/components/analytics/ContentBreakdownChart";
import { TopPostsTable }         from "@/components/analytics/TopPostsTable";
import {
  ALL_DAILY_DATA,
  filterByRange,
  computeKpis,
  formatNumber,
  formatPct,
  DateRangeKey,
} from "@/lib/analytics-data";

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  accentClass,
  children,
}: {
  title: string;
  subtitle?: string;
  accentClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card">
      <div className={`h-[3px] w-full bg-gradient-to-r ${accentClass}`} />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRangeKey>("30d");

  const data    = useMemo(() => filterByRange(ALL_DAILY_DATA, range), [range]);
  const kpi     = useMemo(() => computeKpis(data), [data]);

  // Delta vs previous period
  const prevData = useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const end  = ALL_DAILY_DATA.length - days;
    return ALL_DAILY_DATA.slice(Math.max(0, end - days), end);
  }, [range]);
  const prevKpi = useMemo(() => computeKpis(prevData), [prevData]);

  const impressionsDelta = prevKpi.totalImpressions > 0
    ? Math.round(((kpi.totalImpressions - prevKpi.totalImpressions) / prevKpi.totalImpressions) * 100)
    : 0;
  const engagementDelta = prevKpi.avgEngagementRate > 0
    ? Math.round(((kpi.avgEngagementRate - prevKpi.avgEngagementRate) / prevKpi.avgEngagementRate) * 100)
    : 0;
  const followersDelta = prevKpi.followersGrowth > 0
    ? Math.round(((kpi.followersGrowth - prevKpi.followersGrowth) / prevKpi.followersGrowth) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
            <BarChart2 className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Analytics</h1>
            <p className="text-[12px] text-muted-foreground/60">
              Powered by&nbsp;
              <span className="inline-flex items-center gap-1 font-semibold text-cyan-400">
                <Zap className="h-3 w-3" /> Metricool
              </span>
              &nbsp;· Instagram data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-3 py-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[11px] font-semibold text-cyan-400">Connected · @gabifit</span>
            <ExternalLink className="h-3 w-3 text-cyan-400/60" />
          </div>

          <button className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-card px-3 py-2 text-[12px] font-medium text-muted-foreground/70 transition-all duration-150 hover:border-border/70 hover:text-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </button>

          <DateRangePicker selected={range} onChange={setRange} />
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Total Impressions"
          value={formatNumber(kpi.totalImpressions)}
          subValue={`${formatNumber(kpi.totalReach)} reach`}
          delta={impressionsDelta}
          deltaLabel="vs previous period"
          icon={Eye}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          accentColor="from-cyan-500 to-blue-500"
        />
        <KpiCard
          label="Avg Engagement Rate"
          value={formatPct(kpi.avgEngagementRate)}
          subValue={`${formatNumber(kpi.totalEngagements)} interactions`}
          delta={engagementDelta}
          deltaLabel="vs previous period"
          icon={Heart}
          iconColor="text-pink-400"
          iconBg="bg-pink-500/10"
          accentColor="from-pink-500 to-rose-400"
        />
        <KpiCard
          label="Followers Growth"
          value={`+${formatNumber(kpi.followersGrowth)}`}
          subValue={`${formatNumber(kpi.currentFollowers)} total`}
          delta={followersDelta}
          deltaLabel="vs previous period"
          icon={Users}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          accentColor="from-emerald-500 to-teal-400"
        />
        <KpiCard
          label="Growth Rate"
          value={formatPct(kpi.followersGrowthPct)}
          subValue={`${formatNumber(kpi.totalLikes)} likes`}
          deltaLabel={`${formatNumber(kpi.totalSaves)} saves · ${formatNumber(kpi.totalShares)} shares`}
          icon={TrendingUp}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
          accentColor="from-violet-500 to-purple-500"
        />
      </div>

      {/* ── Impressions + Reach (full width) ──────────────────────────── */}
      <ChartCard
        title="Impressions & Reach"
        subtitle={`${range === "7d" ? "Daily" : "Weekly"} · last ${range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}`}
        accentClass="from-cyan-500 to-violet-500"
      >
        <ImpressionsChart data={data} />
      </ChartCard>

      {/* ── Engagement + Followers row ────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Engagement Rate"
          subtitle="Daily % · interactions ÷ reach"
          accentClass="from-pink-500 to-rose-400"
        >
          <EngagementChart data={data} />
        </ChartCard>

        <ChartCard
          title="Followers Growth"
          subtitle="Cumulative total + daily new followers"
          accentClass="from-emerald-500 to-teal-400"
        >
          <FollowersChart data={data} />
        </ChartCard>
      </div>

      {/* ── Content breakdown + Interaction stats ─────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Content Mix"
          subtitle="Posts by format · all time"
          accentClass="from-violet-500 to-pink-400"
        >
          <ContentBreakdownChart />
        </ChartCard>

        <div className="overflow-hidden rounded-xl border border-border/40 bg-card lg:col-span-2">
          <div className="h-[3px] w-full bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-foreground">
              Interaction Breakdown
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">
              Total for selected period
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "Likes",    value: kpi.totalLikes,    color: "text-pink-400",    bar: "bg-pink-400",    icon: Heart       },
                { label: "Comments", value: kpi.totalComments, color: "text-violet-400",  bar: "bg-violet-400",  icon: BarChart2   },
                { label: "Shares",   value: kpi.totalShares,   color: "text-amber-400",   bar: "bg-amber-400",   icon: TrendingUp  },
                { label: "Saves",    value: kpi.totalSaves,    color: "text-emerald-400", bar: "bg-emerald-400", icon: Eye         },
              ].map(({ label, value, color, bar, icon: Icon }) => {
                const pct = kpi.totalEngagements > 0
                  ? Math.round((value / kpi.totalEngagements) * 100)
                  : 0;
                return (
                  <div
                    key={label}
                    className="flex flex-col gap-2 rounded-xl border border-border/30 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                        <span className="text-[12px] font-medium text-muted-foreground/70">
                          {label}
                        </span>
                      </div>
                      <span className={`font-display text-[20px] font-bold tabular-nums ${color}`}>
                        {formatNumber(value)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${bar} opacity-70 transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground/40">{pct}% of total</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Top performing posts table ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
        <div className="h-[3px] w-full bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-[15px] font-semibold text-foreground">
                Top Performing Posts
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                Ranked by impressions · Metricool data
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground/60 transition-all duration-150 hover:border-border/70 hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
              View in Metricool
            </button>
          </div>
          <div className="mt-4">
            <TopPostsTable />
          </div>
        </div>
      </div>

      {/* ── Footer attribution ────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pb-2 text-[11px] text-muted-foreground/25">
        <Zap className="h-3 w-3" />
        <span>
          Analytics data via Metricool API · Connect your account to see live data
        </span>
      </div>
    </div>
  );
}
