-- 主地点切到西雅图 + 双语字段
alter table public.couples alter column city set default 'seattle';
update public.couples set city = 'seattle' where city = 'bay_area';

-- 约会卡片双语
alter table public.date_cards add column title_en text;
alter table public.date_cards add column description_en text;

-- 场地备注双语
alter table public.venues add column notes_en text;

-- 计划标题/简介双语（站内逐项的 _en 放在 timeline jsonb 里）
alter table public.plans add column title_en text;
alter table public.plans add column summary_en text;
