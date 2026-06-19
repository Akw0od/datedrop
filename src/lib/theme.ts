// 服务端读主题偏好（cookie），供 layout 设置 <html data-theme>
import { cookies } from "next/headers";

export type Theme = "rose" | "sand" | "sage" | "midnight";
export const THEMES: Theme[] = ["rose", "sand", "sage", "midnight"];

export async function getTheme(): Promise<Theme> {
  const c = await cookies();
  const v = c.get("theme")?.value as Theme | undefined;
  return v && THEMES.includes(v) ? v : "rose";
}
