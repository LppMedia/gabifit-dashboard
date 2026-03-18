import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";
// Actor: apify~instagram-profile-scraper
// Returns full profile data + recent posts
const ACTOR_ID = "apify~instagram-profile-scraper";

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN no configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const handle: string = (body?.handle ?? "").replace(/^@/, "").trim();
  if (!handle) {
    return NextResponse.json({ error: "handle requerido" }, { status: 400 });
  }

  const apifyUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120`;

  try {
    const apifyRes = await fetch(apifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [handle],
        resultsLimit: 30,
      }),
    });

    if (!apifyRes.ok) {
      const text = await apifyRes.text().catch(() => "");
      console.error("[ig-profile] Apify error:", apifyRes.status, text);
      return NextResponse.json({ error: `Apify devolvió ${apifyRes.status}` }, { status: 502 });
    }

    const items: Record<string, unknown>[] = await apifyRes.json().catch(() => []);

    if (!items.length) {
      return NextResponse.json({ error: "Perfil no encontrado o cuenta privada" }, { status: 404 });
    }

    const raw = items[0];

    // Normalize posts array — the actor returns posts inside the profile item
    const rawPosts = Array.isArray(raw.latestPosts)
      ? (raw.latestPosts as Record<string, unknown>[])
      : Array.isArray(raw.posts)
      ? (raw.posts as Record<string, unknown>[])
      : [];

    const posts = rawPosts.map((p) => {
      const likes = Number(p.likesCount ?? p.likes ?? 0);
      const comments = Number(p.commentsCount ?? p.comments ?? 0);
      const views = Number(p.videoViewCount ?? p.videoViews ?? p.playsCount ?? 0);
      const followers = Number(raw.followersCount ?? 1);
      // Engagement rate = (likes + comments) / followers * 100
      const engRate = followers > 0 ? ((likes + comments) / followers) * 100 : 0;

      return {
        id: String(p.shortCode ?? p.id ?? Math.random()),
        shortCode: String(p.shortCode ?? ""),
        url: String(p.url ?? `https://www.instagram.com/p/${p.shortCode}/`),
        type: String(p.type ?? "Image") as "Video" | "Image" | "Sidecar",
        caption: String(p.caption ?? ""),
        likesCount: likes,
        commentsCount: comments,
        videoViewCount: views,
        timestamp: String(p.timestamp ?? new Date().toISOString()),
        displayUrl: String(p.displayUrl ?? p.thumbnailUrl ?? p.imageUrl ?? ""),
        videoUrl: p.videoUrl ? String(p.videoUrl) : null,
        ownerUsername: String(raw.username ?? handle),
        durationSec: p.durationSec != null ? Number(p.durationSec) : null,
        engagementRate: Math.round(engRate * 100) / 100,
      };
    });

    // Sort by engagementRate desc, then by likes
    posts.sort((a, b) =>
      b.engagementRate !== a.engagementRate
        ? b.engagementRate - a.engagementRate
        : b.likesCount - a.likesCount
    );

    const profile = {
      username: String(raw.username ?? handle),
      fullName: String(raw.fullName ?? raw.name ?? ""),
      biography: String(raw.biography ?? raw.bio ?? ""),
      followersCount: Number(raw.followersCount ?? raw.followers ?? 0),
      followsCount: Number(raw.followsCount ?? raw.following ?? 0),
      postsCount: Number(raw.postsCount ?? raw.igtvVideoCount ?? posts.length),
      profilePicUrl: String(raw.profilePicUrl ?? raw.profilePicUrlHD ?? ""),
      isVerified: Boolean(raw.isVerified ?? raw.verified ?? false),
      externalUrl: String(raw.externalUrl ?? raw.website ?? ""),
      scrapedAt: new Date().toISOString(),
      posts,
    };

    return NextResponse.json(profile);
  } catch (err) {
    console.error("[ig-profile] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
