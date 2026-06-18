-- 计划增加标题与一句话推荐理由
alter table public.plans add column title text not null default '周六约会';
alter table public.plans add column summary text not null default '';
