# DateDrop

**Every Thursday, a ready-to-run Saturday date plan lands for the two of you — real venues, real weather, one tap to confirm.**

A couples app for people who *want* to go on dates but keep failing to plan them. DateDrop pushes a complete plan to both partners; you only keep veto power.

> Built as a real product (my partner and I use it) and as a portfolio piece. Fully bilingual (中文 / English), localized for Seattle.

---

## The thesis

The hard part of dating long-term isn't a shortage of ideas — it's **decision fatigue**. Between "we should do something Saturday" and actually leaving the house sits a chain of friction: pick a place, check hours, check the weather, agree with your partner. DateDrop collapses that chain into one tap.

Three product bets drive every decision:

1. **Behavior beats self-report.** Partners each blind-swipe date cards (Tinder-style). Cards you *both* swipe right on form the preference pool — real signal, not a questionnaire.
2. **It's a commitment device.** The plan is pushed to both people at once. Once your partner taps "I'm in," you can't flake. The product sells *follow-through*, not ideas.
3. **The cost ceiling is baked into the UX.** There is no free-form chat box. One generation per week, capped rerolls, instant pre-ranked swaps. Spend is bounded *by design*, not by a budget alarm.

---

## What it does

- **Blind dual-swipe onboarding** → a shared preference pool, with a live "you both want to do this!" moment over Supabase Realtime.
- **A built Saturday plan**, not an idea list: a 2–3 stop timeline of real Seattle venues with a one-line tip per stop, plus the day's actual forecast.
- **Per-stop instant swap.** Don't like the dinner stop? Swipe to the next pre-ranked alternative — instant, free, the rest of the plan stays put.
- **Dual confirmation.** Both partners confirm the *same* plan; the result drops into both calendars.
- **Thursday push.** A cron job generates and emails the week's plan to both partners automatically.
- **中文 / English** everywhere — UI, plan content, venue notes — toggled instantly.

---

## Architecture highlights

The engineering decisions I'd actually talk about in a review:

### Expensive creative assembly vs. cheap refinement
A naive "swap" regenerates the whole plan on every tap: slow, costly, and it throws away 90% of a plan to fix one stop. Instead, the model curates **3–4 alternates per slot in a single generation call**, each constrained to the same time window and nearby area. Swapping a stop is then **pure database index rotation** — `0ms`, `$0`, no model call. The slow, creative work runs once; refinement is free forever.

### The commitment-device invariant lives in the database
"Both partners agreed to *the same* plan" is the product's core promise. So `swap_stop` is a `SECURITY DEFINER` Postgres function that atomically rotates the chosen stop **and clears both confirmations** — if either partner changes any stop after the other confirmed, the confirmation is void. The invariant is enforced in SQL, not hoped for in the UI.

### Dual-path generation, zero hard dependencies
Plan generation has two interchangeable backends, chosen by env at runtime:
- **No key** → a curated local plan pool (`lib/premade-seattle.ts`). Instant, free, fully bilingual. This is the default.
- **`ANTHROPIC_API_KEY` set** → live Claude generation: prefetch (preference pool + venue library + weather) → one structured call → strict `venue_id` validation to kill hallucinated venues → same-category backfill.

The LLM layer itself is also dual-provider: a local `claude` CLI (subscription OAuth, **no API key**) for development, or the Anthropic SDK for serverless. Same interface, swapped by env.

### Bilingual across the server/client boundary
Language is a cookie, read by **both** React Server Components (`getLang()`) and client components (`useLang()`) through one shared `t(lang, key)` function. Toggling sets the cookie and `router.refresh()`es so server-rendered pages re-render in the new language with no flash. Dynamic content (plans, cards, venue notes) carries `_en` fields rendered by `pick(lang, …)`.

### A timezone bug worth the fix
`nextSaturday()` originally did date math via `toISOString()`. On a Pacific-time machine, an evening call pushed the wall-clock time across the UTC date boundary — returning *Sunday* instead of *Saturday*, silently desyncing the home page from the cron. Fixed by reading the wall-clock date in the target timezone via `Intl.DateTimeFormat`, then doing arithmetic on a pure UTC date. The kind of bug only a real run catches.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend / backend | Next.js 15 (App Router) · TypeScript · Tailwind v4 |
| Auth · DB · Realtime | Supabase (Postgres, RLS, Realtime) |
| Motion | Framer Motion (motion-value drag, spring physics, bottom-sheet) |
| Plan generation | Local curated pool (default) ⇄ Claude Haiku (CLI or SDK) |
| Weather | Open-Meteo (free, no key) |
| Push | Vercel Cron (Thursday) + Resend (graceful console fallback) |
| Icons | Phosphor (no emoji in product UI) |

---

## Unit economics

The product shape keeps cost near zero, on purpose:

| Mode | Cost / couple / week |
|---|---|
| Premade pool (default) | **$0** |
| Live Claude (Haiku, API) | **≈ $0.02** |

Supabase, Open-Meteo, and Resend free tiers comfortably cover the first ~1,000 couples. Every live generation is metered into `llm_usage` for a real cost-per-couple readout. The only meaningful fixed cost at scale is Vercel Pro ($20/mo).

---

## Data model

`profiles` · `couples` (invite-code pairing) · `date_cards` (bilingual) · `swipes` · `matches` (trigger-written, Realtime) · `venues` (curated Seattle library) · `plans` (timeline as `jsonb`: per-stop `options[]` + `current`) · `plan_feedback` · `llm_usage`.

Migrations in `supabase/migrations/`. Seed Seattle venues with `node scripts/seed-seattle.mjs`.

---

## Local development

```bash
cp .env.example .env.local     # Supabase keys required; everything else optional
npm install
npm run dev
```

Without any AI or email key, the app runs fully: plans come from the curated pool, and the Thursday email prints to the console (and writes `.email-preview.html`).

**Trigger the Thursday push locally:**
```bash
curl -X POST http://localhost:3000/api/cron/thursday \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Deploy (Vercel)

1. Import the repo; set env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`.
2. Optional: `RESEND_API_KEY` + `EMAIL_FROM` for real email; `ANTHROPIC_API_KEY` for live generation.
3. `vercel.json` registers the Thursday cron automatically.

---

## Roadmap

- Post-date feedback loop feeding the preference model
- Anniversary / surprise modes (the paid tier)
- Shareable weekly recap card (the organic-growth hook)
- Multi-city expansion once Seattle quality is proven
