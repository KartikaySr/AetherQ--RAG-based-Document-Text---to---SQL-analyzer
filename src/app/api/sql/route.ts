import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Client } from "pg";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    // Allow guest mode

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Attempt to connect to PG and fetch schema, or use a default one
    let schemaStr = `
Table: public.employees
Columns: id (uuid), name (text), department (text), salary (numeric), hire_date (date)

Table: public.sales
Columns: id (uuid), region (text), revenue (numeric), created_at (timestamp)

Table: public.carriers
Columns: id (uuid), name (text), freight_cost (numeric)
`;

    // Generate SQL using Groq
    const systemPrompt = `You are a Postgres SQL generator. 
Given the user's question, generate a valid SQL query against the following schema:
${schemaStr}

Return ONLY the raw SQL query. Do not wrap it in markdown. Do not provide any explanation. Just the SQL.`;

    const { text: generatedSql } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: systemPrompt,
      prompt: query,
    });

    const cleanSql = generatedSql.replace(/\`\`\`sql/g, "").replace(/\`\`\`/g, "").trim();

    // Now attempt to run the SQL using pg client
    let rows: any[] = [];
    let explanation = `I translated your request into the following query:\n\`\`\`sql\n${cleanSql}\n\`\`\`\n\n`;

    try {
      if (process.env.DATABASE_URL) {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        const res = await client.query(cleanSql);
        rows = res.rows;
        await client.end();
        explanation += `The query executed successfully and returned ${rows.length} rows.`;
      } else {
        explanation += `Note: No DATABASE_URL provided, so I couldn't execute the query to get live results.`;
      }
    } catch (pgError: any) {
      console.error("PG Execution Error:", pgError);
      explanation += `I couldn't run this query successfully against the database. The database connection may be invalid or the tables may not exist yet. Error: ${pgError.message}`;
    }

    return NextResponse.json({
      sql: cleanSql,
      rows: rows,
      explanation: explanation,
    });
  } catch (error: any) {
    console.error("SQL API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process SQL analytics" },
      { status: 500 }
    );
  }
}
