// Service role 客户端：仅在服务端使用（cron 批量生成、llm_usage 记账）
// 绕过 RLS，绝不能泄漏到客户端代码
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
