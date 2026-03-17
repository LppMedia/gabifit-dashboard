"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InstagramPost,
  PostType,
  PostStatus,
  POST_TYPE_LABELS,
} from "@/lib/instagram-store";

// ─── Cover colours assigned by type ──────────────────────────────────────────
const TYPE_COVER: Record<PostType, string> = {
  post:      "from-pink-500/30 to-violet-500/30",
  story:     "from-amber-500/30 to-orange-500/30",
  reel:      "from-cyan-500/30 to-emerald-500/30",
  carousel:  "from-violet-500/30 to-pink-500/30",
};

// ─── Blank form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  caption: "",
  hashtags: "",
  type: "post" as PostType,
  status: "draft" as PostStatus,
  scheduledDate: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface NewPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a post to pre-fill the form for editing */
  editPost?: InstagramPost | null;
  onSave: (data: Omit<InstagramPost, "id" | "createdAt">) => void;
}

export function NewPostDialog({
  open,
  onOpenChange,
  editPost,
  onSave,
}: NewPostDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  // Pre-fill when editing
  useEffect(() => {
    if (editPost) {
      setForm({
        caption: editPost.caption,
        hashtags: editPost.hashtags,
        type: editPost.type,
        status: editPost.status,
        scheduledDate: editPost.scheduledDate
          ? editPost.scheduledDate.slice(0, 16) // datetime-local format
          : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editPost, open]);

  const set = <K extends keyof typeof EMPTY_FORM>(
    key: K,
    value: (typeof EMPTY_FORM)[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const isValid = form.caption.trim().length > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      caption: form.caption.trim(),
      hashtags: form.hashtags.trim(),
      type: form.type,
      status: form.status,
      scheduledDate: form.scheduledDate
        ? new Date(form.scheduledDate).toISOString()
        : null,
      coverColor: TYPE_COVER[form.type],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-base">
            {editPost ? "Edit Post" : "New Post Idea"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write your caption here… include emojis, hooks, CTAs 💬"
              className="min-h-[110px] resize-none"
              value={form.caption}
              onChange={(e) => set("caption", e.target.value)}
            />
          </div>

          {/* Hashtags */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              placeholder="#gabifit #fitness #motivation"
              value={form.hashtags}
              onChange={(e) => set("hashtags", e.target.value)}
            />
          </div>

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Post Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => set("type", v as PostType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(POST_TYPE_LABELS) as PostType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {POST_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as PostStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduleDate">
              Schedule Date & Time{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="scheduleDate"
              type="datetime-local"
              value={form.scheduledDate}
              onChange={(e) => set("scheduledDate", e.target.value)}
              className="[color-scheme:dark]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isValid}
            onClick={handleSave}
            className="bg-pink-600 hover:bg-pink-500 text-white"
          >
            {editPost ? "Save Changes" : "Add Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
