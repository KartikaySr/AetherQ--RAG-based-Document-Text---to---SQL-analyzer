import type { SupabaseClient } from "@supabase/supabase-js";
/** Database counter is shared by all application instances; errors fail closed. */
export async function enforceQuota(supabase: SupabaseClient): Promise<Response | null> {
  const { data, error } = await supabase.rpc("consume_ai_request");
  if (error) return Response.json({ error: "Request limits are unavailable. Check database setup." }, { status: 503 });
  if (!data) return Response.json({ error: "Hourly request limit reached. Please try again later." }, { status: 429, headers: { "Retry-After": "3600" } });
  return null;
}
