// 计划邮件：渲染 on-brand HTML + 发送。设了 RESEND_API_KEY 走 Resend，否则打控制台。
import { t, pick, type Lang } from "@/lib/dict";
import type { Plan } from "@/lib/types";

const FROM = process.env.EMAIL_FROM ?? "DateDrop <onboarding@resend.dev>";

function renderHtml(plan: Plan, lang: Lang): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = pick(lang, plan.title, plan.title_en);
  const summary = pick(lang, plan.summary, plan.summary_en);
  const weather = plan.weather
    ? `${plan.weather.high_c}°/${plan.weather.low_c}°C · ${t(lang, "plan.precip")} ${plan.weather.precip_prob}%`
    : "";

  const stops = plan.timeline
    .map((s) => {
      const o = s.options[s.current] ?? s.options[0];
      const note = pick(lang, o.note, o.note_en);
      return `
      <tr>
        <td style="padding:14px 0;border-top:1px solid #f0f0f1;vertical-align:top;width:56px;">
          <span style="font-family:'SFMono-Regular',Menlo,monospace;font-size:15px;color:#e11d48;font-weight:600;">${s.time}</span>
        </td>
        <td style="padding:14px 0;border-top:1px solid #f0f0f1;">
          <div style="font-size:15px;font-weight:600;color:#18181b;">${pick(lang, o.title, o.title_en)}</div>
          <div style="font-size:13px;color:#a1a1aa;margin-top:3px;">${o.venue_name}${o.area ? " · " + o.area : ""}</div>
          ${note ? `<div style="font-size:13px;color:#71717a;margin-top:5px;line-height:1.5;">${note}</div>` : ""}
        </td>
      </tr>`;
    })
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#fafafa;padding:24px;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
  <span style="display:none;opacity:0;color:#fafafa;">${t(lang, "email.preheader")}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
    <tr><td style="padding:4px 8px 18px;">
      <span style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#a1a1aa;">${t(lang, "email.hello")}</span>
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid #e4e4e7;border-radius:24px;padding:28px;box-shadow:0 20px 40px -22px rgba(0,0,0,0.12);">
      <div style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#a1a1aa;">${plan.week_of} ${t(lang, "plan.saturday")}${weather ? " · " + weather : ""}</div>
      <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#18181b;margin:10px 0 0;">${title}</h1>
      <p style="font-size:14px;color:#71717a;line-height:1.6;margin:8px 0 0;">${summary}</p>
      <p style="font-size:13px;color:#52525b;line-height:1.6;margin:14px 0 0;">${t(lang, "email.intro")}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">${stops}</table>
      <a href="${appUrl}" style="display:block;text-align:center;margin-top:24px;background:#e11d48;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px;border-radius:14px;">${t(lang, "email.cta")} →</a>
    </td></tr>
    <tr><td style="padding:18px 8px;text-align:center;">
      <span style="font-size:12px;color:#a1a1aa;">${t(lang, "email.footer")}</span>
    </td></tr>
  </table>
  </body></html>`;
}

export async function sendPlanEmail(
  to: string[],
  plan: Plan,
  lang: Lang = "zh"
): Promise<{ sent: boolean; mode: "resend" | "console" }> {
  const html = renderHtml(plan, lang);
  const subject = t(lang, "email.subject");
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // 开发模式：完整 HTML 落盘成预览文件，方便目检（生产只读盘，忽略失败）
    let preview = "";
    try {
      const { writeFileSync } = await import("node:fs");
      const { join } = await import("node:path");
      preview = join(process.cwd(), ".email-preview.html");
      writeFileSync(preview, html, "utf8");
    } catch {
      preview = "(预览文件写入跳过)";
    }
    console.log(`\n=== [DateDrop 邮件 · 控制台模式] ===\nTo: ${to.join(", ")}\nSubject: ${subject}\n预览: ${preview}\n(设 RESEND_API_KEY 后将真实发送)\n`);
    return { sent: false, mode: "console" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend 发送失败: ${res.status} ${await res.text()}`);
  return { sent: true, mode: "resend" };
}
