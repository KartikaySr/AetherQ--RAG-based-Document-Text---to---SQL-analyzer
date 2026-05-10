create extension if not exists "pgcrypto";

create table if not exists public.document_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents_metadata(id) on delete cascade,
  extracted_text text not null,
  page_count integer not null default 0 check (page_count >= 0),
  extraction_status text not null default 'completed' check (
    extraction_status in ('pending', 'processing', 'completed', 'failed')
  ),
  created_at timestamptz not null default now(),
  unique (document_id)
);

alter table public.document_extractions enable row level security;

drop policy if exists "document_extractions_select" on public.document_extractions;
create policy "document_extractions_select"
on public.document_extractions
for select
to anon, authenticated
using (true);

drop policy if exists "document_extractions_insert" on public.document_extractions;
create policy "document_extractions_insert"
on public.document_extractions
for insert
to anon, authenticated
with check (
  extraction_status in ('pending', 'processing', 'completed', 'failed')
  and page_count >= 0
);

drop policy if exists "document_extractions_update" on public.document_extractions;
create policy "document_extractions_update"
on public.document_extractions
for update
to anon, authenticated
using (true)
with check (
  extraction_status in ('pending', 'processing', 'completed', 'failed')
  and page_count >= 0
);
