import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/dict";
import { getMyCouple } from "@/lib/couple";
import { RecapEditor } from "@/components/recap-editor";
import type { Plan } from "@/lib/types";

export default async function RecapPage() {
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/recap");

  const couple = await getMyCouple(supabase, user.id);
  if (!couple) redirect("/pair");

  // 最近一次计划（周报基于它的足迹/统计）
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("couple_id", couple.id)
    .order("week_of", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const partnerId = couple.user_a === user.id ? couple.user_b : couple.user_a;
  const [{ data: me }, { data: partner }, { data: recap }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    partnerId
      ? supabase.from("profiles").select("display_name").eq("id", partnerId).maybeSingle()
      : Promise.resolve({ data: null }),
    plan
      ? supabase
          .from("recaps")
          .select("photos, note")
          .eq("couple_id", couple.id)
          .eq("week_of", (plan as Plan).week_of)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <main className="min-h-[100dvh] px-5 py-8">
      <div className="mx-auto w-full max-w-lg">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
          >
            <ArrowLeft size={15} />
            DateDrop
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            {t(lang, "recap.title")}
          </span>
        </header>

        <div className="mt-8">
          {plan ? (
            <RecapEditor
              plan={plan as Plan}
              coupleId={couple.id}
              meName={me?.display_name ?? (lang === "en" ? "You" : "你")}
              partnerName={partner?.display_name ?? "TA"}
              initialPhotos={recap?.photos ?? []}
              initialNote={recap?.note ?? ""}
            />
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-zinc-200/60 bg-[var(--surface)] p-10 text-center">
              <ImageSquare size={28} className="text-zinc-300" />
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
                {t(lang, "recap.empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
