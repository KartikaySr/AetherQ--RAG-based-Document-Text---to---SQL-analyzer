import { enforceQuota } from "@/lib/server/quota";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { authenticatedClient } from "@/lib/server/auth";
import { canUseWarehouse, readWarehouse } from "@/lib/server/warehouse";
export const maxDuration = 60;
const schema = `public.departments(id uuid, name text, cost_center text, head_count_budget int, office_location text)
public.employees(id uuid, name text, role text, salary numeric, department_id uuid, location text, joining_date date, email text)
public.sales(id uuid, region text, revenue numeric, product text, quarter text, sales_rep text, units_sold int, deal_date date)
public.logistics(id uuid, shipment_ref text, origin_warehouse text, destination_region text, freight_cost_usd numeric, carrier text, eta_days int, status text, departure_date date)
public.inventory(id uuid, product_name text, sku text, stock int, warehouse text, reorder_level int, unit_cost_usd numeric, last_restock_at date)`;
export async function POST(req: Request) {
  try {
    const { supabase, user } = await authenticatedClient();
    if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
    const quotaResponse = await enforceQuota(supabase);
    if (quotaResponse) return quotaResponse;
    if (!canUseWarehouse(user)) return Response.json({ error: "Your account has not been granted warehouse access." }, { status: 403 });
    if (!process.env.ANALYTICS_DATABASE_URL) return Response.json({ error: "Analytics connection is not configured." }, { status: 503 });
    const { query } = await req.json();
    if (typeof query !== "string" || !query.trim() || query.length > 4000) return Response.json({ error: "Provide a question of 1–4,000 characters." }, { status: 400 });
    const { text } = await generateText({
      model: createGroq({ apiKey: process.env.GROQ_API_KEY })(process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b"),
      system: `Generate one PostgreSQL SELECT using only this schema. No CTEs, comments, DML, system tables, or custom functions. Return raw SQL only. Schema:\n${schema}`,
      prompt: query, abortSignal: req.signal,
    });
    const sql = text.replace(/^```(?:sql)?\s*|\s*```$/g, "").trim();
    const rows = await readWarehouse(sql);
    const cell = (v: unknown) => String(v ?? "").replace(/\|/g, "\\|").replace(/[\r\n]/g, " ");
    const keys = rows.length ? Object.keys(rows[0]) : [];
    const table = keys.length ? `| ${keys.map(cell).join(" | ")} |\n| ${keys.map(() => "---").join(" | ")} |\n${rows.map(row => `| ${keys.map(k => cell(row[k])).join(" | ")} |`).join("\n")}` : "No matching rows.";
    return Response.json({ sql, rows, explanation: `### SQL\n\`\`\`sql\n${sql}\n\`\`\`\n\n${table}\n\nResults are limited to 200 rows.`, rowLimit: 200 });
  } catch (error) {
    console.error("Analytics query rejected", error);
    return Response.json({ error: "The query could not be safely completed. Try a simpler question or check the analytics connection." }, { status: 422 });
  }
}
