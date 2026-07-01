import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServiceClient } from "@/lib/supabaseAdmin";

export const GUEST_MODE_COOKIE = "aetherq_guest_mode";
export const GUEST_ID_COOKIE = "aetherq_guest_id";
export const GUEST_NAME_COOKIE = "aetherq_guest_name";

export type RequestUser =
  | User
  | {
      id: string;
      email: string;
      user_metadata: { name: string; is_guest: true };
    };

export function isGuestRequestUser(user: RequestUser | null | undefined) {
  return user?.user_metadata?.is_guest === true;
}

export async function getUserFromRequest() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{name: string, value: string, options?: Record<string, unknown>}>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, unknown>)
            );
          } catch {
            // Middleware might be handling this
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isGuest = cookieStore.get(GUEST_MODE_COOKIE)?.value === "true";
  const guestId = cookieStore.get(GUEST_ID_COOKIE)?.value;

  if (!user && isGuest && guestId) {
    const serviceSupabase = getSupabaseServiceClient();
    if (!serviceSupabase) {
      return { user: null, error, supabase };
    }

    const rawGuestName = cookieStore.get(GUEST_NAME_COOKIE)?.value;
    const guestName = rawGuestName
      ? decodeURIComponent(rawGuestName)
      : "Guest";

    const guestUser: RequestUser = {
      id: guestId,
      email: `${guestId}@guest.local`,
      user_metadata: {
        name: guestName,
        is_guest: true,
      },
    };

    return {
      user: guestUser,
      error: null,
      supabase: serviceSupabase as SupabaseClient,
    };
  }

  return { user, error, supabase };
}

export function createAuthErrorResponse(statusCode = 401) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: statusCode }
  );
}
