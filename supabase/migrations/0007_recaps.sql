-- 约会周报：照片 + 便签（足迹/统计从对应 plan 派生）
create table public.recaps (
  couple_id uuid not null references public.couples(id) on delete cascade,
  week_of date not null,
  photos text[] not null default '{}',   -- storage 路径
  note text not null default '',
  created_at timestamptz not null default now(),
  primary key (couple_id, week_of)
);
alter table public.recaps enable row level security;
create policy "recaps_select" on public.recaps for select to authenticated
  using (public.is_couple_member(couple_id));
create policy "recaps_insert" on public.recaps for insert to authenticated
  with check (public.is_couple_member(couple_id));
create policy "recaps_update" on public.recaps for update to authenticated
  using (public.is_couple_member(couple_id));

-- 照片存储桶（公开读，便于分享卡里的图加载；写入限本情侣文件夹）
insert into storage.buckets (id, name, public)
values ('recap-photos', 'recap-photos', true)
on conflict (id) do nothing;

create policy "recap_photos_read" on storage.objects for select to public
  using (bucket_id = 'recap-photos');
create policy "recap_photos_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'recap-photos'
    and public.is_couple_member((storage.foldername(name))[1]::uuid)
  );
create policy "recap_photos_delete" on storage.objects for delete to authenticated
  using (
    bucket_id = 'recap-photos'
    and public.is_couple_member((storage.foldername(name))[1]::uuid)
  );
