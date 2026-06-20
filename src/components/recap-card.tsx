"use client";

// 约会周报分享卡 · 剪纸/剪贴簿风（基于 design-exports/recap-card 设计，接真实数据）
import { pick, t, type Lang } from "@/lib/dict";
import type { Plan } from "@/lib/types";

const C = {
  cream: "#f1e7d2",
  creamHi: "#f7efdd",
  paper: "#fbf6ec",
  kraft: "#e7d9bb",
  ink: "#4a3f34",
  inkSoft: "#8a7a66",
  rose: "#bd7b82",
  roseDeep: "#a85d67",
  terra: "#c67c52",
  sage: "#93a079",
  twine: "#c9b48c",
};

// 纸纤维噪点
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const HAND = "var(--font-hand), var(--font-brush), cursive";
const initialOf = (n: string) => (n || "?").trim().slice(-1);

function Polaroid({ src, rotate, tape }: { src: string; rotate: number; tape: string }) {
  return (
    <div
      style={{
        position: "relative",
        background: C.paper,
        padding: "9px 9px 9px",
        borderRadius: 3,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          "0 16px 26px -14px rgba(74,55,30,0.42), 0 2px 4px rgba(74,55,30,0.14)",
      }}
    >
      {/* washi 胶带 */}
      <div
        style={{
          position: "absolute",
          top: -9,
          left: "50%",
          width: 50,
          height: 17,
          transform: "translateX(-50%) rotate(-4deg)",
          background: tape,
          opacity: 0.62,
          boxShadow: "0 1px 2px rgba(74,55,30,0.18)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        crossOrigin="anonymous"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", borderRadius: 1 }}
      />
    </div>
  );
}

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
    { n: plan.weather ? `${plan.weather.high_c}°` : "—", l: t(lang, "recap.stat_weather"), c: C.terra },
    { n: String(stops.length), l: t(lang, "recap.stat_stops"), c: C.sage },
    { n: String(photos.length), l: t(lang, "recap.stat_photos"), c: C.rose },
    { n: "$".repeat(tier), l: t(lang, "recap.stat_budget"), c: C.twine },
  ];
  const photoTapes = [C.rose, C.sage, C.terra];
  const photoRots = photos.length === 1 ? [-1.5] : photos.length === 2 ? [-3, 2.5] : [-3.5, 2, -1.5];

  return (
    <div
      data-recap
      style={{
        position: "relative",
        width: 400,
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: 18,
        color: C.ink,
        backgroundColor: C.cream,
        backgroundImage: `radial-gradient(135% 100% at 50% -8%, ${C.creamHi} 0%, ${C.cream} 44%, #ead9b8 100%)`,
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* 噪点 + 暗角，让边缘像真纸 */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "140px 140px", opacity: 0.1, mixBlendMode: "multiply", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 110px 8px rgba(120,96,58,0.10)", pointerEvents: "none" }} />

      <div style={{ position: "relative", padding: "26px 26px 22px" }}>
        {/* top: 品牌 + 日期邮戳 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.inkSoft }}>
            DateDrop
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              color: C.roseDeep,
              border: `1.5px dashed ${C.rose}`,
              borderRadius: 8,
              padding: "3px 9px",
              transform: "rotate(2.5deg)",
              background: "rgba(251,246,236,0.5)",
            }}
          >
            {plan.week_of}
          </span>
        </div>

        {/* 情侣名 + 标题（手作字体） */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex" }}>
            <span style={{ display: "flex", height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: C.ink, color: C.paper, fontSize: 14, boxShadow: `0 0 0 3px ${C.cream}` }}>{initialOf(meName)}</span>
            <span style={{ marginLeft: -10, display: "flex", height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: C.roseDeep, color: C.paper, fontSize: 14, boxShadow: `0 0 0 3px ${C.cream}` }}>{initialOf(partnerName)}</span>
          </span>
          <div style={{ fontFamily: HAND, fontSize: 24, lineHeight: 1, color: C.ink }}>
            {meName} <span style={{ color: C.rose }}>&amp;</span> {partnerName}
          </div>
        </div>

        <h2 style={{ margin: "12px 0 0", fontFamily: HAND, fontSize: 38, lineHeight: 1.08, color: C.ink, letterSpacing: "0.01em" }}>
          {pick(lang, plan.title, plan.title_en)}
        </h2>

        {/* 拍立得照片墙 */}
        {photos.length > 0 && (
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 6 }}>
            {photos.slice(0, 3).map((src, i) => (
              <div key={i} style={{ width: photos.length === 1 ? 240 : 118, height: photos.length === 1 ? 200 : 138 }}>
                <Polaroid src={src} rotate={photoRots[i] ?? 0} tape={photoTapes[i % 3]} />
              </div>
            ))}
          </div>
        )}

        {/* 足迹：牛皮纸标签 + 虚线连 */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 10 }}>
            {t(lang, "recap.footprint")}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            {stops.map((o, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ color: C.rose, letterSpacing: 1, fontSize: 11 }}>···</span>}
                <span
                  style={{
                    background: C.kraft,
                    color: C.ink,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 7,
                    transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`,
                    boxShadow: "0 4px 9px -4px rgba(74,55,30,0.3)",
                  }}
                >
                  {o.venue_name}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* 统计：纸贴纸 */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: C.paper,
                borderRadius: 12,
                padding: "10px 6px",
                textAlign: "center",
                transform: `rotate(${[-2, 1.5, -1, 2][i]}deg)`,
                boxShadow: "0 8px 16px -8px rgba(74,55,30,0.28)",
                borderTop: `3px solid ${s.c}`,
              }}
            >
              <div style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: 17, fontWeight: 600, color: C.ink }}>{s.n}</div>
              <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* 便签 */}
        {note && (
          <div
            style={{
              marginTop: 20,
              background: C.paper,
              borderRadius: "4px 14px 6px 12px",
              padding: "14px 16px",
              transform: "rotate(-0.8deg)",
              boxShadow: "0 10px 20px -10px rgba(74,55,30,0.3)",
            }}
          >
            <span style={{ fontFamily: HAND, fontSize: 30, lineHeight: 0.6, color: C.rose }}>“</span>
            <p style={{ margin: "2px 0 0", fontFamily: HAND, fontSize: 19, lineHeight: 1.45, color: C.ink }}>{note}</p>
          </div>
        )}

        {/* footer 印章 */}
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              color: C.roseDeep,
              border: `1.5px solid ${C.rose}`,
              borderRadius: 99,
              padding: "5px 12px",
              transform: "rotate(-1.5deg)",
              background: "rgba(251,246,236,0.4)",
            }}
          >
            ♥ made with DateDrop
          </span>
        </div>
      </div>
    </div>
  );
}
