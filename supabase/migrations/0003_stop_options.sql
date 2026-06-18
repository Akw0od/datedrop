-- Phase 3.5：单站备选 + 这周心情 + 换站作废确认
alter table public.plans add column mood text;

-- 换站：轮换某个环节的当前备选下标，并清空双方确认。
-- 关键不变量：两人确认的必须是"同一份"计划，所以计划一变（换了任何一站），
-- 之前的点头立即作废、状态退回 proposed。原子完成，避免读改写竞态。
create or replace function public.swap_stop(p_plan_id uuid, p_stop int)
returns public.plans
language plpgsql
security definer
set search_path = public
as $$
declare
  pl public.plans;
  n int;
  cur int;
begin
  select * into pl from public.plans where id = p_plan_id;
  if pl.id is null then
    raise exception 'plan not found';
  end if;

  -- 只有这对情侣的成员能换
  if not exists (
    select 1 from public.couples c
    where c.id = pl.couple_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ) then
    raise exception 'not authorized';
  end if;

  n := jsonb_array_length(pl.timeline -> p_stop -> 'options');
  if n is null or n < 2 then
    return pl; -- 这一站没有可换的备选，原样返回
  end if;
  cur := coalesce((pl.timeline -> p_stop ->> 'current')::int, 0);

  update public.plans set
    timeline = jsonb_set(timeline, array[p_stop::text, 'current'], to_jsonb((cur + 1) % n)),
    accepted_by = '{}',
    status = 'proposed'
  where id = p_plan_id
  returning * into pl;

  return pl;
end;
$$;

grant execute on function public.swap_stop(uuid, int) to authenticated;
