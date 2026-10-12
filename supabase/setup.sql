-- Repair for the existing vmiehkctmtpmpmizhkzt project. No content is deleted.
begin;
alter table public.portfolio_images add column if not exists storage_path text;

-- Recover paths for already saved public Storage URLs.
update public.portfolio_images
set storage_path = split_part(image_url, '/storage/v1/object/public/portfolio-images/', 2)
where storage_path is null
  and image_url like 'https://vmiehkctmtpmpmizhkzt.supabase.co/storage/v1/object/public/portfolio-images/%';

-- Public images are already publicly downloadable; this also permits admin upserts.
drop policy if exists "Frilance admin can read storage metadata" on storage.objects;
create policy "Frilance admin can read storage metadata" on storage.objects
for select to authenticated
using (bucket_id = 'portfolio-images' and auth.uid() = '69814204-0be0-4b8e-83fb-1172b8aa501f'::uuid);
commit;
