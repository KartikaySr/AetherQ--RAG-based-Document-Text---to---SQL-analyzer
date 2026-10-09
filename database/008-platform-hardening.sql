-- Apply after the legacy application migrations. Preserves existing data.
BEGIN;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
-- Revoked/banned sessions cannot keep using old access tokens through the Data API.
CREATE OR REPLACE FUNCTION private.has_active_session()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM auth.sessions s JOIN auth.users u ON u.id = s.user_id
 WHERE s.id::text = auth.jwt()->>'session_id' AND s.user_id = auth.uid()
 AND (s.not_after IS NULL OR s.not_after > now())
 AND (u.banned_until IS NULL OR u.banned_until < now()));
$$;
REVOKE ALL ON FUNCTION private.has_active_session() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_active_session() TO authenticated;

ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_mode_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_mode_check CHECK (mode IN ('general','documents','analytics'));
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sql_result jsonb;
DROP FUNCTION IF EXISTS public.replace_conversation_messages(uuid,jsonb);
CREATE OR REPLACE FUNCTION public.replace_conversation_messages(p_conversation_id uuid, p_messages jsonb, p_expected_version integer)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE current_version integer;
BEGIN
 SELECT version INTO current_version FROM public.conversations WHERE id = p_conversation_id AND user_id = auth.uid() FOR UPDATE;
 IF NOT FOUND OR NOT private.has_active_session() THEN RAISE EXCEPTION 'Conversation not found' USING ERRCODE = '42501'; END IF;
 IF p_expected_version IS NULL OR current_version <> p_expected_version THEN RAISE EXCEPTION 'Conversation changed in another tab. Reload before saving.' USING ERRCODE = 'PT409'; END IF;
 IF p_messages IS NULL OR jsonb_typeof(p_messages) <> 'array' OR jsonb_array_length(p_messages) > 500 THEN RAISE EXCEPTION 'Invalid messages'; END IF;
 DELETE FROM public.messages WHERE conversation_id = p_conversation_id;
 INSERT INTO public.messages (conversation_id,role,content,chunks,sql_result,created_at)
 SELECT p_conversation_id,item->>'role',item->>'content',NULLIF(item->'chunks','null'::jsonb),NULLIF(item->'sql_result','null'::jsonb),now()+ordinal*interval '1 microsecond'
 FROM jsonb_array_elements(p_messages) WITH ORDINALITY incoming(item,ordinal);
 UPDATE public.conversations SET updated_at=now(),version=version+1 WHERE id=p_conversation_id;
 RETURN current_version+1;
END; $$;
REVOKE ALL ON FUNCTION public.replace_conversation_messages(uuid,jsonb,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_conversation_messages(uuid,jsonb,integer) TO authenticated;

DROP FUNCTION IF EXISTS public.match_document_chunks(vector,integer);
DROP FUNCTION IF EXISTS public.match_document_chunks(vector,integer,uuid);
DROP FUNCTION IF EXISTS public.match_document_chunks(vector,integer,uuid,uuid);
CREATE FUNCTION public.match_document_chunks(query_embedding vector(384),match_count integer DEFAULT 5,filter_document_id uuid DEFAULT NULL)
RETURNS TABLE(chunk_id uuid,document_id uuid,document_name text,chunk_text text,similarity double precision)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT dc.id,dc.document_id,dm.name,dc.chunk_text,1-(dc.embedding <=> query_embedding)
 FROM public.document_chunks dc JOIN public.documents_metadata dm ON dm.id=dc.document_id
 WHERE dc.user_id=(select auth.uid()) AND dm.user_id=(select auth.uid())
 AND (filter_document_id IS NULL OR dc.document_id=filter_document_id)
 ORDER BY dc.embedding <=> query_embedding LIMIT LEAST(GREATEST(match_count,1),20);
$$;
REVOKE ALL ON FUNCTION public.match_document_chunks(vector,integer,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_document_chunks(vector,integer,uuid) TO authenticated;

DO $$ DECLARE p record; t text; BEGIN
 FOREACH t IN ARRAY ARRAY['documents_metadata','document_chunks','document_extractions','conversations','messages'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 END LOOP;
 FOR p IN SELECT tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('documents_metadata','document_chunks','document_extractions') LOOP
  EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,p.tablename);
 END LOOP;
END $$;
CREATE POLICY documents_owner ON public.documents_metadata FOR ALL TO authenticated
 USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()) AND size>0 AND size<=10485760 AND name<>'' AND split_part(storage_path,'/',1)=(select auth.uid())::text);
CREATE POLICY chunks_owner ON public.document_chunks FOR ALL TO authenticated
 USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()) AND EXISTS(SELECT 1 FROM public.documents_metadata d WHERE d.id=document_id AND d.user_id=(select auth.uid())));
CREATE POLICY extractions_owner ON public.document_extractions FOR ALL TO authenticated
 USING(user_id=(select auth.uid())) WITH CHECK(user_id=(select auth.uid()) AND EXISTS(SELECT 1 FROM public.documents_metadata d WHERE d.id=document_id AND d.user_id=(select auth.uid())));
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['documents_metadata','document_chunks','document_extractions','conversations','messages'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS active_session_required ON public.%I',t);
  EXECUTE format('CREATE POLICY active_session_required ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((select private.has_active_session())) WITH CHECK ((select private.has_active_session()))',t);
 END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS documents_metadata_owner_uploaded ON public.documents_metadata(user_id,uploaded_at DESC);
CREATE INDEX IF NOT EXISTS document_chunks_owner_document ON public.document_chunks(user_id,document_id);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.documents_metadata,public.document_chunks,public.document_extractions,public.conversations,public.messages TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('documents-private','documents-private',false,10485760)
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=10485760;
UPDATE storage.buckets SET public=false WHERE id='documents';
DROP POLICY IF EXISTS documents_bucket_select ON storage.objects;
DROP POLICY IF EXISTS documents_bucket_insert ON storage.objects;
DROP POLICY IF EXISTS documents_bucket_delete ON storage.objects;
DROP POLICY IF EXISTS documents_private_select ON storage.objects;
DROP POLICY IF EXISTS documents_private_insert ON storage.objects;
DROP POLICY IF EXISTS documents_private_delete ON storage.objects;
CREATE POLICY documents_private_select ON storage.objects FOR SELECT TO authenticated USING(bucket_id='documents-private' AND (storage.foldername(name))[1]=(select auth.uid())::text AND (select private.has_active_session()));
CREATE POLICY documents_private_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='documents-private' AND (storage.foldername(name))[1]=(select auth.uid())::text AND (select private.has_active_session()));
CREATE POLICY documents_private_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='documents-private' AND (storage.foldername(name))[1]=(select auth.uid())::text AND (select private.has_active_session()));

CREATE TABLE IF NOT EXISTS public.ai_request_limits(user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,window_start timestamptz NOT NULL,requests integer NOT NULL,PRIMARY KEY(user_id,window_start));
ALTER TABLE public.ai_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_request_limits FROM anon,authenticated;
CREATE OR REPLACE FUNCTION public.consume_ai_request()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE used integer; maximum integer; who uuid:=auth.uid();
BEGIN
 IF who IS NULL OR NOT private.has_active_session() THEN RETURN false; END IF;
 maximum:=CASE WHEN coalesce((auth.jwt()->>'is_anonymous')::boolean,false) THEN 10 ELSE 60 END;
 INSERT INTO public.ai_request_limits(user_id,window_start,requests) VALUES(who,date_trunc('hour',now()),1)
 ON CONFLICT(user_id,window_start) DO UPDATE SET requests=ai_request_limits.requests+1 WHERE ai_request_limits.requests<maximum RETURNING requests INTO used;
 RETURN used IS NOT NULL;
END; $$;
REVOKE ALL ON FUNCTION public.consume_ai_request() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_request() TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
