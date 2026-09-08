create extension if not exists "pgcrypto";

create table if not exists public.documents_metadata (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size bigint not null check (size > 0),
  storage_path text not null unique,
  uploaded_at timestamptz not null default now()
);

alter table public.documents_metadata enable row level security;

drop policy if exists "documents_metadata_select" on public.documents_metadata;
create policy "documents_metadata_select"
on public.documents_metadata
for select
to anon, authenticated
using (true);

drop policy if exists "documents_metadata_insert" on public.documents_metadata;
create policy "documents_metadata_insert"
on public.documents_metadata
for insert
to anon, authenticated
with check (
  storage_path like 'documents/%'
  and name <> ''
  and size > 0
  and size <= 10485760
);

drop policy if exists "documents_metadata_delete" on public.documents_metadata;
create policy "documents_metadata_delete"
on public.documents_metadata
for delete
to anon, authenticated
using (
  storage_path like 'documents/%'
);

drop policy if exists "documents_bucket_insert" on storage.objects;
create policy "documents_bucket_insert"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'documents'
  and name like 'documents/%'
  and (storage.extension(name)) in ('pdf', 'docx', 'txt', 'md', 'csv', 'json')
);

drop policy if exists "documents_bucket_select" on storage.objects;
create policy "documents_bucket_select"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'documents'
  and name like 'documents/%'
);

drop policy if exists "documents_bucket_delete" on storage.objects;
create policy "documents_bucket_delete"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'documents'
  and name like 'documents/%'
);
