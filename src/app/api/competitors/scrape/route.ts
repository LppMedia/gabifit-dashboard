import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";
const ACTOR_ID    = "apidojo~instagram-scraper-api";

// Weighted performance score — prioritises absolute reach
function score(likes: number, comments: number, views: number): number {
  return views * 0.05 + likes * 1.5 + comments * 3;
}

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const handle:  string = body?.handle;
  const postUrl: string = body?.postUrl;   // optional: single-post mode (URL Drop)

  if (!handle && !postUrl) {
    return NextResponse.json({ error: "handle o postUrl requerido" }, { status: 400 });
  }

  // Build start URL and item limit
  const cleanHandle = handle ? handle.replace(/^@/, "").trim() : "";
  const startUrl    = postUrl ?? `https://www.instagram.com/${cleanHandle}/`;
  const maxItems    = postUrl ? 5 : 50;   // single-post: 5 items is enough

  const apifyUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=180`;

  const apifyRes = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [startUrl],
      maxItems,
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

  // Debug: log the keys of the first item to confirm exact Apify field names
  if (items.length > 0) {
    console.log("[scrape] Apify item keys:", Object.keys(items[0]));
    console.log("[scrape] Sample fields:", {
      displayUrl:          items[0].displayUrl,
      display_url:         items[0].display_url,
      thumbnailUrl:        items[0].thumbnailUrl,
      thumbnail_url:       items[0].thumbnail_url,
      likesCount:          items[0].likesCount,
      likes_count:         items[0].likes_count,
      commentsCount:       items[0].commentsCount,
      videoViewCount:      items[0].videoViewCount,
      followersCount:      items[0].followersCount,
      ownerFollowersCount: items[0].ownerFollowersCount,
      followers_count:     items[0].followers_count,
      type:                items[0].type,
      productType:         items[0].productType,
      videoUrl:            items[0].videoUrl ? "[present]" : null,
    });
  }

  /** Extract the best available follower count across all items */
  const profileFollowers: number | null = (() => {
    for (const item of items) {
      const raw =
        item.ownerFollowersCount ??
        item.followersCount       ??
        item.followers_count      ??
        (item.owner as Record<string, unknown> | undefined)?.followersCount ??
        (item.owner as Record<string, unknown> | undefined)?.followers_count ??
        null;
      if (raw !== null && Number(raw) > 0) return Number(raw);
    }
    return null;
  })();

  /** Pick the best available image URL from an Apify item, trying every known field name */
  function extractDisplayUrl(item: Record<string, unknown>): string {
    // Direct fields — both camelCase and snake_case variants
    const candidates = [
      item.displayUrl,
      item.display_url,       // snake_case — apidojo actor
      item.thumbnailUrl,
      item.thumbnail_url,
      item.thumbnail,
      item.imageUrl,
      item.image_url,
      item.img,
      item.thumbnail_src,
      item.coverUrl,
      item.cover_url,
      item.previewUrl,
      item.preview_url,
      item.cover_image,
      // Some actors nest the first image inside an array
      Array.isArray(item.images) && (item.images as unknown[])[0]
        ? (item.images as string[])[0]
        : null,
      // previewImages array
      Array.isArray(item.previewImages) && (item.previewImages as unknown[])[0]
        ? (item.previewImages as string[])[0]
        : null,
      // displayResources nested object
      Array.isArray(item.displayResources) && (item.displayResources as Record<string, unknown>[])[0]
        ? String((item.displayResources as Record<string, unknown>[])[0].src ?? "")
        : null,
    ];
    for (const c of candidates) {
      if (c && typeof c === "string" && c.startsWith("http")) return c;
    }
    return "";
  }

  /** Normalise Apify type strings to our 3 canonical values */
  function normaliseType(raw: unknown): "Video" | "Image" | "Sidecar" {
    const t = String(raw ?? "").toLowerCase();
    if (t.includes("video") || t.includes("reel")) return "Video";
    if (t.includes("sidecar") || t.includes("carousel") || t.includes("album")) return "Sidecar";
    return "Image";
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  // Normalize and compute scores
  const posts = items
    .map((item) => {
      const likes    = Number(item.likesCount ?? item.likes_count ?? item.like_count ?? (item.edge_media_preview_like as any)?.count ?? 0);
      const comments = Number(item.commentsCount ?? item.comments_count ?? item.comment_count ?? (item.edge_media_to_comment as any)?.count ?? 0);
      const views    = Number(
        item.videoViewCount ?? 
        item.video_view_count ?? 
        item.playCount ?? 
        item.play_count ?? 
        item.plays_count ?? 
        item.video_play_count ?? 
        0
      );

      const denominator    = views > 0 ? views : likes + comments;
      const engagementRate = denominator > 0 ? ((likes + comments) / denominator) * 100 : 0;

      const timestamp  = String(item.timestamp ?? item.takenAtTimestamp ?? item.taken_at_timestamp ?? new Date().toISOString());
      const shortCode  = String(item.shortCode ?? item.shortcode ?? item.code ?? "");
      const displayUrl = extractDisplayUrl(item);

      return {
        id:             String(item.shortCode ?? item.shortcode ?? item.id ?? Math.random()),
        shortCode,
        url:            String(item.url ?? (shortCode ? `https://www.instagram.com/p/${shortCode}/` : "")),
        type:           normaliseType(item.type ?? item.productType ?? item.mediaType ?? item.media_type),
        caption:        String(item.caption ?? item.edge_media_to_caption ?? ""),
        likesCount:     likes,
        commentsCount:  comments,
        videoViewCount: views,
        timestamp,
        displayUrl,
        videoUrl:       item.videoUrl ? String(item.videoUrl) : null,
        ownerUsername:  String(item.ownerUsername ?? (item.owner as Record<string, unknown>)?.username ?? item.username ?? cleanHandle),
        durationSec:    item.durationSec != null ? Number(item.durationSec) : null,
        engagementRate: Math.round(engagementRate * 10) / 10,
        _score:         score(likes, comments, views),
        _ts:            new Date(timestamp).getTime(),
      };
    })
    // For profile scrapes: keep only posts from the last 30 days
    // For single-post mode: keep all (post might be older)
    .filter((p) => postUrl ? true : p._ts >= thirtyDaysAgo);

  // Sort by performance score descending, take top 10
  posts.sort((a, b) => b._score - a._score);
  const top = posts.slice(0, postUrl ? 1 : 10);

  // Strip internal scoring fields before returning
  const result = top.map(({ _score: _, _ts: __, ...rest }) => rest);

  return NextResponse.json({ posts: result, followers: profileFollowers });
}
