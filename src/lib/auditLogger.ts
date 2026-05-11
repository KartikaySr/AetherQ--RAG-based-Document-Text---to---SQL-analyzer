import { getSupabaseServiceClient } from "./supabaseAdmin";

export type QueryAuditPayload = {
  userPrompt: string;
  generatedSql: string;
  executionStatus: "success" | "error" | "rejected";
  responseTimeMs: number | null;
  rowCount?: number | null;
  errorDetail?: string | null;
};

export async function logSqlAudit(entry: QueryAuditPayload): Promise<void> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;

  try {
    await supabase.from("query_audit_logs").insert({
      user_prompt: entry.userPrompt,
      generated_sql: entry.generatedSql,
      execution_status: entry.executionStatus,
      response_time_ms: entry.responseTimeMs,
      row_count: entry.rowCount ?? null,
      error_detail: entry.errorDetail ?? null,
    });
  } catch {
    /* never throw from audit */
  }
}
