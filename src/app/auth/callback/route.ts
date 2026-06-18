// OAuth 回调：Google → Supabase → 这里。用 code 换 session（PKCE），再跳回应用。
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 生产在反代后面：优先用 x-forwarded-host 回到规范域名
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base =
        process.env.NODE_ENV === "production" && forwardedHost
          ? `https://${forwardedHost}`
          : origin;
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
