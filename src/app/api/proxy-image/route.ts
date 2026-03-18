import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy for Instagram CDN thumbnails.
 * Instagram blocks direct <img src> hotlinking from browsers, but allows
 * server-to-server fetches with the correct Referer header.
 *
 * Usage: /api/proxy-image?url=https%3A%2F%2Fscontent...
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  // Only proxy Instagram / known CDN domains for safety
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  const allowed = [
    "cdninstagram.com",
    "fbcdn.net",
    "instagram.com",
    "scontent",
  ];
  const isAllowed = allowed.some(
    (d) => parsed.hostname.includes(d) || parsed.hostname.endsWith(d)
  );

  if (!isAllowed) {
    return new NextResponse("Domain not allowed", { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Referer: "https://www.instagram.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=7200, s-maxage=7200",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[proxy-image] fetch error:", err);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}
