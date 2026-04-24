# GabiFit — AI Weekly Report + Calendar Auto-Fill

**Date:** 2026-04-24  
**Status:** Approved  

---

## Overview

A single button in the "Plan Semanal" tab of Instagram Studio triggers:
1. One Apify call to scrape GabiFit's Instagram
2. One KIE AI (DeepSeek) call with redesigned deep-analysis prompts
3. A full weekly report displayed in Plan Semanal
4. A content plan (1 week or 1 month, user's choice) with a preview + confirm flow that auto-fills the Calendar

The goal is to enter every Monday, review results from the past week, and leave with the calendar populated with content that drives sales for GabiFit's course and live event.

---

## Architecture

Two sequential client-side calls (enables real loading state per step):

```
[Button: "Generar Reporte + Plan"]
  → Step 1: POST /api/instagram/profile (existing Apify endpoint)
      → Shows: "Scrapeando Instagram..."
      → Returns: all posts with metrics
  → Step 2: POST /api/weekly-review (replaced endpoint, receives posts in body)
      → Shows: "Analizando con IA..."
      → KIE AI DeepSeek call with new prompt
      → Returns: { weeklyReport, contentPlan }
  → Shows: "Plan listo ✓"
  → UI renders weekly report (Bloque 1)
  → UI renders plan preview (Bloque 2)
  → User clicks "Confirmar y llenar calendario"
      → Conflict detection against Supabase calendar_posts
      → Modal shows rows: free / conflict / deselected
      → Bulk insert confirmed posts to Supabase calendar_posts
      → Redirect to /calendar
```

Note: if Apify data was already loaded in the current session (profile store is fresh), Step 1 is skipped and cached data is used directly.

No Anthropic API key. No new external services. Uses existing KIE AI + Apify credentials.

---

## API Endpoint: `POST /api/weekly-review` (replaced)

### Request
```ts
{
  posts: ScrapedPost[]    // passed from client after Apify step completes
  scope: "week" | "month" // plan scope chosen by user
  month: string           // YYYY-MM, used to anchor the plan dates
}
```

### Internal Steps
1. **Filter posts** — from the received `posts` array, extract those with `timestamp` within last 7 days for `weeklyReport`. All 30 posts inform the AI's content strategy but only the last-7-days subset is reported as "this week."
2. **Prompt construction** — builds a single prompt with:
   - All posts with metrics (likes, views, comments, type, caption snippet, timestamp)
   - GabiFit brand context: postparto fitness coach, Dominican, Latina moms 25–40, warm/empowering tone, sells a course + live event
   - Scope instruction: generate plan for `scope` (week = 7 days, month = 4 weeks)
   - CTA distribution rule: ~30% posts point to course, ~20% to live event, ~50% community/educational
3. **KIE AI call** — `deepseek-chat` model, single call, JSON output enforced via prompt

### Response Schema
```ts
{
  weeklyReport: {
    resumenSemana: {
      totalPosts: number
      totalLikes: number
      totalViews: number
      totalComments: number
      avgEngagementRate: number       // percentage
      bestPerformingFormat: string    // "Reel" | "Carrusel" | etc.
    }
    topPosts: Array<{
      shortCode: string               // used server-side to match back to Apify post
      thumbnailUrl: string            // enriched server-side from Apify data, not from AI
      likes: number
      views: number
      comments: number
      porQueFuncionó: string          // 2-3 sentence AI analysis
      queRepetir: string              // concrete action to repeat
    }>
    insights: string                  // 1 paragraph: what content won and why
    estrategia: string[]              // exactly 3 concrete actions for next week
  }
  contentPlan: {
    scope: "week" | "month"
    semanas: Array<{
      enfoqueSemana: "ventas_curso" | "evento_presencial" | "comunidad" | "educativo"
      posts: Array<{
        fecha: string                 // YYYY-MM-DD
        plataforma: "instagram" | "tiktok" | "youtube"
        formato: string               // "Reel" | "Carrusel" | "Story" | "Short" | etc.
        tema: string                  // post topic
        hook: string                  // opening hook line
        cta: string                   // call to action
        caption: string               // full suggested caption
        tipo: string                  // content type matching CalendarPost type field
        apuntaA: "curso" | "evento" | "comunidad" | null
      }>
    }>
  }
}
```

### Prompt Design Rules
- Output must be valid JSON only (no markdown, no preamble)
- Posts in `topPosts` sorted by engagement rate descending, max 5
- `contentPlan.semanas` has 1 entry for `scope=week`, 4 entries for `scope=month`
- Each week has 5–7 posts distributed across platforms (Instagram-heavy, ~60% IG, ~25% TikTok, ~15% YouTube)
- Captions in Spanish, GabiFit voice (colloquial, warm, no voseo, no perfect-body messaging)

---

## UI: Tab "Plan Semanal" (redesigned)

### Top Bar
- Selector: `[ Esta semana (7 días) ]  [ Este mes (4 semanas) ]` — toggles `scope`
- Button: **"Generar Reporte + Plan"** (primary, full-width on mobile)
- Loading states (sequential):
  1. `Scrapeando Instagram...`
  2. `Analizando con IA...`
  3. `Plan listo ✓`

### Bloque 1 — Reporte Semanal
Renders after API responds.

- **KPI row**: 4 cards (Posts, Likes, Views, Engagement %)
- **Top Posts grid**: thumbnails with #1 #2 #3 badges, likes/views overlay
  - Each card expands to show "¿Por qué funcionó?" and "¿Qué repetir?"
- **Estrategia section**: numbered checklist of the 3 action items
- **Insights paragraph**: 1 block of AI text explaining the week's pattern

### Bloque 2 — Plan de Contenido (preview)
Renders below Bloque 1.

- Header: `X posts listos para el calendario` + platform breakdown (`Y en Instagram · Z en TikTok · W en YouTube`)
- Week-grouped list: each week shows its `enfoqueSemana` label + post chips
- Each chip: platform color + formato + tema + CTA icon (🛒 curso, 📍 evento)
- Button: **"Confirmar y llenar calendario →"** (sticky at bottom)

### Bloque 3 — Modal de Confirmación
Opens when user clicks confirm.

- Title: "Revisar antes de llenar el calendario"
- Table columns: Fecha | Plataforma | Tema | Estado
  - Estado values: `✅ Libre` | `⚠️ Conflicto (ya hay post)` | checkbox to include anyway
- Checkboxes on each row — all checked by default, conflicts unchecked by default
- Footer: `[X posts seleccionados]` + **"Llenar calendario"** button
- On success: toast "28 posts agregados al calendario" + `router.push('/calendar')`

---

## Calendar Fill Logic

```ts
// 1. Fetch existing calendar_posts for the date range
const existing = await supabase
  .from('calendar_posts')
  .select('date')
  .gte('date', rangeStart)
  .lte('date', rangeEnd)
  .eq('user_id', userId)

// 2. Mark conflicts
const occupiedDates = new Set(existing.map(p => p.date))
const postsWithStatus = planPosts.map(p => ({
  ...p,
  conflict: occupiedDates.has(p.fecha)
}))

// 3. Bulk insert confirmed posts
const toInsert = confirmedPosts.map(p => ({
  date: p.fecha,
  platform: p.plataforma,
  type: p.tipo,
  caption: p.caption,
  format: p.formato,
  status: 'scheduled',
  time: null,
  script: null,
  user_id: userId
}))

await supabase.from('calendar_posts').insert(toInsert)
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/weekly-review/route.ts` | Replace KIE AI call with new prompt + new response schema |
| `src/app/(dashboard)/instagram/page.tsx` | Redesign Plan Semanal tab UI (Bloque 1 + 2) |
| `src/components/instagram/WeeklyReportBlock.tsx` | New component — Bloque 1 (report display) |
| `src/components/instagram/ContentPlanPreview.tsx` | New component — Bloque 2 (plan preview) |
| `src/components/instagram/CalendarFillModal.tsx` | New component — Bloque 3 (confirm modal) |
| `src/lib/instagram-profile-store.ts` | Add `scope` field, store `weeklyReport` + `contentPlan` separately |

No changes to `/calendar` page or `calendar-store.ts` — the fill flow writes directly to Supabase.

---

## Out of Scope

- Scheduling automation (the button is always manual)
- Editing individual plan posts before confirming (post-MVP)
- TikTok/YouTube native API integration (plan only, no actual publishing)
- Authentication changes
