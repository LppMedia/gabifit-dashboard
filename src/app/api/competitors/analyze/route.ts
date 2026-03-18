import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const { postUrl, transcript, caption, handle } = body ?? {};

  if (!postUrl || !transcript) {
    return NextResponse.json(
      { error: "postUrl y transcript requeridos" },
      { status: 400 }
    );
  }

  const prompt = `Eres un experto en análisis de contenido de fitness en español para redes sociales.

Analiza este video de Instagram de un competidor en el nicho de fitness femenino hispanohablante.

DATOS DEL POST:
- URL: ${postUrl}
- Cuenta: @${handle ?? "competidor"}
- Caption: ${caption ?? "(sin caption)"}

TRANSCRIPT DEL VIDEO:
${transcript}

Genera un análisis estructurado y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin texto adicional, sin markdown, sin código fence):
{
  "hook": {
    "text": "Descripción de qué dice/muestra en los primeros 3-5 segundos",
    "type": "curiosidad"
  },
  "structure": [
    { "time": "0:00-0:05", "section": "Hook", "description": "Descripción de esta sección" },
    { "time": "0:05-0:30", "section": "Desarrollo", "description": "..." }
  ],
  "tone": {
    "main": "Educativo y motivacional",
    "attributes": ["directo", "empático", "científico", "accesible"]
  },
  "tactics": [
    "Táctica 1 usada para retener al espectador",
    "Táctica 2...",
    "Táctica 3..."
  ],
  "gabifitAdaptation": {
    "title": "Cómo adaptar esto para GabiFit",
    "tips": [
      "Tip concreto 1 de adaptación",
      "Tip concreto 2...",
      "Tip concreto 3..."
    ],
    "suggestedHook": "Hook sugerido específico para GabiFit con este mismo formato",
    "suggestedCTA": "CTA sugerido para el final del video"
  }
}

IMPORTANTE: El campo "type" del hook debe ser uno de: curiosidad, dolor, promesa, identidad, humor, sorpresa`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text().catch(() => "");
    console.error("Anthropic error:", anthropicRes.status, errText);
    return NextResponse.json(
      { error: `Error de IA: ${anthropicRes.status}` },
      { status: 502 }
    );
  }

  const anthropicData = await anthropicRes.json();
  const rawText: string = anthropicData?.content?.[0]?.text ?? "{}";

  let analysis;
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    analysis = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "IA devolvió JSON inválido" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ...analysis,
    postUrl,
    analyzedAt: new Date().toISOString(),
  });
}
