-- ============================================================================
-- AetherQ Multi-Tenant Security Migration
-- Adds user_id and RLS to existing tables
-- Run AFTER supabase-conversations-schema.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add user_id columns to existing tables
-- ============================================================================

-- Add user_id to documents_metadata
ALTER TABLE IF EXISTS public.documents_metadata
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to document_chunks
ALTER TABLE IF EXISTS public.document_chunks
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to document_extractions (if exists)
ALTER TABLE IF EXISTS public.document_extractions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: Enable RLS on all user-scoped tables
-- ============================================================================

ALTER TABLE public.documents_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_extractions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Drop existing permissive policies (for anon access during migration)
-- ============================================================================

-- Drop old policies that allowed anon access
DROP POLICY IF EXISTS "documents_metadata_select" ON public.documents_metadata;
DROP POLICY IF EXISTS "documents_metadata_insert" ON public.documents_metadata;
DROP POLICY IF EXISTS "documents_metadata_delete" ON public.documents_metadata;

DROP POLICY IF EXISTS "document_chunks_select" ON public.document_chunks;
DROP POLICY IF EXISTS "document_chunks_insert" ON public.document_chunks;
DROP POLICY IF EXISTS "document_chunks_delete" ON public.document_chunks;

-- ============================================================================
-- STEP 4: Create new RLS policies for documents_metadata
-- ============================================================================

CREATE POLICY "documents_metadata_select_authenticated"
ON public.documents_metadata
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "documents_metadata_insert_authenticated"
ON public.documents_metadata
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND name <> ''
  AND size > 0
  AND size <= 10485760
);

CREATE POLICY "documents_metadata_update_authenticated"
ON public.documents_metadata
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_metadata_delete_authenticated"
ON public.documents_metadata
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Create new RLS policies for document_chunks
-- ============================================================================

CREATE POLICY "document_chunks_select_authenticated"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "document_chunks_insert_authenticated"
ON public.document_chunks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND chunk_text <> ''
  AND chunk_index >= 0
);

CREATE POLICY "document_chunks_update_authenticated"
ON public.document_chunks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_chunks_delete_authenticated"
ON public.document_chunks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: Create RLS policies for document_extractions (if exists)
-- ============================================================================

CREATE POLICY "document_extractions_select_authenticated"
ON public.document_extractions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "document_extractions_insert_authenticated"
ON public.document_extractions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_extractions_update_authenticated"
ON public.document_extractions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "document_extractions_delete_authenticated"
ON public.document_extractions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 7: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_documents_metadata_user_id
ON public.documents_metadata(user_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_user_id
ON public.document_chunks(user_id);

CREATE INDEX IF NOT EXISTS idx_document_extractions_user_id
ON public.document_extractions(user_id);

-- ============================================================================
-- STEP 8: Create user-scoped vector search function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_document_chunks_for_user(
  query_embedding vector(384),
  p_user_id UUID,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  document_name text,
  chunk_text text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    dc.id as chunk_id,
    dc.document_id,
    dm.name as document_name,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM public.document_chunks dc
  JOIN public.documents_metadata dm
    ON dm.id = dc.document_id
  WHERE dc.user_id = p_user_id
    AND dm.user_id = p_user_id
  ORDER BY dc.embedding <=> query_embedding
  LIMIT GREATEST(match_count, 1);
$$;

-- ============================================================================
-- STEP 9: Update storage bucket policies for private access
-- ============================================================================

-- Drop old storage policies
DROP POLICY IF EXISTS "documents_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_bucket_delete" ON storage.objects;

-- Create private bucket if needed (via Supabase dashboard), then add RLS
CREATE POLICY "documents_private_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "documents_private_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "documents_private_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- STEP 10: Create audit log table for security compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.access_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_audit_logs_user_id ON public.access_audit_logs(user_id);
CREATE INDEX idx_access_audit_logs_created_at ON public.access_audit_logs(created_at DESC);

ALTER TABLE public.access_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs (if you add admin role later)
CREATE POLICY "access_audit_logs_select_authenticated"
ON public.access_audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

COMMIT;
