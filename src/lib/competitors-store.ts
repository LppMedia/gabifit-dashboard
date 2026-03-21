"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Competitor,
  CompetitorPlatformMetrics,
  SEED_COMPETITORS,
} from "./competitors-data";
import { createClient } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Competitor {
  return {
    id:             row.id,
    handle:         row.handle,
    name:           row.name,
    platforms:      row.platforms,
    niche:          row.niche,
    avatarGradient: row.avatar_gradient,
    addedAt:        row.added_at,
    lastRefreshed:  row.last_refreshed,
    metrics:        row.metrics ?? {},
    posts:          [], // posts live in competitor_scraped_data
  };
}

function jitter(value: number, pct = 0.05): number {
  const delta = value * pct;
  return Math.round(value + (Math.random() * 2 - 1) * delta);
}

function jitterFloat(value: number, pct = 0.05): number {
  const delta = value * pct;
  const result = value + (Math.random() * 2 - 1) * delta;
  return Math.round(result * 10) / 10;
}

function applyJitter(metrics: CompetitorPlatformMetrics): CompetitorPlatformMetrics {
  return {
    ...metrics,
    followers:         jitter(metrics.followers),
    followersGrowth:   jitterFloat(metrics.followersGrowth),
    avgEngagementRate: jitterFloat(metrics.avgEngagementRate),
  };
}

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [hydrated, setHydrated]       = useState(false);
  const [refreshing, setRefreshing]   = useState<Set<string>>(new Set());
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHydrated(true); return; }

      const { data } = await supabase
        .from("competitors")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: true });

      if (active) {
        let rows = (data ?? []).map(fromRow);
        // Seed default competitors for first-time users
        if (rows.length === 0) {
          const seeded = await seedCompetitors(user.id, supabase);
          rows = seeded;
        }
        setCompetitors(rows);
        setHydrated(true);
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCompetitor = useCallback(
    async (
      data: Omit<Competitor, "id" | "addedAt" | "lastRefreshed" | "posts" | "metrics">
    ): Promise<Competitor> => {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const id = `comp-${Date.now()}`;

      const metrics = Object.fromEntries(
        data.platforms.map((p) => [
          p,
          { followers: 0, followersGrowth: 0, avgEngagementRate: 0, postsPerWeek: 0, totalPosts: 0 } satisfies CompetitorPlatformMetrics,
        ])
      );

      const newCompetitor: Competitor = {
        ...data, id, addedAt: now, lastRefreshed: now, posts: [], metrics,
      };

      if (user) {
        await supabase.from("competitors").insert({
          id,
          user_id:         user.id,
          handle:          data.handle,
          name:            data.name,
          platforms:       data.platforms,
          niche:           data.niche,
          avatar_gradient: data.avatarGradient,
          metrics,
          added_at:        now,
          last_refreshed:  now,
        });
      }

      setCompetitors((prev) => [...prev, newCompetitor]);
      return newCompetitor;
    },
    [supabase]
  );

  const removeCompetitor = useCallback(
    async (id: string) => {
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
      // competitor_scraped_data will cascade delete
      await supabase.from("competitors").delete().eq("id", id);
    },
    [supabase]
  );

  const updateCompetitor = useCallback(
    async (id: string, updates: Partial<Competitor>) => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );

      const dbUpdates: Record<string, unknown> = {};
      if (updates.handle         !== undefined) dbUpdates.handle          = updates.handle;
      if (updates.name           !== undefined) dbUpdates.name            = updates.name;
      if (updates.platforms      !== undefined) dbUpdates.platforms       = updates.platforms;
      if (updates.niche          !== undefined) dbUpdates.niche           = updates.niche;
      if (updates.avatarGradient !== undefined) dbUpdates.avatar_gradient = updates.avatarGradient;
      if (updates.metrics        !== undefined) dbUpdates.metrics         = updates.metrics;
      if (updates.lastRefreshed  !== undefined) dbUpdates.last_refreshed  = updates.lastRefreshed;

      await supabase.from("competitors").update(dbUpdates).eq("id", id);
    },
    [supabase]
  );

  const refreshCompetitor = useCallback(
    async (id: string): Promise<void> => {
      setRefreshing((prev) => new Set(prev).add(id));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCompetitors((prev) => {
        const next = prev.map((c) => {
          if (c.id !== id) return c;
          const updatedMetrics = Object.fromEntries(
            Object.entries(c.metrics).map(([platform, m]) => [
              platform,
              m ? applyJitter(m) : m,
            ])
          ) as Competitor["metrics"];
          return { ...c, metrics: updatedMetrics, lastRefreshed: new Date().toISOString() };
        });
        // Persist updated metrics to DB
        const updated = next.find((c) => c.id === id);
        if (updated) {
          supabase.from("competitors").update({
            metrics:        updated.metrics,
            last_refreshed: updated.lastRefreshed,
          }).eq("id", id);
        }
        return next;
      });
      setRefreshing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [supabase]
  );

  const refreshAll = useCallback(async (): Promise<void> => {
    setIsRefreshingAll(true);
    await Promise.all(competitors.map((c) => refreshCompetitor(c.id)));
    setIsRefreshingAll(false);
  }, [competitors, refreshCompetitor]);

  /** Update the instagram follower count for a competitor after a live scrape */
  const updateFollowers = useCallback(
    async (competitorId: string, followers: number) => {
      setCompetitors((prev) =>
        prev.map((c) => {
          if (c.id !== competitorId) return c;
          const igMetrics = c.metrics.instagram;
          const updated = {
            ...c,
            metrics: {
              ...c.metrics,
              instagram: igMetrics
                ? { ...igMetrics, followers }
                : { followers, followersGrowth: 0, avgEngagementRate: 0, postsPerWeek: 0, totalPosts: 0 },
            },
          };
          // Fire-and-forget DB update
          supabase.from("competitors").update({ metrics: updated.metrics }).eq("id", competitorId);
          return updated;
        })
      );
    },
    [supabase]
  );

  return {
    competitors,
    hydrated,
    refreshing,
    isRefreshingAll,
    addCompetitor,
    removeCompetitor,
    updateCompetitor,
    updateFollowers,
    refreshCompetitor,
    refreshAll,
  };
}

// ─── Seed helpers ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedCompetitors(userId: string, supabase: any): Promise<Competitor[]> {
  const rows = SEED_COMPETITORS.map((c) => ({
    id:              c.id,
    user_id:         userId,
    handle:          c.handle,
    name:            c.name,
    platforms:       c.platforms,
    niche:           c.niche,
    avatar_gradient: c.avatarGradient,
    metrics:         c.metrics,
    added_at:        c.addedAt,
    last_refreshed:  c.lastRefreshed,
  }));
  const { data } = await supabase.from("competitors").insert(rows).select();
  return (data ?? rows).map(fromRow);
}
