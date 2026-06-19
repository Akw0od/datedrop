"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  CalendarBlank,
  CalendarCheck,
  Check,
  CloudSun,
  Confetti,
  HourglassMedium,
  Lightbulb,
  Lightning,
  LockSimple,
  MapPin,
  Shuffle,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/lang-provider";
import { t, pick, kindLabel, type Lang } from "@/lib/dict";
import type { Plan, StopOption } from "@/lib/types";

const MAX_REROLLS = 9;
const spring = { type: "spring", stiffness: 320, damping: 32 } as const;

const MOODS = [
  { id: "chill", Icon: Armchair },
  { id: "spark", Icon: Lightning },
  { id: "fete", Icon: Confetti },
] as const;

const initialOf = (name: string) => (name || "?").trim().slice(-1);

function gcalUrl(plan: Plan, lang: Lang): string {
  const first = plan.timeline[0];
  const last = plan.timeline[plan.timeline.length - 1];
  const date = plan.week_of.replace(/-/g, "");
  const start = `${date}T${first.time.replace(":", "")}00`;
  const endH = String(Math.min(23, parseInt(last.time, 10) + 2)).padStart(2, "0");
  const end = `${date}T${endH}${last.time.split(":")[1] ?? "00"}00`;
  const details = plan.timeline
    .map((s) => {
      const o = s.options[s.current] ?? s.options[0];
      return `${s.time}  ${pick(lang, o.title, o.title_en)} @ ${o.venue_name}`;
    })
    .join("\n");
  const loc = (plan.timeline[0].options[plan.timeline[0].current] ?? plan.timeline[0].options[0]).venue_name;
  const title = pick(lang, plan.title, plan.title_en);
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(loc)}`
  );
}

function Avatar({
  initial, accent, confirmed, pending,
}: { initial: string; accent?: boolean; confirmed?: boolean; pending?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium text-white ring-2 ring-white ${accent ? "bg-rose-600" : "bg-zinc-900"}`}>
        {initial}
      </span>
      {confirmed && (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 ring-2 ring-white">
          <Check size={9} weight="bold" className="text-white" />
        </span>
      )}
      {pending && (
        <span className="pulse-dot absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-white" />
      )}
    </span>
  );
}

function StationCard({
  lang, index, time, slot, slotEn, opt, optionCount, locked, delay, onSwap,
}: {
  lang: Lang; index: number; time: string; slot: string; slotEn?: string;
  opt: StopOption; optionCount: number; locked: boolean; delay: number; onSwap: () => void;
}) {
  return (
    <div className="drop-in" style={{ animationDelay: `${delay}ms` }}>
      <p className="mb-2 ml-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {t(lang, "plan.station", { n: index + 1 })} · {pick(lang, slot, slotEn)}
      </p>
      <div
        className={`rounded-[1.75rem] border bg-white p-5 ${locked ? "border-rose-200" : "border-zinc-200/70"}`}
        style={{ boxShadow: "0 16px 34px -18px rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[22px] font-medium tracking-tight text-zinc-900">{time}</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500">
              {kindLabel(lang, opt.category)}
            </span>
          </div>
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
              <LockSimple size={12} weight="fill" /> {t(lang, "plan.locked")}
            </span>
          ) : (
            <button
              onClick={onSwap}
              aria-label={t(lang, "plan.swap")}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800 active:scale-[0.96]"
            >
              <Shuffle size={13} /> {t(lang, "plan.swap")}
              {optionCount > 1 && <span className="font-mono text-[10px] text-zinc-300">{optionCount}</span>}
            </button>
          )}
        </div>

        <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-zinc-900">
          {pick(lang, opt.title, opt.title_en)}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-zinc-500">
          <MapPin size={15} weight="fill" className="text-rose-600" />
          <span className="font-medium text-zinc-700">{opt.venue_name}</span>
          {opt.area && (<><span className="text-zinc-300">·</span><span>{opt.area}</span></>)}
        </div>

        {pick(lang, opt.note, opt.note_en) && (
          <div className="mt-3.5 flex items-start gap-2 rounded-2xl bg-zinc-50 px-3.5 py-2.5">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-zinc-400" />
            <p className="text-[13px] leading-snug text-zinc-500">{pick(lang, opt.note, opt.note_en)}</p>
            {opt.price > 0 && (
              <span className="ml-auto shrink-0 font-mono text-[13px] font-medium text-zinc-400">{"$".repeat(opt.price)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SwapSheet({
  lang, time, options, current, onApply, onClose,
}: {
  lang: Lang; time: string; options: StopOption[]; current: number;
  onApply: (i: number) => void; onClose: () => void;
}) {
  const [temp, setTemp] = useState(current);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[current] as HTMLElement | undefined;
    if (track && card) track.scrollLeft = card.offsetLeft - 20;
  }, [current]);

  function pickIdx(i: number) {
    setTemp(i);
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative rounded-t-[2rem] bg-zinc-50 pb-7 pt-2.5 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.25)]"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={spring}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-zinc-200" />
        <div className="flex items-center justify-between px-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              {t(lang, "plan.swap_title", { time })}
            </p>
            <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-zinc-900">{t(lang, "plan.swap_sub")}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 active:scale-[0.95]">
            <X size={15} weight="bold" />
          </button>
        </div>

        <div ref={trackRef} className="no-sb mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          {options.map((a, i) => {
            const on = temp === i;
            return (
              <button
                key={i}
                onClick={() => pickIdx(i)}
                className={`flex w-[78%] shrink-0 snap-center flex-col rounded-[1.5rem] border bg-white p-5 text-left transition-all duration-200 ${
                  on ? "border-rose-300 shadow-[0_18px_36px_-16px_rgba(225,29,72,0.35)]" : "border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500">{kindLabel(lang, a.category)}</span>
                  {current === i && <span className="font-mono text-[11px] font-medium text-zinc-400">{t(lang, "plan.current")}</span>}
                </div>
                <h4 className="mt-3 text-[17px] font-semibold tracking-tight text-zinc-900">{pick(lang, a.title, a.title_en)}</h4>
                <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-zinc-500">
                  <MapPin size={14} weight="fill" className="text-rose-600" />
                  <span className="font-medium text-zinc-700">{a.venue_name}</span>
                  {a.area && <span className="text-zinc-400">· {a.area}</span>}
                </div>
                <p className="mt-3 line-clamp-2 text-[13px] leading-snug text-zinc-500">{pick(lang, a.note, a.note_en)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[13px] text-zinc-500">{a.price > 0 ? "$".repeat(a.price) : t(lang, "plan.free")}</span>
                  {on && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                      <Check size={11} weight="bold" /> {t(lang, "plan.selected")}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {options.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${temp === i ? "w-5 bg-rose-600" : "w-1.5 bg-zinc-200"}`} />
          ))}
        </div>

        <div className="mt-4 px-5">
          <button
            onClick={() => onApply(temp)}
            className="w-full rounded-2xl bg-zinc-900 py-4 text-[15px] font-semibold text-white transition active:scale-[0.99]"
          >
            {temp === current ? t(lang, "plan.use_this") : t(lang, "plan.swap_to_this")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function PlanCard({
  initialPlan, bothBound, meId, memberIds, coupleId, weekOf, meName, partnerName,
}: {
  initialPlan: Plan | null; bothBound: boolean; meId: string; memberIds: string[];
  coupleId: string; weekOf: string; meName: string; partnerName: string;
}) {
  const { lang } = useLang();
  const supabase = useMemo(() => createClient(), []);
  const partnerId = memberIds.find((id) => id !== meId) ?? null;

  const [plan, setPlan] = useState<Plan | null>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [swapIdx, setSwapIdx] = useState<number | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`plans-${coupleId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "plans", filter: `couple_id=eq.${coupleId}` }, (payload) => {
        const row = payload.new as Plan;
        if (row?.week_of === weekOf) setPlan(row);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, coupleId, weekOf]);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t(lang, "plan.gen_fail"));
      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(lang, "plan.gen_fail"));
    } finally {
      setLoading(false);
    }
  }

  async function applySwap(stopIndex: number, toIndex: number) {
    setSwapIdx(null);
    const { data } = await supabase.rpc("swap_stop", { p_plan_id: plan!.id, p_stop: stopIndex, p_to: toIndex });
    if (data) setPlan((Array.isArray(data) ? data[0] : data) as Plan);
  }

  async function accept() {
    if (!plan || plan.accepted_by.includes(meId)) return;
    setBusy(true);
    const { data } = await supabase.rpc("accept_plan", { p_plan_id: plan.id });
    if (data) setPlan((Array.isArray(data) ? data[0] : data) as Plan);
    setBusy(false);
  }

  async function unaccept() {
    if (!plan) return;
    setBusy(true);
    const { data } = await supabase.rpc("unaccept_plan", { p_plan_id: plan.id });
    if (data) setPlan((Array.isArray(data) ? data[0] : data) as Plan);
    setBusy(false);
  }

  const panel = "rounded-[2rem] border border-zinc-200/60 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]";

  if (!bothBound) {
    return (
      <div className={`${panel} flex min-h-[320px] flex-col items-center justify-center p-10 text-center`}>
        <CalendarCheck size={28} className="text-zinc-300" />
        <p className="mt-3 text-sm text-zinc-400">{t(lang, "plan.empty_card")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${panel} min-h-[320px] p-8`}>
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
        <div className="mt-6 h-7 w-3/5 animate-pulse rounded bg-zinc-100" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-zinc-100" />
        <div className="mt-8 space-y-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-[1.75rem] bg-zinc-100" />)}
        </div>
        <p className="mt-6 text-xs text-zinc-400">{t(lang, "plan.generating")}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={`${panel} flex min-h-[320px] flex-col items-start justify-center p-10`}>
        <CalendarCheck size={28} className="text-rose-600" />
        <h3 className="mt-4 text-lg font-semibold tracking-tight">{t(lang, "plan.none_title")}</h3>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-500">{t(lang, "plan.none_body", { date: weekOf })}</p>
        <div className="mt-6 w-full">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{t(lang, "plan.mood")}</span>
            <span className="text-[11px] font-medium text-zinc-300">{t(lang, "plan.skippable")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(({ id, Icon }) => {
              const on = mood === id;
              return (
                <button
                  key={id}
                  onClick={() => setMood(on ? null : id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition active:scale-[0.97] ${
                    on ? "border-rose-200 bg-rose-50 text-rose-700" : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  <Icon size={16} weight={on ? "fill" : "regular"} />
                  {t(lang, `plan.mood_${id}`)}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={generate} className="mt-6 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.98]">
          {t(lang, "plan.generate")}
        </button>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  const meConfirmed = plan.accepted_by.includes(meId);
  const partnerConfirmed = !!partnerId && plan.accepted_by.includes(partnerId);
  const both = plan.status === "accepted";
  const rerollsLeft = MAX_REROLLS - plan.reroll_count;

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="p-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{t(lang, "home.this_week")}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Sparkle size={11} weight="fill" /> {t(lang, "plan.delivered")}
          </span>
        </div>
        <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-zinc-900">{pick(lang, plan.title, plan.title_en)}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{pick(lang, plan.summary, plan.summary_en)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CalendarBlank size={14} />
            <span className="font-mono">{plan.week_of} {t(lang, "plan.saturday")}</span>
          </span>
          {plan.weather && (
            <>
              <span className="text-zinc-300">·</span>
              <span className="flex items-center gap-1.5 font-mono">
                <CloudSun size={14} />
                {plan.weather.high_c}°/{plan.weather.low_c}° · {t(lang, "plan.precip")} {plan.weather.precip_prob}%
              </span>
            </>
          )}
        </div>

        {meConfirmed && !both && (
          <div className="drop-in mt-5 flex items-center gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3.5">
            <HourglassMedium size={20} className="text-amber-500" />
            <div className="leading-tight">
              <p className="text-[14px] font-semibold tracking-tight text-amber-900">{t(lang, "plan.sent_title", { name: partnerName })}</p>
              <p className="text-[12px] text-amber-700">{t(lang, "plan.sent_body", { name: partnerName })}</p>
            </div>
          </div>
        )}
        {both && (
          <div className="drop-in mt-5 flex items-center gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3.5">
            <span className="seal-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600">
              <Check size={20} weight="bold" className="text-white" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight text-rose-800">{t(lang, "plan.both_title")}</p>
              <p className="text-[12px] text-rose-700">{t(lang, "plan.both_body")}</p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3.5">
          {plan.timeline.map((stop, i) => (
            <StationCard
              key={i}
              lang={lang}
              index={i}
              time={stop.time}
              slot={stop.slot}
              slotEn={stop.slot_en}
              opt={stop.options[stop.current] ?? stop.options[0]}
              optionCount={stop.options.length}
              locked={both}
              delay={i * 80}
              onSwap={() => setSwapIdx(i)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/60 px-7 py-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex -space-x-2">
            <Avatar initial={initialOf(meName)} confirmed={meConfirmed} />
            <Avatar initial={initialOf(partnerName)} accent confirmed={partnerConfirmed} pending={meConfirmed && !partnerConfirmed} />
          </div>
          <p className="text-[13px] font-medium leading-tight">
            {both ? (
              <span className="text-rose-700">{t(lang, "plan.status_both")}</span>
            ) : meConfirmed ? (
              <span className="text-zinc-600" dangerouslySetInnerHTML={{ __html: t(lang, "plan.status_mine", { name: `<span class='text-rose-700'>${partnerName}</span>` }) }} />
            ) : partnerConfirmed ? (
              <span className="text-zinc-600" dangerouslySetInnerHTML={{ __html: t(lang, "plan.status_partner", { name: `<span class='text-rose-700'>${partnerName}</span>` }) }} />
            ) : (
              <span className="text-zinc-400">{t(lang, "plan.status_none")}</span>
            )}
          </p>
          {meConfirmed && !both && (
            <button onClick={unaccept} disabled={busy} className="ml-auto text-[12px] font-medium text-zinc-400 transition hover:text-zinc-700">
              {t(lang, "plan.undo")}
            </button>
          )}
        </div>

        {both ? (
          <a
            href={gcalUrl(plan, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99]"
          >
            <CalendarCheck size={18} /> {t(lang, "plan.add_calendar")}
          </a>
        ) : meConfirmed ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 py-3.5 text-[14px] font-medium text-amber-700">
            <HourglassMedium size={17} /> {t(lang, "plan.waiting", { name: partnerName })}
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={accept} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-rose-600 py-3.5 text-[15px] font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60">
              <Check size={16} weight="bold" /> {t(lang, "plan.commit")}
            </button>
            <button onClick={generate} disabled={rerollsLeft <= 0} className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[14px] font-medium text-zinc-500 transition hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40">
              <Shuffle size={16} />
              <span className="flex flex-col items-start leading-none">
                <span>{t(lang, "plan.reroll")}</span>
                <span className="mt-0.5 font-mono text-[11px] text-zinc-400">{rerollsLeft}/{MAX_REROLLS}</span>
              </span>
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </div>

      <AnimatePresence>
        {swapIdx !== null && plan.timeline[swapIdx] && (
          <SwapSheet
            lang={lang}
            time={plan.timeline[swapIdx].time}
            options={plan.timeline[swapIdx].options}
            current={plan.timeline[swapIdx].current}
            onApply={(i) => applySwap(swapIdx, i)}
            onClose={() => setSwapIdx(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
