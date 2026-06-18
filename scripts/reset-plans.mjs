// 清空 plans + llm_usage（测试用），service role 直连
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const db = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

await db.from("llm_usage").delete().neq("id", "00000000-0000-0000-0000-000000000000");
await db.from("plans").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const { count } = await db.from("plans").select("*", { count: "exact", head: true });
console.log(`✅ 已清空，plans 剩 ${count}`);
