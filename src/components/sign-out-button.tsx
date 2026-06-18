"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/lang-provider";
import { t } from "@/lib/dict";

export function SignOutButton() {
  const router = useRouter();
  const { lang } = useLang();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      aria-label={t(lang, "home.sign_out")}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.95]"
    >
      <SignOut size={16} />
    </button>
  );
}
