"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsersThree, ArrowRight } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { getMyCouple } from "@/lib/couple";
import { useLang } from "@/components/lang-provider";
import { LangToggle } from "@/components/lang-toggle";
import { t } from "@/lib/dict";

export default function PairPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"create" | "join" | null>(null);

  async function createCouple() {
    setLoading("create");
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    // 已经有空间了就别再建（防止重复 couple 把绑定搅乱）
    const existing = await getMyCouple(supabase, user.id);
    if (existing) {
      router.push("/");
      router.refresh();
      return;
    }
    const { error } = await supabase
      .from("couples")
      .insert({ user_a: user.id });
    if (error) {
      setError(error.message);
      setLoading(null);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function joinCouple(e: React.FormEvent) {
    e.preventDefault();
    setLoading("join");
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_couple", {
      code: code.trim(),
    });
    if (error || !data) {
      setError(t(lang, "pair.code_bad"));
      setLoading(null);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center px-6">
      <div className="absolute right-6 top-6">
        <LangToggle />
      </div>
      <div className="mx-auto w-full max-w-md">
        <UsersThree size={32} className="text-rose-600" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {t(lang, "pair.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t(lang, "pair.sub")}</p>

        <button
          onClick={createCouple}
          disabled={loading !== null}
          className="mt-8 flex w-full items-center justify-between rounded-2xl bg-rose-600 px-5 py-4 text-left text-white transition hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50"
        >
          <span className="text-sm font-medium">
            {loading === "create" ? t(lang, "pair.creating") : t(lang, "pair.create")}
          </span>
          <ArrowRight size={18} />
        </button>

        <div className="mt-8 border-t border-zinc-200 pt-6">
          <p className="text-xs font-medium text-zinc-500">{t(lang, "pair.have_code")}</p>
          <form onSubmit={joinCouple} className="mt-3 flex gap-2">
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t(lang, "pair.code_ph")}
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              disabled={loading !== null}
              className="shrink-0 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.97] disabled:opacity-50"
            >
              {loading === "join" ? "…" : t(lang, "pair.join")}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </main>
  );
}
