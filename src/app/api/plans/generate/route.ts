import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlan } from "@/lib/plan";
import { getMyCouple } from "@/lib/couple";

// 生成/重摇本周计划。重摇上限与场地校验都在 lib/plan.ts 里强制执行
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json().catch(() => ({}));
  const mood: string | null =
    typeof body?.mood === "string" ? body.mood : null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const couple = await getMyCouple(supabase, user.id);
  if (!couple)
    return NextResponse.json({ error: "还没有绑定情侣空间" }, { status: 400 });
  if (!couple.user_b)
    return NextResponse.json(
      { error: "等另一半加入后再生成计划" },
      { status: 400 }
    );

  try {
    const plan = await generatePlan(couple, mood);
    return NextResponse.json({ plan });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "生成失败" },
      { status: 400 }
    );
  }
}
