import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const email = `guest_${Math.random().toString(36).substring(2, 10)}@aetherq.local`;
    const password = `guest_${Math.random().toString(36).substring(2, 15)}`;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_guest: true }
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ email, password });
  } catch (error: any) {
    console.error("Guest Auth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
