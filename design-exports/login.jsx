/* global React */
/* DateDrop · 登录 + 情侣配对流程
 * Wrapped in an IIFE so its local primitives never collide with app.jsx.
 * Exports window.LoginFlow + window.LOGIN_TABS.
 */
(function () {
  const { useState, useEffect, useRef } = React;

  const ME = { name: "江野", initial: "野" };

  /* ---------- local primitives (isolated) ---------- */
  function Ph({ name, className = "", style }) {
    return <i className={`ph ${name} ${className}`} style={style} />;
  }
  function SectionLabel({ children, className = "" }) {
    return (
      <div className={`t-muted text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>
        {children}
      </div>
    );
  }
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

  /* ---------- wordmark ---------- */
  function Wordmark({ size = 17 }) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="t-accent-bg flex items-center justify-center rounded-[9px]"
              style={{ width: size + 9, height: size + 9 }}>
          <Ph name="ph-heart ph-fill" style={{ fontSize: size - 1, color: "#fff" }} />
        </span>
        <span className="t-text font-semibold tracking-tight" style={{ fontSize: size }}>DateDrop</span>
      </div>
    );
  }

  function Header({ step, onBack }) {
    const total = 3;
    return (
      <div className="flex items-center justify-between px-5 pt-1 pb-2">
        <button onClick={onBack}
                className="press t-chip t-text3 flex h-9 w-9 items-center justify-center rounded-full">
          <Ph name="ph-arrow-left ph-bold" style={{ fontSize: 16 }} />
        </button>
        {step > 0 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i < step ? "w-6 t-accent-bg" : "w-1.5 t-hair-bg"
                    }`} />
            ))}
          </div>
        )}
        <span className="w-9" />
      </div>
    );
  }

  /* ================================================================ *
   *  STEP 0 · WELCOME / 落地页
   * ================================================================ */
  function Welcome({ go }) {
    const preview = [
      { t: "14:30", v: "Urban Putt", a: "Mission" },
      { t: "17:00", v: "Lands End Trail", a: "Outer Richmond" },
      { t: "19:30", v: "Ferry Building", a: "Embarcadero" },
    ];
    return (
      <div className="flex h-full flex-col">
        <StatusBar />
        <div className="no-sb flex-1 overflow-y-auto px-6 pt-3">
          <div className="drop" style={{ animationDelay: "40ms" }}>
            <Wordmark />
          </div>

          <h1 className="drop t-text mt-9 text-[34px] font-semibold leading-[1.08] tracking-tight"
              style={{ animationDelay: "90ms", textWrap: "balance" }}>
            约会这件事,<br />交给我们排
          </h1>
          <p className="drop t-text3 mt-3.5 text-[15px] leading-relaxed" style={{ animationDelay: "150ms" }}>
            每周四,给你和 TA 推一份排好的周六计划。<br />你们只管否决和微调,不用从头做攻略。
          </p>

          {/* teaser card — a peek at what arrives */}
          <div className="drop t-card t-border mt-7 rounded-[2rem] border p-5"
               style={{ animationDelay: "220ms", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between">
              <SectionLabel>本周六 · 旧金山</SectionLabel>
              <span className="t-accent-soft t-accent-text inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Ph name="ph-sparkle ph-fill" style={{ fontSize: 10 }} /> 已排好
              </span>
            </div>
            <div className="mt-3.5 space-y-3">
              {preview.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="t-text font-mono text-[14px] font-medium tracking-tight">{p.t}</span>
                  <span className="t-hair-bg h-1 w-1 shrink-0 rounded-full" />
                  <span className="t-text2 text-[14px] font-medium">{p.v}</span>
                  <span className="t-faint ml-auto text-[12px]">{p.a}</span>
                </div>
              ))}
            </div>
            <div className="t-hair-bg my-4 h-px" />
            <div className="flex items-center justify-between">
              {[
                { icon: "ph-sun", v: "18°C" },
                { icon: "ph-wallet", v: "$74" },
                { icon: "ph-path", v: "14 mi" },
                { icon: "ph-steering-wheel", v: "38 min" },
              ].map((m) => (
                <div key={m.icon} className="t-text3 flex items-center gap-1.5 text-[12px]">
                  <Ph name={m.icon} style={{ fontSize: 15, color: "var(--muted)" }} />
                  <span className="font-mono">{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 pb-8 pt-3">
          <button onClick={() => go("identify")}
                  className="press t-accent-bg w-full rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)]">
            创建情侣账号
          </button>
          <button onClick={() => go("identify")}
                  className="press t-text2 mt-1 w-full rounded-2xl py-3 text-[14px] font-medium">
            已经有账号了 · 登录
          </button>
          <p className="t-faint mt-2 text-center text-[11px] leading-relaxed">
            继续即代表同意 <span className="t-text3 underline underline-offset-2">服务条款</span> 与 <span className="t-text3 underline underline-offset-2">隐私政策</span>
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================ *
   *  STEP 1 · IDENTIFY / 手机号 · 邮箱 · Apple
   * ================================================================ */
  function Identify({ go, back }) {
    const [method, setMethod] = useState("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const valid = method === "phone" ? phone.replace(/\D/g, "").length >= 10 : /.+@.+\..+/.test(email);

    const fmtPhone = (raw) => {
      const d = raw.replace(/\D/g, "").slice(0, 10);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    };

    return (
      <div className="flex h-full flex-col">
        <StatusBar />
        <Header step={1} onBack={back} />
        <div className="no-sb flex-1 overflow-y-auto px-6 pt-2">
          <SectionLabel className="drop">第 1 步 · 共 3 步</SectionLabel>
          <h2 className="drop t-text mt-2 text-[26px] font-semibold leading-tight tracking-tight"
              style={{ animationDelay: "60ms" }}>
            先验证一下<br />是你本人
          </h2>

          {/* method switch */}
          <div className="drop t-chip mt-6 flex rounded-2xl p-1" style={{ animationDelay: "110ms" }}>
            {[
              { id: "phone", label: "手机号", icon: "ph-device-mobile" },
              { id: "email", label: "邮箱", icon: "ph-envelope-simple" },
            ].map((m) => {
              const on = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)}
                        className={`press flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[14px] font-medium transition-all ${
                          on ? "t-card t-text shadow-sm" : "t-text3"
                        }`}>
                  <Ph name={m.icon} style={{ fontSize: 16 }} /> {m.label}
                </button>
              );
            })}
          </div>

          {/* input */}
          <div className="drop mt-4" style={{ animationDelay: "150ms" }}>
            {method === "phone" ? (
              <div className="t-card t-border flex items-center gap-2 rounded-2xl border px-3 py-1">
                <button className="t-subtle t-text2 flex items-center gap-1 rounded-xl px-3 py-2.5 text-[14px] font-medium">
                  <span className="font-mono">US +1</span>
                  <Ph name="ph-caret-down" style={{ fontSize: 12 }} />
                </button>
                <input
                  value={phone}
                  onChange={(e) => setPhone(fmtPhone(e.target.value))}
                  inputMode="numeric"
                  placeholder="(415) 555-0142"
                  className="t-text w-full bg-transparent py-3 font-mono text-[17px] tracking-tight outline-none placeholder:text-[var(--faint)]"
                />
              </div>
            ) : (
              <div className="t-card t-border flex items-center gap-2 rounded-2xl border px-4">
                <Ph name="ph-envelope-simple" style={{ fontSize: 18, color: "var(--muted)" }} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  placeholder="you@example.com"
                  className="t-text w-full bg-transparent py-3.5 text-[16px] outline-none placeholder:text-[var(--faint)]"
                />
              </div>
            )}
            <p className="t-muted mt-2.5 flex items-center gap-1.5 pl-1 text-[12px]">
              <Ph name="ph-shield-check" style={{ fontSize: 14 }} />
              {method === "phone" ? "我们会发一条验证码短信,不会推广营销。" : "我们会发一封带登录链接的邮件。"}
            </p>
          </div>
        </div>

        <div className="shrink-0 px-6 pb-8 pt-3">
          <button
            onClick={() => valid && go("code", { method, contact: method === "phone" ? `+1 ${phone}` : email })}
            disabled={!valid}
            className="press t-accent-bg w-full rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)] disabled:opacity-40 disabled:shadow-none">
            {method === "phone" ? "发送验证码" : "发送登录链接"}
          </button>

          <div className="my-3 flex items-center gap-3">
            <span className="t-hair-bg h-px flex-1" />
            <span className="t-muted text-[12px]">或</span>
            <span className="t-hair-bg h-px flex-1" />
          </div>

          <button onClick={() => go("pair")}
                  className="press t-ink flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold">
            <Ph name="ph-apple-logo ph-fill" style={{ fontSize: 18 }} /> 通过 Apple 继续
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ *
   *  STEP 2 · OTP CODE
   * ================================================================ */
  function CodeStep({ go, back, contact }) {
    const [code, setCode] = useState("");
    const [secs, setSecs] = useState(42);
    const inputRef = useRef(null);
    const len = 6;

    useEffect(() => {
      const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(id);
    }, []);
    useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);
    useEffect(() => { if (code.length === len) { const t = setTimeout(() => go("pair"), 350); return () => clearTimeout(t); } }, [code]);

    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");

    return (
      <div className="flex h-full flex-col">
        <StatusBar />
        <Header step={2} onBack={back} />
        <div className="no-sb flex-1 overflow-y-auto px-6 pt-2">
          <SectionLabel className="drop">第 2 步 · 共 3 步</SectionLabel>
          <h2 className="drop t-text mt-2 text-[26px] font-semibold leading-tight tracking-tight"
              style={{ animationDelay: "60ms" }}>
            输入验证码
          </h2>
          <p className="drop t-text3 mt-2.5 text-[14px]" style={{ animationDelay: "100ms" }}>
            已发送至 <span className="t-text2 font-mono font-medium">{contact || "+1 (415) 555-0142"}</span>
            <button onClick={back} className="t-accent-text ml-1.5 font-medium">改</button>
          </p>

          {/* OTP cells */}
          <div className="drop relative mt-7" style={{ animationDelay: "150ms" }}
               onClick={() => inputRef.current && inputRef.current.focus()}>
            <div className="flex justify-between gap-2">
              {Array.from({ length: len }).map((_, i) => {
                const ch = code[i];
                const active = i === code.length;
                return (
                  <div key={i}
                       className={`flex h-[58px] flex-1 items-center justify-center rounded-2xl border t-card transition-all ${
                         ch ? "t-accent-bd" : active ? "t-accent-bd" : "t-border"
                       }`}
                       style={ch || active ? { boxShadow: "0 0 0 3px var(--accent-soft)" } : undefined}>
                    {ch
                      ? <span className="t-text font-mono text-[24px] font-medium">{ch}</span>
                      : active
                        ? <span className="t-accent-bg h-5 w-px animate-pulse" />
                        : null}
                  </div>
                );
              })}
            </div>
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, len))}
              inputMode="numeric"
              className="absolute inset-0 h-full w-full cursor-default opacity-0"
            />
          </div>

          <div className="mt-5 flex items-center justify-center">
            {secs > 0 ? (
              <span className="t-muted text-[13px]">
                没收到? <span className="t-text3 font-mono">{mm}:{ss}</span> 后可重发
              </span>
            ) : (
              <button onClick={() => setSecs(42)} className="t-accent-text text-[13px] font-semibold">重新发送验证码</button>
            )}
          </div>

          <button onClick={() => setCode("8421")}
                  className="t-faint mx-auto mt-6 block text-[11px] underline underline-offset-2">
            演示:自动填一部分
          </button>
        </div>

        <div className="shrink-0 px-6 pb-8 pt-3">
          <button
            onClick={() => go("pair")}
            disabled={code.length < len}
            className="press t-accent-bg w-full rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)] disabled:opacity-40 disabled:shadow-none">
            验证并继续
          </button>
        </div>
      </div>
    );
  }

  /* ---------- pairing visual: you — connector — partner slot ---------- */
  function PairLink({ accepted }) {
    return (
      <div className="flex items-center justify-center gap-1 py-2">
        {/* you */}
        <div className="flex flex-col items-center gap-2">
          <span className="t-ink flex h-[60px] w-[60px] items-center justify-center rounded-full text-[22px] font-medium ring-2 ring-white">
            {ME.initial}
          </span>
          <span className="t-text2 text-[12px] font-medium">{ME.name}</span>
        </div>
        {/* connector */}
        <div className="flex flex-1 flex-col items-center px-1">
          <div className="flex w-full items-center">
            <span className={`h-px flex-1 ${accepted ? "t-accent-bg" : "t-hair-bg"}`}
                  style={accepted ? undefined : { borderTop: "2px dashed var(--hair)", height: 0 }} />
            <Ph name={accepted ? "ph-heart ph-fill" : "ph-heart"}
                style={{ fontSize: 18, color: accepted ? "var(--accent)" : "var(--faint)", margin: "0 4px" }} />
            <span className={`h-px flex-1 ${accepted ? "t-accent-bg" : "t-hair-bg"}`}
                  style={accepted ? undefined : { borderTop: "2px dashed var(--hair)", height: 0 }} />
          </div>
        </div>
        {/* partner */}
        <div className="flex flex-col items-center gap-2">
          {accepted ? (
            <span className="seal-pop t-accent-bg flex h-[60px] w-[60px] items-center justify-center rounded-full text-[22px] font-medium text-white ring-2 ring-white">
              念
            </span>
          ) : (
            <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full ring-2 ring-white"
                  style={{ border: "2px dashed var(--faint)" }}>
              <Ph name="ph-plus" style={{ fontSize: 22, color: "var(--faint)" }} />
            </span>
          )}
          <span className={`text-[12px] font-medium ${accepted ? "t-text2" : "t-faint"}`}>
            {accepted ? "苏念" : "等 TA"}
          </span>
        </div>
      </div>
    );
  }

  /* ================================================================ *
   *  STEP 3 · PAIR (发邀请) + STEP 4 · WAITING / SUCCESS
   * ================================================================ */
  function Pair({ go, back, waiting, onEnterPlan }) {
    const [toast, setToast] = useState("");
    const [joinMode, setJoinMode] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [accepted, setAccepted] = useState(false);
    const inviteCode = "DATE-7F3K";
    const inviteLink = "datedrop.app/j/7F3K";

    const copy = (text, label) => {
      try { navigator.clipboard.writeText(text); } catch (e) {}
      setToast(label);
      setTimeout(() => setToast(""), 1600);
    };

    /* ---- waiting / success screen ---- */
    if (waiting) {
      return (
        <div className="flex h-full flex-col">
          <StatusBar />
          <Header step={3} onBack={back} />
          <div className="no-sb flex-1 overflow-y-auto px-6 pt-2">
            <SectionLabel className="drop">{accepted ? "配对成功" : "邀请已发出"}</SectionLabel>
            <h2 className="drop t-text mt-2 text-[26px] font-semibold leading-tight tracking-tight"
                style={{ animationDelay: "60ms" }}>
              {accepted ? "你们俩对上了" : "就等 TA 点开了"}
            </h2>

            <div className="drop t-card t-border mt-7 rounded-[2rem] border p-6"
                 style={{ animationDelay: "120ms", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}>
              <PairLink accepted={accepted} />
              <p className={`mt-4 text-center text-[13px] leading-relaxed ${accepted ? "t-accent-text font-medium" : "t-text3"}`}>
                {accepted
                  ? "第一份周六计划已经在路上,马上送到你们俩的手机。"
                  : "TA 接受邀请后,你们的第一份周六计划立刻开始生成。"}
              </p>
            </div>

            {!accepted && (
              <div className="drop mt-4 space-y-3" style={{ animationDelay: "180ms" }}>
                <div className="t-subtle flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <Ph name="ph-link-simple" style={{ fontSize: 18, color: "var(--muted)" }} />
                  <span className="t-text2 flex-1 truncate font-mono text-[13px]">{inviteLink}</span>
                  <button onClick={() => copy(inviteLink, "链接已复制")}
                          className="t-accent-text text-[13px] font-semibold">复制</button>
                </div>
                <button onClick={() => setAccepted(true)}
                        className="t-faint mx-auto block text-[11px] underline underline-offset-2">
                  演示:假装 TA 已接受
                </button>
              </div>
            )}
          </div>

          <div className="shrink-0 px-6 pb-8 pt-3">
            {accepted ? (
              <button onClick={() => go("location")}
                      className="press t-accent-bg flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)]">
                挑你们的活动范围 <Ph name="ph-arrow-right ph-bold" style={{ fontSize: 16 }} />
              </button>
            ) : (
              <button onClick={() => copy(inviteLink, "链接已复制")}
                      className="press t-ink flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold">
                <Ph name="ph-share-network" style={{ fontSize: 18 }} /> 再分享一次邀请
              </button>
            )}
          </div>

          {toast && (
            <div className="scrim-in pointer-events-none absolute bottom-28 left-1/2 z-50 -translate-x-1/2">
              <div className="t-ink flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium shadow-lg">
                <Ph name="ph-check ph-bold" style={{ fontSize: 12 }} /> {toast}
              </div>
            </div>
          )}
        </div>
      );
    }

    /* ---- invite screen ---- */
    return (
      <div className="flex h-full flex-col">
        <StatusBar />
        <Header step={3} onBack={back} />
        <div className="no-sb flex-1 overflow-y-auto px-6 pt-2">
          <SectionLabel className="drop">第 3 步 · 共 3 步</SectionLabel>
          <h2 className="drop t-text mt-2 text-[26px] font-semibold leading-tight tracking-tight"
              style={{ animationDelay: "60ms" }}>
            把 TA 拉进来
          </h2>
          <p className="drop t-text3 mt-2.5 text-[14px] leading-relaxed" style={{ animationDelay: "100ms" }}>
            DateDrop 是两个人的。邀请你的另一半,你们的周六计划才会开始推送。
          </p>

          <div className="drop t-card t-border mt-6 rounded-[2rem] border p-6"
               style={{ animationDelay: "150ms", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}>
            <PairLink accepted={false} />

            {!joinMode ? (
              <>
                <SectionLabel className="mt-5 text-center">你的情侣邀请码</SectionLabel>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="t-text font-mono text-[28px] font-semibold tracking-[0.12em]">{inviteCode}</span>
                  <button onClick={() => copy(inviteCode, "邀请码已复制")}
                          className="press t-subtle t-text3 flex h-8 w-8 items-center justify-center rounded-full">
                    <Ph name="ph-copy" style={{ fontSize: 15 }} />
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <SectionLabel className="mb-2">输入 TA 给你的邀请码</SectionLabel>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 9))}
                  placeholder="DATE-____"
                  className="t-subtle t-text w-full rounded-2xl px-4 py-3.5 text-center font-mono text-[20px] font-semibold tracking-[0.1em] outline-none placeholder:text-[var(--faint)]"
                />
              </div>
            )}
          </div>

          <button onClick={() => setJoinMode((v) => !v)}
                  className="t-text3 mx-auto mt-4 flex items-center gap-1.5 text-[13px] font-medium">
            <Ph name={joinMode ? "ph-arrow-u-up-left" : "ph-ticket"} style={{ fontSize: 15 }} />
            {joinMode ? "改回发出我的邀请" : "我收到了 TA 的邀请码"}
          </button>
        </div>

        <div className="shrink-0 px-6 pb-8 pt-3">
          {!joinMode ? (
            <div className="flex gap-3">
              <button onClick={() => copy(inviteLink, "链接已复制")}
                      className="press t-border t-card t-text2 flex items-center gap-2 rounded-2xl border px-4 py-4 text-[14px] font-medium">
                <Ph name="ph-link-simple" style={{ fontSize: 17 }} /> 复制链接
              </button>
              <button onClick={() => go("waiting")}
                      className="press t-accent-bg flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)]">
                <Ph name="ph-share-network" style={{ fontSize: 18 }} /> 分享邀请
              </button>
            </div>
          ) : (
            <button onClick={() => go("waiting")}
                    disabled={joinCode.replace(/[^A-Z0-9]/g, "").length < 8}
                    className="press t-accent-bg w-full rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)] disabled:opacity-40 disabled:shadow-none">
              绑定这对情侣
            </button>
          )}
          <button onClick={onEnterPlan} className="press t-muted mt-1 w-full py-3 text-[13px] font-medium">
            稍后再说,先看看计划
          </button>
        </div>

        {toast && (
          <div className="scrim-in pointer-events-none absolute bottom-28 left-1/2 z-50 -translate-x-1/2">
            <div className="t-ink flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium shadow-lg">
              <Ph name="ph-check ph-bold" style={{ fontSize: 12 }} /> {toast}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================ *
   *  FLOW ROUTER
   * ================================================================ */
  function LoginFlow({ step, setStep, onEnterPlan, baseRegion, setBaseRegion, baseAddress, setBaseAddress }) {
    const [ctx, setCtx] = useState({});
    const go = (next, data) => { if (data) setCtx((c) => ({ ...c, ...data })); setStep(next); };

    if (step === "identify") return <Identify go={go} back={() => setStep("welcome")} />;
    if (step === "code")     return <CodeStep go={go} back={() => setStep("identify")} contact={ctx.contact} />;
    if (step === "pair")     return <Pair go={go} back={() => setStep("code")} waiting={false} onEnterPlan={onEnterPlan} />;
    if (step === "waiting")  return <Pair go={go} back={() => setStep("pair")} waiting={true} onEnterPlan={onEnterPlan} />;
    if (step === "location" && window.LocationStep)
      return <window.LocationStep region={baseRegion} setRegion={setBaseRegion} address={baseAddress} setAddress={setBaseAddress} back={() => setStep("waiting")} onConfirm={onEnterPlan} />;
    return <Welcome go={go} />;
  }

  window.LoginFlow = LoginFlow;
  window.LOGIN_TABS = [
    { id: "welcome",  label: "欢迎" },
    { id: "identify", label: "登录" },
    { id: "code",     label: "验证码" },
    { id: "pair",     label: "配对·发邀请" },
    { id: "waiting",  label: "等 TA 接受" },
    { id: "location", label: "选择地点" },
  ];
})();
