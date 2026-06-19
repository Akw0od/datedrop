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
  {
    mood: "chill",
    title_zh: "湖边慢日子",
    title_en: "A Lakeside Easy Day",
    summary_zh: "环湖散步，划只小木船，冰淇淋收尾——不赶时间的一天。",
    summary_en: "A loop around the lake, a little wooden boat, ice cream to end — a day with nowhere to be.",
    stops: [
      { time: "13:30", slot_zh: "散步", slot_en: "Stroll", options: [
        o("Green Lake Park", "Green Lake", "park", 1, "Green Lake 环湖", "Green Lake loop", "4.8km 平路，散步骑行都行", "A flat 3-mile loop, walk it or bike it"),
        o("Gas Works Park", "Wallingford", "park", 1, "Gas Works 草坡", "Gas Works hill", "废工厂草坡看天际线", "Skyline views from the old gasworks hill"),
        o("Washington Park Arboretum", "Madison Park", "garden", 1, "植物园漫步", "Arboretum walk", "230 英亩绿意，安静", "230 quiet green acres"),
      ]},
      { time: "16:00", slot_zh: "水上", slot_en: "On water", options: [
        o("Center for Wooden Boats", "South Lake Union", "water", 1, "划木船游联合湖", "Row on Lake Union", "免费划木船，小而浪漫", "Row a wooden boat, small and romantic"),
        o("Argosy Elliott Bay Cruise", "Waterfront", "water", 2, "海湾巡游", "Harbor cruise", "一小时船游看雪山", "An hour out with mountain views"),
        o("Alki Beach", "West Seattle", "beach", 1, "Alki 海滨长廊", "Alki promenade", "正对天际线的散步道", "A boardwalk at the skyline"),
      ]},
      { time: "18:00", slot_zh: "甜点", slot_en: "Sweet", options: [
        o("Molly Moon's", "Wallingford", "dessert", 1, "Molly Moon's 冰淇淋", "Molly Moon's ice cream", "蜂蜜薰衣草必点", "Get the honey lavender"),
        o("Salt & Straw", "Capitol Hill", "dessert", 2, "Salt & Straw 冰淇淋", "Salt & Straw ice cream", "脑洞口味", "Wildly inventive flavors"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Seafood chowder", "想吃正餐就来这", "If you'd rather a real meal"),
      ]},
    ],
  },
  {
    mood: "spark",
    title_zh: "高空与海浪",
    title_en: "Heights & Waves",
    summary_zh: "先登高俯瞰全城，再下到海边吹风，生蚝收尾——有起伏的一天。",
    summary_en: "Up for the city view, down to the shore for the wind, oysters to finish — a day with some range.",
    stops: [
      { time: "14:00", slot_zh: "登高", slot_en: "Up high", options: [
        o("Sky View Observatory", "Downtown", "viewpoint", 2, "73 层观景台", "73rd-floor observatory", "全城最高视野", "The highest view in town"),
        o("Space Needle", "Seattle Center", "landmark", 3, "太空针", "Space Needle", "旋转玻璃地板", "Rotating glass floor"),
        o("Kerry Park", "Queen Anne", "viewpoint", 1, "Kerry Park 机位", "Kerry Park view", "太空针配雷尼尔山", "Space Needle and Mt Rainier"),
      ]},
      { time: "16:30", slot_zh: "海边", slot_en: "Seaside", options: [
        o("Alki Beach", "West Seattle", "beach", 1, "Alki 海滩", "Alki Beach", "海风长廊", "Breezy boardwalk"),
        o("Golden Gardens Park", "Ballard", "beach", 1, "Golden Gardens", "Golden Gardens", "沙滩篝火坑", "Beach fire pits"),
        o("Discovery Park", "Magnolia", "hike", 1, "Discovery 海崖", "Discovery bluff", "走到灯塔", "Hike to the lighthouse"),
      ]},
      { time: "19:00", slot_zh: "生蚝", slot_en: "Oysters", options: [
        o("The Walrus and the Carpenter", "Ballard", "food", 3, "Ballard 生蚝吧", "Ballard oyster bar", "早点到占位", "Get there early"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Seafood chowder", "海风后来碗热的", "A warm bowl after the wind"),
        o("Din Tai Fung", "University Village", "food", 2, "鼎泰丰", "Din Tai Fung", "稳妥又好吃", "Reliably delicious"),
      ]},
    ],
  },
  {
    mood: "fete",
    title_zh: "摩天轮之夜",
    title_en: "Great Wheel Night",
    summary_zh: "海湾巡游、登高、再来一顿值得的大餐——仪式感拉满的庆祝夜。",
    summary_en: "A bay cruise, a high view, then a dinner worth it — a celebration night with all the ceremony.",
    stops: [
      { time: "15:00", slot_zh: "海湾", slot_en: "Bayfront", options: [
        o("Seattle Great Wheel", "Waterfront", "amusement", 2, "海湾摩天轮", "The Great Wheel", "封顶座厢更有仪式感", "Splurge on the VIP gondola"),
        o("Argosy Elliott Bay Cruise", "Waterfront", "water", 2, "海湾巡游", "Harbor cruise", "天际线 + 雪山", "Skyline and snowy peaks"),
        o("Seattle Aquarium", "Pike Place", "aquarium", 2, "海滨水族馆", "Waterfront aquarium", "水獭和触摸池", "Sea otters and a touch pool"),
      ]},
      { time: "17:00", slot_zh: "观景", slot_en: "View", options: [
        o("Kerry Park", "Queen Anne", "viewpoint", 1, "Kerry Park 日落", "Kerry Park sunset", "明信片机位", "The postcard view"),
        o("Sky View Observatory", "Downtown", "viewpoint", 2, "73 层观景", "73rd-floor view", "全城最高", "The highest in town"),
        o("Space Needle", "Seattle Center", "landmark", 3, "太空针", "Space Needle", "经典必打卡", "The classic landmark"),
      ]},
      { time: "19:30", slot_zh: "大餐", slot_en: "Feast", options: [
        o("Canlis", "Queen Anne", "food", 3, "Canlis fine dining", "Canlis fine dining", "西雅图顶级", "Seattle's top tier"),
        o("The Walrus and the Carpenter", "Ballard", "food", 3, "生蚝吧", "Oyster bar", "想轻松点来这", "If you'd rather keep it easy"),
        o("Din Tai Fung", "University Village", "food", 2, "鼎泰丰", "Din Tai Fung", "稳妥备选", "The reliable fallback"),
      ]},
    ],
  },
  {
    mood: null,
    title_zh: "博物馆日",
    title_en: "A Museum Day",
    summary_zh: "市场起个头，泡一下午展馆，热乎晚餐收尾——下雨也不怕的文化日。",
    summary_en: "Start at the market, spend the afternoon in galleries, a warm dinner to end — a culture day, rain or not.",
    stops: [
      { time: "12:30", slot_zh: "市场", slot_en: "Market", options: [
        o("Pike Place Market", "Downtown", "market", 1, "派克市场", "Pike Place Market", "飞鱼摊热闹开场", "The flying-fish market, a lively start"),
        o("Storyville Coffee", "Pike Place", "coffee", 2, "Storyville 手冲", "Storyville pour-over", "靠窗慢慢醒", "Wake up slowly by the window"),
        o("Ballard Farmers Market", "Ballard", "market", 1, "Ballard 周日市集", "Ballard Sunday market", "本地农产", "Local produce"),
      ]},
      { time: "15:00", slot_zh: "展馆", slot_en: "Gallery", options: [
        o("Museum of Flight", "Tukwila", "museum", 2, "航空博物馆", "Museum of Flight", "能登上真飞机", "Walk aboard real aircraft"),
        o("Seattle Art Museum", "Downtown", "museum", 2, "SAM 艺术馆", "Seattle Art Museum", "市中心安静看展", "A calm downtown gallery"),
        o("Pacific Science Center", "Seattle Center", "museum", 2, "科学中心", "Science Center", "蝴蝶馆 + IMAX", "Butterflies and IMAX"),
      ]},
      { time: "18:00", slot_zh: "晚餐", slot_en: "Dinner", options: [
        o("Din Tai Fung", "University Village", "food", 2, "鼎泰丰小笼包", "Din Tai Fung", "热乎管饱", "Warm and satisfying"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Seafood chowder", "得奖的一碗", "The award-winning bowl"),
        o("Salt & Straw", "Capitol Hill", "dessert", 2, "Salt & Straw", "Salt & Straw", "甜点收尾", "End on a scoop"),
      ]},
    ],
  },
  {
    mood: "spark",
    title_zh: "城市玩家",
    title_en: "City Player",
    summary_zh: "逛个市集，玩点室内的，泡进精酿花园——很西雅图、不无聊的一天。",
    summary_en: "Browse a market, play something indoors, settle into a beer garden — a very Seattle, never-dull day.",
    stops: [
      { time: "13:00", slot_zh: "逛", slot_en: "Wander", options: [
        o("Pike Place Market", "Downtown", "market", 1, "派克市场 + 口香糖墙", "Pike Place + Gum Wall", "经典打卡", "The classic stops"),
        o("Fremont Sunday Market", "Fremont", "market", 1, "Fremont 跳蚤", "Fremont flea market", "古着和小吃", "Vintage and snacks"),
        o("Ballard Farmers Market", "Ballard", "market", 1, "Ballard 市集", "Ballard market", "下雨照常开", "Rain or shine"),
      ]},
      { time: "15:30", slot_zh: "好玩", slot_en: "Fun", options: [
        o("Seattle Pinball Museum", "Chinatown-ID", "quirky", 2, "弹珠机博物馆", "Pinball museum", "一票畅玩", "Unlimited play"),
        o("Flatstick Pub", "Pioneer Square", "quirky", 2, "室内迷你高尔夫", "Indoor mini-golf", "迷你高尔夫配精酿", "Mini-golf and a pint"),
        o("Garage Billiards", "Capitol Hill", "quirky", 2, "复古保龄台球", "Retro bowling", "保龄加台球", "Bowling and billiards"),
      ]},
      { time: "18:00", slot_zh: "精酿", slot_en: "Brews", options: [
        o("Fremont Brewing", "Fremont", "brewery", 2, "Fremont 啤酒花园", "Fremont beer garden", "露天，可自带小食", "Open-air, BYO snacks"),
        o("Stoup Brewing", "Ballard", "brewery", 2, "Stoup 精酿", "Stoup taproom", "常有餐车", "Food trucks most days"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Chowder", "想吃正餐", "If you want a real meal"),
      ]},
    ],
  },
  {
    mood: null,
    title_zh: "花园与艺术",
    title_en: "Gardens & Art",
    summary_zh: "在花园里慢慢走，看场展，冰淇淋收尾——温柔安静的一天。",
    summary_en: "A slow wander through gardens, an exhibit, ice cream to finish — a gentle, quiet day.",
    stops: [
      { time: "13:30", slot_zh: "花园", slot_en: "Garden", options: [
        o("Washington Park Arboretum", "Madison Park", "garden", 1, "植物园漫步", "Arboretum walk", "春樱秋叶", "Cherry blossoms and fall color"),
        o("Kubota Garden", "Rainier Beach", "garden", 1, "久保田日式庭园", "Kubota Garden", "免费、清净小众", "Free, peaceful, hidden"),
        o("Volunteer Park Conservatory", "Capitol Hill", "garden", 1, "维多利亚温室", "Victorian conservatory", "雨天躲进热带", "Duck into the tropics"),
      ]},
      { time: "16:00", slot_zh: "艺术", slot_en: "Art", options: [
        o("Frye Art Museum", "First Hill", "museum", 1, "Frye 免费艺术馆", "The Frye (free)", "安静小而美", "Small, quiet, lovely"),
        o("Seattle Art Museum", "Downtown", "museum", 2, "SAM", "Seattle Art Museum", "常设 + 特展", "Permanent and special shows"),
        o("Chihuly Garden and Glass", "Seattle Center", "museum", 3, "Chihuly 玻璃艺术", "Chihuly glass", "色彩炸裂", "A riot of color"),
      ]},
      { time: "18:00", slot_zh: "甜点", slot_en: "Sweet", options: [
        o("Salt & Straw", "Capitol Hill", "dessert", 2, "Salt & Straw", "Salt & Straw", "排队也认了", "Worth the queue"),
        o("Molly Moon's", "Wallingford", "dessert", 1, "Molly Moon's", "Molly Moon's", "本地手工冰淇淋", "Local handmade ice cream"),
        o("Pike Place Chowder", "Pike Place", "food", 2, "海鲜浓汤", "Chowder", "想吃咸的", "If you want something savory"),
      ]},
    ],
  },
];
