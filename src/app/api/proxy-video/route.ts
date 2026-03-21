import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTS = [
  "cdninstagram.com",
  "instagram.com",
  "fbcdn.net",
  "scontent",
  "video.cdninstagram.com",
];

export async function GET(req: NextRequest) {
  const videoUrl = req.nextUrl.searchParams.get("url");
  if (!videoUrl) {
    return new NextResponse(null, { status: 400 });
  }

  // Only proxy Instagram/FB CDN video URLs
  const isAllowed = ALLOWED_HOSTS.some((h) => videoUrl.includes(h));
  if (!isAllowed) {
    return new NextResponse("Forbidden host", { status: 403 });
  }

  // Forward Range header for seek support
  const upstreamHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
  };

  const rangeHeader = req.headers.get("range");
  if (rangeHeader) upstreamHeaders["Range"] = rangeHeader;

  let upstream: Response;
  try {
    upstream = await fetch(videoUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
    });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(null, { status: upstream.status });
  }

  if (!upstream.body) {
    return new NextResponse(null, { status: 502 });
  }

  const resHeaders: Record<string, string> = {
    "Content-Type": upstream.headers.get("content-type") ?? "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
  };

  if (req.nextUrl.searchParams.get("download") === "true") {
    resHeaders["Content-Disposition"] = "attachment; filename=\"instagram_video.mp4\"";
  }

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) resHeaders["Content-Length"] = contentLength;

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) resHeaders["Content-Range"] = contentRange;

  return new NextResponse(upstream.body, {
    status: rangeHeader ? 206 : 200,
    headers: resHeaders,
  });
}
