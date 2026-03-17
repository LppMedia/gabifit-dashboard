"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type PostType = "post" | "story" | "reel" | "carousel";
export type PostStatus = "scheduled" | "draft" | "published" | "backlog";

export interface InstagramPost {
  id: string;
  caption: string;
  type: PostType;
  status: PostStatus;
  scheduledDate: string | null; // ISO date string or null
  createdAt: string;
  hashtags: string;
  coverColor: string; // random accent for the visual placeholder
}

// ─── Seed data ─────────────────────────────────────────────────────────────────
const SEED_POSTS: InstagramPost[] = [
  {
    id: "1",
    caption: "Morning workout fuels your whole day 🔥 Drop your favourite pre-workout routine in the comments!",
    type: "post",
    status: "scheduled",
    scheduledDate: "2026-03-20T08:00:00",
    createdAt: "2026-03-15T10:00:00",
    hashtags: "#fitness #morningworkout #gabifit",
    coverColor: "from-pink-500/30 to-violet-500/30",
  },
  {
    id: "2",
    caption: "5 moves to sculpt your core in under 10 minutes. Save this one for later! 💪",
    type: "reel",
    status: "scheduled",
    scheduledDate: "2026-03-22T18:30:00",
    createdAt: "2026-03-15T11:00:00",
    hashtags: "#reel #coreworkout #gabifit #abs",
    coverColor: "from-cyan-500/30 to-emerald-500/30",
  },
  {
    id: "3",
    caption: "Behind the scenes of today's shoot 📸 Real. Raw. Ready.",
    type: "story",
    status: "scheduled",
    scheduledDate: "2026-03-19T12:00:00",
    createdAt: "2026-03-16T09:00:00",
    hashtags: "#bts #gabifit",
    coverColor: "from-amber-500/30 to-orange-500/30",
  },
  {
    id: "4",
    caption: "Full week meal prep guide — everything I eat to stay on track while training.",
    type: "carousel",
    status: "draft",
    scheduledDate: null,
    createdAt: "2026-03-14T14:00:00",
    hashtags: "#mealprep #nutrition #gabifit",
    coverColor: "from-violet-500/30 to-pink-500/30",
  },
  {
    id: "5",
    caption: "Rest days are just as important as training days. Here's how I recover 🧘‍♀️",
    type: "post",
    status: "draft",
    scheduledDate: null,
    createdAt: "2026-03-13T16:00:00",
    hashtags: "#recovery #restday #gabifit",
    coverColor: "from-sky-500/30 to-blue-500/30",
  },
  {
    id: "6",
    caption: "That post-leg-day feeling 😂 Tag a friend who knows the struggle.",
    type: "reel",
    status: "published",
    scheduledDate: "2026-03-10T17:00:00",
    createdAt: "2026-03-08T10:00:00",
    hashtags: "#legday #funny #gabifit",
    coverColor: "from-emerald-500/30 to-teal-500/30",
  },
  {
    id: "7",
    caption: "My top 3 supplements for muscle building — honest review, no sponsorships.",
    type: "post",
    status: "published",
    scheduledDate: "2026-03-08T09:00:00",
    createdAt: "2026-03-05T11:00:00",
    hashtags: "#supplements #honest #gabifit",
    coverColor: "from-rose-500/30 to-pink-500/30",
  },
  {
    id: "8",
    caption: "Holiday fitness challenge idea — 30 days to your strongest self.",
    type: "carousel",
    status: "backlog",
    scheduledDate: null,
    createdAt: "2026-03-01T10:00:00",
    hashtags: "#challenge #fitness #gabifit",
    coverColor: "from-amber-500/30 to-yellow-500/30",
  },
  {
    id: "9",
    caption: "Q&A: How I got started in fitness coaching and what I wish I knew sooner.",
    type: "reel",
    status: "backlog",
    scheduledDate: null,
    createdAt: "2026-02-28T10:00:00",
    hashtags: "#qanda #coaching #gabifit",
    coverColor: "from-indigo-500/30 to-violet-500/30",
  },
  {
    id: "10",
    caption: "Collab idea with a local gym — group class promo content.",
    type: "story",
    status: "backlog",
    scheduledDate: null,
    createdAt: "2026-02-25T10:00:00",
    hashtags: "#collab #gym #gabifit",
    coverColor: "from-fuchsia-500/30 to-pink-500/30",
  },
];

// ─── localStorage key ──────────────────────────────────────────────────────────
const STORAGE_KEY = "gabifit_instagram_posts";

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useInstagramPosts() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage (or seed)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setPosts(stored ? JSON.parse(stored) : SEED_POSTS);
    } catch {
      setPosts(SEED_POSTS);
    }
    setHydrated(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts, hydrated]);

  const addPost = (post: Omit<InstagramPost, "id" | "createdAt">) => {
    const newPost: InstagramPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, updates: Partial<InstagramPost>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const byStatus = (status: PostStatus) =>
    posts.filter((p) => p.status === status);

  return { posts, hydrated, addPost, updatePost, deletePost, byStatus };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const POST_TYPE_LABELS: Record<PostType, string> = {
  post: "Post",
  story: "Story",
  reel: "Reel",
  carousel: "Carousel",
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
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
