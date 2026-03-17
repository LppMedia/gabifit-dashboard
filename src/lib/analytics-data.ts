// ─── Types (mirrors Metricool API shape) ──────────────────────────────────────
export type ContentType = "post" | "reel" | "story" | "carousel";
export type DateRangeKey = "7d" | "30d" | "90d";

export interface DailyMetric {
  date: string;         // "YYYY-MM-DD"
  impressions: number;
  reach: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers: number;    // cumulative follower count on that day
  newFollowers: number; // daily net new
}

export interface TopPost {
  id: string;
  caption: string;
  type: ContentType;
  date: string;
  coverColor: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number; // %
}

// ─── Seeded deterministic random ─────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

// ─── Generate 90 days of mock data (Metricool-style) ─────────────────────────
function generateDailyData(): DailyMetric[] {
  const rand = seededRandom(42);
  const data: DailyMetric[] = [];

  const baseFollowers = 8_420;
  let cumulativeFollowers = baseFollowers;

  // 90 days ending today (March 17 2026)
  const endDate = new Date("2026-03-17");

  for (let i = 89; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendBoost = isWeekend ? 1.4 : 1.0;

    // Simulate upward growth trend (~+15% over 90 days)
    const trendMult = 1 + (0.15 * (90 - i)) / 90;

    const impressions = Math.round((3_800 + rand() * 2_400) * trendMult * weekendBoost);
    const reach       = Math.round(impressions * (0.55 + rand() * 0.15));
    const likes       = Math.round(reach * (0.04 + rand() * 0.03));
    const comments    = Math.round(likes * (0.08 + rand() * 0.07));
    const shares      = Math.round(likes * (0.03 + rand() * 0.04));
    const saves       = Math.round(likes * (0.10 + rand() * 0.08));
    const engagements = likes + comments + shares + saves;

    // Net new followers: avg +12/day with variance
    const newFollowers = Math.round((8 + rand() * 20) * trendMult * weekendBoost);
    cumulativeFollowers += newFollowers;

    data.push({
      date: dateStr,
      impressions,
      reach,
      engagements,
      likes,
      comments,
      shares,
      saves,
      followers: cumulativeFollowers,
      newFollowers,
    });
  }

  return data;
}

export const ALL_DAILY_DATA: DailyMetric[] = generateDailyData();

// ─── Date range filter ────────────────────────────────────────────────────────
export function filterByRange(
  data: DailyMetric[],
  range: DateRangeKey,
  customStart?: string,
  customEnd?: string
): DailyMetric[] {
  if (customStart && customEnd) {
    return data.filter((d) => d.date >= customStart && d.date <= customEnd);
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return data.slice(-days);
}

// ─── Aggregate KPIs ───────────────────────────────────────────────────────────
export interface KpiSummary {
  totalImpressions: number;
  totalReach: number;
  avgEngagementRate: number;    // %
  followersGrowth: number;      // net new over period
  followersGrowthPct: number;   // %
  currentFollowers: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  totalEngagements: number;
}

export function computeKpis(data: DailyMetric[]): KpiSummary {
  if (!data.length) {
    return {
      totalImpressions: 0, totalReach: 0, avgEngagementRate: 0,
      followersGrowth: 0, followersGrowthPct: 0, currentFollowers: 0,
      totalLikes: 0, totalComments: 0, totalShares: 0, totalSaves: 0,
      totalEngagements: 0,
    };
  }
  const totalImpressions  = data.reduce((s, d) => s + d.impressions, 0);
  const totalReach        = data.reduce((s, d) => s + d.reach, 0);
  const totalLikes        = data.reduce((s, d) => s + d.likes, 0);
  const totalComments     = data.reduce((s, d) => s + d.comments, 0);
  const totalShares       = data.reduce((s, d) => s + d.shares, 0);
  const totalSaves        = data.reduce((s, d) => s + d.saves, 0);
  const totalEngagements  = totalLikes + totalComments + totalShares + totalSaves;
  const avgEngagementRate = totalReach > 0
    ? +((totalEngagements / totalReach) * 100).toFixed(2)
    : 0;

  const startFollowers   = data[0].followers - data[0].newFollowers;
  const currentFollowers = data[data.length - 1].followers;
  const followersGrowth  = data.reduce((s, d) => s + d.newFollowers, 0);
  const followersGrowthPct = startFollowers > 0
    ? +((followersGrowth / startFollowers) * 100).toFixed(2)
    : 0;

  return {
    totalImpressions, totalReach, avgEngagementRate,
    followersGrowth, followersGrowthPct, currentFollowers,
    totalLikes, totalComments, totalShares, totalSaves, totalEngagements,
  };
}

// ─── Chart-ready data (weekly buckets for bar chart) ──────────────────────────
export function toWeeklyBuckets(data: DailyMetric[]) {
  const weeks: { week: string; impressions: number; reach: number; engagements: number }[] = [];
  for (let i = 0; i < data.length; i += 7) {
    const slice = data.slice(i, i + 7);
    const label = slice[0].date.slice(5); // "MM-DD"
    weeks.push({
      week: label,
      impressions: slice.reduce((s, d) => s + d.impressions, 0),
      reach:       slice.reduce((s, d) => s + d.reach, 0),
      engagements: slice.reduce((s, d) => s + d.engagements, 0),
    });
  }
  return weeks;
}

// ─── Engagement rate per day (for line chart) ─────────────────────────────────
export function toEngagementRateSeries(data: DailyMetric[]) {
  return data.map((d) => ({
    date: d.date.slice(5),   // "MM-DD"
    rate: d.reach > 0
      ? +((d.engagements / d.reach) * 100).toFixed(2)
      : 0,
  }));
}

// ─── Followers series (line chart) ────────────────────────────────────────────
export function toFollowersSeries(data: DailyMetric[]) {
  return data.map((d) => ({
    date: d.date.slice(5),
    followers: d.followers,
    newFollowers: d.newFollowers,
  }));
}

// ─── Top performing posts (Metricool-style) ────────────────────────────────────
export const TOP_POSTS: TopPost[] = [
  {
    id: "tp1",
    caption: "5 moves to sculpt your core in under 10 minutes. Save this one! 💪",
    type: "reel",
    date: "2026-03-10",
    coverColor: "from-cyan-500 to-emerald-500",
    impressions: 24_850,
    reach: 18_200,
    likes: 1_420,
    comments: 184,
    shares: 310,
    saves: 890,
    engagementRate: 15.4,
  },
  {
    id: "tp2",
    caption: "Full week meal prep guide — everything I eat to stay on track while training.",
    type: "carousel",
    date: "2026-03-05",
    coverColor: "from-violet-500 to-pink-500",
    impressions: 19_300,
    reach: 14_100,
    likes: 980,
    comments: 210,
    shares: 195,
    saves: 1_240,
    engagementRate: 18.6,
  },
  {
    id: "tp3",
    caption: "Morning workout fuels your whole day 🔥 Drop your favourite pre-workout routine!",
    type: "post",
    date: "2026-02-28",
    coverColor: "from-pink-500 to-rose-400",
    impressions: 15_600,
    reach: 11_400,
    likes: 740,
    comments: 92,
    shares: 88,
    saves: 430,
    engagementRate: 11.8,
  },
  {
    id: "tp4",
    caption: "That post-leg-day feeling 😂 Tag a friend who knows the struggle.",
    type: "reel",
    date: "2026-03-01",
    coverColor: "from-amber-500 to-orange-400",
    impressions: 13_200,
    reach: 9_800,
    likes: 620,
    comments: 148,
    shares: 240,
    saves: 185,
    engagementRate: 12.2,
  },
  {
    id: "tp5",
    caption: "My top 3 supplements for muscle building — honest review, no sponsorships.",
    type: "post",
    date: "2026-02-22",
    coverColor: "from-emerald-500 to-teal-400",
    impressions: 11_400,
    reach: 8_600,
    likes: 510,
    comments: 175,
    shares: 120,
    saves: 340,
    engagementRate: 13.3,
  },
];

// ─── Content type breakdown (donut chart) ─────────────────────────────────────
export const CONTENT_BREAKDOWN = [
  { type: "Reel",     count: 4, impressions: 38_050, color: "#22d3ee" },  // cyan
  { type: "Carousel", count: 3, impressions: 29_300, color: "#a78bfa" },  // violet
  { type: "Post",     count: 6, impressions: 27_000, color: "#f472b6" },  // pink
  { type: "Story",    count: 8, impressions: 12_400, color: "#34d399" },  // emerald
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: "7d",  label: "7 days"  },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];
