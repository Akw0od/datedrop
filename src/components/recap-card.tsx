"use client";

// 约会周报分享卡（基于 design-exports/recap-card-bold 设计，接真实 plan+照片）
import {
  Camera,
  CheckCircle,
  CloudSun,
  HeartStraight,
  MapPin,
  Path,
  Quotes,
  Wallet,
} from "@phosphor-icons/react";
import { pick, t, type Lang } from "@/lib/dict";
import type { Plan } from "@/lib/types";

const initialOf = (n: string) => (n || "?").trim().slice(-1);

export function RecapCard({
  plan,
  lang,
  meName,
  partnerName,
  photos,
  note,
}: {
  plan: Plan;
  lang: Lang;
  meName: string;
  partnerName: string;
  photos: string[];
  note: string;
}) {
  const stops = plan.timeline.map((s) => s.options[s.current] ?? s.options[0]);
  const totalPrice = stops.reduce((a, o) => a + (o.price || 0), 0);
  const tier = Math.max(1, Math.round(totalPrice / (stops.length || 1)));

  const stats = [
    { icon: <CloudSun size={18} className="text-zinc-400" />, n: plan.weather ? `${plan.weather.high_c}°` : "—", l: t(lang, "recap.stat_weather") },
    { icon: <MapPin size={18} weight="fill" className="text-zinc-400" />, n: String(stops.length), l: t(lang, "recap.stat_stops") },
    { icon: <Camera size={18} className="text-zinc-400" />, n: String(photos.length), l: t(lang, "recap.stat_photos") },
    { icon: <Wallet size={18} className="text-zinc-400" />, n: "$".repeat(tier), l: t(lang, "recap.stat_budget") },
  ];

  return (
    <div
      data-recap
      className="w-[400px] max-w-full overflow-hidden bg-[#fafafa] p-7 font-sans"
      style={{ borderRadius: 28 }}
    >
      {/* top */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          DateDrop
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white">
          <CheckCircle size={13} weight="fill" /> {plan.week_of}
        </span>
      </div>

      {/* couple */}
      <div className="mt-5 flex items-center gap-3">
        <span className="flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-[15px] font-medium text-white ring-2 ring-[#fafafa]">
            {initialOf(meName)}
          </span>
          <span className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-[15px] font-medium text-white ring-2 ring-[#fafafa]">
            {initialOf(partnerName)}
          </span>
        </span>
        <div className="leading-tight">
          <div className="text-[17px] font-semibold tracking-tight text-zinc-900">
            {meName} <span className="text-zinc-300">&</span> {partnerName}
          </div>
          <div className="mt-0.5 font-mono text-[12px] text-zinc-400">{plan.week_of} · Seattle</div>
        </div>
      </div>

      {/* hero title */}
      <h2 className="mt-5 text-[26px] font-semibold leading-[1.15] tracking-tight text-zinc-900">
        {pick(lang, plan.title, plan.title_en)}
      </h2>

      {/* photos */}
      {photos.length > 0 && (
        <div
          className="mt-5 grid gap-2"
          style={{
            gridTemplateColumns: photos.length === 1 ? "1fr" : "1.2fr 1fr",
            gridTemplateRows: photos.length > 2 ? "1fr 1fr" : "1fr",
            height: 240,
          }}
        >
          {photos.slice(0, 3).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              crossOrigin="anonymous"
              className="h-full w-full rounded-2xl object-cover"
              style={i === 0 && photos.length > 2 ? { gridRow: "span 2" } : undefined}
            />
          ))}
        </div>
      )}

      {/* footprint */}
      <div className="mt-6">
        <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {t(lang, "recap.footprint")}
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {stops.map((o, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <Path size={13} className="text-rose-300" />}
              <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[12px] font-medium text-zinc-700 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]">
                {o.venue_name}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-zinc-200/70 bg-zinc-200/70">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 bg-[var(--surface)] px-4 py-3">
            {s.icon}
            <div className="leading-tight">
              <div className="font-mono text-[15px] font-semibold text-zinc-900">{s.n}</div>
              <div className="text-[11px] text-zinc-400">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* note */}
      {note && (
        <div className="mt-4 rounded-[1.5rem] border border-zinc-200/70 bg-[var(--surface)] p-4">
          <Quotes size={18} weight="fill" className="text-rose-200" />
          <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-600">{note}</p>
        </div>
      )}

      {/* footer */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-zinc-400">
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-rose-600">
          <HeartStraight size={11} weight="fill" className="text-white" />
        </span>
        <span className="font-mono tracking-wide">made with DateDrop</span>
      </div>
    </div>
  );
}
