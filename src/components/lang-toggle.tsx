"use client";

import { useLang } from "@/components/lang-provider";
import type { Lang } from "@/lib/dict";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-zinc-200 bg-white p-0.5 text-[11px] font-medium">
      {(["zh", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => l !== lang && setLang(l)}
          className={`rounded-full px-2 py-0.5 transition ${
            lang === l ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {l === "zh" ? "中" : "EN"}
        </button>
      ))}
    </div>
  );
}
