"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type PostType = "post" | "story" | "reel" | "carousel";
export type PostStatus = "scheduled" | "draft" | "published" | "backlog";

export interface InstagramPost {
  id: string;
  caption: string;
  type: PostType;
  status: PostStatus;
  scheduledDate: string | null;
  createdAt: string;
  hashtags: string;
  coverColor: string;
}

// ─── DB row → TS ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): InstagramPost {
  return {
    id:            row.id,
    caption:       row.caption,
    type:          row.type as PostType,
    status:        row.status as PostStatus,
    scheduledDate: row.scheduled_date ?? null,
    createdAt:     row.created_at,
    hashtags:      row.hashtags,
    coverColor:    row.cover_color,
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useInstagramPosts() {
  const [posts, setPosts]       = useState<InstagramPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setHydrated(true); return; }

      const { data } = await supabase
        .from("instagram_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (active) {
        setPosts((data ?? []).map(fromRow));
        setHydrated(true);
      }
    }
    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPost = useCallback(
    async (post: Omit<InstagramPost, "id" | "createdAt">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("instagram_posts")
        .insert({
          user_id:        user.id,
          caption:        post.caption,
          type:           post.type,
          status:         post.status,
          scheduled_date: post.scheduledDate ?? null,
          hashtags:       post.hashtags,
          cover_color:    post.coverColor,
        })
        .select()
        .single();

      if (!error && data) {
        setPosts((prev) => [fromRow(data), ...prev]);
      }
    },
    [supabase]
  );

  const updatePost = useCallback(
    async (id: string, updates: Partial<InstagramPost>) => {
      // Optimistic update
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

      const dbUpdates: Record<string, unknown> = {};
      if (updates.caption       !== undefined) dbUpdates.caption        = updates.caption;
      if (updates.type          !== undefined) dbUpdates.type           = updates.type;
      if (updates.status        !== undefined) dbUpdates.status         = updates.status;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.hashtags      !== undefined) dbUpdates.hashtags       = updates.hashtags;
      if (updates.coverColor    !== undefined) dbUpdates.cover_color    = updates.coverColor;

      await supabase.from("instagram_posts").update(dbUpdates).eq("id", id);
    },
    [supabase]
  );

  const deletePost = useCallback(
    async (id: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      await supabase.from("instagram_posts").delete().eq("id", id);
    },
    [supabase]
  );

  const byStatus = (status: PostStatus) =>
    posts.filter((p) => p.status === status);

  return { posts, hydrated, addPost, updatePost, deletePost, byStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const POST_TYPE_LABELS: Record<PostType, string> = {
  post:      "Post",
  story:     "Story",
  reel:      "Reel",
  carousel:  "Carousel",
};

export const POST_TYPE_COLORS: Record<PostType, string> = {
  post:      "bg-pink-500/15 text-pink-400 border-pink-500/30",
  story:     "bg-amber-500/15 text-amber-400 border-amber-500/30",
  reel:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  carousel:  "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  scheduled:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft:      "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  published:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  backlog:    "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export function formatScheduledDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month:  "short",
    day:    "numeric",
    hour:   "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
