/* global React, ReactDOM */
const { useState, useEffect, useRef, useCallback } = React;

/* ------------------------------------------------------------------ *
 *  PEOPLE
 * ------------------------------------------------------------------ */
const ME      = { name: "江野", initial: "野" };
const PARTNER = { name: "苏念", initial: "念" };

/* ------------------------------------------------------------------ *
 *  THE PLAN  ·  region-specific data lives in regions.jsx (window.REGIONS)
 *  Each region carries its own stations + 3–4 pre-sorted alternates.
 * ------------------------------------------------------------------ */
const MOODS = [
  { id: "chill",  label: "想躺平",   icon: "ph-couch" },
  { id: "spark",  label: "来点刺激", icon: "ph-lightning" },
  { id: "fete",   label: "有事庆祝", icon: "ph-confetti" },
];

/* ------------------------------------------------------------------ *
 *  THEMES  (switcher metadata — vars live in index.html)
 * ------------------------------------------------------------------ */
const THEMES = [
  { id: "rose",     name: "玫瑰", bg: "#fafafa", accent: "#e11d48", dark: false },
  { id: "sand",     name: "暖砂", bg: "#faf7f2", accent: "#c2410c", dark: false },
  { id: "sage",     name: "林野", bg: "#f6f8f6", accent: "#047857", dark: false },
  { id: "midnight", name: "墨夜", bg: "#16161a", accent: "#f43f5e", dark: true  },
];

/* ------------------------------------------------------------------ *
 *  SMALL PRIMITIVES
 * ------------------------------------------------------------------ */
function Ph({ name, className = "", style }) {
  return <i className={`ph ${name} ${className}`} style={style} />;
}

function Avatar({ person, size = 30, confirmed, pending, dim }) {
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`inline-flex items-center justify-center rounded-full ring-2 ring-white font-medium ${
          dim ? "t-dim" : "t-ink"
        }`}
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {person.initial}
      </span>
      {confirmed && (
        <span className="t-accent-bg absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full ring-2 ring-white"
              style={{ width: size * 0.5, height: size * 0.5 }}>
          <Ph name="ph-check ph-bold" style={{ fontSize: size * 0.3, color: "#fff" }} />
        </span>
      )}
      {pending && (
        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-amber-400 ring-2 ring-white pulse-dot"
              style={{ width: size * 0.5, height: size * 0.5 }}>
          <Ph name="ph-dots-three ph-bold" style={{ fontSize: size * 0.3, color: "#fff" }} />
        </span>
      )}
    </span>
  );
}

function SectionLabel({ children, className = "" }) {
  return (
    <div className={`t-muted text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  STATUS BAR
 * ------------------------------------------------------------------ */
function StatusBar() {
  return (
    <div className="t-text flex items-center justify-between px-7 pt-3.5 pb-1.5 shrink-0">
      <span className="font-mono text-[15px] font-medium tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5 text-[15px]">
        <Ph name="ph-cell-signal-full ph-fill" />
        <Ph name="ph-wifi-high ph-fill" />
        <Ph name="ph-battery-full ph-fill" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  MOOD CHIPS  (optional, skippable)
 * ------------------------------------------------------------------ */
function MoodRow({ mood, setMood }) {
  return (
    <div className="px-5 pt-1">
      <div className="flex items-center justify-between mb-2.5">
        <SectionLabel>这周心情</SectionLabel>
        <span className="t-faint text-[11px] font-medium">可跳过</span>
      </div>
      <div className="flex gap-2">
        {MOODS.map((m) => {
          const on = mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMood(on ? null : m.id)}
              className={`press flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium ${
                on
                  ? "t-accent-bd t-accent-bg shadow-[0_6px_16px_-6px_var(--accent-shadow)]"
                  : "t-border t-card t-text3"
              }`}
            >
              <Ph name={m.icon} style={{ fontSize: 16 }} />
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  STATION CARD
 * ------------------------------------------------------------------ */
function StationCard({ index, time, station, alt, onSwap, locked, delay }) {
  return (
    <div className="drop" style={{ animationDelay: `${delay}ms` }}>
      <SectionLabel className="ml-1.5 mb-2">
        第 {index + 1} 站 · {station.leadIn}
      </SectionLabel>
      <div
        className={`relative rounded-[2rem] border t-card p-5 ${locked ? "t-accent-soft-bd" : "t-border"}`}
        style={{ boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="t-text font-mono text-[22px] font-medium tracking-tight">{time}</span>
            <span className="t-chip t-text3 rounded-full px-2 py-0.5 font-mono text-[11px]">{alt.kind}</span>
          </div>
          {locked ? (
            <span className="t-accent-soft t-accent-text inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
              <Ph name="ph-lock-simple ph-fill" style={{ fontSize: 12 }} /> 定了
            </span>
          ) : (
            <button
              onClick={onSwap}
              aria-label="换这一站"
              className="press swap-hover t-border t-card t-text3 group flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[12px] font-medium"
            >
              <Ph name="ph-arrows-clockwise" style={{ fontSize: 14 }} /> 换
            </button>
          )}
        </div>

        <h3 className="t-text mt-3 text-[19px] font-semibold tracking-tight">{alt.title}</h3>

        <div className="t-text3 mt-1.5 flex items-center gap-1.5 text-[14px]">
          <Ph name="ph-map-pin ph-fill" style={{ fontSize: 15, color: "var(--accent)" }} />
          <span className="t-text2 font-medium">{alt.venue}</span>
          <span className="t-faint">·</span>
          <span>{alt.area}</span>
        </div>

        <div className="t-subtle mt-3.5 flex items-start gap-2 rounded-2xl px-3.5 py-2.5">
          <Ph name="ph-lightbulb" style={{ fontSize: 15, color: "var(--muted)", marginTop: 1 }} />
          <p className="t-text3 text-[13px] leading-snug">{alt.note}</p>
          {alt.price > 0 && (
            <span className="t-text3 ml-auto shrink-0 font-mono text-[13px] font-medium">${alt.price}</span>
          )}
        </div>
      </div>

      {station.driveToNext && (
        <div className="flex items-center gap-2.5 pl-7 py-2.5">
          <div className="flex flex-col items-center">
            <span className="t-hair-bg h-1 w-1 rounded-full" />
            <span className="my-0.5 h-3.5 w-px" style={{ borderLeft: "1px dashed var(--hair)" }} />
            <span className="t-hair-bg h-1 w-1 rounded-full" />
          </div>
          <div className="t-muted flex items-center gap-1.5 text-[12px]">
            <Ph name="ph-car-profile" style={{ fontSize: 15 }} />
            <span className="font-mono">{station.driveToNext.time}</span>
            <span className="t-faint">·</span>
            <span className="font-mono">{station.driveToNext.dist}</span>
            <span className="t-faint">到下一站</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  HOME ORIGIN  ·  "从家出发" start point (base location)
 * ------------------------------------------------------------------ */
function HomeOrigin({ reg, address, onEdit, delay }) {
  return (
    <div className="drop" style={{ animationDelay: `${delay}ms` }}>
      <SectionLabel className="ml-1.5 mb-2">从这里出发</SectionLabel>
      <button
        onClick={onEdit}
        className="press t-card t-border flex w-full items-center gap-3 rounded-[1.5rem] border p-4 text-left"
        style={{ boxShadow: "0 12px 28px -18px rgba(0,0,0,0.08)" }}
      >
        <span className="t-accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
          <Ph name="ph-house-line ph-fill" style={{ fontSize: 19, color: "var(--accent)" }} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="t-text text-[15px] font-semibold tracking-tight">从家出发</div>
          <div className="t-text3 truncate text-[13px]">{address} · {reg.name}</div>
        </div>
        <Ph name="ph-pencil-simple" style={{ fontSize: 15, color: "var(--muted)" }} />
      </button>
      <div className="flex items-center gap-2.5 pl-7 py-2.5">
        <div className="flex flex-col items-center">
          <span className="t-hair-bg h-1 w-1 rounded-full" />
          <span className="my-0.5 h-3.5 w-px" style={{ borderLeft: "1px dashed var(--hair)" }} />
          <span className="t-hair-bg h-1 w-1 rounded-full" />
        </div>
        <div className="t-muted flex items-center gap-1.5 text-[12px]">
          <Ph name="ph-car-profile" style={{ fontSize: 15 }} />
          <span className="font-mono">{reg.fromHome.time}</span>
          <span className="t-faint">·</span>
          <span className="font-mono">{reg.fromHome.dist}</span>
          <span className="t-faint">到第一站</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  META FOOTER  ·  proves this is an executable plan
 * ------------------------------------------------------------------ */
function MetaFooter({ total, region, delay }) {
  const items = [
    { icon: "ph-sun",            label: region.weather, value: region.temp },
    { icon: "ph-wallet",         label: "整场预算", value: `$${total}` },
    { icon: "ph-path",           label: "总距离",  value: region.dist },
    { icon: "ph-steering-wheel", label: "车程合计", value: region.drive },
  ];
  return (
    <div className="drop px-1" style={{ animationDelay: `${delay}ms` }}>
      <SectionLabel className="ml-1.5 mb-2">这趟整体</SectionLabel>
      <div
        className="t-border t-hair-bg grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border"
        style={{ boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}
      >
        {items.map((it) => (
          <div key={it.label} className="t-card flex items-center gap-3 px-4 py-3.5">
            <Ph name={it.icon} style={{ fontSize: 19, color: "var(--text3)" }} />
            <div className="leading-tight">
              <div className="t-muted text-[11px]">{it.label}</div>
              <div className="t-text font-mono text-[15px] font-medium">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  SWAP SHEET  ·  horizontal swipe through pre-sorted alternates
 * ------------------------------------------------------------------ */
function SwapSheet({ station, stationTime, current, onApply, onClose }) {
  const [temp, setTemp] = useState(current);
  const trackRef = useRef(null);

  const scrollTo = useCallback((i) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i];
    if (card) track.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // jump to the current pick without animation on open
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[current];
    if (card) track.scrollLeft = card.offsetLeft - 20;
  }, []); // eslint-disable-line

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestD = Infinity;
    Array.from(track.children).forEach((c, i) => {
      const cc = c.offsetLeft + c.clientWidth / 2;
      const d = Math.abs(cc - center);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== temp) setTemp(best);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <div className="scrim-in t-scrim absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
      <div className="sheet-in t-bg relative rounded-t-[2rem] pb-7 pt-2.5 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="t-hair-bg mx-auto mb-3 h-1 w-9 rounded-full" />

        <div className="flex items-center justify-between px-5">
          <div>
            <SectionLabel>换这一站 · {stationTime}</SectionLabel>
            <div className="t-text mt-0.5 text-[15px] font-semibold tracking-tight">横滑挑一个,其他站不动</div>
          </div>
          <button onClick={onClose} className="press t-chip t-text3 flex h-8 w-8 items-center justify-center rounded-full">
            <Ph name="ph-x ph-bold" style={{ fontSize: 15 }} />
          </button>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-sb snap-x mt-4 flex gap-3 overflow-x-auto px-5 pb-1"
        >
          {station.alts.map((a, i) => {
            const on = temp === i;
            const isCurrent = current === i;
            return (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`snap-c t-card relative flex w-[78%] shrink-0 flex-col rounded-[1.75rem] border p-5 text-left transition-all duration-200 ${
                  on ? "t-accent-bd shadow-[0_18px_36px_-16px_var(--accent-shadow)]" : "t-border opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="t-chip t-text3 rounded-full px-2 py-0.5 font-mono text-[11px]">{a.kind}</span>
                  {isCurrent && <span className="t-muted font-mono text-[11px] font-medium">当前</span>}
                </div>
                <h4 className="t-text mt-3 text-[18px] font-semibold tracking-tight">{a.title}</h4>
                <div className="t-text3 mt-1.5 flex items-center gap-1.5 text-[13px]">
                  <Ph name="ph-map-pin ph-fill" style={{ fontSize: 14, color: "var(--accent)" }} />
                  <span className="t-text2 font-medium">{a.venue}</span>
                  <span className="t-faint">·</span>
                  <span>{a.area}</span>
                </div>
                <p className="t-text3 mt-3 text-[13px] leading-snug">{a.note}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="t-text3 font-mono text-[13px]">{a.price > 0 ? `$${a.price}` : "免费"}</span>
                  {on && (
                    <span className="t-accent-soft t-accent-text inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                      <Ph name="ph-check ph-bold" style={{ fontSize: 11 }} /> 选中
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {station.alts.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${temp === i ? "w-5 t-accent-bg" : "w-1.5 t-hair-bg"}`} />
          ))}
        </div>

        <div className="mt-4 px-5">
          <button
            onClick={() => onApply(temp)}
            className="press t-ink w-full rounded-2xl py-4 text-[15px] font-semibold shadow-[0_14px_28px_-12px_rgba(0,0,0,0.5)]"
          >
            {temp === current ? "就用这个" : "换成这个"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  COMMIT / 承诺 AREA  (bottom)  —  carries dual-confirm status
 * ------------------------------------------------------------------ */
function CommitBar({ status, regen, onCommit, onNudge, onReset }) {
  return (
    <div className="t-border t-bar shrink-0 border-t px-5 pb-7 pt-4 backdrop-blur-xl">
      {/* dual-confirm strip */}
      <div className="mb-3.5 flex items-center gap-2.5">
        <div className="flex -space-x-2">
          <Avatar person={ME} size={28} confirmed={status !== "pending"} dim={status === "pending"} />
          <Avatar person={PARTNER} size={28}
                  confirmed={status === "both"}
                  pending={status === "mine"}
                  dim={status === "pending"} />
        </div>
        <div className="leading-tight">
          {status === "pending" && (
            <p className="t-muted text-[13px] font-medium">{ME.name} 和 {PARTNER.name} 都还没点头</p>
          )}
          {status === "mine" && (
            <p className="t-text2 text-[13px] font-medium">你已确认 · 等 <span className="t-accent-text">{PARTNER.name}</span> 确认</p>
          )}
          {status === "both" && (
            <p className="t-accent-text text-[13px] font-semibold">两个人都确认了 · 周六见</p>
          )}
        </div>
        {status === "mine" && (
          <button onClick={onReset} className="press t-muted ml-auto text-[12px] font-medium">撤回</button>
        )}
      </div>

      {status === "pending" && (
        <div className="flex gap-3">
          <button
            onClick={onCommit}
            className="press t-accent-bg flex-1 rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)]"
          >
            就这个了
          </button>
          <button
            onClick={regen.run}
            disabled={regen.left === 0}
            className="press t-border t-card t-text3 flex items-center gap-2 rounded-2xl border px-4 py-4 text-[14px] font-medium disabled:opacity-40"
          >
            <Ph name="ph-shuffle" style={{ fontSize: 17 }} />
            <span className="flex flex-col items-start leading-none">
              <span>换一个</span>
              <span className="t-muted mt-0.5 font-mono text-[11px]">{regen.left}/3</span>
            </span>
          </button>
        </div>
      )}

      {status === "mine" && (
        <button
          onClick={onNudge}
          className="press t-accent-soft-bd t-accent-soft t-accent-text flex w-full items-center justify-center gap-2 rounded-2xl border py-4 text-[15px] font-semibold"
        >
          <Ph name="ph-hand-waving" style={{ fontSize: 18 }} /> 戳 {PARTNER.name} 一下
        </button>
      )}

      {status === "both" && (
        <button
          className="press t-ink flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold"
        >
          <Ph name="ph-calendar-check" style={{ fontSize: 18 }} /> 加进两个人的日历
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  CONFIRMED BANNER  (states 3 & 4, top of scroll area)
 * ------------------------------------------------------------------ */
function ConfirmBanner({ status }) {
  if (status === "mine") {
    return (
      <div className="drop t-warn t-warn-bd mx-5 mt-1 flex items-center gap-3 rounded-[1.5rem] border px-4 py-3.5">
        <Ph name="ph-hourglass-medium" style={{ fontSize: 20, color: "var(--warn-icon)" }} />
        <div className="leading-tight">
          <p className="t-warn-title text-[14px] font-semibold tracking-tight">已发给 {PARTNER.name}</p>
          <p className="t-warn-body text-[12px]">{PARTNER.name} 点头后,这周六就锁定了</p>
        </div>
      </div>
    );
  }
  if (status === "both") {
    return (
      <div className="drop t-accent-soft t-accent-soft-bd mx-5 mt-1 flex items-center gap-3 rounded-[1.5rem] border px-4 py-3.5">
        <span className="seal-pop t-accent-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Ph name="ph-check ph-bold" style={{ fontSize: 20, color: "#fff" }} />
        </span>
        <div className="leading-tight">
          <p className="t-accent-strong text-[15px] font-semibold tracking-tight">周六见,就这么定了</p>
          <p className="t-accent-text text-[12px]">出发前一晚我们会再提醒你们一次</p>
        </div>
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ *
 *  THE SCREEN
 * ------------------------------------------------------------------ */
function DateDropScreen({ status, setStatus, swapId, setSwapId, picks, setPicks, regen, mood, setMood, region, setRegion, baseRegion, baseAddress, setBaseRegion, setBaseAddress }) {
  const [locOpen, setLocOpen] = useState(false);
  const reg = window.findRegion(region);
  const stations = reg.stations;
  const commit = () => setStatus("mine");
  const reset  = () => setStatus("pending");
  const locked = status === "both";

  const total = stations.reduce((s, st, i) => s + st.alts[picks[i]].price, 0);

  const applySwap = (i, alt) => {
    setPicks((p) => { const n = [...p]; n[i] = alt; return n; });
    setSwapId(null);
  };

  const swapIndex = swapId == null ? -1 : swapId;

  return (
    <div className="t-bg relative flex h-full flex-col">
      <StatusBar />

      <div className="no-sb flex-1 overflow-y-auto pb-4">
        {/* header */}
        <div className="px-5 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <SectionLabel>DateDrop · 第 24 周</SectionLabel>
            <span className="t-accent-bg inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
              <Ph name="ph-sparkle ph-fill" style={{ fontSize: 11 }} /> 本周已送达
            </span>
          </div>
          <h1 className="t-text mt-2.5 text-[28px] font-semibold leading-[1.1] tracking-tight" style={{ textWrap: "balance" }}>
            这周六,<br />给你俩排好了
          </h1>
          <div className="t-muted mt-2 flex items-center gap-1.5 text-[13px]">
            <Ph name="ph-calendar-blank" style={{ fontSize: 14 }} />
            <span className="font-mono">6 月 14 日 · 周六</span>
            <span className="t-faint">·</span>
            {locked ? (
              <span className="t-text3 font-medium">{reg.name}</span>
            ) : (
              <button onClick={() => setLocOpen(true)}
                      className="press t-text3 inline-flex items-center gap-1 font-medium">
                <Ph name="ph-map-pin ph-fill" style={{ fontSize: 13, color: "var(--accent)" }} />
                {reg.name}
                <Ph name="ph-caret-down" style={{ fontSize: 11 }} />
              </button>
            )}
          </div>
        </div>

        <ConfirmBanner status={status} />

        {status === "pending" && <MoodRow mood={mood} setMood={setMood} />}

        {/* timeline */}
        <div className="space-y-1 px-5 pt-5">
          {region === baseRegion && baseAddress && reg.fromHome && !locked && (
            <HomeOrigin reg={reg} address={baseAddress} delay={0} onEdit={() => setLocOpen(true)} />
          )}
          {stations.map((st, i) => (
            <StationCard
              key={region + "-" + i}
              index={i}
              time={st.time}
              station={st}
              alt={st.alts[picks[i]]}
              locked={locked}
              delay={i * 80}
              onSwap={() => setSwapId(i)}
            />
          ))}
        </div>

        <div className="px-5 pt-2">
          <MetaFooter total={total} region={reg} delay={stations.length * 80} />
        </div>
      </div>

      <CommitBar
        status={status}
        regen={regen}
        onCommit={commit}
        onReset={reset}
        onNudge={() => setStatus("both")}
      />

      {swapIndex >= 0 && (
        <SwapSheet
          station={stations[swapIndex]}
          stationTime={stations[swapIndex].time}
          current={picks[swapIndex]}
          onApply={(alt) => applySwap(swapIndex, alt)}
          onClose={() => setSwapId(null)}
        />
      )}
      {locOpen && window.LocationSheet && (
        <window.LocationSheet
          region={region}
          baseRegion={baseRegion}
          baseAddress={baseAddress}
          setBaseRegion={setBaseRegion}
          setBaseAddress={setBaseAddress}
          onApply={(id) => { setLocOpen(false); if (id !== region) setRegion(id); }}
          onClose={() => setLocOpen(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  THEME SWITCHER  (presentation chrome, outside the phone)
 * ------------------------------------------------------------------ */
function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="mr-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">主题</span>
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={t.name}
            className="press flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[12px] font-medium transition-colors"
            style={{
              borderColor: on ? t.accent : "rgba(212,212,216,0.9)",
              background: on ? "#fff" : "rgba(255,255,255,0.6)",
              color: on ? "#27272a" : "#71717a",
              boxShadow: on ? `0 4px 14px -6px ${t.accent}66` : "none",
            }}
          >
            <span
              className="relative inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full"
              style={{ background: t.bg, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.accent }} />
            </span>
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  PHONE FRAME + CANVAS + STATE TABS
 * ------------------------------------------------------------------ */
const TABS = [
  { id: "pending", label: "待确认" },
  { id: "swap",    label: "换站浮层" },
  { id: "mine",    label: "我已确认·等TA" },
  { id: "both",    label: "双方已确认" },
];

function App() {
  const [mode, setMode]     = useState("login"); // login | plan
  const [loginStep, setLoginStep] = useState("welcome");
  const [status, setStatus] = useState("pending"); // pending | mine | both
  const [swapId, setSwapId] = useState(null);
  const [picks, setPicks]   = useState([0, 0, 0]);
  const [left, setLeft]     = useState(3);
  const [mood, setMood]     = useState(null);
  const [scale, setScale]   = useState(1);
  const [region, setRegionRaw] = useState("sf");
  const [baseRegion, setBaseRegion] = useState("sf");
  const [baseAddress, setBaseAddress] = useState("Valencia St · Mission");
  const [theme, setThemeRaw] = useState(() => {
    try { return localStorage.getItem("datedrop-theme") || "rose"; } catch (e) { return "rose"; }
  });

  const setTheme = (id) => {
    setThemeRaw(id);
    try { localStorage.setItem("datedrop-theme", id); } catch (e) {}
  };

  // which tab is conceptually active
  const activeTab = mode === "login" ? loginStep : (swapId != null ? "swap" : status);
  const LOGIN_TABS = window.LOGIN_TABS || [];

  const selectTab = (id) => {
    if (mode === "login") { setLoginStep(id); return; }
    if (id === "swap") { setStatus("pending"); setSwapId(0); return; }
    setSwapId(null);
    setStatus(id);
  };

  const changeRegion = (id) => { setRegionRaw(id); setPicks([0, 0, 0]); setLeft(3); setSwapId(null); };
  const enterPlan = () => { setMode("plan"); setSwapId(null); setStatus("pending"); setPicks([0, 0, 0]); setLeft(3); setRegionRaw(baseRegion); };

  const regen = {
    left,
    run: () => {
      if (left === 0) return;
      const st = window.findRegion(region).stations;
      setPicks((p) => p.map((v, i) => (v + 1) % st[i].alts.length));
      setLeft((l) => Math.max(0, l - 1));
    },
  };

  // fit phone to viewport height
  useEffect(() => {
    const fit = () => {
      const avail = window.innerHeight - 236;
      setScale(Math.min(1, Math.max(0.58, avail / 844)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#e7e7ea] flex flex-col items-center">
      {/* presentation chrome */}
      <div className="sticky top-0 z-10 w-full bg-[#e7e7ea]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2.5 px-4 pt-4 pb-3">
          {/* mode switch: 登录 / 计划 */}
          <div className="flex rounded-full border border-zinc-300 bg-white/70 p-1">
            {[{ id: "login", label: "登录流程" }, { id: "plan", label: "本周计划" }].map((m) => {
              const on = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`press rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                    on ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(mode === "login" ? LOGIN_TABS : TABS).map((t) => {
              const on = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`press rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors ${
                    on
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 bg-white/70 text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </div>
      </div>

      {/* phone */}
      <div className="flex flex-1 items-start justify-center pb-10" style={{ paddingTop: 4 }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <div
            className="relative bg-zinc-900 p-[10px]"
            style={{ width: 390 + 20, borderRadius: 56, boxShadow: "0 50px 90px -30px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.6)" }}
          >
            <div
              data-theme={theme}
              className="theme-anim t-bg relative overflow-hidden"
              style={{ width: 390, height: 844, borderRadius: 46 }}
            >
              {/* dynamic island */}
              <div className="absolute left-1/2 top-2.5 z-40 h-[26px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
              {mode === "login"
                ? <window.LoginFlow step={loginStep} setStep={setLoginStep} onEnterPlan={enterPlan} baseRegion={baseRegion} setBaseRegion={setBaseRegion} baseAddress={baseAddress} setBaseAddress={setBaseAddress} />
                : (
                  <DateDropScreen
                    status={status}
                    setStatus={setStatus}
                    swapId={swapId}
                    setSwapId={setSwapId}
                    picks={picks}
                    setPicks={setPicks}
                    regen={regen}
                    mood={mood}
                    setMood={setMood}
                    region={region}
                    setRegion={changeRegion}
                    baseRegion={baseRegion}
                    baseAddress={baseAddress}
                    setBaseRegion={setBaseRegion}
                    setBaseAddress={setBaseAddress}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
