import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";
const ACTOR_ID    = "apidojo~instagram-scraper-api";

/**
 * DEBUG endpoint — returns the raw first Apify item so we can see all field names.
 * Call: GET /api/debug-scrape?handle=jc_simo
 * Remove this file once images are working.
 */
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) return NextResponse.json({ error: "?handle= required" }, { status: 400 });
  if (!APIFY_TOKEN) return NextResponse.json({ error: "no token" }, { status: 500 });

  const profileUrl = `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
  const apifyUrl   = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=120`;

  const res = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startUrls: [profileUrl], maxItems: 3 }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Apify ${res.status}` }, { status: 502 });
  }

  const items = await res.json();
  // Return first item in full so we can inspect all fields
  return NextResponse.json({
    totalItems: items.length,
    firstItem: items[0] ?? null,
    firstItemKeys: items[0] ? Object.keys(items[0]) : [],
  });
}
