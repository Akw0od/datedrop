// 计划生成引擎：预取（匹配偏好 + 场地库 + 天气）→ 单次结构化生成 → 校验 → 落库
import { createAdminClient } from "@/lib/supabase/admin";
import { generateText, extractJson } from "@/lib/llm";
import { nextSaturday } from "@/lib/dates";
import { PREMADE_SEATTLE } from "@/lib/premade-seattle";
import type { Couple, Plan, PlanStop, StopOption, Venue } from "@/lib/types";

const MAX_REROLLS = 9; // 预制方案免费，放宽整体换；接 LLM 后可下调
const MAX_OPTIONS = 4; // 每站最多备选数（含首选），换站在这几个里轮换

// 城市坐标（场地库扩展到新城市时同步加）
const CITY_COORDS: Record<string, { lat: number; lng: number; tz: string }> = {
  seattle: { lat: 47.6062, lng: -122.3321, tz: "America/Los_Angeles" },
  bay_area: { lat: 37.77, lng: -122.42, tz: "America/Los_Angeles" },
};
const DEFAULT_CITY = "seattle";

// 约会风格 → 场地类别的松散映射，用于候选筛选
const TAG_TO_CATEGORIES: Record<string, string[]> = {
  outdoor: ["hike", "park", "beach", "garden", "viewpoint"],
  active: ["hike", "activity", "water"],
  culture: ["museum", "art-walk", "cinema", "landmark"],
  food: ["food", "dessert", "winery"],
  playful: ["activity", "quirky", "amusement"],
  chill: ["park", "garden", "dessert", "aquarium"],
  romantic: ["viewpoint", "beach", "winery", "garden", "landmark"],
  nightlife: ["nightlife", "event", "cinema"],
  water: ["water", "beach", "aquarium"],
  city: ["district", "landmark", "art-walk", "food"],
  adventure: ["hike", "roadtrip", "amusement"],
  creative: ["quirky", "museum", "art-walk"],
  roadtrip: ["roadtrip", "winery"],
  home: [],
};

// 这周心情 → 给 LLM 的一句话调性指引
const MOOD_HINT: Record<string, string> = {
  chill: "他们这周想躺平：偏轻松、省力、慢节奏，别安排暴走或高强度项目。",
  spark: "他们这周想来点刺激：偏新鲜、有点冒险或没试过的体验。",
  fete: "他们这周有事要庆祝：可以更隆重、更有仪式感一点，舍得花。",
};

// LLM 输出的原始结构（每站给多个备选）
interface GeneratedPlan {
  title: string;
  summary: string;
  stops: {
    time: string;
    slot: string;
    options: { venue_id: string; title: string; note: string }[];
  }[];
}

async function fetchWeather(
  lat: number,
  lng: number,
  tz: string,
  date: string
): Promise<Plan["weather"]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&timezone=${encodeURIComponent(tz)}&start_date=${date}&end_date=${date}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const high = Math.round(data.daily.temperature_2m_max[0]);
    const low = Math.round(data.daily.temperature_2m_min[0]);
    const precip = data.daily.precipitation_probability_max[0] ?? 0;
    return {
      high_c: high,
      low_c: low,
      precip_prob: precip,
      summary: `${high}°/${low}°C，降水概率 ${precip}%`,
    };
  } catch {
    return null; // 天气挂了不阻塞生成
  }
}

// 计算本周目标周六 + 重摇序号（成本/次数铁律），两条生成路径共用
async function weekAndReroll(admin: ReturnType<typeof createAdminClient>, couple: Couple) {
  const geo = CITY_COORDS[couple.city] ?? CITY_COORDS[DEFAULT_CITY];
  const weekOf = nextSaturday(geo.tz);
  const { data: prior } = await admin
    .from("plans")
    .select("reroll_count")
    .eq("couple_id", couple.id)
    .eq("week_of", weekOf)
    .order("reroll_count", { ascending: false })
    .limit(1)
    .maybeSingle();
  const rerollCount = prior ? prior.reroll_count + 1 : 0;
  if (rerollCount > MAX_REROLLS)
    throw new Error(`本周的重摇次数用完了（${MAX_REROLLS} 次），周六就从现有计划里挑一个吧`);
  return { geo, weekOf, rerollCount };
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// 无 API key 路径：从本地预制方案池取一个，瞬间出方案（整体换=切下一个）
async function generateFromPremade(couple: Couple, mood?: string | null): Promise<Plan> {
  const admin = createAdminClient();
  const { geo, weekOf, rerollCount } = await weekAndReroll(admin, couple);
  const weather = await fetchWeather(geo.lat, geo.lng, geo.tz, weekOf);

  const pool = PREMADE_SEATTLE.filter((p) => !mood || p.mood === mood || p.mood === null);
  const list = pool.length ? pool : PREMADE_SEATTLE;

  // 用滑卡匹配排序：两人都右滑的卡 → 偏好类别 → 命中越多的方案排越前。
  // 没匹配时全 0 分、保持原序（等同未排序）。这让"盲选"真正影响拿到的计划。
  const { data: matchRows } = await admin
    .from("matches")
    .select("date_cards(style_tags)")
    .eq("couple_id", couple.id);
  const prefCats = new Set(
    (matchRows ?? [])
      .flatMap((r) => (r.date_cards as unknown as { style_tags: string[] })?.style_tags ?? [])
      .flatMap((tag) => TAG_TO_CATEGORIES[tag] ?? [])
  );
  const ranked = list
    .map((p) => ({
      p,
      score: prefCats.size
        ? p.stops.reduce(
            (s, st) => s + (st.options.some((o) => prefCats.has(o.category)) ? 1 : 0),
            0
          )
        : 0,
    }))
    .sort((a, b) => b.score - a.score);
  const chosen = ranked[rerollCount % ranked.length].p;

  const timeline: PlanStop[] = chosen.stops.map((s) => ({
    time: s.time,
    slot: s.slot_zh,
    slot_en: s.slot_en,
    current: 0,
    options: s.options.map((op) => ({
      venue_id: slug(op.venue),
      venue_name: op.venue,
      area: op.area,
      title: op.title_zh,
      title_en: op.title_en,
      note: op.note_zh,
      note_en: op.note_en,
      category: op.category,
      price: op.price,
    })),
  }));

  const { data: plan, error } = await admin
    .from("plans")
    .insert({
      couple_id: couple.id,
      week_of: weekOf,
      status: "proposed",
      timeline,
      weather,
      mood: mood ?? null,
      reroll_count: rerollCount,
      title: chosen.title_zh,
      title_en: chosen.title_en,
      summary: chosen.summary_zh,
      summary_en: chosen.summary_en,
    })
    .select()
    .single();
  if (error) throw new Error(`计划落库失败: ${error.message}`);
  return plan as Plan;
}

export async function generatePlan(
  couple: Couple,
  mood?: string | null
): Promise<Plan> {
  // 没有 API key 就走本地预制方案（默认；上线设了 key 才走 LLM 实时生成）
  if (!process.env.ANTHROPIC_API_KEY) return generateFromPremade(couple, mood);

  const admin = createAdminClient();
  const { geo, weekOf, rerollCount } = await weekAndReroll(admin, couple);

  // 偏好画像：双方都右滑的卡
  const { data: matchRows } = await admin
    .from("matches")
    .select("date_cards(title, style_tags)")
    .eq("couple_id", couple.id);
  const matchedCards = (matchRows ?? [])
    .map((r) => r.date_cards as unknown as { title: string; style_tags: string[] })
    .filter(Boolean);
  if (matchedCards.length === 0)
    throw new Error("你们还没有匹配的约会卡片，先去滑卡吧");

  const tagCount = new Map<string, number>();
  for (const c of matchedCards)
    for (const t of c.style_tags)
      tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const topTags = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  const [{ data: venues }, weather] = await Promise.all([
    admin.from("venues").select("*").eq("city", couple.city).eq("is_active", true),
    fetchWeather(geo.lat, geo.lng, geo.tz, weekOf),
  ]);
  if (!venues?.length) throw new Error("场地库是空的");

  // 候选打分：类别贴合偏好 + 天气适配。保留分数，换站时按同类目高分回填备选
  const rainy = (weather?.precip_prob ?? 0) > 50;
  const preferredCats = new Set(topTags.flatMap((t) => TAG_TO_CATEGORIES[t] ?? []));
  const scored = (venues as Venue[])
    .map((v) => {
      let score = preferredCats.has(v.category) ? 2 : 0;
      if (rainy && v.indoor) score += 1.5;
      if (rainy && !v.indoor) score -= 1;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);
  const candidates = scored.slice(0, 28).map(({ v }) => v); // 按分排序的候选池
  const venueMap = new Map(candidates.map((v) => [v.id, v]));

  const moodHint = mood ? MOOD_HINT[mood] : null;
  const prompt = `你是约会策划师。为一对湾区情侣策划 ${weekOf}（周六）的约会，输出严格 JSON，不要任何其他文字、不要 markdown 围栏。

他们俩都想去的约会类型（按共同兴趣降序）：${matchedCards.slice(0, 10).map((c) => c.title).join("、")}
偏好标签：${topTags.join(", ")}
当天天气：${weather?.summary ?? "未知"}${rainy ? "（降水概率高，优先室内场地）" : ""}${moodHint ? `\n这周心情：${moodHint}` : ""}

候选场地（只能从这里选，venue_id 必须原样照抄）：
${candidates.map((v) => JSON.stringify({ venue_id: v.id, name: v.name, area: v.area, category: v.category, tags: v.tags, price: v.price_level, hours_est: v.duration_hours, indoor: v.indoor, notes: v.notes })).join("\n")}

要求：
- 2 到 3 个时段（stops），时间在 13:00–21:00 之间，时段间留出车程余量（不同 area 之间至少 45 分钟）
- 整体动静搭配：别全是吃的，也别全是暴走
- 每个时段给 3 个 options：options[0] 是你的首选，另外 2 个是质量相近的备选
- 关键：同一时段的 3 个 options 必须都适合这个时间点、且彼此 area 相近——因为用户会即时切换它们，换了不能破坏行程
- 跨时段不要重复同一个 venue
- slot 给这个时段起个角色名（如 暖场 / 主活动 / 晚餐 / 甜点收尾）
- note 每个 option 一句话贴心具体的小提示（中文，口语化，别用感叹号轰炸）
- title 给整个约会起个有记忆点的中文名（不超过 12 字）；summary 一句话说明为什么这个组合适合他们

输出格式：
{"title":"...","summary":"...","stops":[{"time":"14:00","slot":"暖场","options":[{"venue_id":"...","title":"环节标题","note":"..."},{"venue_id":"...","title":"...","note":"..."},{"venue_id":"...","title":"...","note":"..."}]}]}`;

  const result = await generateText(prompt);
  const parsed = extractJson<GeneratedPlan>(result.text);

  const toOption = (v: Venue, title?: string, note?: string): StopOption => ({
    venue_id: v.id,
    venue_name: v.name,
    area: v.area,
    title: (title || v.name).slice(0, 40),
    note: (note ?? v.notes ?? "").slice(0, 90),
    category: v.category,
    price: v.price_level,
  });

  // 校验 + 回填：每站只收校验通过的 venue_id（杜绝编造），
  // 不足则用同类目高分候选回填，并禁止复用其他站的当前选择（杜绝可见重复）
  const usedPrimary = new Set<string>();
  const stops: PlanStop[] = [];
  for (const s of parsed.stops ?? []) {
    if (!/^\d{1,2}:\d{2}$/.test(s.time ?? "")) continue;

    const optIds = new Set<string>();
    const options: StopOption[] = [];
    for (const o of s.options ?? []) {
      if (!o.venue_id || !venueMap.has(o.venue_id)) continue; // 丢幻觉
      if (optIds.has(o.venue_id) || usedPrimary.has(o.venue_id)) continue;
      optIds.add(o.venue_id);
      options.push(toOption(venueMap.get(o.venue_id)!, o.title, o.note));
    }
    if (options.length === 0) continue; // 这一站一个有效场地都没有，整站丢弃

    // 回填到至少 2 个、至多 MAX_OPTIONS：先同类目，再放宽到任意候选
    const primaryCat = venueMap.get(options[0].venue_id)!.category;
    for (const pass of [true, false]) {
      for (const v of candidates) {
        if (options.length >= MAX_OPTIONS) break;
        if (optIds.has(v.id) || usedPrimary.has(v.id)) continue;
        if (pass && v.category !== primaryCat) continue;
        optIds.add(v.id);
        options.push(toOption(v));
      }
      if (options.length >= 2) break;
    }

    usedPrimary.add(options[0].venue_id);
    stops.push({
      time: s.time,
      slot: (s.slot || "环节").slice(0, 12),
      current: 0,
      options,
    });
  }
  if (stops.length < 2)
    throw new Error("这次生成质量不行（场地校验未通过），点「换一个」再试");

  const { data: plan, error: insertErr } = await admin
    .from("plans")
    .insert({
      couple_id: couple.id,
      week_of: weekOf,
      status: "proposed",
      timeline: stops,
      weather,
      mood: mood ?? null,
      reroll_count: rerollCount,
      title: parsed.title?.slice(0, 30) ?? "周六约会",
      summary: parsed.summary?.slice(0, 120) ?? "",
    })
    .select()
    .single();
  if (insertErr) throw new Error(`计划落库失败: ${insertErr.message}`);

  // 单位经济记账
  await admin.from("llm_usage").insert({
    plan_id: plan.id,
    couple_id: couple.id,
    model: result.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    cache_read_tokens: result.cacheReadTokens,
    cost_usd: result.costUsd,
  });

  return plan as Plan;
}
