import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SwipeDeck } from "@/components/swipe-deck";
import { getMyCouple } from "@/lib/couple";
import type { DateCard } from "@/lib/types";

export default async function SwipePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/swipe");

  const couple = await getMyCouple(supabase, user.id);
  if (!couple) redirect("/pair");

  const [{ data: cards }, { data: swipes }] = await Promise.all([
    supabase
      .from("date_cards")
      .select("*")
      .eq("city", couple.city)
      .eq("is_active", true)
      .order("id"),
    supabase.from("swipes").select("card_id").eq("user_id", user.id),
  ]);

  const swipedIds = new Set((swipes ?? []).map((s) => s.card_id));
  const allCards = (cards ?? []) as DateCard[];
  const deck = allCards.filter((c) => !swipedIds.has(c.id));

  return (
    <SwipeDeck
      deck={deck}
      allCards={allCards}
      coupleId={couple.id}
      userId={user.id}
    />
  );
}
