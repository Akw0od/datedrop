// 本地预制西雅图方案（无 API key 时用，瞬间出方案）。自包含、双语、每站 3 备选。
export interface PremadeOption {
  venue: string;
  area: string;
  category: string;
  price: number;
  title_zh: string;
  title_en: string;
  note_zh: string;
  note_en: string;
}
export interface PremadeStop {
  time: string;
  slot_zh: string;
  slot_en: string;
  options: PremadeOption[];
}
export interface PremadePlan {
  mood: string | null;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  stops: PremadeStop[];
}

const o = (
  venue: string, area: string, category: string, price: number,
  title_zh: string, title_en: string, note_zh: string, note_en: string
): PremadeOption => ({ venue, area, category, price, title_zh, title_en, note_zh, note_en });

export const PREMADE_SEATTLE: PremadePlan[] = [
  {
    mood: "chill",
    title_zh: "雨城慢日子",
    title_en: "A Slow Seattle Saturday",
    summary_zh: "咖啡暖场，躲进玻璃艺术馆，一碗热浓汤收尾——下雨也不怕的松弛一天。",
    summary_en: "Coffee to start, glass art to hide from the rain, a warm bowl to end — an easy day even when it pours.",
    stops: [
      { time: "13:00", slot_zh: "暖场", slot_en: "Warm-up", options: [
        o("Storyville Coffee", "Pike Place", "coffee", 2, "Storyville 靠窗手冲", "Pour-over by the window at Storyville", "派克市场楼上，靠窗看海湾慢慢醒", "Above Pike Place, ease into the day with a bay view"),
        o("Victrola Coffee Roasters", "Capitol Hill", "coffee", 1, "Victrola 老派咖啡", "Old-school coffee at Victrola", "Capitol Hill 松弛氛围，适合慢聊", "Capitol Hill mellow, made for slow conversation"),
        o("Pike Place Market", "Downtown", "market", 1, "派克市场逛一圈", "Wander Pike Place Market", "飞鱼摊和初代星巴克，热闹起个头", "Flying fish and the first Starbucks, a lively start"),
      ]},
      { time: "15:00", slot_zh: "主活动", slot_en: "Main", options: [
        o("Chihuly Garden and Glass", "Seattle Center", "museum", 3, "Chihuly 玻璃艺术", "Chihuly glass garden", "雨天首选，出片率极高", "Top rainy-day pick, impossibly photogenic"),
        o("Frye Art Museum", "First Hill", "museum", 1, "Frye 免费艺术馆", "Free art at the Frye", "安静小而美，免门票", "Quiet, lovely, and free"),
        o("Volunteer Park Conservatory", "Capitol Hill", "garden", 1, "维多利亚温室", "Victorian conservatory", "躲进玻璃温室里的热带", "Step into the tropics inside a glass house"),
      ]},
      { time: "18:00", slot_zh: "晚餐", slot_en: "Dinner", options: [
        o("Pike Place Chowder", "Pike Place", "food", 2, "得奖海鲜浓汤", "Award-winning chowder", "排队也值的一碗热汤", "A hot bowl worth the line"),
        o("Din Tai Fung", "University Village", "food", 2, "鼎泰丰小笼包", "Din Tai Fung dumplings", "约会安全牌，热乎管饱", "A safe, warm, satisfying bet"),
        o("Salt & Straw", "Capitol Hill", "dessert", 2, "Salt & Straw 冰淇淋", "Salt & Straw ice cream", "脑洞口味当甜点收尾", "End on a wildly inventive scoop"),
      ]},
    ],
  },
  {
    mood: "spark",
    title_zh: "海风冒险",
    title_en: "Salt-Air Adventure",
    summary_zh: "海崖步道开场，登高俯瞰全城，生蚝配落日收尾——给想动起来的一天。",
    summary_en: "Bluff trails to start, climb for the city view, oysters at sunset to finish — for a day with some motion.",
    stops: [
      { time: "13:00", slot_zh: "户外", slot_en: "Outdoors", options: [
        o("Discovery Park", "Magnolia", "hike", 1, "Discovery 海崖步道", "Discovery Park bluff trail", "走到灯塔，海风很大", "Hike out to the lighthouse, brisk and breezy"),
        o("Golden Gardens Park", "Ballard", "beach", 1, "Golden Gardens 沙滩", "Golden Gardens beach", "沙滩篝火坑，晴天看雪山落日", "Beach fire pits, mountain sunsets on a clear day"),
        o("Alki Beach", "West Seattle", "beach", 1, "Alki 海滨长廊", "Alki Beach promenade", "正对天际线的散步道", "A boardwalk straight at the skyline"),
      ]},
      { time: "16:00", slot_zh: "观景", slot_en: "View", options: [
        o("Kerry Park", "Queen Anne", "viewpoint", 1, "Kerry Park 明信片机位", "Kerry Park postcard view", "太空针和雷尼尔山同框", "Space Needle and Mt Rainier in one frame"),
        o("Sky View Observatory", "Downtown", "viewpoint", 2, "73 层观景台", "73rd-floor observatory", "全城最高，俯瞰整个海湾", "The highest view in town, the whole bay below"),
        o("Seattle Great Wheel", "Waterfront", "amusement", 2, "海湾摩天轮", "Great Wheel on the bay", "海上转一圈看天际线", "A turn over the water, skyline all around"),
      ]},
      { time: "19:00", slot_zh: "晚餐", slot_en: "Dinner", options: [
        o("The Walrus and the Carpenter", "Ballard", "food", 3, "Ballard 生蚝吧", "Ballard oyster bar", "氛围满分，记得早点到占位", "All atmosphere — get there early for a seat"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Seafood chowder", "海风吹完来碗热的", "A warm bowl after all that sea air"),
        o("Molly Moon's", "Wallingford", "dessert", 1, "Molly Moon's 冰淇淋", "Molly Moon's ice cream", "蜂蜜薰衣草当收尾", "Finish with the honey lavender"),
      ]},
    ],
  },
  {
    mood: "fete",
    title_zh: "庆祝之夜",
    title_en: "A Night to Celebrate",
    summary_zh: "登顶地标，沉浸艺术，再来一顿值得的大餐——纪念日就该这么过。",
    summary_en: "Up the landmark, into the art, then a dinner worth the occasion — exactly how an anniversary should go.",
    stops: [
      { time: "14:00", slot_zh: "观光", slot_en: "Sightsee", options: [
        o("Space Needle", "Seattle Center", "landmark", 3, "太空针观景层", "Space Needle deck", "旋转玻璃地板，经典必打卡", "Rotating glass floor, the classic landmark"),
        o("Argosy Elliott Bay Cruise", "Waterfront", "water", 2, "海湾巡游", "Elliott Bay cruise", "一小时游船看天际线雪山", "An hour on the water, skyline and snowy peaks"),
        o("Seattle Great Wheel", "Waterfront", "amusement", 2, "封顶座厢摩天轮", "Great Wheel VIP gondola", "包个封顶座厢更有仪式感", "Splurge on the VIP gondola for the occasion"),
      ]},
      { time: "16:30", slot_zh: "艺术", slot_en: "Art", options: [
        o("Chihuly Garden and Glass", "Seattle Center", "museum", 3, "Chihuly 玻璃艺术", "Chihuly glass", "色彩炸裂，浪漫加分", "Riot of color, romance bonus"),
        o("Museum of Pop Culture", "Seattle Center", "museum", 3, "MoPOP 流行文化", "MoPOP pop culture", "科幻音乐，建筑本身就奇形怪状", "Sci-fi and music in a wild building"),
        o("Seattle Art Museum", "Downtown", "museum", 2, "SAM 艺术馆", "Seattle Art Museum", "市中心安静看展", "A calm downtown gallery hour"),
      ]},
      { time: "19:00", slot_zh: "大餐", slot_en: "Big dinner", options: [
        o("Canlis", "Queen Anne", "food", 3, "Canlis 天花板 fine dining", "Canlis fine dining", "西雅图顶级，纪念日专属", "Seattle's top tier, made for the big night"),
        o("The Walrus and the Carpenter", "Ballard", "food", 3, "生蚝吧", "Oyster bar", "想轻松点就来这", "If you'd rather keep it easy"),
        o("Din Tai Fung", "University Village", "food", 2, "鼎泰丰", "Din Tai Fung", "稳妥又好吃的备选", "The reliably delicious fallback"),
      ]},
    ],
  },
  {
    mood: null,
    title_zh: "市集与精酿",
    title_en: "Markets & Microbrews",
    summary_zh: "逛个街市，玩点室内的，最后泡进精酿啤酒花园——很西雅图的一天。",
    summary_en: "Browse a market, play something indoors, then settle into a beer garden — a very Seattle day.",
    stops: [
      { time: "12:30", slot_zh: "市集", slot_en: "Market", options: [
        o("Pike Place Market", "Downtown", "market", 1, "派克市场", "Pike Place Market", "本地手作和小吃，热闹开场", "Local makers and snacks, a lively start"),
        o("Ballard Farmers Market", "Ballard", "market", 1, "Ballard 周日街市", "Ballard Sunday market", "下雨照常开的本地农产", "Local produce, rain or shine"),
        o("Fremont Sunday Market", "Fremont", "market", 1, "Fremont 跳蚤市场", "Fremont flea market", "古着和跳蚤，最 Fremont", "Vintage and flea finds, peak Fremont"),
      ]},
      { time: "15:00", slot_zh: "好玩", slot_en: "Fun", options: [
        o("Flatstick Pub", "Pioneer Square", "quirky", 2, "室内迷你高尔夫", "Indoor mini-golf", "迷你高尔夫配本地精酿", "Mini-golf with a local pint"),
        o("Seattle Pinball Museum", "Chinatown-ID", "quirky", 2, "弹珠机博物馆", "Pinball museum", "一票畅玩，胜负欲拉满", "Unlimited play, bring your competitive streak"),
        o("Garage Billiards", "Capitol Hill", "quirky", 2, "复古保龄台球", "Retro bowling & billiards", "保龄加台球，越夜越闹", "Bowling and billiards, livelier late"),
      ]},
      { time: "18:00", slot_zh: "精酿", slot_en: "Brews", options: [
        o("Fremont Brewing", "Fremont", "brewery", 2, "Fremont 啤酒花园", "Fremont beer garden", "露天花园，可自带小食", "Open-air garden, BYO snacks welcome"),
        o("Stoup Brewing", "Ballard", "brewery", 2, "Stoup 人气精酿", "Stoup taproom", "Ballard 人气，常有餐车", "Popular in Ballard, food trucks most days"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤收尾", "Chowder to finish", "想吃正餐就来碗热汤", "A hot bowl if you'd rather a real meal"),
      ]},
    ],
  },
];
