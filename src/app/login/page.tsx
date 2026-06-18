"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogo } from "@phosphor-icons/react";
import { useLang } from "@/components/lang-provider";
import { LangToggle } from "@/components/lang-toggle";
import { t } from "@/lib/dict";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const { lang } = useLang();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function google() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(t(lang, "login.oauth_fail"));
  }

  const inputCls =
    "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

  return (
    <div className="grid min-h-[100dvh] md:grid-cols-2">
      {/* 左侧品牌面板（移动端隐藏） */}
      <div className="relative hidden overflow-hidden bg-zinc-950 md:flex md:flex-col md:justify-between md:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-rose-900/40 blur-3xl"
          style={{ animation: "drift-a 16s ease-in-out infinite" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-zinc-800/60 blur-3xl"
          style={{ animation: "drift-b 20s ease-in-out infinite" }}
        />
        <p className="relative text-sm font-semibold tracking-tight text-white">
          DateDrop
        </p>
        <h1 className="relative max-w-md whitespace-pre-line text-5xl font-semibold tracking-tighter leading-tight text-white">
          {t(lang, "login.tagline")}
        </h1>
        <p className="relative max-w-sm text-sm leading-relaxed text-zinc-400">
          {t(lang, "login.blurb")}
        </p>
      </div>

      {/* 右侧表单 */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-6 top-6">
          <LangToggle />
        </div>
        <div className="w-full max-w-sm">
          <p className="text-sm font-semibold tracking-tight md:hidden">
            DateDrop
          </p>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight md:mt-0">
            {mode === "signin" ? t(lang, "login.welcome_back") : t(lang, "login.start")}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "signin" ? t(lang, "login.sub_signin") : t(lang, "login.sub_signup")}
          </p>

          <button
            type="button"
            onClick={google}
            className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
          >
            <GoogleLogo size={18} weight="bold" className="text-rose-600" />
            {t(lang, "login.google")}
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-400">{t(lang, "login.or")}</span>
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-700">
                  {t(lang, "login.your_name")}
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t(lang, "login.name_ph")}
                  className={inputCls}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-700">{t(lang, "login.email")}</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-700">{t(lang, "login.password")}</label>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t(lang, "login.password_ph")}
                className={inputCls}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <button
              disabled={loading}
              className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? t(lang, "loading") : mode === "signin" ? t(lang, "login.signin") : t(lang, "login.create")}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="mt-6 text-sm text-zinc-500 underline-offset-4 transition hover:text-zinc-800 hover:underline"
          >
            {mode === "signin" ? t(lang, "login.to_signup") : t(lang, "login.to_signin")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
