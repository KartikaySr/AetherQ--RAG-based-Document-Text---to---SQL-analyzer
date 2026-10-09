import { authenticatedClient } from "@/lib/server/auth";
export async function GET() {
  const { supabase, user } = await authenticatedClient();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });
  const [docs, conversations] = await Promise.all([
    supabase.from("documents_metadata").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  if (docs.error || conversations.error) return Response.json({ error: "Workspace counts unavailable." }, { status: 503 });
  return Response.json({ documentCount: docs.count, conversationCount: conversations.count });
}
