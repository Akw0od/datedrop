"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkBreak } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/lang-provider";
import { t } from "@/lib/dict";

export function UnpairButton() {
  const router = useRouter();
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);

  async function unpair() {
    if (busy || !window.confirm(t(lang, "home.unpair_confirm"))) return;
    setBusy(true);
    await createClient().rpc("unpair_couple");
    router.push("/"); // home 自己按新状态分流（离开者→/pair，留下者→邀请卡）
    router.refresh();
  }

  return (
    <button
      onClick={unpair}
      disabled={busy}
      className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-zinc-400 transition hover:text-rose-600 disabled:opacity-50"
    >
      <LinkBreak size={12} />
      {t(lang, "home.unpair")}
    </button>
  );
}
