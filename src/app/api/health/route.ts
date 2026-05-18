import { NextResponse } from "next/server";

/**
 * Lightweight readiness probe for deploy platforms (no secrets exposed).
 * Does not hit external APIs — only checks that required env keys exist.
 */
export async function GET() {
  const checks = {
    nextPublicSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
    nextPublicSupabaseAnonKey: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    ),
    groqApiKey: Boolean(process.env.GROQ_API_KEY?.trim()),
    huggingfaceApiKey: Boolean(process.env.HUGGINGFACE_API_KEY?.trim()),
    databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  };

  const coreAuthReady =
    checks.nextPublicSupabaseUrl && checks.nextPublicSupabaseAnonKey;
  const analyticsReady = checks.databaseUrl;

  return NextResponse.json({
    ok: true,
    service: "aetherq",
    time: new Date().toISOString(),
    ready: {
      app: coreAuthReady,
      aiChatAndSql: checks.groqApiKey,
      embeddingsSearch: checks.huggingfaceApiKey,
      analyticsWarehouse: analyticsReady,
      sqlAuditLogsToSupabase: checks.supabaseServiceRoleKey,
    },
    checks,
  });
}
