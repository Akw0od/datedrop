"use client";

import { useState } from "react";
import { Check, CopySimple } from "@phosphor-icons/react";
import { useLang } from "@/components/lang-provider";
import { t } from "@/lib/dict";

export function CopyButton({ text }: { text: string }) {
  const { lang } = useLang();
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-700 active:scale-[0.97]"
    >
      {copied ? <Check size={14} weight="bold" /> : <CopySimple size={14} />}
      {copied ? t(lang, "home.copied") : t(lang, "home.copy")}
    </button>
  );
}
