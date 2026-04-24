import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN no configurado" }, { status: 500 });
  }

  const { handle } = await req.json().catch(() => ({}));
  const username = handle || "gabifit";

  // Start Apify run
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 20,
      }),
    }
  );

  if (!runRes.ok) {
    return NextResponse.json({ error: "Error al iniciar scraping" }, { status: 502 });
  }

  const runData = await runRes.json();
  const runId = runData?.data?.id;
  if (!runId) return NextResponse.json({ error: "No se obtuvo runId" }, { status: 502 });

  // Poll for completion (max 90s)
  let attempts = 0;
  while (attempts < 18) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = await statusRes.json();
    const status = statusData?.data?.status;

    if (status === "SUCCEEDED") {
      const datasetId = statusData.data.defaultDatasetId;
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=20`
      );
      const items = await itemsRes.json();
      const profile = Array.isArray(items) ? items[0] : null;

      if (!profile) return NextResponse.json({ error: "Sin datos" }, { status: 502 });

      // Normalize posts
      const rawPosts = profile.latestPosts || profile.posts || [];
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const posts = rawPosts
        .map((p: Record<string, unknown>) => ({
          id: (p.id || p.shortCode || "") as string,
          shortCode: (p.shortCode || p.short_code || "") as string,
          url: (p.url || p.link || `https://instagram.com/p/${p.shortCode}`) as string,
          type: (p.type || p.productType || "image") as string,
          caption: (p.caption || p.text || "") as string,
          likesCount: (p.likesCount || p.likes_count || p.likeCount || 0) as number,
          commentsCount: (p.commentsCount || p.comments_count || 0) as number,
          videoViewCount: (p.videoViewCount || p.video_view_count || p.viewCount || 0) as number,
          timestamp: (p.timestamp || p.taken_at_timestamp || new Date().toISOString()) as string,
          displayUrl: (p.displayUrl || p.display_url || p.thumbnailUrl || "") as string,
          videoUrl: (p.videoUrl || p.video_url || "") as string,
        }))
        .filter((p: { timestamp: string }) => new Date(p.timestamp).getTime() > sevenDaysAgo);

      return NextResponse.json({
        username: profile.username || username,
        followersCount: profile.followersCount || profile.followers_count || 0,
        posts,
        scrapedAt: new Date().toISOString(),
      });
    }

    if (status === "FAILED" || status === "ABORTED") {
      return NextResponse.json({ error: "Scraping falló" }, { status: 502 });
    }

    attempts++;
  }

  return NextResponse.json({ error: "Timeout en scraping" }, { status: 504 });
}
