-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the document_chunks table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents_metadata(id) on delete cascade,
  chunk_text text not null,
  chunk_index integer not null,
  embedding vector(384),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create the match_document_chunks function
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(384),
  match_count int DEFAULT null,
  filter_document_id uuid DEFAULT null,
  filter_user_id uuid DEFAULT null
) RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_name text,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dm.name AS document_name,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents_metadata dm ON dm.id = dc.document_id
  WHERE
    (filter_document_id IS NULL OR dc.document_id = filter_document_id)
    AND (filter_user_id IS NULL OR dc.user_id = filter_user_id)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
