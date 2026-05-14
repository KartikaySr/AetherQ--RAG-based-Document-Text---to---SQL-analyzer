import { NextResponse } from "next/server";

import { createAuthErrorResponse, getUserFromRequest } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const { user, supabase } = await getUserFromRequest();
    if (!user) {
      return createAuthErrorResponse();
    }

    const [docsRes, convRes] = await Promise.all([
      supabase
        .from("documents_metadata")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    return NextResponse.json({
      documentCount: docsRes.count ?? 0,
      conversationCount: convRes.count ?? 0,
    });
  } catch {
    return NextResponse.json(
      { documentCount: 0, conversationCount: 0 },
      { status: 200 }
    );
  }
}
