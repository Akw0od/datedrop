// Phase 2 验收脚本：用户 B 把所有卡片全部右滑（喜欢），触发与 A 的匹配
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { error: loginErr } = await supabase.auth.signInWithPassword({
  email: "b@datedrop.test",
  password: "test1234",
});
if (loginErr) throw loginErr;
const { data: { user } } = await supabase.auth.getUser();

const { data: couple } = await supabase
  .from("couples")
  .select("*")
  .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
  .maybeSingle();
if (!couple) throw new Error("B 还没绑定情侣对");

const [{ data: cards }, { data: mySwipes }] = await Promise.all([
  supabase.from("date_cards").select("id,title").eq("is_active", true),
  supabase.from("swipes").select("card_id").eq("user_id", user.id),
]);
const swiped = new Set((mySwipes ?? []).map((s) => s.card_id));
const todo = cards.filter((c) => !swiped.has(c.id));
console.log(`B 待滑卡片: ${todo.length} 张，全部右滑…`);

for (const card of todo) {
  const { error } = await supabase.from("swipes").insert({
    user_id: user.id,
    couple_id: couple.id,
    card_id: card.id,
    liked: true,
  });
  if (error) throw new Error(`滑 ${card.title} 失败: ${error.message}`);
}

const { count } = await supabase
  .from("matches")
  .select("*", { count: "exact", head: true })
  .eq("couple_id", couple.id);
console.log(`✅ B 滑完。当前匹配数: ${count}`);
