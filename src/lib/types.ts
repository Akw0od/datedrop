// 核心领域类型（与 supabase/migrations/0001_init.sql 对应）

export type StyleTag =
  | "outdoor" | "city" | "active" | "chill" | "romantic" | "playful"
  | "creative" | "culture" | "food" | "nightlife" | "adventure"
  | "water" | "home" | "roadtrip";

export interface Profile {
  id: string;
  display_name: string;
  email: string | null;
  created_at: string;
}

export interface Couple {
  id: string;
  user_a: string;
  user_b: string | null;
  invite_code: string;
  city: string;
  created_at: string;
}

export interface DateCard {
  id: string;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  emoji: string;
  style_tags: StyleTag[];
  budget_level: 1 | 2 | 3;
  duration_hours: number;
  seasons: string[];
  city: string;
  is_active: boolean;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  area: string | null;
  category: string;
  tags: string[];
  price_level: 1 | 2 | 3;
  duration_hours: number | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
  indoor: boolean;
  notes: string | null;
  hours_verified: boolean;
  is_active: boolean;
}

/** 一个环节的某个可选场地（options[0] 是 LLM 首选，其余是即时可换的备选） */
export interface StopOption {
  venue_id: string;
  venue_name: string;
  area: string | null;
  title: string;       // "Lands End 日落徒步"
  title_en?: string;
  note: string;        // 给情侣看的一句话提示
  note_en?: string;
  category: string;    // 场地类别，前端映射成 kind 标签
  price: number;       // 价位档 1–3
}

/** 计划时间线里的一个环节：固定时段，多个可滑动切换的备选 */
export interface PlanStop {
  time: string;        // "14:00"
  slot: string;        // 这个时段的角色，如 "暖场" / "主活动" / "收尾晚餐"
  slot_en?: string;
  current: number;     // 当前选中的 options 下标
  options: StopOption[]; // 1–4 个
}

export type PlanStatus = "proposed" | "accepted" | "rejected" | "completed" | "expired";

export interface Plan {
  id: string;
  couple_id: string;
  week_of: string;     // 目标周六 yyyy-mm-dd
  status: PlanStatus;
  title: string;
  title_en: string | null;
  summary: string;
  summary_en: string | null;
  timeline: PlanStop[];
  weather: { high_c: number; low_c: number; precip_prob: number; summary: string } | null;
  mood: string | null;
  reroll_count: number;
  accepted_by: string[];
  created_at: string;
}
