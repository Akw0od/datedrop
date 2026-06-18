// 用本地 claude CLI 把 date_cards 批量翻成英文，回填 title_en/description_en
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: cards } = await db.from("date_cards").select("id,title,description");
const prompt =
  "Translate these date-idea cards to natural, punchy American English. " +
  "Return ONLY a JSON array, no prose, no code fences: [{\"id\":\"...\",\"title_en\":\"...\",\"description_en\":\"...\"}].\n\n" +
  JSON.stringify(cards.map((c) => ({ id: c.id, title: c.title, description: c.description })));

const out = await new Promise((resolve, reject) => {
  const child = spawn("claude -p --model haiku --output-format json", { shell: true, windowsHide: true });
  let s = "";
  child.stdout.on("data", (d) => (s += d));
  child.on("error", reject);
  child.on("close", () => resolve(s));
  child.stdin.write(prompt);
  child.stdin.end();
});

const env2 = JSON.parse(out);
const text = env2.result ?? "";
const start = text.indexOf("[");
const end = text.lastIndexOf("]");
const arr = JSON.parse(text.slice(start, end + 1));

let n = 0;
for (const r of arr) {
  if (!r.id || !r.title_en) continue;
  const { error } = await db
    .from("date_cards")
    .update({ title_en: r.title_en, description_en: r.description_en ?? "" })
    .eq("id", r.id);
  if (!error) n++;
}
console.log(`✅ 翻译回填 ${n}/${cards.length} 张卡片`);
