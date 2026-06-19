"use client";

import { useState } from "react";
import { useLang } from "@/components/lang-provider";
import { t } from "@/lib/dict";
import type { Theme } from "@/lib/theme";

const SWATCHES: { id: Theme; bg: string; accent: string }[] = [
  { id: "rose", bg: "#fafafa", accent: "#e11d48" },
  { id: "sand", bg: "#faf7f2", accent: "#c2410c" },
  { id: "sage", bg: "#f4f8f5", accent: "#047857" },
  { id: "midnight", bg: "#16161a", accent: "#f43f5e" },
];

export function ThemeSwitcher() {
  const { lang } = useLang();
  const [cur, setCur] = useState<string>(() =>
    typeof document !== "undefined"
      ? document.documentElement.dataset.theme || "rose"
      : "rose"
  );

  function pick(id: Theme) {
    const el = document.documentElement;
    el.dataset.theme = id;
    el.style.colorScheme = id === "midnight" ? "dark" : "light";
    document.cookie = `theme=${id}; path=/; max-age=31536000; samesite=lax`;
    setCur(id);
  }

  return (
    <div className="flex gap-3">
      {SWATCHES.map((s) => {
        const on = cur === s.id;
        return (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            aria-label={t(lang, `theme.${s.id}`)}
            className="flex flex-col items-center gap-1.5 active:scale-[0.96]"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition"
              style={{
                background: s.bg,
                borderColor: on ? s.accent : "transparent",
                boxShadow: on ? `0 6px 16px -6px ${s.accent}66` : "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              <span className="h-4 w-4 rounded-full" style={{ background: s.accent }} />
            </span>
            <span className={`text-[11px] font-medium ${on ? "text-zinc-800" : "text-zinc-400"}`}>
              {t(lang, `theme.${s.id}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
