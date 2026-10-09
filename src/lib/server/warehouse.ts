import { Pool } from "pg";
import { validateSql } from "@/lib/sql-policy";
let pool: Pool | undefined;
export function canUseWarehouse(user: { id: string; is_anonymous?: boolean }) {
  return !user.is_anonymous && (process.env.ANALYTICS_ALLOWED_USER_IDS || "").split(",").map(s=>s.trim()).includes(user.id);
}
export async function readWarehouseQueries(queries: string[]) {
  const sqls=queries.map(validateSql);
  if(!process.env.ANALYTICS_DATABASE_URL)throw new Error("Analytics connection unavailable.");
  pool ??= new Pool({connectionString:process.env.ANALYTICS_DATABASE_URL,max:3,idleTimeoutMillis:30000,connectionTimeoutMillis:8000,query_timeout:10000});
  const client=await pool.connect();
  try {
    const {rows}=await client.query("SELECT current_user AS name,rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user");
    if(rows[0]?.name!=="aetherq_reader"||rows[0]?.rolsuper||rows[0]?.rolbypassrls)throw new Error("A dedicated analytics reader is required.");
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout='8s'");
    await client.query("SET LOCAL lock_timeout='2s'");
    await client.query("SET LOCAL search_path=pg_catalog,public");
    const results=[];
    for(const sql of sqls){
      const result=await client.query(`SELECT * FROM (${sql}) AS aetherq_result LIMIT 200`);
      // PostgreSQL decimals are strings. Convert only finite, safely representable values for charts.
      const numericColumns=new Set(result.fields.filter(f=>[20,21,23,700,701,1700].includes(f.dataTypeID)).map(f=>f.name));
      results.push(result.rows.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,numericColumns.has(k)&&typeof v==='string'&&/^-?\d+(\.\d+)?$/.test(v)&&Number.isFinite(Number(v))&&Math.abs(Number(v))<=Number.MAX_SAFE_INTEGER?Number(v):v]))));
    }
    return results;
  } finally { await client.query("ROLLBACK").catch(()=>{});client.release(); }
}
export async function readWarehouse(sql:string){return (await readWarehouseQueries([sql]))[0];}
