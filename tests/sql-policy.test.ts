import { test } from "node:test";
import assert from "node:assert/strict";
import { validateSql } from "../src/lib/sql-policy";
for (const sql of [
 "SELECT region, SUM(revenue) FROM public.sales GROUP BY region",
 "SELECT d.name, COUNT(e.id) FROM public.departments d LEFT JOIN public.employees e ON d.id=e.department_id GROUP BY d.name",
 "SELECT COALESCE(AVG(freight_cost_usd),0) FROM public.logistics;",
]) test(`accepts ${sql}`, () => assert.ok(validateSql(sql)));
for (const sql of [
 "DELETE FROM public.sales", "SELECT * FROM public.sales; DELETE FROM public.sales",
 "SELECT * FROM auth.users", "SELECT * FROM public.documents_metadata",
 "SELECT pg_sleep(10)", "SELECT set_config('transaction_read_only','off',true)",
 "WITH x AS (DELETE FROM public.sales RETURNING *) SELECT * FROM x",
 "SELECT * INTO stolen FROM public.sales", "SELECT * FROM public.sales FOR UPDATE",
 "SELECT public.sum(revenue) FROM public.sales", "SELECT 'pg_authid'::regclass",
 "SELECT * FROM (SELECT * FROM auth.users) x",
]) test(`rejects ${sql}`, () => assert.throws(() => validateSql(sql)));
