"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "gabifit-ig-profile-v1";

export interface IgPost {
  id: string;
  shortCode: string;
  url: string;
  type: "Video" | "Image" | "Sidecar";
  caption: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  timestamp: string;
  displayUrl: string;
  videoUrl: string | null;
  ownerUsername: string;
  durationSec: number | null;
  engagementRate: number;
}

export interface IgProfile {
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  profilePicUrl: string;
  isVerified: boolean;
  externalUrl: string;
  scrapedAt: string;
  posts: IgPost[];
}

interface State {
  profile: IgProfile | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

export function useIgProfile() {
  const [state, setState] = useState<State>({
    profile: null,
    loading: false,
    error: null,
    hydrated: false,
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as IgProfile;
        setState((s) => ({ ...s, profile: parsed, hydrated: true }));
      } else {
        setState((s) => ({ ...s, hydrated: true }));
      }
    } catch {
      setState((s) => ({ ...s, hydrated: true }));
    }
  }, []);

  const persist = useCallback((profile: IgProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, []);

  const scrapeProfile = useCallback(
    async (handle: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch("/api/instagram/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState((s) => ({
            ...s,
            loading: false,
            error: data.error ?? "Error al scrapeear",
          }));
          return;
        }
        persist(data as IgProfile);
        setState((s) => ({
          ...s,
          profile: data as IgProfile,
          loading: false,
          error: null,
        }));
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Error de conexión" }));
      }
    },
    [persist]
  );

  const clearProfile = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setState((s) => ({ ...s, profile: null, error: null }));
  }, []);

  // Computed analytics from posts
  const analytics =
    state.profile ? computeAnalytics(state.profile.posts) : null;

  return {
    ...state,
    scrapeProfile,
    clearProfile,
    analytics,
  };
}

export function computeAnalytics(posts: IgPost[]) {
  if (!posts.length) return null;

  const avgLikes = Math.round(
    posts.reduce((s, p) => s + p.likesCount, 0) / posts.length
  );
  const avgComments = Math.round(
    posts.reduce((s, p) => s + p.commentsCount, 0) / posts.length
  );
  const avgEngagement =
    posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length;
  const avgEngagementRate = Math.round(avgEngagement * 100) / 100;

  const totalViews = posts.reduce((s, p) => s + p.videoViewCount, 0);

  // Content type breakdown
  const typeCount: Record<string, number> = {};
  posts.forEach((p) => {
    typeCount[p.type] = (typeCount[p.type] ?? 0) + 1;
  });

  // Best posting hour (from timestamps)
  const hourCount: Record<number, number> = {};
  posts.forEach((p) => {
    const h = new Date(p.timestamp).getHours();
    hourCount[h] = (hourCount[h] ?? 0) + 1;
  });
  const bestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestPostingHour = bestHour != null ? Number(bestHour) : null;

  // Engagement trend (last 10 posts ordered by date for a chart)
  const sorted = [...posts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const engagementTrend = sorted.slice(-10).map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
    engagement: p.engagementRate,
    likes: p.likesCount,
    comments: p.commentsCount,
  }));

  const topPost =
    [...posts].sort((a, b) => b.engagementRate - a.engagementRate)[0] ?? null;

  return {
    avgLikes,
    avgComments,
    avgEngagementRate,
    totalViews,
    typeCount,
    bestPostingHour,
    engagementTrend,
    topPost,
    postsAnalyzed: posts.length,
  };
}
