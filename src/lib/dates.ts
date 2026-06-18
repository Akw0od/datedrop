// 下一个周六（含今天）的 yyyy-mm-dd，按指定时区。
// 关键：先在目标时区取到“墙上日期+星期”，再用纯 UTC 日期做加法，
// 避免在 PT 机器上晚上调用时 toISOString() 把时间推到 UTC 次日（off-by-one）。
const WD: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export function nextSaturday(tz = "America/Los_Angeles"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const wd = WD[get("weekday")];

  const add = (6 - wd + 7) % 7; // 周六=6；今天就是周六则 add=0
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + add);
  return base.toISOString().slice(0, 10);
}
