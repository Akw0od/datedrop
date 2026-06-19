import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, HeartStraight, SignOut } from "@phosphor-icons/react/dist/ssr";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/dict";
import { getMyCouple } from "@/lib/couple";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LangToggle } from "@/components/lang-toggle";
import { UnpairButton } from "@/components/unpair-button";

const label =
  "text-[11px] font-medium uppercase tracking-widest text-zinc-400";
const panel =
  "rounded-[2rem] border border-zinc-200/60 bg-[var(--surface)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]";

export default async function ProfilePage() {
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: me } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const couple = await getMyCouple(supabase, user.id);
  const partnerId = couple
    ? couple.user_a === user.id
      ? couple.user_b
      : couple.user_a
    : null;
  const [{ data: partner }, { count: matchCount }] = await Promise.all([
    partnerId
      ? supabase.from("profiles").select("display_name").eq("id", partnerId).maybeSingle()
      : Promise.resolve({ data: null }),
    couple
      ? supabase.from("matches").select("*", { count: "exact", head: true }).eq("couple_id", couple.id)
      : Promise.resolve({ count: 0 }),
  ]);

  const initial = (me?.display_name || "?").trim().slice(-1);

  return (
    <main className="min-h-[100dvh] px-5 py-8 md:px-8">
      <div className="mx-auto w-full max-w-lg">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
          >
            <ArrowLeft size={15} />
            DateDrop
          </Link>
        </header>

        {/* 头像 + 名字 */}
        <div className="mt-10 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-600 text-2xl font-medium text-white">
            {initial}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {me?.display_name}
            </h1>
            {partner ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                {me?.display_name}
                <HeartStraight size={13} weight="fill" className="text-rose-600" />
                {partner.display_name}
                <span className="ml-1 text-zinc-300">·</span>
                <span className="font-mono text-zinc-600">{matchCount ?? 0}</span>
                <span className="text-zinc-400">
                  {t(lang, "home.match_pool")}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-400">
                {t(lang, "home.wait_partner")}
              </p>
            )}
          </div>
        </div>

        {/* 外观：主题 + 语言 */}
        <section className="mt-10">
          <p className={label}>{t(lang, "profile.appearance")}</p>
          <div className={`${panel} mt-3 divide-y divide-zinc-100`}>
            <div className="flex items-center justify-between gap-4 p-5">
              <span className="text-sm font-medium">{t(lang, "profile.theme")}</span>
              <ThemeSwitcher />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <span className="text-sm font-medium">{t(lang, "profile.language")}</span>
              <LangToggle />
            </div>
          </div>
        </section>

        {/* 账号：解绑 + 退出 */}
        <section className="mt-8">
          <p className={label}>{t(lang, "profile.account")}</p>
          <div className={`${panel} mt-3 divide-y divide-zinc-100`}>
            {partnerId && (
              <div className="flex items-center justify-between gap-4 p-5">
                <span className="text-sm font-medium">{t(lang, "home.unpair")}</span>
                <UnpairButton />
              </div>
            )}
            <form
              action={async () => {
                "use server";
                const sb = await createClient();
                await sb.auth.signOut();
                redirect("/login");
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-medium text-zinc-600 transition hover:text-rose-600"
              >
                {t(lang, "profile.signout")}
                <SignOut size={16} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
