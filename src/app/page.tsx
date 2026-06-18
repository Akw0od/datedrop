import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Cards,
  HeartStraight,
} from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/components/sign-out-button";
import { CopyButton } from "@/components/copy-button";
import { PlanCard } from "@/components/plan-card";
import { TagIcon } from "@/components/tag-icon";
import { LangToggle } from "@/components/lang-toggle";
import { nextSaturday } from "@/lib/dates";
import { getLang } from "@/lib/lang";
import { t, pick } from "@/lib/dict";
import type { Plan } from "@/lib/types";

const label = "text-[11px] font-medium uppercase tracking-widest text-zinc-400";
const panel =
  "rounded-[2rem] border border-zinc-200/60 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]";

export default async function Home() {
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();
  if (!couple) redirect("/pair");

  const partnerId = couple.user_a === user.id ? couple.user_b : couple.user_a;
  const weekOf = nextSaturday();

  const [
    { data: me },
    { data: partner },
    { count: matchCount },
    { data: recentMatches },
    { data: plan },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    partnerId
      ? supabase.from("profiles").select("*").eq("id", partnerId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", couple.id),
    supabase
      .from("matches")
      .select("card_id, created_at, date_cards(title, title_en, style_tags)")
      .eq("couple_id", couple.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("plans")
      .select("*")
      .eq("couple_id", couple.id)
      .eq("week_of", weekOf)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${couple.invite_code}`;
  const matches = (recentMatches ?? []).map((m) => ({
    id: m.card_id as string,
    card: m.date_cards as unknown as {
      title: string;
      title_en: string | null;
      style_tags: string[];
    },
  }));

  return (
    <main className="min-h-[100dvh] px-5 py-8 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between">
          <p className="text-base font-semibold tracking-tighter">DateDrop</p>
          <div className="flex items-center gap-3">
            <LangToggle />
            <span className="text-sm text-zinc-500">{me?.display_name}</span>
            <SignOutButton />
          </div>
        </header>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.65fr_1fr]">
          {/* 左：本周计划（主舞台） */}
          <section>
            <p className={label}>{t(lang, "home.this_week")}</p>
            <div className="mt-3">
              <PlanCard
                initialPlan={(plan as Plan) ?? null}
                bothBound={!!partnerId}
                meId={user.id}
                memberIds={[couple.user_a, couple.user_b].filter(Boolean)}
                coupleId={couple.id}
                weekOf={weekOf}
                meName={me?.display_name ?? (lang === "en" ? "You" : "你")}
                partnerName={partner?.display_name ?? "TA"}
              />
            </div>
          </section>

          {/* 右：状态 / 入口 / 匹配池 */}
          <div className="space-y-8">
            <section>
              <p className={label}>{t(lang, "home.us")}</p>
              {partnerId ? (
                <div className={`${panel} mt-3 p-6`}>
                  <div className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
                    {me?.display_name}
                    <HeartStraight size={14} weight="fill" className="text-rose-600" />
                    {partner?.display_name}
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {t(lang, "home.pool_count", { n: matchCount ?? 0 })}
                  </p>
                </div>
              ) : (
                <div className={`${panel} mt-3 p-6`}>
                  <p className="text-sm font-semibold tracking-tight">
                    {t(lang, "home.wait_partner")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {t(lang, "home.invite_hint")}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 font-mono text-[11px] text-zinc-600">
                      {inviteUrl}
                    </code>
                    <CopyButton text={inviteUrl} />
                  </div>
                </div>
              )}
            </section>

            <section>
              <p className={label}>{t(lang, "home.discover")}</p>
              <Link
                href="/swipe"
                className={`${panel} mt-3 flex items-center justify-between p-6 transition hover:-translate-y-[1px] hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.08)] active:scale-[0.99]`}
              >
                <div className="flex items-center gap-3">
                  <Cards size={20} className="text-rose-600" />
                  <div>
                    <p className="text-sm font-semibold tracking-tight">
                      {t(lang, "home.swipe_title")}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {t(lang, "home.swipe_sub")}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-400" />
              </Link>
            </section>

            <section>
              <p className={label}>{t(lang, "home.match_pool")}</p>
              <div className={`${panel} mt-3 px-6 py-2`}>
                {matches.length === 0 ? (
                  <p className="py-6 text-xs leading-relaxed text-zinc-400">
                    {t(lang, "home.no_match")}
                  </p>
                ) : (
                  <ul className="divide-y divide-zinc-100">
                    {matches.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 py-3.5">
                        <TagIcon
                          tags={m.card?.style_tags ?? []}
                          size={16}
                          className="shrink-0 text-rose-600"
                        />
                        <span className="truncate text-sm">
                          {pick(lang, m.card?.title ?? "", m.card?.title_en)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
