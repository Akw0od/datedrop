import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LinkBreak } from "@phosphor-icons/react/dist/ssr";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/dict";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const lang = await getLang();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/invite/${code}`);

  const { data: coupleId } = await supabase.rpc("join_couple", { code });
  if (coupleId) redirect("/");

  return (
    <main className="flex min-h-[100dvh] items-center px-6">
      <div className="mx-auto w-full max-w-md">
        <LinkBreak size={32} className="text-zinc-400" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {t(lang, "invite.bad_title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          {t(lang, "invite.bad_body")}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
        >
          {t(lang, "back_home")}
        </Link>
      </div>
    </main>
  );
}
