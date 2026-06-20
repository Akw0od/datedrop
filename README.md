# DateDrop

**Every Thursday, a ready-to-run Saturday date plan lands for the two of you — real venues, real weather, one tap to confirm.**

A couples app for people who *want* to go on dates but keep failing to plan them. DateDrop pushes a complete plan to both partners; you only keep veto power.

🔗 **Live:** https://datedrop-nu.vercel.app · Fully bilingual (中文 / English), localized for Seattle, installable as a PWA.

> Built as a real product (my partner and I use it) and as a portfolio piece.

---

## The thesis

The hard part of dating long-term isn't a shortage of ideas — it's **decision fatigue**. Between "we should do something Saturday" and actually leaving the house sits a chain of friction: pick a place, check hours, check the weather, agree with your partner. DateDrop collapses that chain into one tap.

Three product bets drive every decision:

1. **Behavior beats self-report.** Partners each blind-swipe date cards (Tinder-style). Cards you *both* swipe right on form a preference pool that actually **ranks which plan you get** — real signal, not a questionnaire.
2. **It's a commitment device.** The plan is pushed to both people at once. Once your partner taps "I'm in," you can't flake. The product sells *follow-through*, not ideas.
3. **The cost ceiling is baked into the UX.** There is no free-form chat box. One generation per week, capped rerolls, instant pre-ranked swaps. Spend is bounded *by design*, not by a budget alarm.

---

## What it does

- **Sign in** with email/password or **one-tap Google** (Supabase Auth + PKCE OAuth callback).
- **Blind dual-swipe onboarding** → a shared preference pool, with a live "you both want to do this!" moment over Supabase Realtime.
- **A built Saturday plan**, not an idea list: a 2–3 stop timeline of real Seattle venues with a one-line tip per stop, plus the day's actual forecast — and it's **ranked by your swiped preferences**.
- **Per-stop instant swap** via a bottom-sheet: don't like the dinner stop? Swipe to the next pre-ranked alternative — instant, free, the rest of the plan stays put.
- **Dual confirmation** that drops into both calendars; **unpair** to reset a mis-pairing.
- **Thursday push** — a cron job generates and emails the week's plan to both partners.
- **Weekly recap** — after a date, upload a few photos and get a **paper-cut scrapbook card** (handwritten/brush fonts, polaroids, washi tape, footprint, stats) you download as a PNG to share.
- **4 themes** (Rose / Sand / Sage / Midnight dark) and **中文 / English**, toggled instantly from your profile.

---

## Architecture highlights

The engineering decisions I'd actually talk about in a review:

### Expensive creative assembly vs. cheap refinement
A naive "swap" regenerates the whole plan on every tap: slow, costly, and it throws away 90% of a plan to fix one stop. Instead, **3–4 alternates per slot** are prepared up front, each constrained to the same time window and nearby area. Swapping a stop is then **pure database index rotation** — `0ms`, `$0`, no model call. The slow, creative work runs once; refinement is free forever.

### Invariants and concurrency live in the database, not the UI
Two-person state is racy, so the mutations are `SECURITY DEFINER` Postgres RPCs, not client read-modify-writes:
- **`swap_stop`** rotates the chosen stop **and atomically clears both confirmations** — "both partners agreed to *the same* plan" is the product's core promise, so changing any stop voids the confirmation.
- **`accept_plan` / `unaccept_plan`** use array ops so two partners tapping "I'm in" at the same instant can't clobber each other's vote (the original client-side array write could).
- **`join_couple`** refuses a user who's already paired, and **`getMyCouple`** tolerates a data anomaly (someone in >1 couple) by ordering paired-first and taking one — so a bad row never crashes the home page.

### Runtime theming with zero component refactor
Tailwind v4 emits every color as a CSS variable, so the 4 themes are just `[data-theme]` blocks overriding `--color-rose-*` (accent) and, for Midnight, `--color-zinc-*` + a `--surface` token. No component changes its color classes. Dark mode's one real conflict — `white` doubles as both card surface and on-accent text — is solved by mapping `bg-white → bg-[var(--surface)]` while leaving `text-white` literal. Theme is a cookie read server-side in `layout` (no flash) and flipped instantly client-side.

### Dual-path generation, zero hard dependencies
Plan generation has two interchangeable backends, chosen by env at runtime:
- **No key** → a curated local plan pool (`lib/premade-seattle.ts`, 18 plans). Instant, free, fully bilingual, **ranked by the couple's match pool**. This is the default.
- **`ANTHROPIC_API_KEY` set** → live Claude generation: prefetch (preferences + venue library + weather) → one structured call → strict `venue_id` validation to kill hallucinated venues → same-category backfill.

The LLM layer is itself dual-provider: a local `claude` CLI (subscription OAuth, **no API key**) for development, or the Anthropic SDK for serverless.

### The recap is a client-rendered share asset
The paper-cut card is a React component captured to PNG with **html-to-image**, after `await document.fonts.ready` so the handwritten/brush fonts (loaded on-demand via `next/font`, `preload: false`) bake into the export instead of falling back. Photos upload to a **public Storage bucket with folder-scoped RLS** (`is_couple_member((storage.foldername(name))[1])`).

### A timezone bug worth the fix
`nextSaturday()` originally did date math via `toISOString()`. On a Pacific-time machine, an evening call pushed the wall-clock time across the UTC date boundary — returning *Sunday* instead of *Saturday*, silently desyncing the home page from the cron. Fixed by reading the wall-clock date in the target timezone via `Intl.DateTimeFormat`, then doing arithmetic on a pure UTC date. The kind of bug only a real run catches.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend / backend | Next.js 15 (App Router) · TypeScript · Tailwind v4 |
| Auth · DB · Realtime · Storage | Supabase (Postgres, RLS, Realtime, Storage; email + Google OAuth) |
| Motion | Framer Motion (motion-value drag, spring physics, bottom-sheet) |
| Plan generation | Local curated pool (default) ⇄ Claude Haiku (CLI or SDK) |
| Weather | Open-Meteo (free, no key) |
| Push | Vercel Cron (Thursday) + Resend (graceful console fallback) |
| Recap export | html-to-image · `next/font` (Caveat, Ma Shan Zheng) |
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

`profiles` · `couples` (invite-code pairing) · `date_cards` (bilingual) · `swipes` · `matches` (trigger-written, Realtime) · `venues` (curated Seattle library) · `plans` (timeline as `jsonb`: per-stop `options[]` + `current`, with `mood`) · `recaps` (photos + note, keyed by couple+week) · `plan_feedback` · `llm_usage`. Plus a public `recap-photos` Storage bucket.

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
3. For Google sign-in: enable the Google provider in Supabase Auth, add the app's `/auth/callback` to the redirect allowlist.
4. `vercel.json` registers the Thursday cron automatically.

---

## Roadmap

- Post-date feedback loop feeding the preference model
- Anniversary / surprise modes (the paid tier)
- Web Push so the Thursday drop is a phone notification (iOS 16.4+ PWA)
- Multi-city expansion once Seattle quality is proven
