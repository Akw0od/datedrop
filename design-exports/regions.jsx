/* global React */
/* DateDrop · 湾区片区数据 + 选择地点 UI
 * IIFE-isolated. Exports window.REGIONS, window.LocationStep (onboarding),
 * window.LocationSheet (plan-page bottom sheet).
 */
(function () {
  const { useState } = React;

  function Ph({ name, className = "", style }) {
    return <i className={`ph ${name} ${className}`} style={style} />;
  }
  function SectionLabel({ children, className = "" }) {
    return (
      <div className={`t-muted text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>
        {children}
      </div>
    );
  }
  function StatusBar() {
    return (
      <div className="t-text flex items-center justify-between px-7 pt-3.5 pb-1.5 shrink-0">
        <span className="font-mono text-[15px] font-medium tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5 text-[15px]">
          <Ph name="ph-cell-signal-full ph-fill" />
          <Ph name="ph-wifi-high ph-fill" />
          <Ph name="ph-battery-full ph-fill" />
        </div>
      </div>
    );
  }

  /* ================================================================ *
   *  REGION DATA  ·  each is a full, independent Saturday plan
   * ================================================================ */
  const REGIONS = [
    {
      id: "sf",
      name: "旧金山",
      sub: "城里就够你们逛一整天",
      icon: "ph-buildings",
      weather: "晴", temp: "18°C", dist: "14 mi", drive: "38 min", fromHome: { time: "9 min", dist: "2.4 mi" },
      stations: [
        { time: "14:30", leadIn: "下午先动起来", driveToNext: { time: "12 min", dist: "4.2 mi" }, alts: [
          { title: "迷你高尔夫对决", venue: "Urban Putt", area: "Mission", note: "输的人请下一站的单", price: 36, kind: "玩乐" },
          { title: "food truck 巡场", venue: "Spark Social SF", area: "Mission Bay", note: "十几家轮着点,别一上来吃太饱", price: 28, kind: "吃喝" },
          { title: "打两局保龄", venue: "Mission Bowling Club", area: "Mission", note: "他们家的薯条值得专程来", price: 32, kind: "玩乐" },
          { title: "逛个科学馆", venue: "Cal Academy of Sciences", area: "Golden Gate Park", note: "三点的雨林馆人最少", price: 45, kind: "文艺" },
        ]},
        { time: "17:00", leadIn: "趁天没黑,去海边", driveToNext: { time: "18 min", dist: "6.1 mi" }, alts: [
          { title: "海崖步道走一段", venue: "Lands End Trail", area: "Outer Richmond", note: "海边风大,给她带件外套", price: 0, kind: "散步" },
          { title: "看一场日落", venue: "Baker Beach", area: "Presidio", note: "今天 8:21 日落,提前半小时到", price: 0, kind: "散步" },
          { title: "草坪上躺会儿", venue: "Crissy Field", area: "Marina", note: "桥就在正前方,适合拍照", price: 0, kind: "散步" },
          { title: "沿海骑车", venue: "Ocean Beach", area: "Sunset", note: "路边能租到双人车", price: 22, kind: "玩乐" },
        ]},
        { time: "19:30", leadIn: "慢慢收尾", driveToNext: null, alts: [
          { title: "慢慢吃顿晚饭", venue: "Ferry Building", area: "Embarcadero", note: "靠窗的位子要提前 5 分钟到", price: 38, kind: "吃喝" },
          { title: "天井里吃一顿", venue: "Foreign Cinema", area: "Mission", note: "墙上会放老电影,挑里院", price: 52, kind: "吃喝" },
          { title: "来一打生蚝", venue: "Hog Island Oyster Co.", area: "Embarcadero", note: "Happy hour 到 6 点,卡着点去", price: 40, kind: "吃喝" },
          { title: "意面配红酒", venue: "Zuni Café", area: "Hayes Valley", note: "烤鸡要等一小时,先点别的", price: 46, kind: "吃喝" },
        ]},
      ],
    },
    {
      id: "eastbay",
      name: "东湾",
      sub: "Oakland 跟 Berkeley,松弛有阳光",
      icon: "ph-tree",
      weather: "晴", temp: "21°C", dist: "16 mi", drive: "41 min", fromHome: { time: "11 min", dist: "3.1 mi" },
      stations: [
        { time: "14:00", leadIn: "下午先动起来", driveToNext: { time: "14 min", dist: "5.0 mi" }, alts: [
          { title: "湖上划船", venue: "Lake Merritt Boating Center", area: "Oakland", note: "脚踏船比划艇省力,适合边聊边划", price: 24, kind: "玩乐" },
          { title: "逛小巷市集", venue: "Temescal Alley", area: "Oakland", note: "理发店隔壁那家冰淇淋别错过", price: 18, kind: "吃喝" },
          { title: "看个展", venue: "BAMPFA", area: "Berkeley", note: "周六下午常有老电影放映", price: 28, kind: "文艺" },
        ]},
        { time: "16:30", leadIn: "去湾边走走", driveToNext: { time: "16 min", dist: "6.0 mi" }, alts: [
          { title: "码头看日落", venue: "Berkeley Marina", area: "Berkeley", note: "正对金门桥,风比城里小", price: 0, kind: "散步" },
          { title: "玫瑰园散步", venue: "Berkeley Rose Garden", area: "Berkeley", note: "层层叠叠的台阶,拍照很出片", price: 0, kind: "散步" },
          { title: "海滨栈道", venue: "Middle Harbor Shoreline Park", area: "Oakland", note: "看货轮进港,意外地解压", price: 0, kind: "散步" },
        ]},
        { time: "19:00", leadIn: "慢慢收尾", driveToNext: null, alts: [
          { title: "慢慢吃顿晚饭", venue: "Wood Tavern", area: "Rockridge", note: "周六满座,务必先订位", price: 44, kind: "吃喝" },
          { title: "来份德州烤肉", venue: "Horn Barbecue", area: "West Oakland", note: "去晚了肋排会卖光", price: 39, kind: "吃喝" },
          { title: "吃顿越南菜", venue: "Le Cheval", area: "Downtown Oakland", note: "招牌火锅两人份刚好", price: 34, kind: "吃喝" },
        ]},
      ],
    },
    {
      id: "peninsula",
      name: "半岛",
      sub: "往南开一点,海岸线更开阔",
      icon: "ph-mountains",
      weather: "多云", temp: "17°C", dist: "22 mi", drive: "52 min", fromHome: { time: "13 min", dist: "4.0 mi" },
      stations: [
        { time: "13:30", leadIn: "下午先动起来", driveToNext: { time: "15 min", dist: "7.0 mi" }, alts: [
          { title: "逛庄园花园", venue: "Filoli", area: "Woodside", note: "买联票能进后山步道", price: 30, kind: "文艺" },
          { title: "校园里骑行", venue: "Stanford Campus", area: "Stanford", note: "棕榈大道尽头的教堂值得一看", price: 0, kind: "玩乐" },
          { title: "逛个小花园", venue: "Gamble Garden", area: "Palo Alto", note: "免费,但周六关得早,先去", price: 0, kind: "散步" },
        ]},
        { time: "16:30", leadIn: "去海边吹风", driveToNext: { time: "22 min", dist: "12 mi" }, alts: [
          { title: "海滩走一段", venue: "Half Moon Bay State Beach", area: "Half Moon Bay", note: "雾来得快,外套别落车上", price: 0, kind: "散步" },
          { title: "看潮池生物", venue: "Fitzgerald Marine Reserve", area: "Moss Beach", note: "退潮时才看得到海星", price: 0, kind: "散步" },
          { title: "渔港边逛逛", venue: "Pillar Point Harbor", area: "El Granada", note: "码头尽头有现煮蟹", price: 16, kind: "吃喝" },
        ]},
        { time: "19:00", leadIn: "慢慢收尾", driveToNext: null, alts: [
          { title: "来锅海鲜杂烩", venue: "Sam's Chowder House", area: "Half Moon Bay", note: "龙虾卷两人分一个正好", price: 48, kind: "吃喝" },
          { title: "吃顿越南菜", venue: "Tamarine", area: "Palo Alto", note: "回程顺路,环境很舒服", price: 54, kind: "吃喝" },
          { title: "地中海小馆", venue: "Cetrella", area: "Half Moon Bay", note: "壁炉边的位子要碰运气", price: 50, kind: "吃喝" },
        ]},
      ],
    },
    {
      id: "northbay",
      name: "北湾",
      sub: "过桥到 Marin,红杉与海湾",
      icon: "ph-sailboat",
      weather: "晴", temp: "19°C", dist: "19 mi", drive: "58 min", fromHome: { time: "15 min", dist: "5.2 mi" },
      stations: [
        { time: "13:30", leadIn: "下午先动起来", driveToNext: { time: "16 min", dist: "5.5 mi" }, alts: [
          { title: "海湾小镇闲逛", venue: "Sausalito Waterfront", area: "Sausalito", note: "渡轮过来最有感觉,免停车烦恼", price: 0, kind: "散步" },
          { title: "划皮划艇", venue: "Sea Trek", area: "Sausalito", note: "新手选双人艇,有教练带", price: 42, kind: "玩乐" },
          { title: "骑车过金门桥", venue: "Golden Gate Bridge", area: "Sausalito", note: "顺风去逆风回,量力而行", price: 26, kind: "玩乐" },
        ]},
        { time: "16:00", leadIn: "进山看景", driveToNext: { time: "25 min", dist: "9.0 mi" }, alts: [
          { title: "走进红杉林", venue: "Muir Woods", area: "Mill Valley", note: "必须提前网上订停车位", price: 30, kind: "散步" },
          { title: "山顶看日落", venue: "Mount Tamalpais", area: "Mill Valley", note: "East Peak 的视野最好", price: 0, kind: "散步" },
          { title: "山谷步道", venue: "Tennessee Valley Trail", area: "Mill Valley", note: "平缓好走,尽头就是海滩", price: 0, kind: "散步" },
        ]},
        { time: "19:00", leadIn: "慢慢收尾", driveToNext: null, alts: [
          { title: "海景边吃晚饭", venue: "Sam's Anchor Cafe", area: "Tiburon", note: "露台位子看得到城里的灯", price: 46, kind: "吃喝" },
          { title: "来份海鲜", venue: "Scoma's", area: "Sausalito", note: "靠水的老馆子,蟹做得地道", price: 52, kind: "吃喝" },
          { title: "小馆子收尾", venue: "Bungalow 44", area: "Mill Valley", note: "回程顺路,氛围放松", price: 43, kind: "吃喝" },
        ]},
      ],
    },
    {
      id: "seattle",
      name: "西雅图",
      sub: "出趟远门,换座城过周六",
      icon: "ph-coffee",
      weather: "多云", temp: "15°C", dist: "11 mi", drive: "34 min", fromHome: { time: "8 min", dist: "2.0 mi" },
      stations: [
        { time: "13:30", leadIn: "下午先动起来", driveToNext: { time: "10 min", dist: "3.5 mi" }, alts: [
          { title: "逛公共市场", venue: "Pike Place Market", area: "Downtown", note: "一开门人最少,先去看抛鱼", price: 0, kind: "散步" },
          { title: "看玻璃艺术", venue: "Chihuly Garden and Glass", area: "Seattle Center", note: "傍晚灯一亮,玻璃园最好看", price: 36, kind: "文艺" },
          { title: "逛流行文化馆", venue: "MoPOP", area: "Seattle Center", note: "吉他塔下拍照,科幻馆值得细看", price: 34, kind: "文艺" },
        ]},
        { time: "16:30", leadIn: "去高处看天际线", driveToNext: { time: "12 min", dist: "4.0 mi" }, alts: [
          { title: "看一场日落", venue: "Kerry Park", area: "Queen Anne", note: "晴天能望到 Rainier,带件外套", price: 0, kind: "散步" },
          { title: "草坪上躺会儿", venue: "Gas Works Park", area: "Wallingford", note: "斜坡看湖景,适合躺着聊天", price: 0, kind: "散步" },
          { title: "海滩走一段", venue: "Alki Beach", area: "West Seattle", note: "对岸就是天际线,有车可租", price: 0, kind: "散步" },
        ]},
        { time: "19:00", leadIn: "慢慢收尾", driveToNext: null, alts: [
          { title: "慢慢吃顿晚饭", venue: "The Pink Door", area: "Downtown", note: "藏在巷子里没招牌,务必先订位", price: 48, kind: "吃喝" },
          { title: "来一打生蚝", venue: "Elliott's Oyster House", area: "Waterfront", note: "happy hour 生蚝便宜,卡点去", price: 52, kind: "吃喝" },
          { title: "马来风味收尾", venue: "Kedai Makan", area: "Capitol Hill", note: "招牌叻沙够两个人分", price: 36, kind: "吃喝" },
        ]},
      ],
    },
  ];

  const findRegion = (id) => REGIONS.find((r) => r.id === id) || REGIONS[0];

  /* ---------- base address field (map placeholder) ---------- */
  function BaseAddressField({ address, setAddress, regionName }) {
    const locate = () => setAddress("Valencia St · Mission");
    return (
      <div className="t-card t-border overflow-hidden rounded-[1.5rem] border"
           style={{ boxShadow: "0 12px 28px -18px rgba(0,0,0,0.08)" }}>
        {/* map placeholder strip */}
        <div className="relative h-20 t-subtle"
             style={{ backgroundImage: "repeating-linear-gradient(0deg, var(--hair) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--hair) 0 1px, transparent 1px 26px)" }}>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <Ph name="ph-map-pin ph-fill" style={{ fontSize: 26, color: "var(--accent)" }} />
          </span>
          <span className="t-muted absolute bottom-2 right-3 text-[10px]">地图示意</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Ph name="ph-house-line" style={{ fontSize: 18, color: "var(--muted)" }} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="输入你们家的街道 / 小区"
            className="t-text w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-[var(--faint)]"
          />
          <button onClick={locate}
                  className="press t-subtle t-text2 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium">
            <Ph name="ph-crosshair" style={{ fontSize: 14 }} /> 定位
          </button>
        </div>
      </div>
    );
  }

  /* ---------- shared region row ---------- */
  function RegionRow({ region, selected, isBase, onSelect, delay }) {
    const venues = region.stations.map((s) => s.alts[0].venue).slice(0, 3).join(" · ");
    return (
      <button
        onClick={onSelect}
        className={`drop relative flex w-full items-start gap-3.5 rounded-[1.5rem] border p-4 text-left transition-all t-card ${
          selected ? "t-accent-bd" : "t-border"
        }`}
        style={{
          animationDelay: `${delay}ms`,
          boxShadow: selected ? "0 14px 30px -16px var(--accent-shadow)" : "0 12px 28px -18px rgba(0,0,0,0.08)",
        }}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? "t-accent-bg" : "t-subtle"}`}>
          <Ph name={region.icon} style={{ fontSize: 21, color: selected ? "#fff" : "var(--text3)" }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="t-text text-[16px] font-semibold tracking-tight">{region.name}</span>
            {isBase && (
              <span className="t-accent-soft t-accent-text inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                <Ph name="ph-house-line ph-fill" style={{ fontSize: 10 }} /> 你们的地盘
              </span>
            )}
            <span className="t-chip t-text3 rounded-full px-2 py-0.5 font-mono text-[10px]">{region.weather} {region.temp}</span>
          </div>
          <p className="t-text3 mt-0.5 text-[13px]">{region.sub}</p>
          <p className="t-faint mt-1.5 truncate text-[11px]">{venues}</p>
        </div>
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? "t-accent-bg border-transparent" : "t-border"
        }`}>
          {selected && <Ph name="ph-check ph-bold" style={{ fontSize: 11, color: "#fff" }} />}
        </span>
      </button>
    );
  }

  /* ================================================================ *
   *  ONBOARDING · LocationStep  (last step of login flow)
   * ================================================================ */
  function LocationStep({ region, setRegion, address, setAddress, back, onConfirm }) {
    const cur = findRegion(region);
    return (
      <div className="flex h-full flex-col">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-1 pb-2">
          <button onClick={back} className="press t-chip t-text3 flex h-9 w-9 items-center justify-center rounded-full">
            <Ph name="ph-arrow-left ph-bold" style={{ fontSize: 16 }} />
          </button>
          <span className="t-muted inline-flex items-center gap-1.5 text-[12px] font-medium">
            <Ph name="ph-heart ph-fill" style={{ fontSize: 13, color: "var(--accent)" }} /> 已配对
          </span>
          <span className="w-9" />
        </div>

        <div className="no-sb flex-1 overflow-y-auto px-6 pt-2">
          <SectionLabel className="drop">最后一步 · 设个主场</SectionLabel>
          <h2 className="drop t-text mt-2 text-[26px] font-semibold leading-tight tracking-tight" style={{ animationDelay: "60ms" }}>
            你们俩的<br />地盘在哪?
          </h2>
          <p className="drop t-text3 mt-2.5 text-[14px] leading-relaxed" style={{ animationDelay: "100ms" }}>
            选一个常驻片区当主场,留个出发地址,计划会从你们家门口开始算。随时能在计划页里改。
          </p>

          <div className="drop mt-5" style={{ animationDelay: "140ms" }}>
            <SectionLabel className="ml-1 mb-2">你们的家</SectionLabel>
            <BaseAddressField address={address} setAddress={setAddress} regionName={cur.name} />
          </div>

          <SectionLabel className="drop ml-1 mt-6 mb-2" style={{ animationDelay: "180ms" }}>主场片区</SectionLabel>
          <div className="space-y-3">
            {REGIONS.map((r, i) => (
              <RegionRow key={r.id} region={r} selected={region === r.id} isBase={region === r.id}
                         onSelect={() => setRegion(r.id)} delay={210 + i * 60} />
            ))}
          </div>
        </div>

        <div className="shrink-0 px-6 pb-8 pt-3">
          <button onClick={onConfirm}
                  className="press t-accent-bg flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-semibold shadow-[0_14px_30px_-10px_var(--accent-shadow)]">
            以{cur.name}为主场,生成计划 <Ph name="ph-arrow-right ph-bold" style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ *
   *  PLAN PAGE · LocationSheet  (tap header to change region)
   * ================================================================ */
  function LocationSheet({ region, baseRegion, baseAddress, setBaseRegion, setBaseAddress, onApply, onClose }) {
    const [temp, setTemp] = useState(region);
    const [showAddr, setShowAddr] = useState(false);
    return (
      <div className="absolute inset-0 z-30 flex flex-col justify-end">
        <div className="scrim-in t-scrim absolute inset-0 backdrop-blur-[2px]" onClick={onClose} />
        <div className="sheet-in t-bg relative rounded-t-[2rem] pb-7 pt-2.5 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.25)]">
          <div className="t-hair-bg mx-auto mb-3 h-1 w-9 rounded-full" />
          <div className="flex items-center justify-between px-5">
            <div>
              <SectionLabel>换个地点</SectionLabel>
              <div className="t-text mt-0.5 text-[15px] font-semibold tracking-tight">这周想去哪一带?</div>
            </div>
            <button onClick={onClose} className="press t-chip t-text3 flex h-8 w-8 items-center justify-center rounded-full">
              <Ph name="ph-x ph-bold" style={{ fontSize: 15 }} />
            </button>
          </div>

          {/* home base row */}
          <div className="mt-3.5 px-5">
            {showAddr ? (
              <BaseAddressField address={baseAddress} setAddress={setBaseAddress} regionName={findRegion(baseRegion).name} />
            ) : (
              <button onClick={() => setShowAddr(true)}
                      className="press t-subtle flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-3 text-left">
                <Ph name="ph-house-line ph-fill" style={{ fontSize: 17, color: "var(--accent)" }} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="t-muted text-[10px] font-semibold uppercase tracking-[0.14em]">你们的家 · {findRegion(baseRegion).name}</div>
                  <div className="t-text2 truncate text-[13px] font-medium">{baseAddress || "还没填地址,点这里设置"}</div>
                </div>
                <Ph name="ph-pencil-simple" style={{ fontSize: 15, color: "var(--muted)" }} />
              </button>
            )}
          </div>

          <div className="mt-3 max-h-[42vh] space-y-2.5 overflow-y-auto px-5 no-sb">
            {REGIONS.map((r, i) => (
              <div key={r.id} className="relative">
                <RegionRow region={r} selected={temp === r.id} isBase={baseRegion === r.id}
                           onSelect={() => setTemp(r.id)} delay={i * 50} />
                {temp === r.id && baseRegion !== r.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setBaseRegion(r.id); }}
                    className="press t-card t-accent-soft-bd t-accent-text absolute bottom-3 right-12 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                    设为主场
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 px-5">
            <button onClick={() => onApply(temp)}
                    className="press t-ink w-full rounded-2xl py-4 text-[15px] font-semibold shadow-[0_14px_28px_-12px_rgba(0,0,0,0.5)]">
              {temp === region ? "就用这个地点" : `换到${findRegion(temp).name},重排计划`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.REGIONS = REGIONS;
  window.findRegion = findRegion;
  window.LocationStep = LocationStep;
  window.LocationSheet = LocationSheet;
})();
