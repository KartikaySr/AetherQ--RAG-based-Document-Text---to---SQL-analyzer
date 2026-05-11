import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import { logSqlAudit } from "@/lib/auditLogger";
import { getAnalyticsDbPool } from "@/lib/dbPool";
import {
  ANALYTICS_TABLES,
  extractSqlFromModelOutput,
  validateAndNormalizeAnalyticsSql,
} from "@/lib/sqlValidator";

export const runtime = "nodejs";

const SCHEMA_PREVIEW = ANALYTICS_TABLES.map((t) => `- ${t}`).join("\n");

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "bigint") out[k] = v.toString();
    else if (v instanceof Date) out[k] = v.toISOString();
    else out[k] = v;
  }
  return out;
}

async function generateSqlFromNl(nl: string): Promise<string | null> {
  if (!process.env.GROQ_API_KEY) return null;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You write one PostgreSQL SELECT query (optionally WITH … SELECT) for analytics.
Rules:
- Read-only. Use only: SELECT, WITH, FROM, WHERE, JOIN, ON, GROUP BY, ORDER BY, HAVING, LIMIT, COUNT, SUM, AVG, MIN, MAX, DISTINCT, AS, AND, OR, IN, BETWEEN, LIKE, ILIKE, COALESCE, CAST, DATE_TRUNC, EXTRACT, CASE, WHEN, THEN, END.
- Allowed tables:
${SCHEMA_PREVIEW}
- employees: id, name, role, salary, department_id, location, joining_date, email, created_at
- departments: id, name, cost_center, head_count_budget, office_location, created_at
- sales: id, region, revenue, product, quarter, sales_rep, units_sold, deal_date, created_at
- logistics: id, shipment_ref, origin_warehouse, destination_region, freight_cost_usd, carrier, eta_days, status, departure_date
- inventory: id, product_name, sku, stock, warehouse, reorder_level, unit_cost_usd, last_restock_at
- No UNION. Do not use semicolons. Exactly one statement.
- Prefer LIMIT <= 500.
Reply only with one markdown code fence labeled sql.`,
      },
      { role: "user", content: nl },
    ],
    temperature: 0.08,
    max_tokens: 900,
  });
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return null;
  const extracted = extractSqlFromModelOutput(raw) ?? raw;
  return extracted.trim();
}

async function summarizeWithGroq(
  question: string,
  sql: string,
  preview: Record<string, unknown>[]
): Promise<string> {
  if (!process.env.GROQ_API_KEY) return "";
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const compact = JSON.stringify(preview ?? []).slice(0, 7000);
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are AetherQ Enterprise Analytics. Write a concise markdown executive brief. Use headings and bullets when helpful. Infer only from JSON sample figures—do not fabricate aggregates.",
      },
      {
        role: "user",
        content: `User question:\n${question}\n\nSQL:\n${sql}\n\nSample rows (JSON):\n${compact}`,
      },
    ],
    temperature: 0.25,
    max_tokens: 700,
  });
  return (
    completion.choices[0]?.message?.content?.trim() ||
    "_No summary was generated._"
  );
}

export async function POST(req: Request) {
  const started = performance.now();
  let prompt = "";
  let sqlForAudit = "";

  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI SQL assistant is not configured." },
        { status: 503 }
      );
    }

    const pool = getAnalyticsDbPool();
    if (!pool) {
      return NextResponse.json(
        {
          error:
            "Database connection is not configured. Set DATABASE_URL to your Supabase Postgres connection string.",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as { query?: string };
    prompt = body.query?.replace(/\s+/g, " ").trim() ?? "";
    if (!prompt) {
      return NextResponse.json({ error: "query is required." }, { status: 400 });
    }

    const generated = await generateSqlFromNl(prompt);
    if (!generated) {
      await logSqlAudit({
        userPrompt: prompt,
        generatedSql: "",
        executionStatus: "rejected",
        responseTimeMs: Math.round(performance.now() - started),
        rowCount: 0,
        errorDetail: "Model returned no SQL.",
      });
      return NextResponse.json(
        { error: "Could not derive SQL from the question." },
        { status: 422 }
      );
    }

    const validated = validateAndNormalizeAnalyticsSql(generated);
    if (!validated.ok) {
      sqlForAudit = generated;
      await logSqlAudit({
        userPrompt: prompt,
        generatedSql: sqlForAudit,
        executionStatus: "rejected",
        responseTimeMs: Math.round(performance.now() - started),
        rowCount: 0,
        errorDetail: validated.reason,
      });
      return NextResponse.json(
        {
          error: validated.reason,
          sql: sqlForAudit,
          rows: [],
          explanation:
            "**Query blocked by policy.** The drafted SQL failed read-only validation. Try rephrasing or narrowing the question.",
        },
        { status: 400 }
      );
    }

    sqlForAudit = validated.sql;
    let rows: Record<string, unknown>[] = [];
    try {
      const result = await pool.query<Record<string, unknown>>(validated.sql);
      rows = result.rows.map(serializeRow);
    } catch (dbErr) {
      const detail =
        dbErr instanceof Error ? dbErr.message : "Database execution error.";
      await logSqlAudit({
        userPrompt: prompt,
        generatedSql: sqlForAudit,
        executionStatus: "error",
        responseTimeMs: Math.round(performance.now() - started),
        rowCount: 0,
        errorDetail: detail,
      });
      return NextResponse.json(
        {
          error: "The validated query could not execute against the warehouse.",
          sql: sqlForAudit,
          rows: [],
          explanation: `Execution failed (**sanitized**): ${detail.slice(0, 280)}`,
        },
        { status: 500 }
      );
    }

    const explanation =
      rows.length === 0
        ? "*The query executed successfully and returned **zero rows**. Try broadening filters or validating source data freshness.*"
        : await summarizeWithGroq(prompt, sqlForAudit, rows.slice(0, 40));
    await logSqlAudit({
      userPrompt: prompt,
      generatedSql: sqlForAudit,
      executionStatus: "success",
      responseTimeMs: Math.round(performance.now() - started),
      rowCount: rows.length,
      errorDetail: null,
    });

    return NextResponse.json({
      sql: sqlForAudit,
      rows,
      explanation,
    });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "SQL analytics failed unexpectedly.";
    await logSqlAudit({
      userPrompt: prompt,
      generatedSql: sqlForAudit,
      executionStatus: "error",
      responseTimeMs: Math.round(performance.now() - started),
      rowCount: 0,
      errorDetail: msg,
    });

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
