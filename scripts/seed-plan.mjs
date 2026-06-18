// 用真实场地构造一个结构正确的计划（绕开 LLM 延迟，专门验证 UI）
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: couple } = await db.from("couples").select("*").limit(1).single();
const { data: venues } = await db
  .from("venues")
  .select("*")
  .eq("city", "bay_area")
  .eq("is_active", true);

const byCat = (cats) => venues.filter((v) => cats.includes(v.category));
const opt = (v, note) => ({
  venue_id: v.id,
  venue_name: v.name,
  area: v.area,
  title: v.name,
  note: note ?? v.notes ?? "",
  category: v.category,
  price: v.price_level,
});
const pick = (cats, n) => byCat(cats).slice(0, n).map((v) => opt(v));

const timeline = [
  { time: "13:30", slot: "暖场", current: 0, options: pick(["activity", "quirky", "amusement"], 4) },
  { time: "16:00", slot: "主活动", current: 0, options: pick(["hike", "beach", "viewpoint", "park"], 4) },
  { time: "19:00", slot: "晚餐", current: 0, options: pick(["food", "dessert"], 4) },
].filter((s) => s.options.length >= 2);

await db.from("llm_usage").delete().neq("id", "00000000-0000-0000-0000-000000000000");
await db.from("plans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const { data: plan, error } = await db
  .from("plans")
  .insert({
    couple_id: couple.id,
    week_of: "2026-06-20",
    status: "proposed",
    title: "日落冒险快闪之旅",
    summary: "迷你高尔夫开场，海边日落徒步当主轴，美食车收尾——刺激与浪漫的接力。",
    timeline,
    weather: { high_c: 20, low_c: 14, precip_prob: 6, summary: "20°/14°C，降水概率 6%" },
    mood: "spark",
    reroll_count: 0,
    accepted_by: [],
  })
  .select()
  .single();
if (error) console.log("ERR", error.message);
else
  console.log(
    `✅ 计划已插入：${plan.title}\n` +
      timeline.map((s) => `  ${s.time} ${s.slot}: ${s.options.map((o) => o.venue_name).join(" / ")}`).join("\n")
  );
