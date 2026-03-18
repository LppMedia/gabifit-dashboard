import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";
const ACTOR_ID = "apidojo~instagram-scraper-api";

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const handle: string = body?.handle;
  if (!handle) {
    return NextResponse.json({ error: "handle requerido" }, { status: 400 });
  }

  const cleanHandle = handle.replace(/^@/, "").trim();
  const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

  const apifyUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120`;

  const apifyRes = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [profileUrl],
      maxItems: 12,
    }),
  });

  if (!apifyRes.ok) {
    const text = await apifyRes.text().catch(() => "");
    console.error("Apify error:", apifyRes.status, text);
    return NextResponse.json(
      { error: `Apify devolvió ${apifyRes.status}` },
      { status: 502 }
    );
  }

  const items: Record<string, unknown>[] = await apifyRes.json().catch(() => []);

  // Normalize and compute engagement rates
  const posts = items.map((item) => {
    const likes = Number(item.likesCount ?? 0);
    const comments = Number(item.commentsCount ?? 0);
    const views = Number(item.videoViewCount ?? 0);
    const denominator = views > 0 ? views : likes + comments;
    const engagementRate =
      denominator > 0 ? ((likes + comments) / denominator) * 100 : 0;

    return {
      id: String(item.shortCode ?? item.id ?? Math.random()),
      shortCode: String(item.shortCode ?? ""),
      url: String(
        item.url ?? `https://www.instagram.com/p/${item.shortCode}/`
      ),
      type: String(item.type ?? "Video") as "Video" | "Image" | "Sidecar",
      caption: String(item.caption ?? ""),
      likesCount: likes,
      commentsCount: comments,
      videoViewCount: views,
      timestamp: String(item.timestamp ?? new Date().toISOString()),
      displayUrl: String(item.displayUrl ?? item.thumbnailUrl ?? ""),
      videoUrl: item.videoUrl ? String(item.videoUrl) : null,
      ownerUsername: String(item.ownerUsername ?? cleanHandle),
      durationSec: item.durationSec != null ? Number(item.durationSec) : null,
      engagementRate: Math.round(engagementRate * 10) / 10,
    };
  });

  // Sort by engagement then views
  posts.sort((a, b) => {
    if (b.engagementRate !== a.engagementRate)
      return b.engagementRate - a.engagementRate;
    return b.videoViewCount - a.videoViewCount;
  });

  return NextResponse.json(posts);
}
