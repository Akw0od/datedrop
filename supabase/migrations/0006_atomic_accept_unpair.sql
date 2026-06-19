-- 修复确认竞态 + join 守卫 + 解绑功能

-- ① 原子确认：array_append 去重，服务端判定"双方都确认"。避免两端同时点导致互相覆盖。
create or replace function public.accept_plan(p_plan_id uuid)
returns public.plans
language plpgsql security definer set search_path = public
as $$
declare
  pl public.plans;
  members uuid[];
begin
  select * into pl from public.plans where id = p_plan_id;
  if pl.id is null then raise exception 'plan not found'; end if;
  select array_remove(array[c.user_a, c.user_b], null) into members
    from public.couples c where c.id = pl.couple_id;
  if not (auth.uid() = any(members)) then raise exception 'not authorized'; end if;

  update public.plans
    set accepted_by = (
      select array_agg(distinct e) from unnest(array_append(accepted_by, auth.uid())) e
    )
    where id = p_plan_id
    returning * into pl;

  if pl.accepted_by @> members then
    update public.plans set status = 'accepted' where id = p_plan_id returning * into pl;
  end if;
  return pl;
end;
$$;
grant execute on function public.accept_plan(uuid) to authenticated;

-- 撤回确认（同样原子）
create or replace function public.unaccept_plan(p_plan_id uuid)
returns public.plans
language plpgsql security definer set search_path = public
as $$
declare pl public.plans;
begin
  select * into pl from public.plans where id = p_plan_id;
  if pl.id is null then raise exception 'plan not found'; end if;
  if not exists (
    select 1 from public.couples c
    where c.id = pl.couple_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ) then raise exception 'not authorized'; end if;
  update public.plans
    set accepted_by = array_remove(accepted_by, auth.uid()), status = 'proposed'
    where id = p_plan_id returning * into pl;
  return pl;
end;
$$;
grant execute on function public.unaccept_plan(uuid) to authenticated;

-- ② join_couple 守卫：已经有对象的人不能再加入别的 couple（杜绝双重绑定根因）
create or replace function public.join_couple(code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare cid uuid;
begin
  if exists (
    select 1 from public.couples c where c.user_a = auth.uid() or c.user_b = auth.uid()
  ) then
    return null; -- 已有对象
  end if;
  update public.couples set user_b = auth.uid()
  where invite_code = code and user_b is null and user_a <> auth.uid()
  returning id into cid;
  return cid;
end;
$$;

-- ③ 解绑：把对象从当前 couple 移除（user_b 置空）并换新邀请码（旧链接失效）。
-- 离开者被释放可重新连接；留下者拿到新邀请码可重新邀请正确的人。
create or replace function public.unpair_couple()
returns void language plpgsql security definer set search_path = public
as $$
declare cid uuid;
begin
  select id into cid from public.couples
    where user_a = auth.uid() or user_b = auth.uid() limit 1;
  if cid is null then return; end if;
  update public.couples
    set user_b = null,
        invite_code = substr(md5(gen_random_uuid()::text), 1, 8)
  where id = cid;
end;
$$;
grant execute on function public.unpair_couple() to authenticated;
