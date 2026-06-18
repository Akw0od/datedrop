// Phase 3 验收脚本：用户 B 确认本周计划
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

const { data: plan } = await supabase
  .from("plans")
  .select("*")
  .eq("couple_id", couple.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
if (!plan) throw new Error("没有计划");

const acceptedBy = plan.accepted_by.includes(user.id)
  ? plan.accepted_by
  : [...plan.accepted_by, user.id];
const memberIds = [couple.user_a, couple.user_b].filter(Boolean);
const status = memberIds.every((id) => acceptedBy.includes(id)) ? "accepted" : plan.status;

const { error } = await supabase
  .from("plans")
  .update({ accepted_by: acceptedBy, status })
  .eq("id", plan.id);
if (error) throw error;
console.log(`✅ B 已确认「${plan.title}」，状态: ${status}`);
