-- Run only in the dedicated analytics database. Never use the application/admin login.
-- Set a strong reader password separately in your database administration console.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aetherq_reader') THEN
   CREATE ROLE aetherq_reader LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
 END IF;
END $$;
ALTER ROLE aetherq_reader SET default_transaction_read_only = on;
ALTER ROLE aetherq_reader SET statement_timeout = '8s';
GRANT USAGE ON SCHEMA public TO aetherq_reader;
GRANT SELECT ON public.departments, public.employees, public.sales, public.logistics, public.inventory TO aetherq_reader;
REVOKE ALL ON public.departments, public.employees, public.sales, public.logistics, public.inventory FROM anon, authenticated;
-- Defense in depth for warehouses hosted on Supabase: deny direct browser API access.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['departments','employees','sales','logistics','inventory'] LOOP
   EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
   EXECUTE format('DROP POLICY IF EXISTS analytics_reader ON public.%I',t);
   EXECUTE format('CREATE POLICY analytics_reader ON public.%I FOR SELECT TO aetherq_reader USING (true)',t);
 END LOOP;
END $$;
COMMIT;
