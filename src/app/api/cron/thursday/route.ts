// 周四推送：给所有已绑定的情侣生成本周计划（本地预制，无需 LLM/key）并发邮件。
// Vercel Cron 每周四触发（见 vercel.json）。幂等：本周已有计划就跳过，不重复打扰。
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePlan } from "@/lib/plan";
import { sendPlanEmail } from "@/lib/email";
import { nextSaturday } from "@/lib/dates";
import type { Couple, Plan } from "@/lib/types";

export const maxDuration = 60;

async function runThursdayDrop() {
  const admin = createAdminClient();
  const weekOf = nextSaturday();

  // 只推已绑定双方的情侣
  const { data: couples } = await admin
    .from("couples")
    .select("*")
    .not("user_b", "is", null);

  let created = 0;
  let emailed = 0;
  const skipped: string[] = [];

  for (const couple of (couples ?? []) as Couple[]) {
    // 本周已有计划 → 跳过（幂等，避免重复邮件）
    const { data: existing } = await admin
      .from("plans")
      .select("id")
      .eq("couple_id", couple.id)
      .eq("week_of", weekOf)
      .limit(1)
      .maybeSingle();
    if (existing) {
      skipped.push(couple.id);
      continue;
    }

    let plan: Plan;
    try {
      plan = await generatePlan(couple);
      created++;
    } catch {
      continue; // 生成失败（极少）不阻塞其他情侣
    }

    const ids = [couple.user_a, couple.user_b].filter(Boolean) as string[];
    const { data: profs } = await admin
      .from("profiles")
      .select("email")
      .in("id", ids);
    const emails = [
      ...new Set((profs ?? []).map((p) => p.email).filter(Boolean) as string[]),
    ];
    if (emails.length) {
      try {
        await sendPlanEmail(emails, plan, "zh");
        emailed += emails.length;
      } catch (e) {
        console.error("邮件发送失败", couple.id, e);
      }
    }
  }

  return { ok: true, weekOf, couples: couples?.length ?? 0, created, emailed, skipped: skipped.length };
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 本地未设密钥时放行，方便开发触发
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await runThursdayDrop());
}

// 手动触发（本地测试用）
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await runThursdayDrop());
}
