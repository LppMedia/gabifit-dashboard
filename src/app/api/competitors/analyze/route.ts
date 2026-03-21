import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

// Models tried in order — first available wins
const MODELS = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
];

// GabiFit brand context — injected into every analysis
const GABIFIT_CONTEXT = `
CONTEXTO DE MARCA — GABIFIT:
- Gabi es coach de fitness postparto, latina (Colombia), madre
- Voz: cálida, empoderada, cercana — como amiga que sabe de lo que habla
- Idioma: español latinoamericano (tuteo natural, no voseo)
- Nicho: mamás en recuperación postparto que quieren recuperar su cuerpo y energía
- Evitar: lenguaje médico frío, anglicismos innecesarios, tono condescendiente
- Sus seguidoras son mujeres de 25-40 años, latinas, con bebés de 0-3 años
- Formatos: Reels cortos 15-60s, carruseles educativos
`.trim();

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY no configurado" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const { postUrl, transcript, caption, handle, mode } = body ?? {};

  if (!postUrl || !transcript) {
    return NextResponse.json(
      { error: "postUrl y transcript requeridos" },
      { status: 400 }
    );
  }

  const wantsFullScript = mode === "full_script";
  const maxTokens       = wantsFullScript ? 4000 : 1800;

  const scriptSection = wantsFullScript ? `
  "gabifitScript": [
    {
      "label": "Hook",
      "emoji": "🎣",
      "durationHint": "0:00-0:06",
      "script": "Texto exacto a decir en voz alta — en primera persona como Gabi, coloquial y con gancho",
      "visualNotes": "Qué mostrar en cámara, movimientos, B-roll sugerido"
    },
    {
      "label": "Problema",
      "emoji": "😤",
      "durationHint": "0:06-0:18",
      "script": "...",
      "visualNotes": "..."
    },
    {
      "label": "Historia",
      "emoji": "📖",
      "durationHint": "0:18-0:40",
      "script": "...",
      "visualNotes": "..."
    },
    {
      "label": "Solución",
      "emoji": "💡",
      "durationHint": "0:40-1:00",
      "script": "...",
      "visualNotes": "..."
    },
    {
      "label": "Prueba",
      "emoji": "✅",
      "durationHint": "1:00-1:10",
      "script": "...",
      "visualNotes": "..."
    },
    {
      "label": "CTA",
      "emoji": "📲",
      "durationHint": "1:10-1:20",
      "script": "...",
      "visualNotes": "..."
    }
  ],` : "";

  const prompt = `Eres un experto en análisis de contenido de fitness en español para redes sociales.

${GABIFIT_CONTEXT}

Analiza este video de Instagram de un competidor en el nicho de fitness femenino hispanohablante.

DATOS DEL POST:
- URL: ${postUrl}
- Cuenta: @${handle ?? "competidor"}
- Caption: ${caption ?? "(sin caption)"}

TRANSCRIPT DEL VIDEO:
${transcript}
${wantsFullScript ? `
INSTRUCCIÓN ESPECIAL: Además del análisis estándar, genera "gabifitScript" — un guion COMPLETO y listo para grabar.
El guion debe hablar del MISMO TEMA pero con gancho diferente y voz de GabiFit.
Escríbelo en primera persona como Gabi, en español latinoamericano coloquial pero profesional.
Cada sección debe ser específica, concreta y lista para ser grabada tal cual.
` : ""}
Genera ÚNICAMENTE un JSON válido (sin texto adicional, sin markdown, sin código fence):
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
  }${scriptSection}
}

IMPORTANTE: El campo "type" del hook debe ser uno de: curiosidad, dolor, promesa, identidad, humor, sorpresa`;

  // Try each model in order until one succeeds
  let anthropicRes: Response | null = null;
  let usedModel = "";
  for (const model of MODELS) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.ok) {
      anthropicRes = res;
      usedModel = model;
      break;
    }

    if (res.status === 404) {
      const errBody = await res.text().catch(() => "");
      console.warn(`[analyze] model ${model} not available (404):`, errBody);
      continue;
    }

    const errText = await res.text().catch(() => "");
    let friendlyError = `Error de IA: ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message?.includes("credit balance")) {
        friendlyError = "Saldo insuficiente en Anthropic. Por favor revisa tu cuenta de facturación.";
      } else if (errJson.error?.message) {
        friendlyError = `Error IA: ${errJson.error.message}`;
      }
    } catch {
      // Not JSON, use generic
    }

    console.error(`[analyze] Anthropic error ${res.status} with model ${model}:`, errText);
    return NextResponse.json(
      { error: friendlyError },
      { status: 502 }
    );
  }

  if (!anthropicRes) {
    return NextResponse.json(
      { error: "Ningún modelo de IA disponible. Verifica tu API key de Anthropic." },
      { status: 502 }
    );
  }

  console.log(`[analyze] Success with model: ${usedModel}, fullScript: ${wantsFullScript}`);
  const anthropicData = await anthropicRes.json();
  const rawText: string = anthropicData?.content?.[0]?.text ?? "{}";

  let analysis;
  try {
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
