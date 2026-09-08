create extension if not exists "vector";
create extension if not exists "pgcrypto";

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents_metadata(id) on delete cascade,
  chunk_text text not null,
  chunk_index integer not null check (chunk_index >= 0),
  embedding vector(384) not null,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

alter table public.document_chunks enable row level security;

create index if not exists document_chunks_document_id_idx
on public.document_chunks (document_id);

create index if not exists document_chunks_embedding_ivfflat_idx
on public.document_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

drop policy if exists "document_chunks_select" on public.document_chunks;
create policy "document_chunks_select"
on public.document_chunks
for select
to anon, authenticated
using (true);

drop policy if exists "document_chunks_insert" on public.document_chunks;
create policy "document_chunks_insert"
on public.document_chunks
for insert
to anon, authenticated
with check (
  chunk_text <> ''
  and chunk_index >= 0
);

drop policy if exists "document_chunks_delete" on public.document_chunks;
create policy "document_chunks_delete"
on public.document_chunks
for delete
to anon, authenticated
using (true);

create or replace function public.match_document_chunks(
  query_embedding vector(384),
  match_count integer default 5
)
returns table (
  chunk_id uuid,
  document_id uuid,
  document_name text,
  chunk_text text,
  similarity double precision
)
language sql
stable
as $$
  select
    document_chunks.id as chunk_id,
    document_chunks.document_id,
    documents_metadata.name as document_name,
    document_chunks.chunk_text,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  join public.documents_metadata
    on documents_metadata.id = document_chunks.document_id
  order by document_chunks.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create or replace function public.match_document_chunks_by_document(
  document_id uuid,
  query_embedding vector(384),
  match_count integer default 5
)
returns table (
  chunk_id uuid,
  document_id uuid,
  document_name text,
  chunk_text text,
  similarity double precision
)
language sql
stable
as $$
  select
    document_chunks.id as chunk_id,
    document_chunks.document_id,
    documents_metadata.name as document_name,
    document_chunks.chunk_text,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from public.document_chunks
  join public.documents_metadata
    on documents_metadata.id = document_chunks.document_id
  where document_chunks.document_id = document_id
  order by document_chunks.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
