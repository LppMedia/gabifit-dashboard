"use client";

import { useState } from "react";
import {
  Plus,
  Instagram,
  CalendarClock,
  FileText,
  CheckCircle2,
  Archive,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/instagram/PostCard";
import { NewPostDialog } from "@/components/instagram/NewPostDialog";
import {
  useInstagramPosts,
  InstagramPost,
  PostStatus,
} from "@/lib/instagram-store";
import { cn } from "@/lib/utils";

// ─── Tab definition ───────────────────────────────────────────────────────────
const TABS: {
  value: PostStatus;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  emptyText: string;
}[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    icon: CalendarClock,
    iconColor: "text-emerald-400",
    emptyText: "No scheduled posts. Plan ahead!",
  },
  {
    value: "draft",
    label: "Drafts",
    icon: FileText,
    iconColor: "text-zinc-400",
    emptyText: "No drafts yet. Start a new idea!",
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
    iconColor: "text-blue-400",
    emptyText: "Nothing published yet.",
  },
  {
    value: "backlog",
    label: "Backlog",
    icon: Archive,
    iconColor: "text-orange-400",
    emptyText: "Your backlog is empty. Capture ideas here!",
  },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  count,
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-0 rounded-xl border border-border/40 bg-card px-5 py-4 transition-all duration-200 hover:border-border/70",
      "relative overflow-hidden"
    )}>
      {/* Subtle glow spot */}
      <div className={cn("pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-30", bg)} />
      <span className={cn("font-display text-[32px] font-bold leading-none tabular-nums", color)}>
        {count}
      </span>
      <span className="mt-1.5 text-[12px] font-medium text-muted-foreground/70">{label}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InstagramPage() {
  const { hydrated, addPost, updatePost, deletePost, byStatus } =
    useInstagramPosts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPost, setEditPost]     = useState<InstagramPost | null>(null);
  const [search, setSearch]         = useState("");

  const handleSave = (data: Omit<InstagramPost, "id" | "createdAt">) => {
    if (editPost) {
      updatePost(editPost.id, data);
      setEditPost(null);
    } else {
      addPost(data);
    }
  };

  const openEdit = (post: InstagramPost) => {
    setEditPost(post);
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditPost(null);
    setDialogOpen(true);
  };

  const filtered = (status: PostStatus) => {
    const q = search.toLowerCase().trim();
    return byStatus(status).filter(
      (p) =>
        !q ||
        p.caption.toLowerCase().includes(q) ||
        p.hashtags.toLowerCase().includes(q)
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 ring-1 ring-pink-500/30">
              <Instagram className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Instagram Manager
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your content pipeline — schedule, draft, and publish.
              </p>
            </div>
          </div>

          <Button
            onClick={openNew}
            className="gap-2 bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-900/30"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* ── Stats bar ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Scheduled" count={byStatus("scheduled").length} color="text-emerald-400" bg="bg-emerald-400" />
          <StatCard label="Drafts"    count={byStatus("draft").length}     color="text-zinc-300"    bg="bg-zinc-400"    />
          <StatCard label="Published" count={byStatus("published").length} color="text-blue-400"    bg="bg-blue-400"    />
          <StatCard label="Backlog"   count={byStatus("backlog").length}   color="text-orange-400"  bg="bg-orange-400"  />
        </div>

        {/* ── Search ─────────────────────────────────────────────────── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search captions or hashtags…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="mb-1 h-auto gap-1 bg-card p-1">
            {TABS.map(({ value, label, icon: Icon, iconColor }) => {
              const count = filtered(value).length;
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="gap-2 px-4 py-2 text-sm data-[state=active]:bg-background"
                >
                  <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                  {label}
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 rounded-full px-1.5 text-[10px] leading-none"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TABS.map(({ value, emptyText }) => {
            const tabPosts = filtered(value);

            return (
              <TabsContent key={value} value={value} className="mt-4">
                {!hydrated ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-48 animate-pulse rounded-xl bg-card"
                      />
                    ))}
                  </div>
                ) : tabPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
                      <Instagram className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                    {value !== "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={openNew}
                        className="mt-1 gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Post
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tabPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDelete={deletePost}
                        onStatusChange={(id, status) =>
                          updatePost(id, { status })
                        }
                        onEdit={openEdit}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* ── New / Edit dialog ─────────────────────────────────────────── */}
      <NewPostDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditPost(null);
        }}
        editPost={editPost}
        onSave={handleSave}
      />
    </>
  );
}
