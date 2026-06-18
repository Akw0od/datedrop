-- Phase 3.5 视觉港：换站支持指定目标下标（底部 sheet 横滑直接选某个备选）
-- p_to >= 0 时切到该下标；p_to < 0（默认）时轮换到下一个。
-- 目标 == 当前则不动（也不清确认）；真的换了才作废双方确认。
drop function if exists public.swap_stop(uuid, int);

create or replace function public.swap_stop(p_plan_id uuid, p_stop int, p_to int default -1)
returns public.plans
language plpgsql
security definer
set search_path = public
as $$
declare
  pl public.plans;
  n int;
  cur int;
  nxt int;
begin
  select * into pl from public.plans where id = p_plan_id;
  if pl.id is null then
    raise exception 'plan not found';
  end if;
  if not exists (
    select 1 from public.couples c
    where c.id = pl.couple_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
  ) then
    raise exception 'not authorized';
  end if;

  n := jsonb_array_length(pl.timeline -> p_stop -> 'options');
  if n is null or n < 2 then
    return pl;
  end if;
  cur := coalesce((pl.timeline -> p_stop ->> 'current')::int, 0);
  if p_to >= 0 then nxt := p_to % n; else nxt := (cur + 1) % n; end if;
  if nxt = cur then return pl; end if;

  update public.plans set
    timeline = jsonb_set(timeline, array[p_stop::text, 'current'], to_jsonb(nxt)),
    accepted_by = '{}',
    status = 'proposed'
  where id = p_plan_id
  returning * into pl;
  return pl;
end;
$$;

grant execute on function public.swap_stop(uuid, int, int) to authenticated;
