// ─── Platform definitions ─────────────────────────────────────────────────────
export type PlatformKey = "instagram" | "tiktok" | "youtube" | "twitter" | "linkedin";
export type ContentTypeKey = "informativo" | "ventas" | "viralidad";
export type PostStatusKey  = "published" | "scheduled" | "draft";

export interface Platform {
  key:       PlatformKey;
  label:     string;
  abbr:      string;
  color:     string;   // Tailwind text class
  bg:        string;   // Tailwind bg class (low opacity)
  border:    string;   // Tailwind border class
  dot:       string;   // hex for the chip left dot
}

export interface ContentType {
  key:    ContentTypeKey;
  label:  string;
  color:  string;   // Tailwind text class
  bg:     string;
  dot:    string;   // hex
}

export const PLATFORMS: Record<PlatformKey, Platform> = {
  instagram: {
    key:    "instagram",
    label:  "Instagram",
    abbr:   "IG",
    color:  "text-pink-400",
    bg:     "bg-pink-500/15",
    border: "border-pink-500/30",
    dot:    "#f472b6",
  },
  tiktok: {
    key:    "tiktok",
    label:  "TikTok",
    abbr:   "TT",
    color:  "text-cyan-400",
    bg:     "bg-cyan-500/15",
    border: "border-cyan-500/30",
    dot:    "#22d3ee",
  },
  youtube: {
    key:    "youtube",
    label:  "YouTube",
    abbr:   "YT",
    color:  "text-red-400",
    bg:     "bg-red-500/15",
    border: "border-red-500/30",
    dot:    "#f87171",
  },
  twitter: {
    key:    "twitter",
    label:  "Twitter / X",
    abbr:   "TW",
    color:  "text-sky-400",
    bg:     "bg-sky-500/15",
    border: "border-sky-500/30",
    dot:    "#38bdf8",
  },
  linkedin: {
    key:    "linkedin",
    label:  "LinkedIn",
    abbr:   "LN",
    color:  "text-indigo-400",
    bg:     "bg-indigo-500/15",
    border: "border-indigo-500/30",
    dot:    "#818cf8",
  },
};

export const CONTENT_TYPES: Record<ContentTypeKey, ContentType> = {
  informativo: {
    key:   "informativo",
    label: "Informativo",
    color: "text-violet-400",
    bg:    "bg-violet-500/15",
    dot:   "#a78bfa",
  },
  ventas: {
    key:   "ventas",
    label: "Ventas",
    color: "text-amber-400",
    bg:    "bg-amber-500/15",
    dot:   "#fbbf24",
  },
  viralidad: {
    key:   "viralidad",
    label: "Viralidad",
    color: "text-emerald-400",
    bg:    "bg-emerald-500/15",
    dot:   "#34d399",
  },
};

// ─── Media file (metadata only — object URL is session-only) ─────────────────
export interface MediaFile {
  id:         string;
  name:       string;
  type:       string;   // MIME type e.g. "image/jpeg" | "video/mp4"
  size:       number;   // bytes
  /** Object URL created by URL.createObjectURL() — NOT persisted, only in memory */
  url?:       string;
}

// ─── Calendar post ────────────────────────────────────────────────────────────
export interface CalendarPost {
  id:          string;
  date:        string;          // "YYYY-MM-DD"
  time:        string;          // "HH:MM"
  platform:    PlatformKey;
  type:        ContentTypeKey;
  status:      PostStatusKey;
  caption:     string;
  format:      string;          // "Reel" | "Post" | "Story" | "Video" | "Tweet" …
  hashtags?:   string;
  /** Full content script / guion for this post */
  script?:     string;
  /** Uploaded media — metadata only; url is session-only (object URL) */
  mediaFiles?: MediaFile[];
  /** Internal production notes visible only in this dashboard */
  notes?:      string;
  engagement?: { likes: number; comments: number; shares: number } | null;
}

// ─── Available formats ────────────────────────────────────────────────────────
export const FORMATS = [
  "Reel", "Video", "Short", "Carousel", "Post", "Story", "Tweet", "Thread", "Article",
] as const;
export type FormatKey = typeof FORMATS[number];

// ─── Seed data — March 2026 ───────────────────────────────────────────────────
// Posts up to Mar 17 = published; from Mar 18+ = scheduled
export const CALENDAR_POSTS: CalendarPost[] = [
  // ── Week 1 ──────────────────────────────────────────────────────────────────
  {
    id: "c01", date: "2026-03-01", time: "18:00",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "Leg day challenge en serio 💀 ¿Quién se apunta? #legday #challenge",
    hashtags: "#legday #fitness #gabifit",
    script: `[HOOK — 0s]
Cámara directa al peso: sin hablar, solo mostrar la carga del día.

[REVEAL — 3s]
"Hoy es día de pierna. En serio."
→ Texto overlay: 'No es broma hoy'

[DEMO — 8s-40s]
Secuencia rápida con texto overlay en cada ejercicio:
• Squats 4×15 @ peso corporal + barra
• Romanian Deadlift 3×12
• Leg Press 4×20
• Walking Lunges al fallo

[TWIST VIRAL — 40s-55s]
Corte de edición: subiendo escaleras al día siguiente.
Cara de sufrimiento puro. Música dramática.

[CTA — 55s-60s]
"¿Quién se apunta? Comenta 🦵 si esto va a ser tu plan este finde."
→ Texto overlay: 'tag tu compañero de pierna'`,
    engagement: { likes: 2840, comments: 312, shares: 180 },
  },
  {
    id: "c02", date: "2026-03-03", time: "09:00",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "5 hábitos de sueño que mejorarán tu rendimiento 🌙 Guarda este post para cuando lo necesites.",
    hashtags: "#sleep #recovery #gabifit",
    script: `[SLIDE 1 — COVER]
"5 hábitos de sueño que disparan tu rendimiento"
Foto: cama con luz tenue, ambiente relajado.

[SLIDE 2]
Hábito 1: Apaga pantallas 60 min antes.
→ Por qué: la luz azul bloquea la melatonina y dispara el cortisol.
→ Alternativa: libro, estiramientos suaves, meditación.

[SLIDE 3]
Hábito 2: Cuarto a 18–20°C.
→ Por qué: la caída de temperatura corporal activa el sueño profundo (REM).
→ Truco: ventilador o ventana entreabierta.

[SLIDE 4]
Hábito 3: Misma hora siempre (incluso fines de semana).
→ Por qué: el ritmo circadiano regula la recuperación muscular y hormonal.

[SLIDE 5]
Hábito 4: Magnesio glicinato antes de dormir.
→ Dosis: 200–400 mg. Fuentes naturales: espinacas, semillas de calabaza.

[SLIDE 6]
Hábito 5: Última cafeína antes de las 14h.
→ La vida media real de la cafeína es de 5–7 horas. Haz el cálculo.

[SLIDE 7 — CTA]
"¿Cuál empiezas esta semana? Cuéntame abajo 👇"
→ Recuerda pedir que guarden el post.`,
    engagement: { likes: 980, comments: 94, shares: 140 },
  },
  {
    id: "c03", date: "2026-03-03", time: "14:00",
    platform: "youtube", type: "informativo", status: "published", format: "Video",
    caption: "Tutorial full body workout — 45 min sin equipo, para cualquier nivel.",
    hashtags: "#workout #tutorial #gabifit",
    script: `[INTRO — 0:00-2:00]
Bienvenida. Presentar el workout: full body, 45 min, sin equipo.
"Solo necesitas una esterilla y ganas."
Mencionar niveles: principiante/intermedio con modificaciones.

[CALENTAMIENTO — 2:00-7:00]
• Rotación de caderas 30s cada lado
• Sentadilla de cajón × 10 reps lentas
• Rotación de brazos 30s cada dirección
• Marcha elevada de rodillas 60s

[BLOQUE 1 — UPPER BODY — 7:00-20:00]
• Push-ups 3×12 (modificación en rodillas para principiantes)
• Pike push-ups 3×10
• Dips en silla 3×15
• Superman hold 3×30s
→ Descanso 60s entre series. Mostrar forma correcta en cada ejercicio.

[BLOQUE 2 — CORE — 20:00-32:00]
• Dead bug 3×12 (explicar respiración)
• Mountain climbers 3×30 reps
• Hollow body hold 3×30s
• Plank lateral 3×30s cada lado

[BLOQUE 3 — LOWER BODY — 32:00-42:00]
• Sentadillas 4×15
• Glute bridges 4×20 (variación una pierna para avanzados)
• Step-ups 3×12 cada pierna
• Calf raises 3×20

[VUELTA A LA CALMA — 42:00-47:00]
Estiramientos: cuádriceps, isquiotibiales, cadera, pecho, hombros.

[OUTRO — 47:00]
Recordatorio de suscribirse + campana.
Próximo video: nutrición pre y post workout.`,
    engagement: { likes: 1420, comments: 231, shares: 88 },
  },
  {
    id: "c04", date: "2026-03-05", time: "10:00",
    platform: "instagram", type: "ventas", status: "published", format: "Post",
    caption: "🚀 Lanzamiento del Programa de Entrenamiento Primavera. Plazas limitadas.",
    hashtags: "#programa #entrenamiento #gabifit",
    engagement: { likes: 740, comments: 215, shares: 60 },
  },
  {
    id: "c05", date: "2026-03-06", time: "19:30",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "POV: el día después de pierna 😂 Tag a tu compañero de entreno.",
    hashtags: "#legday #funny #gabifit",
    script: `[HOOK — 0s]
Sin intro. Directo al grano: plano de intentar bajar las escaleras.
Cara de sufrimiento total. Música dramática de fondo.

[GAGS — 5s-50s]
Secuencia de clips cortos (3-5s cada uno):
1. Levantarse del sofá → micro-drama
2. Agacharse a recoger algo del suelo
3. Entrar al coche (bajarse de rodillas casi)
4. Bajar del coche al llegar al trabajo
5. Primera sentada del día en la silla

[TWIST — 50s]
Texto overlay: "Y aun así..."
→ Corte a: yo preparando la sesión de pierna de la semana siguiente.

[CTA — 58s]
"Tag tu compañero de dolor 😂"
Texto overlay: "#legday #elquenolabebelapierde"`,
    engagement: { likes: 5200, comments: 640, shares: 920 },
  },
  {
    id: "c06", date: "2026-03-07", time: "08:00",
    platform: "instagram", type: "informativo", status: "published", format: "Story",
    caption: "Mi rutina matutina completa: de levantarme a estar lista para entrenar en 30 min ⏱",
    engagement: { likes: 310, comments: 28, shares: 15 },
  },
  // ── Week 2 ──────────────────────────────────────────────────────────────────
  {
    id: "c07", date: "2026-03-08", time: "12:00",
    platform: "linkedin", type: "informativo", status: "published", format: "Post",
    caption: "Por qué la consistencia supera a la intensidad. Reflexión después de 5 años como coach.",
    hashtags: "#coaching #fitness #consistency",
    engagement: { likes: 430, comments: 67, shares: 112 },
  },
  {
    id: "c08", date: "2026-03-10", time: "17:00",
    platform: "instagram", type: "viralidad", status: "published", format: "Reel",
    caption: "5 movimientos para esculpir el core en menos de 10 minutos 💪 ¡Guárdalo!",
    hashtags: "#core #workout #gabifit",
    script: `[HOOK — 0s]
"5 movimientos. 10 minutos. Core de fuego 🔥"
Mostrar resultado visual (abdomen trabajado, sin ser explícita).

[MOVIMIENTO 1 — 5s]
Plank to Downdog × 10 reps
→ Texto overlay: nombre + rep count
→ Cueing en voz: "activa el ombligo hacia dentro"

[MOVIMIENTO 2 — 25s]
Dead Bug × 12 reps
→ Corrección clave en overlay: "lumbar pegada al suelo TODO el tiempo"

[MOVIMIENTO 3 — 45s]
Hollow Body Hold × 30s
→ Overlay: "si la zona lumbar se despega, sube las piernas"

[MOVIMIENTO 4 — 65s]
Russian Twists × 20 reps
→ Opción con peso / sin peso según nivel

[MOVIMIENTO 5 — 85s]
Plank Lateral × 30s cada lado
→ Overlay: "cadera arriba, no te hundas"

[OUTRO — 105s]
"Guárdalo y hazlo mañana en ayunas 👇 ¿Cuántas rondas puedes completar?"
→ Pedir que comenten y guarden.`,
    engagement: { likes: 1420, comments: 184, shares: 310 },
  },
  {
    id: "c09", date: "2026-03-10", time: "20:00",
    platform: "tiktok", type: "ventas", status: "published", format: "Video",
    caption: "🔥 Quedan 3 plazas de coaching 1:1 para abril. Enlace en bio.",
    hashtags: "#coaching #gabifit",
    engagement: { likes: 890, comments: 178, shares: 65 },
  },
  {
    id: "c10", date: "2026-03-12", time: "09:30",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "Guía honesta de suplementos: lo que SÍ funciona y lo que NO. Sin sponsors.",
    hashtags: "#suplementos #nutrition #gabifit",
    engagement: { likes: 1180, comments: 205, shares: 280 },
  },
  {
    id: "c11", date: "2026-03-13", time: "11:00",
    platform: "twitter", type: "viralidad", status: "published", format: "Tweet",
    caption: "Hot take: los días de descanso son tan importantes como los de entrenamiento. Unpopular opinion o realidad?",
    engagement: { likes: 640, comments: 98, shares: 220 },
  },
  {
    id: "c12", date: "2026-03-14", time: "16:00",
    platform: "youtube", type: "informativo", status: "published", format: "Video",
    caption: "Q&A: Todo sobre coaching de fitness — cómo empecé, mis errores, mis aprendizajes.",
    hashtags: "#qanda #coaching #gabifit",
    engagement: { likes: 980, comments: 312, shares: 45 },
  },
  // ── Week 3 ──────────────────────────────────────────────────────────────────
  {
    id: "c13", date: "2026-03-15", time: "10:00",
    platform: "instagram", type: "ventas", status: "published", format: "Post",
    caption: "🌸 OFERTA PRIMAVERA — 30% dto en el programa completo solo este finde.",
    hashtags: "#oferta #programa #gabifit",
    engagement: { likes: 520, comments: 143, shares: 88 },
  },
  {
    id: "c14", date: "2026-03-15", time: "20:00",
    platform: "tiktok", type: "viralidad", status: "published", format: "Video",
    caption: "POV: llevas 3 meses entrenando y ya no reconoces tu cuerpo 🔥",
    hashtags: "#transformation #gabifit",
    engagement: { likes: 7800, comments: 890, shares: 1240 },
  },
  {
    id: "c15", date: "2026-03-17", time: "08:00",
    platform: "instagram", type: "informativo", status: "published", format: "Carousel",
    caption: "Guía de meal prep semanal: todo lo que como para rendir en el entreno.",
    hashtags: "#mealprep #nutrition #gabifit",
    script: `[SLIDE 1 — COVER]
Título: "Mi meal prep semanal completo — todo lo que como para rendir"
Foto: mesa con tupper bien organizado y colorido.

[SLIDE 2 — PROTEÍNAS]
Pollo al horno × 1 kg (sal, ajo, orégano, AOVE) + Salmón × 2 filetes.
Tiempo de preparación: 35 min. Rendimiento: 5 días.

[SLIDE 3 — HIDRATOS]
Arroz blanco 500g cocido (con caldo de verduras para sabor).
Boniato asado × 4 uds. (con canela opcional).
Nota: hidratos post-entreno = mejor recuperación.

[SLIDE 4 — VERDURAS]
Brócoli al vapor × 1 cabeza entera.
Judías verdes salteadas con ajo.
Espinacas frescas para ensaladas rápidas.

[SLIDE 5 — SNACKS]
Yogur griego 0% × 5 botes (+ miel + fruta).
Fruta cortada en taper (fresas, mango, arándanos).
Frutos secos pre-pesados: 30g por bolsita.

[SLIDE 6 — TABLA DE COMBOS]
Desayuno: yogur + fruta + frutos secos.
Pre-entreno: arroz + pollo + verduras.
Post-entreno: boniato + pollo + brócoli.
Cena: salmón + espinacas + aguacate.

[SLIDE 7 — CTA]
"¿Haces meal prep? Cuéntame tu truco favorito 👇"
"Guarda este post para el próximo domingo."`,
    engagement: { likes: 1240, comments: 167, shares: 340 },
  },
  {
    id: "c16", date: "2026-03-17", time: "13:00",
    platform: "twitter", type: "viralidad", status: "published", format: "Tweet",
    caption: "El problema de la cultura fitness en 2026: todo el mundo quiere resultados en 30 días pero nadie quiere cambiar sus hábitos.",
    engagement: { likes: 1840, comments: 234, shares: 580 },
  },
  // ── Week 3–4 scheduled ──────────────────────────────────────────────────────
  {
    id: "c17", date: "2026-03-19", time: "08:00",
    platform: "instagram", type: "viralidad", status: "scheduled", format: "Reel",
    caption: "Morning workout: el ritual que cambió mi día completamente 🌅",
    hashtags: "#morning #workout #gabifit",
    script: `[HOOK — 0s]
Toma al amanecer. Luz natural. Sin maquillaje. Auténtico.
"Las 6:30 AM. Aquí empieza todo."

[RITUAL — 5s-45s]
Secuencia cronológica con texto overlay de hora:
• 6:30 — Vaso de agua + electrolitos
• 6:35 — 5 min de movilidad (cadera, columna, hombros)
• 6:40 — 20 min de workout (mostrar 3-4 ejercicios key)
• 7:00 — Ducha fría (reacción honesta)
• 7:10 — Desayuno preparado anoche

[MENSAJE — 45s]
"No es magia. Es repetición. Llevo 8 meses así y ya no concibo mi día de otra forma."

[CTA — 55s]
"¿Eres de mañanas o de noches para entrenar? Cuéntame abajo 👇"`,
    notes: "Grabar de lunes a viernes. La luz de las 6:30 AM en marzo es perfecta. Necesito cámara en trípode.",
  },
  {
    id: "c18", date: "2026-03-19", time: "18:00",
    platform: "tiktok", type: "informativo", status: "scheduled", format: "Video",
    caption: "Los 3 errores más comunes al hacer sentadillas (y cómo corregirlos).",
    hashtags: "#squats #form #gabifit",
    script: `[HOOK — 0s]
"¿Llevas meses haciendo sentadillas y tus rodillas te odian? Mira esto."

[ERROR 1 — 5s]
Las rodillas caen hacia dentro (valgo de rodilla).
→ Demostración del error primero.
→ Corrección: activar glúteos antes de bajar, pensar en "empujar las rodillas hacia fuera".
→ Cue visual: banda elástica justo por encima de rodillas.

[ERROR 2 — 25s]
Taconeo al bajar (talones se levantan).
→ Demostración del error.
→ Corrección: elevar talones con disco si falta movilidad de tobillo, o trabajar movilidad.
→ Cue: "imagina que tienes las raíces en el suelo".

[ERROR 3 — 45s]
Inclinación excesiva del torso hacia delante.
→ Demostración vs versión correcta.
→ Corrección: mirada al frente, pecho arriba, core activado.

[OUTRO — 60s]
"¿Cuál de estos tres te pasa a ti? Comenta el número 1, 2 o 3."`,
    notes: "Grabar en el gym con cámara lateral para que se vea la forma. Necesito a alguien que grabe.",
  },
  {
    id: "c19", date: "2026-03-20", time: "10:00",
    platform: "instagram", type: "ventas", status: "scheduled", format: "Post",
    caption: "🚨 Últimas plazas para la cohorte de abril. No te quedes fuera.",
    hashtags: "#coaching #abril #gabifit",
  },
  {
    id: "c20", date: "2026-03-21", time: "15:00",
    platform: "linkedin", type: "ventas", status: "scheduled", format: "Post",
    caption: "Abriendo 5 plazas para coaching ejecutivo online. ¿Eres tú?",
    hashtags: "#coaching #ejecutivo #gabifit",
  },
  {
    id: "c21", date: "2026-03-22", time: "17:00",
    platform: "youtube", type: "informativo", status: "scheduled", format: "Video",
    caption: "Mitos de nutrición que sigues creyendo (desmontándolos con ciencia).",
    hashtags: "#nutrition #myths #gabifit",
  },
  {
    id: "c22", date: "2026-03-22", time: "20:00",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Trend: si tu entrenadora te dijera la verdad 😅 #honestidad",
    hashtags: "#trend #funny #gabifit",
  },
  {
    id: "c23", date: "2026-03-24", time: "09:00",
    platform: "instagram", type: "informativo", status: "scheduled", format: "Story",
    caption: "Behind the scenes del shoot de contenido de esta semana 📸",
  },
  {
    id: "c24", date: "2026-03-25", time: "18:30",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Resultados del challenge de 30 días — INCREÍBLE transformación 🔥",
    hashtags: "#30days #transformation #gabifit",
  },
  {
    id: "c25", date: "2026-03-26", time: "12:00",
    platform: "instagram", type: "informativo", status: "scheduled", format: "Carousel",
    caption: "Plan de entrenamiento semanal gratuito — 5 días, sin excusas.",
    hashtags: "#workoutplan #free #gabifit",
  },
  {
    id: "c26", date: "2026-03-27", time: "11:00",
    platform: "twitter", type: "informativo", status: "scheduled", format: "Tweet",
    caption: "Thread: todo lo que aprendí en mis primeros 3 años como fitness coach 🧵",
  },
  {
    id: "c27", date: "2026-03-28", time: "10:00",
    platform: "instagram", type: "ventas", status: "scheduled", format: "Post",
    caption: "Programa de abril ABIERTO — plazas muy limitadas. Enlace en bio.",
    hashtags: "#programa #abril #gabifit",
  },
  {
    id: "c28", date: "2026-03-29", time: "20:00",
    platform: "tiktok", type: "ventas", status: "scheduled", format: "Video",
    caption: "Por qué invertir en un coach cambia todo. Historia real de una alumna.",
    hashtags: "#coaching #resultado #gabifit",
  },
  {
    id: "c29", date: "2026-03-30", time: "09:00",
    platform: "youtube", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Resumen del mes de marzo: retos, victorias y lo que viene 📹",
    hashtags: "#recap #march #gabifit",
  },
  {
    id: "c30", date: "2026-03-31", time: "19:00",
    platform: "tiktok", type: "viralidad", status: "scheduled", format: "Video",
    caption: "Recap de marzo en 60 segundos ✨ El mes más intenso del año.",
    hashtags: "#recap #gabifit",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getPostsForDate(date: string): CalendarPost[] {
  return CALENDAR_POSTS.filter((p) => p.date === date);
}

export function getPostsByMonth(year: number, month: number): CalendarPost[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return CALENDAR_POSTS.filter((p) => p.date.startsWith(prefix));
}

/** Build a 42-cell array (6 rows × 7 cols, Mon-first) for a given year/month */
export function buildCalendarGrid(year: number, month: number): (string | null)[] {
  const firstDay  = new Date(year, month - 1, 1);
  const lastDay   = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // Convert getDay() (0=Sun) → Monday-first index (0=Mon … 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const cells: (string | null)[] = [];

  // Padding from previous month
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month - 1, -startDow + i + 1);
    cells.push(d.toISOString().slice(0, 10));
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  // Pad to next 7-multiple (up to 42)
  while (cells.length < 42) {
    const d = new Date(year, month, cells.length - startDow - daysInMonth + 1);
    cells.push(d.toISOString().slice(0, 10));
  }

  return cells;
}

export const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
export const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
