import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN ?? "";
const ACTOR_ID = "invideoiq~video-transcriber";

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { error: "APIFY_API_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const videoUrl: string = body?.videoUrl;
  if (!videoUrl) {
    return NextResponse.json({ error: "videoUrl requerido" }, { status: 400 });
  }

  const apifyUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=300`;

  const apifyRes = await fetch(apifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_urls: [videoUrl] }),
  });

  if (!apifyRes.ok) {
    const text = await apifyRes.text().catch(() => "");
    console.error("Transcript actor error:", apifyRes.status, text);
    return NextResponse.json(
      { error: `Actor de transcripción devolvió ${apifyRes.status}` },
      { status: 502 }
    );
  }

  const items: Record<string, unknown>[] = await apifyRes
    .json()
    .catch(() => []);
  const first = items[0] ?? {};

  const result = {
    postUrl: videoUrl,
    transcript: String(first.transcript ?? first.text ?? ""),
    segments: Array.isArray(first.segments)
      ? (first.segments as Array<{ start: number; end: number; text: string }>)
      : [],
    language: String(first.language ?? "es"),
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
