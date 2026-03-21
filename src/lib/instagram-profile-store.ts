"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): IgProfile {
  return {
    username:       row.username,
    fullName:       row.full_name,
    biography:      row.biography,
    followersCount: row.followers_count,
    followsCount:   row.follows_count,
    postsCount:     row.posts_count,
    profilePicUrl:  row.profile_pic_url,
    isVerified:     row.is_verified,
    externalUrl:    row.external_url,
    scrapedAt:      row.scraped_at,
    posts:          row.posts ?? [],
  };
}

export function useIgProfile() {
  const [state, setState] = useState<State>({
    profile: null,
    loading: false,
    error: null,
    hydrated: false,
  });
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState((s) => ({ ...s, hydrated: true })); return; }

      const { data } = await supabase
        .from("ig_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (active) {
        setState((s) => ({
          ...s,
          profile: data ? fromRow(data) : null,
          hydrated: true,
        }));
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setState((s) => ({ ...s, loading: false, error: data.error ?? "Error al scrapear" }));
          return;
        }

        // Upsert to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile = data as IgProfile;
          await supabase.from("ig_profiles").upsert({
            user_id:          user.id,
            username:         profile.username,
            full_name:        profile.fullName,
            biography:        profile.biography,
            followers_count:  profile.followersCount,
            follows_count:    profile.followsCount,
            posts_count:      profile.postsCount,
            profile_pic_url:  profile.profilePicUrl,
            is_verified:      profile.isVerified,
            external_url:     profile.externalUrl,
            posts:            profile.posts,
            scraped_at:       profile.scrapedAt,
          });
        }

        setState((s) => ({ ...s, profile: data as IgProfile, loading: false, error: null }));
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Error de conexión" }));
      }
    },
    [supabase]
  );

  const clearProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("ig_profiles").delete().eq("user_id", user.id);
    }
    setState((s) => ({ ...s, profile: null, error: null }));
  }, [supabase]);

  const analytics = state.profile ? computeAnalytics(state.profile.posts) : null;

  return { ...state, scrapeProfile, clearProfile, analytics };
}

export function computeAnalytics(posts: IgPost[]) {
  if (!posts.length) return null;

  const avgLikes = Math.round(posts.reduce((s, p) => s + p.likesCount, 0) / posts.length);
  const avgComments = Math.round(posts.reduce((s, p) => s + p.commentsCount, 0) / posts.length);
  const avgEngagement = posts.reduce((s, p) => s + p.engagementRate, 0) / posts.length;
  const avgEngagementRate = Math.round(avgEngagement * 100) / 100;
  const totalViews = posts.reduce((s, p) => s + p.videoViewCount, 0);

  const typeCount: Record<string, number> = {};
  posts.forEach((p) => { typeCount[p.type] = (typeCount[p.type] ?? 0) + 1; });

  const hourCount: Record<number, number> = {};
  posts.forEach((p) => {
    const h = new Date(p.timestamp).getHours();
    hourCount[h] = (hourCount[h] ?? 0) + 1;
  });
  const bestHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestPostingHour = bestHour != null ? Number(bestHour) : null;

  const sorted = [...posts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const engagementTrend = sorted.slice(-10).map((p) => ({
    date:       new Date(p.timestamp).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
    engagement: p.engagementRate,
    likes:      p.likesCount,
    comments:   p.commentsCount,
  }));

  const topPost = [...posts].sort((a, b) => b.engagementRate - a.engagementRate)[0] ?? null;

  return { avgLikes, avgComments, avgEngagementRate, totalViews, typeCount, bestPostingHour, engagementTrend, topPost, postsAnalyzed: posts.length };
}
