"use client";

import { BadgeCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IgProfile } from "@/lib/instagram-profile-store";

interface ProfileHeaderProps {
  profile: IgProfile;
}

const proxyImg = (url: string) =>
  url ? `/api/proxy-image?url=${encodeURIComponent(url)}` : "";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : (parts[0]?.[0] ?? "?").toUpperCase();
  return (
    <span className="text-lg font-bold text-white select-none">{letters}</span>
  );
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        {/* ── Left: avatar + info ── */}
        <div className="flex items-start gap-4">
          {/* Profile picture */}
          <div className="relative h-[72px] w-[72px] shrink-0">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-pink-500 to-violet-600 overflow-hidden flex items-center justify-center ring-2 ring-pink-500/30">
              {profile.profilePicUrl ? (
                <img
                  src={proxyImg(profile.profilePicUrl)}
                  alt={profile.username}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Initials name={profile.fullName || profile.username} />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-lg font-bold text-foreground leading-tight">
                {profile.fullName || profile.username}
              </span>
              {profile.isVerified && (
                <BadgeCheck className="h-4.5 w-4.5 text-blue-400 shrink-0" />
              )}
            </div>

            <span className="text-sm text-muted-foreground">
              @{profile.username}
            </span>

            {profile.biography && (
              <p className="mt-1 text-[13px] text-muted-foreground/70 line-clamp-2 max-w-sm">
                {profile.biography}
              </p>
            )}

            {profile.externalUrl && (
              <a
                href={profile.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 flex items-center gap-1 text-[12px] text-pink-400 hover:text-pink-300 transition-colors w-fit"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate max-w-[200px]">
                  {profile.externalUrl.replace(/^https?:\/\//, "")}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* ── Right: stats ── */}
        <div className="flex gap-2 sm:shrink-0">
          {[
            { label: "Seguidores", value: fmt(profile.followersCount) },
            { label: "Siguiendo", value: fmt(profile.followsCount) },
            { label: "Posts", value: fmt(profile.postsCount) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg",
                "bg-white/[0.04] border border-border/30 px-4 py-3 min-w-[72px]"
              )}
            >
              <span className="text-base font-bold text-foreground tabular-nums leading-tight">
                {value}
              </span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
