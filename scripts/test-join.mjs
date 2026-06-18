// Phase 1 验收脚本：模拟用户 B 注册并通过邀请码加入
// 用法: node scripts/test-join.mjs <invite_code>
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);

const code = process.argv[2];
if (!code) throw new Error("用法: node scripts/test-join.mjs <invite_code>");

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 注册用户 B（已存在则直接登录）
const email = "b@datedrop.test";
const password = "test1234";
let { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { display_name: "小白" } },
});
if (signUpErr) {
  console.log("signUp 失败，尝试登录:", signUpErr.message);
  const r = await supabase.auth.signInWithPassword({ email, password });
  if (r.error) throw r.error;
}
console.log("用户 B 已登录");

// 加入情侣对
const { data: coupleId, error: joinErr } = await supabase.rpc("join_couple", { code });
if (joinErr) throw joinErr;
console.log("join_couple 返回:", coupleId);

// 验证：以 B 的身份读 couple
const { data: couple, error: readErr } = await supabase
  .from("couples")
  .select("*")
  .eq("id", coupleId)
  .maybeSingle();
if (readErr) throw readErr;
console.log("绑定结果: user_a =", couple.user_a?.slice(0, 8), "user_b =", couple.user_b?.slice(0, 8));
console.log(couple.user_b ? "✅ Phase 1 双人绑定验收通过" : "❌ user_b 为空");
