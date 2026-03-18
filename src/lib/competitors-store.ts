"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Competitor,
  CompetitorPlatformMetrics,
  SEED_COMPETITORS,
} from "./competitors-data";

const STORAGE_KEY = "gabifit-competitors-v1";

function load(): Competitor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Competitor[];
  } catch {
    // ignore
  }
  return SEED_COMPETITORS;
}

function save(data: Competitor[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded — silently ignore
  }
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

function applyJitter(
  metrics: CompetitorPlatformMetrics
): CompetitorPlatformMetrics {
  return {
    ...metrics,
    followers: jitter(metrics.followers),
    followersGrowth: jitterFloat(metrics.followersGrowth),
    avgEngagementRate: jitterFloat(metrics.avgEngagementRate),
  };
}

export function useCompetitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState<Set<string>>(new Set());
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const stored = load();
    // Merge seed data so new seed competitors appear after updates
    const storedIds = new Set(stored.map((c) => c.id));
    const merged = [
      ...stored,
      ...SEED_COMPETITORS.filter((c) => !storedIds.has(c.id)),
    ];
    setCompetitors(merged);
    save(merged);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Competitor[]) => {
    setCompetitors(next);
    save(next);
  }, []);

  const addCompetitor = useCallback(
    (
      data: Omit<
        Competitor,
        "id" | "addedAt" | "lastRefreshed" | "posts" | "metrics"
      >
    ): Competitor => {
      const now = new Date().toISOString();
      const newCompetitor: Competitor = {
        ...data,
        id: `comp-${Date.now()}`,
        addedAt: now,
        lastRefreshed: now,
        posts: [],
        metrics: Object.fromEntries(
          data.platforms.map((p) => [
            p,
            {
              followers: 0,
              followersGrowth: 0,
              avgEngagementRate: 0,
              postsPerWeek: 0,
              totalPosts: 0,
            } satisfies CompetitorPlatformMetrics,
          ])
        ),
      };
      setCompetitors((prev) => {
        const next = [...prev, newCompetitor];
        save(next);
        return next;
      });
      return newCompetitor;
    },
    []
  );

  const removeCompetitor = useCallback((id: string) => {
    setCompetitors((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(next);
      return next;
    });
  }, []);

  const updateCompetitor = useCallback(
    (id: string, updates: Partial<Competitor>) => {
      setCompetitors((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        );
        save(next);
        return next;
      });
    },
    []
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
          return {
            ...c,
            metrics: updatedMetrics,
            lastRefreshed: new Date().toISOString(),
          };
        });
        save(next);
        return next;
      });
      setRefreshing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    []
  );

  const refreshAll = useCallback(async (): Promise<void> => {
    setIsRefreshingAll(true);
    const ids = competitors.map((c) => c.id);
    await Promise.all(ids.map((id) => refreshCompetitor(id)));
    setIsRefreshingAll(false);
  }, [competitors, refreshCompetitor]);

  return {
    competitors,
    hydrated,
    refreshing,
    isRefreshingAll,
    addCompetitor,
    removeCompetitor,
    updateCompetitor,
    refreshCompetitor,
    refreshAll,
  };
}
