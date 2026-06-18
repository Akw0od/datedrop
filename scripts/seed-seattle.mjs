// 西雅图场地库（真实地点，英文名 + 街区 + 双语备注）。替换旧的湾区库。
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// [name, area, category, price, indoor, lat, lng, notes_zh, notes_en, tags]
const V = [
  ["Storyville Coffee", "Pike Place", "coffee", 2, true, 47.6094, -122.3417, "派克市场楼上的网红咖啡，靠窗能看海湾", "Cozy hidden cafe above Pike Place, bay views from the window", ["coffee","cozy"]],
  ["Victrola Coffee Roasters", "Capitol Hill", "coffee", 1, true, 47.6133, -122.3201, "Capitol Hill 老牌精品咖啡，氛围松弛", "Capitol Hill stalwart roaster, easy unhurried vibe", ["coffee"]],
  ["Analog Coffee", "Capitol Hill", "coffee", 1, true, 47.6189, -122.3210, "极简空间，黑胶 + 手冲", "Minimalist room, vinyl and pour-overs", ["coffee","minimal"]],
  ["Pike Place Market", "Downtown", "market", 1, false, 47.6097, -122.3422, "经典飞鱼摊 + 初代星巴克，人多但值得", "The flying-fish market and original Starbucks — touristy but worth it", ["market","classic"]],
  ["Ballard Farmers Market", "Ballard", "market", 1, false, 47.6680, -122.3845, "周日街市，本地农产和手作，下雨照常开", "Sunday street market, local produce and makers, rain or shine", ["market","local"]],
  ["Fremont Sunday Market", "Fremont", "market", 1, false, 47.6510, -122.3500, "古着 + 跳蚤 + 小吃，最 Fremont 的下午", "Vintage, flea finds and street food — peak Fremont afternoon", ["market","vintage"]],
  ["Chihuly Garden and Glass", "Seattle Center", "museum", 3, true, 47.6206, -122.3503, "玻璃艺术殿堂，雨天首选，出片率极高", "Dazzling glass-art halls, top rainy-day pick, endlessly photogenic", ["art","indoor","date"]],
  ["Museum of Pop Culture", "Seattle Center", "museum", 3, true, 47.6215, -122.3481, "MoPOP，科幻音乐流行文化，建筑本身就奇形怪状", "MoPOP — sci-fi, music and pop culture in a wild Gehry building", ["museum","music"]],
  ["Seattle Art Museum", "Downtown", "museum", 2, true, 47.6075, -122.3380, "市中心 SAM，常设 + 特展都稳", "Downtown SAM, dependable permanent and special shows", ["art","museum"]],
  ["Frye Art Museum", "First Hill", "museum", 1, true, 47.6094, -122.3236, "免费小而美的艺术馆，安静", "Small, free, quietly lovely art museum", ["art","free","quiet"]],
  ["Museum of Flight", "Tukwila", "museum", 2, true, 47.5180, -122.2966, "能登上真飞机的航空馆，适合好奇心重的一对", "Walk-aboard aircraft galleries, great for the curious couple", ["museum"]],
  ["Pacific Science Center", "Seattle Center", "museum", 2, true, 47.6199, -122.3517, "蝴蝶馆 + IMAX，童心未泯版约会", "Butterfly house and IMAX, a playful date", ["science","indoor"]],
  ["Seattle Pinball Museum", "Chinatown-ID", "quirky", 2, true, 47.5980, -122.3235, "一票畅玩几十台弹珠机，胜负欲拉满", "Unlimited play on dozens of pinball machines, brings out the competitor", ["games","retro"]],
  ["Flatstick Pub", "Pioneer Square", "quirky", 2, true, 47.6009, -122.3340, "室内迷你高尔夫 + 本地精酿，下雨天的快乐", "Indoor mini-golf and local craft beer, rainy-day fun", ["minigolf","beer"]],
  ["Garage Billiards", "Capitol Hill", "quirky", 2, true, 47.6140, -122.3270, "复古保龄 + 台球，越夜越热闹", "Retro bowling and billiards, livelier as the night goes", ["bowling","night"]],
  ["Discovery Park", "Magnolia", "hike", 1, false, 47.6580, -122.4060, "海崖步道通往灯塔，西雅图最大公园", "Bluff trails out to the lighthouse, the city's biggest park", ["hike","views"]],
  ["Kerry Park", "Queen Anne", "viewpoint", 1, false, 47.6295, -122.3600, "明信片机位：太空针 + 雷尼尔山同框，日落绝佳", "The postcard view: Space Needle and Mt Rainier together, prime at sunset", ["view","sunset","free"]],
  ["Gas Works Park", "Wallingford", "park", 1, false, 47.6456, -122.3344, "废工厂改的草坡公园，放风筝看天际线", "Grassy hill over old gasworks, fly a kite, skyline views", ["park","picnic"]],
  ["Green Lake Park", "Green Lake", "park", 1, false, 47.6806, -122.3290, "环湖 4.8km 步道，散步骑行都行", "3-mile loop trail around the lake, walk or bike it", ["walk","lake"]],
  ["Washington Park Arboretum", "Madison Park", "garden", 1, false, 47.6390, -122.2960, "230 英亩植物园，春樱秋叶", "230-acre arboretum, cherry blossoms in spring, color in fall", ["garden","walk"]],
  ["Volunteer Park Conservatory", "Capitol Hill", "garden", 1, true, 47.6303, -122.3155, "维多利亚玻璃温室，雨天躲进热带", "Victorian glass conservatory, duck into the tropics on a wet day", ["garden","indoor"]],
  ["Kubota Garden", "Rainier Beach", "garden", 1, false, 47.5135, -122.2630, "免费日式庭园，清净小众", "Free Japanese garden, peaceful and under-the-radar", ["garden","free","quiet"]],
  ["Golden Gardens Park", "Ballard", "beach", 1, false, 47.6920, -122.4030, "沙滩 + 篝火坑，晴天看奥林匹克山落日", "Sandy beach with fire pits, Olympic Mountain sunsets on clear days", ["beach","sunset"]],
  ["Alki Beach", "West Seattle", "beach", 1, false, 47.5763, -122.4090, "海滨长廊正对天际线，像小加州", "Waterfront promenade facing the skyline, a little slice of California", ["beach","walk"]],
  ["Seattle Aquarium", "Pike Place", "aquarium", 2, true, 47.6075, -122.3430, "海滨水族馆，水獭和触摸池", "Waterfront aquarium, sea otters and a touch pool", ["indoor","animals"]],
  ["Seattle Great Wheel", "Waterfront", "amusement", 2, false, 47.6061, -122.3425, "海湾上的摩天轮，封顶座厢可包", "Bay-front Ferris wheel, splurge on the VIP gondola", ["view","ride"]],
  ["Sky View Observatory", "Downtown", "viewpoint", 2, true, 47.6045, -122.3300, "哥伦比亚中心 73 层，全城最高观景台", "73rd floor of Columbia Center, the city's highest viewpoint", ["view","indoor"]],
  ["Space Needle", "Seattle Center", "landmark", 3, false, 47.6205, -122.3493, "旋转玻璃地板观景层，经典必打卡", "Rotating glass-floor observation deck, the classic landmark", ["view","classic"]],
  ["Argosy Elliott Bay Cruise", "Waterfront", "water", 2, false, 47.6055, -122.3410, "一小时海湾巡游，天际线 + 雪山", "One-hour harbor cruise, skyline and snowcapped peaks", ["water","views"]],
  ["Center for Wooden Boats", "South Lake Union", "water", 1, false, 47.6270, -122.3360, "免费划木船游联合湖，小而浪漫", "Row a wooden boat on Lake Union, small and romantic, often free", ["water","romantic"]],
  ["Fremont Brewing", "Fremont", "brewery", 2, true, 47.6490, -122.3480, "露天啤酒花园，自取小食随便配", "Open-air beer garden, bring-your-own snacks welcome", ["beer","casual"]],
  ["Stoup Brewing", "Ballard", "brewery", 2, true, 47.6680, -122.3760, "Ballard 人气精酿，常有餐车", "Popular Ballard taproom, food trucks most days", ["beer"]],
  ["Pike Place Chowder", "Pike Place", "food", 2, true, 47.6093, -122.3410, "拿过奖的海鲜浓汤，永远在排队", "Award-winning clam chowder, the line is always worth it", ["food","seafood"]],
  ["Din Tai Fung", "University Village", "food", 2, true, 47.6630, -122.2980, "小笼包封神，约会安全牌", "Soup dumplings done right, a safe date-night bet", ["food"]],
  ["The Walrus and the Carpenter", "Ballard", "food", 3, true, 47.6657, -122.3840, "Ballard 生蚝吧，氛围满分，记得早到", "Ballard oyster bar, all atmosphere, get there early", ["food","oysters","date"]],
  ["Canlis", "Queen Anne", "food", 3, true, 47.6395, -122.3470, "西雅图天花板级 fine dining，纪念日专属", "Seattle's top-tier fine dining, save it for the big anniversary", ["food","fancy"]],
  ["Salt & Straw", "Capitol Hill", "dessert", 2, true, 47.6140, -122.3190, "脑洞冰淇淋口味，排队也认了", "Wildly inventive ice-cream flavors, worth the queue", ["dessert"]],
  ["Molly Moon's", "Wallingford", "dessert", 1, true, 47.6610, -122.3340, "本地手工冰淇淋，蜂蜜薰衣草必点", "Local handmade ice cream, get the honey lavender", ["dessert"]],
];

await db.from("venues").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const rows = V.map(([name, area, category, price_level, indoor, lat, lng, notes, notes_en, tags]) => ({
  name, city: "seattle", area, category, price_level, indoor, lat, lng, notes, notes_en, tags,
  duration_hours: 2, hours_verified: false, is_active: true,
}));
const { error } = await db.from("venues").insert(rows);
if (error) console.log("ERR", error.message);
else console.log(`✅ 西雅图场地库已建：${rows.length} 个场地`);
