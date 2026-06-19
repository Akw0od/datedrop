// 取"我的情侣"。容错关键：一个人若不慎落在多个 couple 里，
// 也只返回一个（优先已绑定 user_b 的那对），绝不让 maybeSingle 因多行报错。
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Couple } from "@/lib/types";

export async function getMyCouple(
  supabase: SupabaseClient,
  userId: string
): Promise<Couple | null> {
  const { data } = await supabase
    .from("couples")
    .select("*")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("user_b", { ascending: false, nullsFirst: false }) // 已配对(user_b 非空)优先
    .limit(1)
    .maybeSingle();
  return (data as Couple) ?? null;
}
