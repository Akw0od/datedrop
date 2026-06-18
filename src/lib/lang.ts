// 服务端读语言偏好（cookie），供 RSC 使用
import { cookies } from "next/headers";
import type { Lang } from "@/lib/dict";

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  return c.get("lang")?.value === "en" ? "en" : "zh";
}
