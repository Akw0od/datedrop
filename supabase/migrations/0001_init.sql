-- DateDrop 初始 schema
-- 9 张核心表 + RLS + 匹配触发器 + 邀请绑定函数

-- ============ 表 ============

-- 用户资料（接 Supabase Auth）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);

-- 情侣对
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid references public.profiles(id) on delete set null,
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 8),
  city text not null default 'bay_area',
  created_at timestamptz not null default now()
);

-- 约会卡片池（盲选用的 idea 卡）
create table public.date_cards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  emoji text not null default '💞',
  style_tags text[] not null default '{}',   -- outdoor/city/active/chill/romantic/playful/creative/culture/food/nightlife/adventure/water/home/roadtrip
  budget_level int not null default 2 check (budget_level between 1 and 3),  -- 1=免费/便宜 2=适中 3=舍得花
  duration_hours numeric not null default 3,
  seasons text[] not null default '{spring,summer,fall,winter}',
  city text not null default 'bay_area',
  is_active boolean not null default true
);

-- 滑卡记录
create table public.swipes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid not null references public.date_cards(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- 双方都右滑 = 匹配（由触发器写入，Realtime 推送靠这张表）
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  card_id uuid not null references public.date_cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (couple_id, card_id)
);

-- 自建场地库（生成计划时 LLM 只查这张表，不碰 Google）
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'bay_area',
  area text,                                 -- San Francisco / Berkeley / Palo Alto ...
  category text not null,                    -- hike/park/museum/food/activity/nightlife/beach/roadtrip...
  tags text[] not null default '{}',
  price_level int not null default 2 check (price_level between 1 and 3),
  duration_hours numeric default 2,
  url text,
  lat double precision,
  lng double precision,
  indoor boolean not null default false,
  notes text,                                -- 策划备注，会进 LLM 上下文
  hours_verified boolean not null default false,
  is_active boolean not null default true
);

-- 每周计划
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  week_of date not null,                     -- 目标周六的日期
  status text not null default 'proposed' check (status in ('proposed','accepted','rejected','completed','expired')),
  timeline jsonb not null,                   -- [{time, venue_id, title, note}, ...]
  weather jsonb,
  reroll_count int not null default 0,
  accepted_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 约会后一键反馈
create table public.plan_feedback (
  plan_id uuid not null references public.plans(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  went boolean,
  rating int check (rating between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);

-- LLM 用量记账（单位经济仪表盘数据源；仅 service role 可写）
create table public.llm_usage (
  id bigint generated always as identity primary key,
  plan_id uuid references public.plans(id) on delete set null,
  couple_id uuid references public.couples(id) on delete set null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cache_read_tokens int not null default 0,
  cost_usd numeric(10,6) not null default 0,
  created_at timestamptz not null default now()
);

-- ============ 函数与触发器 ============

-- 注册时自动建 profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 是否情侣成员（RLS 辅助）
create or replace function public.is_couple_member(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.couples c
    where c.id = cid and (c.user_a = auth.uid() or c.user_b = auth.uid())
  );
$$;

-- 通过邀请码加入情侣对
create or replace function public.join_couple(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  update public.couples
  set user_b = auth.uid()
  where invite_code = code and user_b is null and user_a <> auth.uid()
  returning id into cid;
  return cid;  -- null = 码无效/已被用/自己邀请自己
end; $$;

-- 右滑时检测对方是否也右滑过 → 写入 matches
create or replace function public.handle_swipe_match()
returns trigger language plpgsql security definer set search_path = public as $$
declare other_user uuid;
begin
  if not new.liked then return new; end if;
  select case when c.user_a = new.user_id then c.user_b else c.user_a end
    into other_user
  from public.couples c where c.id = new.couple_id;
  if other_user is not null and exists (
    select 1 from public.swipes s
    where s.card_id = new.card_id and s.user_id = other_user and s.liked
  ) then
    insert into public.matches (couple_id, card_id)
    values (new.couple_id, new.card_id)
    on conflict (couple_id, card_id) do nothing;
  end if;
  return new;
end; $$;

create trigger on_swipe_check_match
  after insert on public.swipes
  for each row execute function public.handle_swipe_match();

-- matches 表开启 Realtime（双人滑卡时实时弹"匹配了！"）
alter publication supabase_realtime add table public.matches;

-- ============ RLS ============

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.date_cards enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.venues enable row level security;
alter table public.plans enable row level security;
alter table public.plan_feedback enable row level security;
alter table public.llm_usage enable row level security;  -- 不给任何 policy = 仅 service role

-- profiles：自己 + 伴侣可见，自己可改
create policy "profiles_select" on public.profiles for select to authenticated
  using (
    id = auth.uid() or exists (
      select 1 from public.couples c
      where (c.user_a = auth.uid() and c.user_b = profiles.id)
         or (c.user_b = auth.uid() and c.user_a = profiles.id)
    )
  );
create policy "profiles_update" on public.profiles for update to authenticated
  using (id = auth.uid());

-- couples：成员可见；自己当 user_a 创建；绑定走 join_couple()
create policy "couples_select" on public.couples for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());
create policy "couples_insert" on public.couples for insert to authenticated
  with check (user_a = auth.uid());
create policy "couples_update" on public.couples for update to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- 卡片与场地：登录可读（写入走 service role / seed）
create policy "date_cards_select" on public.date_cards for select to authenticated using (true);
create policy "venues_select" on public.venues for select to authenticated using (true);

-- swipes：只能以自己的身份、在自己的情侣对里滑
create policy "swipes_insert" on public.swipes for insert to authenticated
  with check (user_id = auth.uid() and public.is_couple_member(couple_id));
create policy "swipes_select" on public.swipes for select to authenticated
  using (public.is_couple_member(couple_id));

-- matches：成员可见（写入由 security definer 触发器完成）
create policy "matches_select" on public.matches for select to authenticated
  using (public.is_couple_member(couple_id));

-- plans：成员可见可更新（接受/拒绝）；插入允许成员（手动生成）或 service role（cron）
create policy "plans_select" on public.plans for select to authenticated
  using (public.is_couple_member(couple_id));
create policy "plans_insert" on public.plans for insert to authenticated
  with check (public.is_couple_member(couple_id));
create policy "plans_update" on public.plans for update to authenticated
  using (public.is_couple_member(couple_id));

-- plan_feedback：自己写自己的，成员互相可见
create policy "plan_feedback_insert" on public.plan_feedback for insert to authenticated
  with check (user_id = auth.uid());
create policy "plan_feedback_select" on public.plan_feedback for select to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id and public.is_couple_member(p.couple_id)));

-- ============ 索引 ============
create index idx_swipes_couple on public.swipes (couple_id);
create index idx_matches_couple on public.matches (couple_id);
create index idx_plans_couple_week on public.plans (couple_id, week_of desc);
create index idx_venues_city_active on public.venues (city) where is_active;
create index idx_cards_city_active on public.date_cards (city) where is_active;
