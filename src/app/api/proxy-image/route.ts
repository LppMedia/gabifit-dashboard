import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side image proxy for Instagram CDN thumbnails.
 * Instagram blocks direct <img src> hotlinking from browsers, but allows
 * server-to-server fetches with the correct Referer header.
 *
 * Accepts:
 *   ?url=<cdnUrl>               — proxy a CDN URL directly
 *   ?url=<cdnUrl>&shortCode=X   — CDN first, fallback to /media/ redirect
 *   ?shortCode=X                — use Instagram /media/ redirect (always fresh)
 */
export async function GET(req: NextRequest) {
  const url       = req.nextUrl.searchParams.get("url");
  const shortCode = req.nextUrl.searchParams.get("shortCode");

  if (!url && !shortCode) {
    return new NextResponse("Missing url or shortCode param", { status: 400 });
  }

  // Allow Instagram / Facebook CDN and common image hosting domains
  const allowedPatterns = [
    "cdninstagram.com",
    "fbcdn.net",
    "instagram.com",
    "scontent",
    "pinimg.com",
    "pbs.twimg.com",
    "apify.com",
    "amazonaws.com",
    "cloudfront.net",
    "akamaihd.net",
    "googleusercontent.com",
  ];

  const ig_headers = {
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  };

  const bot_headers = {
    "User-Agent":
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    Accept: "image/*,*/*;q=0.8",
  };

  /** Try to fetch an image URL and return the response buffer, or null on failure */
  async function tryFetch(targetUrl: string): Promise<NextResponse | null> {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return null;
    }

    const isAllowed = allowedPatterns.some(
      (d) => parsed.hostname.includes(d) || parsed.hostname.endsWith(d)
    );
    if (!isAllowed) {
      console.warn("[proxy-image] blocked domain:", parsed.hostname);
      return null;
    }

    for (const headers of [ig_headers, bot_headers]) {
      try {
        const res = await fetch(targetUrl, { headers, redirect: "follow" });
        if (!res.ok) {
          console.warn(`[proxy-image] ${res.status} for ${parsed.hostname}`);
          continue;
        }
        const contentType = res.headers.get("content-type") ?? "image/jpeg";
        // Only accept image content types
        if (!contentType.startsWith("image/")) {
          console.warn("[proxy-image] non-image content-type:", contentType);
          continue;
        }
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.warn("[proxy-image] fetch attempt failed:", err);
      }
    }
    return null;
  }

  // Attempt 1: the provided CDN url (if any)
  if (url) {
    const result = await tryFetch(url);
    if (result) return result;
    console.warn("[proxy-image] CDN url failed, trying fallbacks. url:", url.slice(0, 80));
  }

  // Attempt 2: Instagram /media/ redirect — always fresh, works for public posts
  if (shortCode) {
    const mediaUrl = `https://www.instagram.com/p/${shortCode}/media/?size=m`;
    const result = await tryFetch(mediaUrl);
    if (result) return result;
    console.warn("[proxy-image] /media/ fallback failed for shortCode:", shortCode);
  }

  // All attempts failed — 404 triggers img.onError in the browser
  console.error("[proxy-image] All attempts failed.");
  return new NextResponse(null, { status: 404 });
}
